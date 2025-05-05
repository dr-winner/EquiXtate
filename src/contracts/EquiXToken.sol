
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EquiXToken
 * @dev ERC1155 token representing fractional ownership of real estate properties
 */
contract EquiXToken is ERC1155, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // USDC token contract for payments
    IERC20 public usdcToken;
    
    // EquiX token value in USD (2 USD per token with 2 decimal precision)
    uint256 public constant EQUIX_USD_VALUE = 200; // $2.00
    
    // Property struct to store property details
    struct Property {
        uint256 id;
        string name;
        string propertyType; // "sale", "auction", "rent"
        string location;
        uint256 totalTokens;
        uint256 availableTokens;
        uint256 pricePerToken; // in USD cents
        address owner;
        bool isActive;
        string metadataURI;
    }
    
    // Mapping from property ID to Property struct
    mapping(uint256 => Property) public properties;
    
    // Mapping for rental income distribution
    mapping(uint256 => uint256) public rentalIncomePool; // propertyId => accumulated rental income
    mapping(uint256 => mapping(address => uint256)) public lastRentalClaim; // propertyId => user => last claim timestamp
    
    // Auction details
    struct Auction {
        uint256 propertyId;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
    }
    
    // Mapping from property ID to Auction details
    mapping(uint256 => Auction) public auctions;
    
    // Property counter
    uint256 private _propertyIdCounter = 0;
    
    // Events
    event PropertyCreated(uint256 indexed propertyId, string name, string propertyType, uint256 totalTokens);
    event TokensPurchased(uint256 indexed propertyId, address buyer, uint256 amount, uint256 cost);
    event RentalIncomeDistributed(uint256 indexed propertyId, uint256 amount);
    event RentalIncomeClaimed(uint256 indexed propertyId, address user, uint256 amount);
    event AuctionCreated(uint256 indexed propertyId, uint256 startingPrice, uint256 endTime);
    event AuctionBid(uint256 indexed propertyId, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 indexed propertyId, address winner, uint256 bidAmount);
    
    /**
     * @dev Constructor
     * @param usdcTokenAddress Address of the USDC token contract
     */
    constructor(address usdcTokenAddress) ERC1155("https://equixstate.io/api/token/{id}.json") {
        usdcToken = IERC20(usdcTokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new property
     * @param name Property name
     * @param propertyType Property type (sale, auction, rent)
     * @param location Property location
     * @param valueUSD Property value in USD cents
     * @param metadataURI URI for property metadata
     * @return propertyId ID of the created property
     */
    function createProperty(
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 valueUSD, // in cents (e.g. $100,000 = 10000000)
        string memory metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 propertyId = _propertyIdCounter++;
        
        // Calculate total tokens based on property value ($2 per token)
        uint256 totalTokens = (valueUSD * 100) / EQUIX_USD_VALUE; // Calculate tokens needed
        
        properties[propertyId] = Property({
            id: propertyId,
            name: name,
            propertyType: propertyType,
            location: location,
            totalTokens: totalTokens,
            availableTokens: totalTokens,
            pricePerToken: EQUIX_USD_VALUE,  // $2.00 per token
            owner: msg.sender,
            isActive: true,
            metadataURI: metadataURI
        });
        
        emit PropertyCreated(propertyId, name, propertyType, totalTokens);
        
        return propertyId;
    }
    
    /**
     * @dev Purchase property tokens
     * @param propertyId ID of the property
     * @param amount Amount of tokens to purchase
     */
    function purchaseTokens(uint256 propertyId, uint256 amount) external nonReentrant {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        require(property.availableTokens >= amount, "Not enough tokens available");
        require(keccak256(bytes(property.propertyType)) == keccak256(bytes("sale")), "Property not for sale");
        
        // Calculate cost in USDC (cents)
        uint256 costInCents = amount * property.pricePerToken;
        uint256 costInUSDC = costInCents * 10**4; // Convert to USDC (6 decimals)
        
        // Transfer USDC from buyer to contract
        require(usdcToken.transferFrom(msg.sender, address(this), costInUSDC), "USDC transfer failed");
        
        // Update available tokens
        property.availableTokens -= amount;
        
        // Mint tokens to buyer
        _mint(msg.sender, propertyId, amount, "");
        
        emit TokensPurchased(propertyId, msg.sender, amount, costInUSDC);
    }
    
    /**
     * @dev Distribute rental income for a property
     * @param propertyId ID of the property
     * @param amount Amount of rental income in USDC
     */
    function distributeRentalIncome(uint256 propertyId, uint256 amount) external nonReentrant {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        require(keccak256(bytes(property.propertyType)) == keccak256(bytes("rent")), "Property not for rent");
        
        // Transfer USDC from sender to contract
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        
        // Update rental income pool
        rentalIncomePool[propertyId] += amount;
        
        emit RentalIncomeDistributed(propertyId, amount);
    }
    
    /**
     * @dev Claim rental income for a property
     * @param propertyId ID of the property
     */
    function claimRentalIncome(uint256 propertyId) external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender, propertyId);
        require(userBalance > 0, "No tokens owned for this property");
        
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        
        // Calculate user's share of rental income
        uint256 totalIncome = rentalIncomePool[propertyId];
        uint256 lastClaim = lastRentalClaim[propertyId][msg.sender];
        uint256 newIncome = totalIncome - lastClaim;
        
        if (newIncome > 0) {
            uint256 userShare = (newIncome * userBalance) / property.totalTokens;
            
            if (userShare > 0) {
                // Update last claim
                lastRentalClaim[propertyId][msg.sender] = totalIncome;
                
                // Transfer USDC to user
                require(usdcToken.transfer(msg.sender, userShare), "USDC transfer failed");
                
                emit RentalIncomeClaimed(propertyId, msg.sender, userShare);
            }
        }
    }
    
    /**
     * @dev Create an auction for a property
     * @param propertyId ID of the property
     * @param startingPrice Starting price in USDC
     * @param durationDays Duration of the auction in days
     */
    function createAuction(uint256 propertyId, uint256 startingPrice, uint256 durationDays) external onlyRole(MINTER_ROLE) {
        Property storage property = properties[propertyId];
        require(property.isActive, "Property not active");
        require(property.availableTokens == property.totalTokens, "Tokens already sold");
        
        // Set property type to "auction"
        property.propertyType = "auction";
        
        // Create auction
        auctions[propertyId] = Auction({
            propertyId: propertyId,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + durationDays * 1 days,
            isActive: true
        });
        
        emit AuctionCreated(propertyId, startingPrice, auctions[propertyId].endTime);
    }
    
    /**
     * @dev Place a bid on an auction
     * @param propertyId ID of the property
     * @param bidAmount Bid amount in USDC
     */
    function placeBid(uint256 propertyId, uint256 bidAmount) external nonReentrant {
        Auction storage auction = auctions[propertyId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(bidAmount > auction.highestBid, "Bid too low");
        
        // If not the first bid, refund previous bidder
        if (auction.highestBidder != address(0)) {
            require(usdcToken.transfer(auction.highestBidder, auction.highestBid), "Refund failed");
        }
        
        // Transfer USDC from bidder to contract
        require(usdcToken.transferFrom(msg.sender, address(this), bidAmount), "USDC transfer failed");
        
        // Update auction
        auction.highestBid = bidAmount;
        auction.highestBidder = msg.sender;
        
        emit AuctionBid(propertyId, msg.sender, bidAmount);
    }
    
    /**
     * @dev End an auction
     * @param propertyId ID of the property
     */
    function endAuction(uint256 propertyId) external nonReentrant {
        Auction storage auction = auctions[propertyId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime || hasRole(ADMIN_ROLE, msg.sender), "Auction not ended yet");
        
        // Mark auction as inactive
        auction.isActive = false;
        
        // If there was a bid, transfer tokens to winner
        if (auction.highestBidder != address(0)) {
            Property storage property = properties[propertyId];
            
            // Transfer all tokens to winner
            property.availableTokens = 0;
            _mint(auction.highestBidder, propertyId, property.totalTokens, "");
            
            // Transfer funds to property owner
            require(usdcToken.transfer(property.owner, auction.highestBid), "Transfer to owner failed");
            
            emit AuctionEnded(propertyId, auction.highestBidder, auction.highestBid);
        } else {
            emit AuctionEnded(propertyId, address(0), 0);
        }
    }
    
    /**
     * @dev Get property details
     * @param propertyId ID of the property
     * @return property Property details
     */
    function getProperty(uint256 propertyId) external view returns (Property memory) {
        return properties[propertyId];
    }
    
    /**
     * @dev Get auction details
     * @param propertyId ID of the property
     * @return auction Auction details
     */
    function getAuction(uint256 propertyId) external view returns (Auction memory) {
        return auctions[propertyId];
    }
    
    /**
     * @dev Set property metadata URI
     * @param propertyId ID of the property
     * @param metadataURI New metadata URI
     */
    function setPropertyMetadataURI(uint256 propertyId, string memory metadataURI) external onlyRole(ADMIN_ROLE) {
        properties[propertyId].metadataURI = metadataURI;
    }
    
    /**
     * @dev Set property status
     * @param propertyId ID of the property
     * @param isActive New status
     */
    function setPropertyStatus(uint256 propertyId, bool isActive) external onlyRole(ADMIN_ROLE) {
        properties[propertyId].isActive = isActive;
    }
    
    /**
     * @dev Override supportsInterface to support multiple interfaces
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

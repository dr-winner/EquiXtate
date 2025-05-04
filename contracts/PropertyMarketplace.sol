// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PropertyToken.sol";

/**
 * @title PropertyMarketplace
 * @dev Marketplace for buying and selling property tokens
 */
contract PropertyMarketplace is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    uint256 public platformFee = 25; // 2.5% fee (in basis points)
    address public feeCollector;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;

    event PropertyListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);

    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdcToken = IERC20(_usdcToken);
        feeCollector = msg.sender;
        _transferOwnership(msg.sender);
    }

    function listProperty(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than 0");
        
        // Transfer token to marketplace
        PropertyToken(msg.sender).transferFrom(msg.sender, address(this), tokenId);
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true
        });
        
        userListings[msg.sender].push(tokenId);
        
        emit PropertyListed(tokenId, msg.sender, price);
    }

    function buyProperty(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing is not active");
        require(msg.sender != listing.seller, "Cannot buy your own listing");

        uint256 price = listing.price;
        address seller = listing.seller;

        // Calculate platform fee
        uint256 feeAmount = (price * platformFee) / 1000;
        uint256 sellerAmount = price - feeAmount;

        // Transfer USDC from buyer
        require(usdcToken.transferFrom(msg.sender, address(this), price), "USDC transfer failed");
        
        // Transfer fee to collector
        require(usdcToken.transfer(feeCollector, feeAmount), "Fee transfer failed");
        
        // Transfer remaining amount to seller
        require(usdcToken.transfer(seller, sellerAmount), "Seller transfer failed");
        
        // Transfer property token to buyer
        PropertyToken(address(this)).transfer(msg.sender, tokenId);

        // Update listing status
        listing.isActive = false;

        emit PropertySold(tokenId, seller, msg.sender, price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(msg.sender == listing.seller, "Not the seller");
        require(listing.isActive, "Listing not active");

        // Transfer token back to seller
        PropertyToken(address(this)).transfer(listing.seller, tokenId);
        
        listing.isActive = false;
        
        emit ListingCanceled(tokenId, msg.sender);
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 50, "Fee too high"); // Max 5%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }

    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
}

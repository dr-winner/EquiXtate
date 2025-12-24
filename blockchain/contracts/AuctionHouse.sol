// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IPropertyTokenERC1155 {
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IKYCRegistry {
    function isVerified(address user) external view returns (bool);
}

/**
 * @title AuctionHouse
 * @dev Time-bound auction system for AUCTION type properties
 * Supports USDC bidding with escrow, automatic refunds, and anti-snipe protection
 * @custom:oz-upgrades-from AuctionHouse
 */
contract AuctionHouse is 
    Initializable,
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;
    
    // ============ Enums ============
    
    enum AuctionStatus {
        PENDING,        // Auction created but not started
        ACTIVE,         // Auction is live
        ENDED,          // Auction ended, awaiting settlement
        SETTLED,        // Winner claimed tokens, bidders refunded
        CANCELLED       // Auction cancelled by admin
    }
    
    // ============ Roles ============
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUCTIONEER_ROLE = keccak256("AUCTIONEER_ROLE");
    
    // ============ Structs ============
    
    struct Auction {
        uint256 propertyId;         // Property token ID
        address seller;             // Property token seller
        uint256 tokenAmount;        // Amount of tokens being auctioned
        uint256 startTime;          // Auction start timestamp
        uint256 endTime;            // Auction end timestamp
        uint256 reservePrice;       // Minimum acceptable bid (in USDC)
        uint256 minBidIncrement;    // Minimum bid increase (in USDC)
        AuctionStatus status;       // Current auction status
        address highestBidder;      // Current highest bidder
        uint256 highestBid;         // Current highest bid amount
        uint256 totalBids;          // Total number of bids placed
        bool kycRequired;           // Whether KYC is required
        uint256 antiSnipeExtension; // Time extension if bid near end (seconds)
    }
    
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
    }
    
    // ============ State Variables ============
    
    IPropertyTokenERC1155 public propertyToken;
    IERC20 public usdcToken;
    IKYCRegistry public kycRegistry;
    
    uint256 public nextAuctionId;
    uint256 public platformFee;         // Fee in basis points (e.g., 250 = 2.5%)
    address public feeRecipient;
    
    // Default auction parameters
    uint256 public defaultAuctionDuration;
    uint256 public defaultMinBidIncrement;
    uint256 public defaultAntiSnipeExtension;
    uint256 public antiSnipeWindow;
    
    // Auction ID => Auction details
    mapping(uint256 => Auction) public auctions;
    
    // Auction ID => Array of all bids
    mapping(uint256 => Bid[]) public auctionBids;
    
    // Auction ID => Bidder => Total amount escrowed
    mapping(uint256 => mapping(address => uint256)) public escrowedFunds;
    
    // ============ Events ============
    
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed propertyId,
        address indexed seller,
        uint256 tokenAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 reservePrice
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    
    event BidRefunded(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalBid
    );
    
    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );
    
    event AuctionCancelled(
        uint256 indexed auctionId,
        string reason
    );
    
    event AuctionExtended(
        uint256 indexed auctionId,
        uint256 newEndTime
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        address indexed updatedBy
    );
    
    event FeeRecipientUpdated(
        address indexed oldRecipient,
        address indexed newRecipient,
        address indexed updatedBy
    );
    
    event KYCRegistryUpdated(
        address indexed oldRegistry,
        address indexed newRegistry,
        address indexed updatedBy
    );
    
    event DefaultParametersUpdated(
        uint256 duration,
        uint256 minBidIncrement,
        uint256 antiSnipeExtension,
        uint256 antiSnipeWindow,
        address indexed updatedBy
    );
    
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // ============ Initializer ============
    
    function initialize(
        address _propertyToken,
        address _usdcToken,
        address _kycRegistry,
        address _feeRecipient
    ) public initializer {
        require(_propertyToken != address(0), "Invalid property token");
        require(_usdcToken != address(0), "Invalid USDC token");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        propertyToken = IPropertyTokenERC1155(_propertyToken);
        usdcToken = IERC20(_usdcToken);
        kycRegistry = IKYCRegistry(_kycRegistry);
        feeRecipient = _feeRecipient;
        platformFee = 250; // 2.5% default
        
        // Initialize default auction parameters
        defaultAuctionDuration = 7 days;
        defaultMinBidIncrement = 100 * 10**6; // $100 in USDC
        defaultAntiSnipeExtension = 10 minutes;
        antiSnipeWindow = 5 minutes;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUCTIONEER_ROLE, msg.sender);
    }
    
    // ============ Modifiers ============
    
    modifier onlyKYCVerified(address user) {
        if (address(kycRegistry) != address(0)) {
            require(kycRegistry.isVerified(user), "KYC verification required");
        }
        _;
    }
    
    modifier strictKYCVerified(address user) {
        require(address(kycRegistry) != address(0), "KYC registry not initialized");
        require(kycRegistry.isVerified(user), "KYC verification required");
        _;
    }
    
    modifier auctionExists(uint256 auctionId) {
        require(auctionId < nextAuctionId, "Auction does not exist");
        _;
    }
    
    // ============ Auction Creation ============
    
    /**
     * @dev Create a new auction
     */
    function createAuction(
        uint256 propertyId,
        uint256 tokenAmount,
        uint256 startTime,
        uint256 duration,
        uint256 reservePrice,
        uint256 minBidIncrement,
        bool kycRequired
    ) external onlyRole(AUCTIONEER_ROLE) returns (uint256) {
        require(tokenAmount > 0, "Token amount must be positive");
        require(startTime >= block.timestamp, "Start time must be in future");
        require(duration > 0, "Duration must be positive");
        require(reservePrice > 0, "Reserve price must be positive");
        
        uint256 auctionId = nextAuctionId++;
        uint256 endTime = startTime + duration;
        
        if (minBidIncrement == 0) {
            minBidIncrement = defaultMinBidIncrement;
        }
        
        auctions[auctionId] = Auction({
            propertyId: propertyId,
            seller: msg.sender,
            tokenAmount: tokenAmount,
            startTime: startTime,
            endTime: endTime,
            reservePrice: reservePrice,
            minBidIncrement: minBidIncrement,
            status: AuctionStatus.PENDING,
            highestBidder: address(0),
            highestBid: 0,
            totalBids: 0,
            kycRequired: kycRequired,
            antiSnipeExtension: defaultAntiSnipeExtension
        });
        
        // Transfer tokens to escrow
        propertyToken.safeTransferFrom(msg.sender, address(this), propertyId, tokenAmount, "");
        
        emit AuctionCreated(auctionId, propertyId, msg.sender, tokenAmount, startTime, endTime, reservePrice);
        
        return auctionId;
    }
    
    /**
     * @dev Start auction (can be called manually or automatically at startTime)
     */
    function startAuction(uint256 auctionId) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        
        require(auction.status == AuctionStatus.PENDING, "Auction not pending");
        require(block.timestamp >= auction.startTime, "Auction not started yet");
        
        auction.status = AuctionStatus.ACTIVE;
    }
    
    // ============ Bidding ============
    
    /**
     * @dev Place a bid on an active auction
     */
    function placeBid(
        uint256 auctionId,
        uint256 bidAmount
    ) external nonReentrant whenNotPaused auctionExists(auctionId) onlyKYCVerified(msg.sender) {
        Auction storage auction = auctions[auctionId];
        
        // Auto-start auction if time has come
        if (auction.status == AuctionStatus.PENDING && block.timestamp >= auction.startTime) {
            auction.status = AuctionStatus.ACTIVE;
        }
        
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(bidAmount >= auction.reservePrice, "Bid below reserve price");
        require(bidAmount >= auction.highestBid + auction.minBidIncrement, "Bid increment too low");
        
        // Transfer USDC from bidder to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), bidAmount);
        
        // Refund previous highest bidder if exists
        if (auction.highestBidder != address(0)) {
            uint256 refundAmount = escrowedFunds[auctionId][auction.highestBidder];
            escrowedFunds[auctionId][auction.highestBidder] = 0;
            
            usdcToken.safeTransfer(auction.highestBidder, refundAmount);
            
            // Mark bid as refunded
            for (uint256 i = 0; i < auctionBids[auctionId].length; i++) {
                if (auctionBids[auctionId][i].bidder == auction.highestBidder) {
                    auctionBids[auctionId][i].refunded = true;
                }
            }
            
            emit BidRefunded(auctionId, auction.highestBidder, refundAmount);
        }
        
        // Update auction state
        auction.highestBidder = msg.sender;
        auction.highestBid = bidAmount;
        auction.totalBids++;
        
        // Store bid in escrow
        escrowedFunds[auctionId][msg.sender] = bidAmount;
        
        // Record bid
        auctionBids[auctionId].push(Bid({
            bidder: msg.sender,
            amount: bidAmount,
            timestamp: block.timestamp,
            refunded: false
        }));
        
        // Anti-snipe: extend auction if bid placed near end
        if (auction.endTime - block.timestamp <= antiSnipeWindow) {
            auction.endTime += auction.antiSnipeExtension;
            emit AuctionExtended(auctionId, auction.endTime);
        }
        
        emit BidPlaced(auctionId, msg.sender, bidAmount, block.timestamp);
    }
    
    // ============ Auction Settlement ============
    
    /**
     * @dev End auction and determine winner
     */
    function endAuction(uint256 auctionId) external auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        
        auction.status = AuctionStatus.ENDED;
        
        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }
    
    /**
     * @dev Settle auction - transfer tokens to winner and funds to seller
     */
    function settleAuction(uint256 auctionId) external nonReentrant auctionExists(auctionId) {
        Auction storage auction = auctions[auctionId];
        
        require(auction.status == AuctionStatus.ENDED, "Auction not ended");
        
        if (auction.highestBidder != address(0) && auction.highestBid >= auction.reservePrice) {
            // Auction successful
            uint256 fee = (auction.highestBid * platformFee) / 10000;
            uint256 sellerProceeds = auction.highestBid - fee;
            
            // Transfer fee to platform
            if (fee > 0) {
                usdcToken.safeTransfer(feeRecipient, fee);
            }
            
            // Transfer proceeds to seller
            usdcToken.safeTransfer(auction.seller, sellerProceeds);
            
            // Transfer tokens to winner
            propertyToken.safeTransferFrom(
                address(this),
                auction.highestBidder,
                auction.propertyId,
                auction.tokenAmount,
                ""
            );
            
            // Clear escrow
            escrowedFunds[auctionId][auction.highestBidder] = 0;
            
            emit AuctionSettled(auctionId, auction.highestBidder, auction.highestBid);
        } else {
            // Auction failed - return tokens to seller
            propertyToken.safeTransferFrom(
                address(this),
                auction.seller,
                auction.propertyId,
                auction.tokenAmount,
                ""
            );
            
            // Refund highest bidder if any
            if (auction.highestBidder != address(0)) {
                uint256 refundAmount = escrowedFunds[auctionId][auction.highestBidder];
                escrowedFunds[auctionId][auction.highestBidder] = 0;
                usdcToken.safeTransfer(auction.highestBidder, refundAmount);
                emit BidRefunded(auctionId, auction.highestBidder, refundAmount);
            }
        }
        
        auction.status = AuctionStatus.SETTLED;
    }
    
    /**
     * @dev Cancel auction (only before it starts or by admin)
     */
    function cancelAuction(
        uint256 auctionId,
        string memory reason
    ) external auctionExists(auctionId) onlyRole(ADMIN_ROLE) {
        Auction storage auction = auctions[auctionId];
        
        require(auction.status != AuctionStatus.SETTLED, "Auction already settled");
        require(auction.status != AuctionStatus.CANCELLED, "Auction already cancelled");
        
        // Return tokens to seller
        propertyToken.safeTransferFrom(
            address(this),
            auction.seller,
            auction.propertyId,
            auction.tokenAmount,
            ""
        );
        
        // Refund all bidders
        for (uint256 i = 0; i < auctionBids[auctionId].length; i++) {
            Bid storage bid = auctionBids[auctionId][i];
            if (!bid.refunded) {
                uint256 refundAmount = escrowedFunds[auctionId][bid.bidder];
                if (refundAmount > 0) {
                    escrowedFunds[auctionId][bid.bidder] = 0;
                    usdcToken.safeTransfer(bid.bidder, refundAmount);
                    bid.refunded = true;
                    emit BidRefunded(auctionId, bid.bidder, refundAmount);
                }
            }
        }
        
        auction.status = AuctionStatus.CANCELLED;
        
        emit AuctionCancelled(auctionId, reason);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _fee) external onlyRole(ADMIN_ROLE) {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFee;
        platformFee = _fee;
        emit PlatformFeeUpdated(oldFee, _fee, msg.sender);
    }
    
    /**
     * @dev Update default auction parameters
     */
    function setDefaultParameters(
        uint256 duration,
        uint256 minBidIncrement,
        uint256 antiSnipeExtension,
        uint256 antiSnipeWindow_
    ) external onlyRole(ADMIN_ROLE) {
        if (duration > 0) defaultAuctionDuration = duration;
        if (minBidIncrement > 0) defaultMinBidIncrement = minBidIncrement;
        if (antiSnipeExtension > 0) defaultAntiSnipeExtension = antiSnipeExtension;
        if (antiSnipeWindow_ > 0) antiSnipeWindow = antiSnipeWindow_;
        emit DefaultParametersUpdated(duration, minBidIncrement, antiSnipeExtension, antiSnipeWindow_, msg.sender);
    }
    
    /**
     * @dev Update KYC registry
     */
    function setKYCRegistry(address _kycRegistry) external onlyRole(ADMIN_ROLE) {
        address oldRegistry = address(kycRegistry);
        kycRegistry = IKYCRegistry(_kycRegistry);
        emit KYCRegistryUpdated(oldRegistry, _kycRegistry, msg.sender);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyRole(ADMIN_ROLE) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(oldRecipient, _feeRecipient, msg.sender);
    }
    
    /**
     * @dev Authorize upgrade (UUPS)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
    
    // ============ View Functions ============
    
    /**
     * @dev Get auction details
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }
    
    /**
     * @dev Get auction status
     */
    function getAuctionStatus(uint256 auctionId) external view auctionExists(auctionId) returns (AuctionStatus) {
        Auction memory auction = auctions[auctionId];
        
        // Auto-update status based on time
        if (auction.status == AuctionStatus.PENDING && block.timestamp >= auction.startTime) {
            return AuctionStatus.ACTIVE;
        }
        
        if (auction.status == AuctionStatus.ACTIVE && block.timestamp >= auction.endTime) {
            return AuctionStatus.ENDED;
        }
        
        return auction.status;
    }
    
    /**
     * @dev Get bid history for auction
     */
    function getBidHistory(uint256 auctionId) external view returns (Bid[] memory) {
        return auctionBids[auctionId];
    }
    
    /**
     * @dev Get bid count
     */
    function getBidCount(uint256 auctionId) external view returns (uint256) {
        return auctionBids[auctionId].length;
    }
    
    /**
     * @dev Get highest bid
     */
    function getHighestBid(uint256 auctionId) external view auctionExists(auctionId) returns (address, uint256) {
        Auction memory auction = auctions[auctionId];
        return (auction.highestBidder, auction.highestBid);
    }
    
    /**
     * @dev Get time remaining in auction
     */
    function getTimeRemaining(uint256 auctionId) external view auctionExists(auctionId) returns (uint256) {
        Auction memory auction = auctions[auctionId];
        
        if (block.timestamp >= auction.endTime) {
            return 0;
        }
        
        return auction.endTime - block.timestamp;
    }
    
    /**
     * @dev Check if user can bid
     */
    function canBid(address user, uint256 auctionId) external view auctionExists(auctionId) returns (bool) {
        Auction memory auction = auctions[auctionId];
        
        if (auction.kycRequired && address(kycRegistry) != address(0)) {
            if (!kycRegistry.isVerified(user)) {
                return false;
            }
        }
        
        if (auction.status != AuctionStatus.ACTIVE) {
            return false;
        }
        
        if (block.timestamp >= auction.endTime) {
            return false;
        }
        
        if (user == auction.seller) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get minimum next bid amount
     */
    function getMinimumBid(uint256 auctionId) external view auctionExists(auctionId) returns (uint256) {
        Auction memory auction = auctions[auctionId];
        
        if (auction.highestBid == 0) {
            return auction.reservePrice;
        }
        
        return auction.highestBid + auction.minBidIncrement;
    }
    
    /**
     * @dev ERC1155 receiver
     */
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
}

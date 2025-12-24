// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PropertyTokenERC1155
 * @dev Multi-token standard for real estate tokenization supporting Buy/Rent/Fractional/Auction
 * Each property is a unique token ID with fractional ownership
 * @custom:oz-upgrades-from PropertyTokenERC1155
 */
contract PropertyTokenERC1155 is 
    Initializable,
    ERC1155Upgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;
    
    // ============ Enums ============
    
    enum PropertyType {
        FRACTIONAL,  // Shared ownership with rental income
        BUY,         // Full ownership transfer (requires 100% tokens)
        RENT,        // Rental rights (no ownership transfer)
        AUCTION      // Time-bound bidding for ownership
    }
    
    enum PropertyStatus {
        ACTIVE,      // Available for purchase/rent
        SOLD_OUT,    // All tokens sold (for BUY type)
        RENTED,      // Currently rented (for RENT type)
        AUCTION_LIVE, // Auction in progress
        AUCTION_ENDED, // Auction completed
        INACTIVE     // Delisted/disabled
    }
    
    // ============ Roles ============
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // ============ Structs ============
    
    struct Property {
        string propertyId;           // Off-chain property identifier
        PropertyType propertyType;   // Type of property listing
        PropertyStatus status;       // Current status
        uint256 totalSupply;         // Total tokens for this property
        uint256 tokenPrice;          // Price per token in USDC (6 decimals)
        uint256 circulatingSupply;   // Tokens currently issued
        address owner;               // Property owner (for BUY type)
        uint256 rentalIncome;        // Monthly rental income in USDC
        uint256 lastIncomeDistribution; // Timestamp of last distribution
        bool kycRequired;            // Whether KYC is required for purchase
        string metadataURI;          // IPFS URI for property metadata
    }
    
    struct RentalIncome {
        uint256 totalDistributed;    // Total income distributed
        uint256 lastClaimTime;       // Last claim timestamp
        uint256 claimableAmount;     // Amount available to claim
    }
    
    // ============ State Variables ============
    
    IERC20 public usdcToken;         // USDC payment token
    address public kycRegistry;      // KYC verification contract
    address public priceOracle;      // Chainlink price oracle
    
    uint256 public nextPropertyId;   // Counter for property IDs
    uint256 public platformFee;      // Platform fee in basis points (e.g., 100 = 1%)
    address public feeRecipient;     // Address to receive platform fees
    
    // Token ID => Property details
    mapping(uint256 => Property) public properties;
    
    // Token ID => Address => Rental income info
    mapping(uint256 => mapping(address => RentalIncome)) public rentalIncomes;
    
    // Token ID => Total rental income pool
    mapping(uint256 => uint256) public rentalIncomePool;
    
    // ============ Events ============
    
    event PropertyListed(
        uint256 indexed tokenId,
        string propertyId,
        PropertyType propertyType,
        uint256 totalSupply,
        uint256 tokenPrice
    );
    
    event TokensPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount,
        uint256 totalCost
    );
    
    event RentalIncomeDistributed(
        uint256 indexed tokenId,
        uint256 amount,
        uint256 timestamp
    );
    
    event RentalIncomeClaimed(
        uint256 indexed tokenId,
        address indexed holder,
        uint256 amount
    );
    
    event PropertyStatusUpdated(
        uint256 indexed tokenId,
        PropertyStatus oldStatus,
        PropertyStatus newStatus
    );
    
    event PropertyPriceUpdated(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );
    
    event OwnershipTransferred(
        uint256 indexed tokenId,
        address indexed previousOwner,
        address indexed newOwner
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
    
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // ============ Initializer ============
    
    function initialize(
        address _usdcToken,
        address _kycRegistry,
        address _feeRecipient
    ) public initializer {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        
        __ERC1155_init("https://api.equixtate.com/metadata/{id}.json");
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        usdcToken = IERC20(_usdcToken);
        kycRegistry = _kycRegistry;
        feeRecipient = _feeRecipient;
        platformFee = 100; // 1% default fee
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // ============ Modifiers ============
    
    modifier onlyKYCVerified(address user) {
        if (kycRegistry != address(0)) {
            require(IKYCRegistry(kycRegistry).isVerified(user), "KYC verification required");
        }
        _;
    }
    
    modifier strictKYCVerified(address user) {
        require(kycRegistry != address(0), "KYC registry not initialized");
        require(IKYCRegistry(kycRegistry).isVerified(user), "KYC verification required");
        _;
    }
    
    modifier validProperty(uint256 tokenId) {
        require(properties[tokenId].totalSupply > 0, "Property does not exist");
        _;
    }
    
    // ============ Property Management ============
    
    /**
     * @dev List a new property for tokenization
     */
    function listProperty(
        string memory _propertyId,
        PropertyType _propertyType,
        uint256 _totalSupply,
        uint256 _tokenPrice,
        uint256 _rentalIncome,
        bool _kycRequired,
        string memory _metadataURI
    ) external onlyRole(PROPERTY_MANAGER_ROLE) returns (uint256) {
        require(_totalSupply > 0, "Total supply must be positive");
        require(_tokenPrice > 0, "Token price must be positive");
        
        uint256 tokenId = nextPropertyId++;
        
        properties[tokenId] = Property({
            propertyId: _propertyId,
            propertyType: _propertyType,
            status: PropertyStatus.ACTIVE,
            totalSupply: _totalSupply,
            tokenPrice: _tokenPrice,
            circulatingSupply: 0,
            owner: address(0),
            rentalIncome: _rentalIncome,
            lastIncomeDistribution: block.timestamp,
            kycRequired: _kycRequired,
            metadataURI: _metadataURI
        });
        
        emit PropertyListed(tokenId, _propertyId, _propertyType, _totalSupply, _tokenPrice);
        
        return tokenId;
    }
    
    /**
     * @dev Purchase property tokens with USDC
     */
    function purchaseTokens(
        uint256 tokenId,
        uint256 amount
    ) external nonReentrant whenNotPaused validProperty(tokenId) onlyKYCVerified(msg.sender) {
        Property storage property = properties[tokenId];
        
        require(property.status == PropertyStatus.ACTIVE, "Property not available");
        require(property.propertyType != PropertyType.RENT, "Use rent function for rental properties");
        require(amount > 0, "Amount must be positive");
        require(property.circulatingSupply + amount <= property.totalSupply, "Exceeds total supply");
        
        // For BUY type, must purchase all remaining tokens
        if (property.propertyType == PropertyType.BUY) {
            require(amount == property.totalSupply - property.circulatingSupply, "Must purchase all tokens for BUY type");
        }
        
        uint256 totalCost = amount * property.tokenPrice;
        uint256 fee = (totalCost * platformFee) / 10000;
        
        // Transfer USDC from buyer
        usdcToken.safeTransferFrom(msg.sender, address(this), totalCost);
        
        // Transfer fee to platform
        if (fee > 0) {
            usdcToken.safeTransfer(feeRecipient, fee);
        }
        
        // Mint tokens to buyer
        _mint(msg.sender, tokenId, amount, "");
        
        property.circulatingSupply += amount;
        
        // For BUY type, transfer ownership when all tokens purchased
        if (property.propertyType == PropertyType.BUY && property.circulatingSupply == property.totalSupply) {
            property.owner = msg.sender;
            property.status = PropertyStatus.SOLD_OUT;
            emit OwnershipTransferred(tokenId, address(0), msg.sender);
        }
        
        emit TokensPurchased(tokenId, msg.sender, amount, totalCost);
    }
    
    /**
     * @dev Distribute rental income to token holders
     */
    function distributeRentalIncome(
        uint256 tokenId,
        uint256 amount
    ) external onlyRole(PROPERTY_MANAGER_ROLE) validProperty(tokenId) {
        Property storage property = properties[tokenId];
        
        require(amount > 0, "Amount must be positive");
        require(property.circulatingSupply > 0, "No tokens in circulation");
        
        // Transfer USDC to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        rentalIncomePool[tokenId] += amount;
        property.lastIncomeDistribution = block.timestamp;
        
        emit RentalIncomeDistributed(tokenId, amount, block.timestamp);
    }
    
    /**
     * @dev Claim accumulated rental income
     */
    function claimRentalIncome(uint256 tokenId) external nonReentrant validProperty(tokenId) {
        uint256 balance = balanceOf(msg.sender, tokenId);
        require(balance > 0, "No tokens held");
        
        uint256 claimable = calculateClaimableIncome(tokenId, msg.sender);
        require(claimable > 0, "No income to claim");
        
        RentalIncome storage income = rentalIncomes[tokenId][msg.sender];
        income.totalDistributed += claimable;
        income.lastClaimTime = block.timestamp;
        income.claimableAmount = 0;
        
        rentalIncomePool[tokenId] -= claimable;
        
        usdcToken.safeTransfer(msg.sender, claimable);
        
        emit RentalIncomeClaimed(tokenId, msg.sender, claimable);
    }
    
    /**
     * @dev Calculate claimable rental income for a holder
     */
    function calculateClaimableIncome(uint256 tokenId, address holder) public view returns (uint256) {
        Property memory property = properties[tokenId];
        uint256 balance = balanceOf(holder, tokenId);
        
        if (balance == 0 || property.circulatingSupply == 0) {
            return 0;
        }
        
        // Proportional share of rental income pool
        uint256 share = (rentalIncomePool[tokenId] * balance) / property.circulatingSupply;
        
        return share;
    }
    
    // ============ Oracle Integration ============
    
    /**
     * @dev Update property price from oracle
     */
    function updatePropertyPrice(
        uint256 tokenId,
        uint256 newPrice
    ) external onlyRole(ORACLE_ROLE) validProperty(tokenId) {
        Property storage property = properties[tokenId];
        uint256 oldPrice = property.tokenPrice;
        
        require(newPrice > 0, "Price must be positive");
        
        property.tokenPrice = newPrice;
        
        emit PropertyPriceUpdated(tokenId, oldPrice, newPrice);
    }
    
    /**
     * @dev Set oracle address
     */
    function setPriceOracle(address _oracle) external onlyRole(ADMIN_ROLE) {
        require(_oracle != address(0), "Invalid oracle address");
        priceOracle = _oracle;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update property status
     */
    function updatePropertyStatus(
        uint256 tokenId,
        PropertyStatus newStatus
    ) external onlyRole(PROPERTY_MANAGER_ROLE) validProperty(tokenId) {
        Property storage property = properties[tokenId];
        PropertyStatus oldStatus = property.status;
        
        property.status = newStatus;
        
        emit PropertyStatusUpdated(tokenId, oldStatus, newStatus);
    }
    
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
     * @dev Update KYC registry
     */
    function setKYCRegistry(address _kycRegistry) external onlyRole(ADMIN_ROLE) {
        address oldRegistry = kycRegistry;
        kycRegistry = _kycRegistry;
        emit KYCRegistryUpdated(oldRegistry, _kycRegistry, msg.sender);
    }
    
    /**
     * @dev Authorize upgrade (UUPS)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
    
    // ============ View Functions ============
    
    /**
     * @dev Get property details
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        return properties[tokenId];
    }
    
    /**
     * @dev Get available tokens for purchase
     */
    function getAvailableTokens(uint256 tokenId) external view validProperty(tokenId) returns (uint256) {
        Property memory property = properties[tokenId];
        return property.totalSupply - property.circulatingSupply;
    }
    
    /**
     * @dev Check if address can purchase tokens
     */
    function canPurchase(address buyer, uint256 tokenId) external view returns (bool) {
        if (kycRegistry != address(0) && properties[tokenId].kycRequired) {
            return IKYCRegistry(kycRegistry).isVerified(buyer);
        }
        return true;
    }
    
    // ============ Required Overrides ============
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Update URI
     */
    function setURI(string memory newuri) external onlyRole(ADMIN_ROLE) {
        _setURI(newuri);
    }
    
    /**
     * @dev Get token URI for specific property
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return properties[tokenId].metadataURI;
    }
}

/**
 * @title IKYCRegistry
 * @dev Interface for KYC verification contract
 */
interface IKYCRegistry {
    function isVerified(address user) external view returns (bool);
    function getVerificationLevel(address user) external view returns (uint8);
    function isAccredited(address user) external view returns (bool);
}

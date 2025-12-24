// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title PropertyOracle
 * @dev Manages property price updates using Chainlink oracles and custom data feeds
 * Provides automated price adjustments based on market data
 * @custom:oz-upgrades-from PropertyOracle
 */
contract PropertyOracle is 
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    
    // ============ Roles ============
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_UPDATER_ROLE = keccak256("ORACLE_UPDATER_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    
    // ============ Structs ============
    
    struct PropertyValuation {
        uint256 lastPrice;              // Last recorded price in USDC (6 decimals)
        uint256 lastUpdateTime;         // Timestamp of last update
        uint256 appreciationRate;       // Annual appreciation rate (basis points)
        address dataSource;             // Address of data provider
        bool isActive;                  // Whether property is actively tracked
        bytes32 externalId;             // External property ID for off-chain lookup
    }
    
    struct PriceUpdate {
        uint256 oldPrice;
        uint256 newPrice;
        uint256 timestamp;
        address updatedBy;
        string reason;
    }
    
    // ============ State Variables ============
    
    // Chainlink price feed for USD/USDC (if needed for conversion)
    AggregatorV3Interface public usdcPriceFeed;
    
    // Property token ID => valuation data
    mapping(uint256 => PropertyValuation) public propertyValuations;
    
    // Property token ID => price update history
    mapping(uint256 => PriceUpdate[]) public priceHistory;
    
    // Data source address => is authorized
    mapping(address => bool) public authorizedDataSources;
    
    // Maximum price change allowed per update (in basis points, e.g., 1000 = 10%)
    uint256 public maxPriceChangePercent;
    
    // Minimum time between price updates (to prevent manipulation)
    uint256 public minUpdateInterval;
    
    // ============ Events ============
    
    event PropertyValuationUpdated(
        uint256 indexed propertyId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp,
        address updatedBy
    );
    
    event AppreciationRateUpdated(
        uint256 indexed propertyId,
        uint256 oldRate,
        uint256 newRate
    );
    
    event DataSourceAuthorized(
        address indexed dataSource,
        bool authorized
    );
    
    event ChainlinkFeedUpdated(
        address newFeed
    );
    
    event AutomaticPriceAdjustment(
        uint256 indexed propertyId,
        uint256 adjustedPrice,
        uint256 timestamp
    );
    
    event PriceUpdateRejected(
        uint256 indexed propertyId,
        uint256 proposedPrice,
        string reason
    );
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // ============ Initializer ============
    
    function initialize(address _usdcPriceFeed) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Initialize oracle parameters
        maxPriceChangePercent = 1000; // 10%
        minUpdateInterval = 1 days;
        
        if (_usdcPriceFeed != address(0)) {
            usdcPriceFeed = AggregatorV3Interface(_usdcPriceFeed);
        }
    }
    
    // ============ Modifiers ============
    
    modifier onlyAuthorizedSource() {
        require(authorizedDataSources[msg.sender] || hasRole(ORACLE_UPDATER_ROLE, msg.sender), 
                "Not authorized data source");
        _;
    }
    
    modifier validProperty(uint256 propertyId) {
        require(propertyValuations[propertyId].isActive, "Property not tracked");
        _;
    }
    
    // ============ Property Valuation Functions ============
    
    /**
     * @dev Initialize property valuation tracking
     */
    function initializeProperty(
        uint256 propertyId,
        uint256 initialPrice,
        uint256 appreciationRate,
        bytes32 externalId
    ) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(initialPrice > 0, "Price must be positive");
        require(!propertyValuations[propertyId].isActive, "Property already initialized");
        
        propertyValuations[propertyId] = PropertyValuation({
            lastPrice: initialPrice,
            lastUpdateTime: block.timestamp,
            appreciationRate: appreciationRate,
            dataSource: msg.sender,
            isActive: true,
            externalId: externalId
        });
        
        // Record initial price in history
        priceHistory[propertyId].push(PriceUpdate({
            oldPrice: 0,
            newPrice: initialPrice,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: "Initial valuation"
        }));
        
        emit PropertyValuationUpdated(propertyId, 0, initialPrice, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Update property price manually
     */
    function updatePropertyPrice(
        uint256 propertyId,
        uint256 newPrice,
        string memory reason
    ) external onlyAuthorizedSource validProperty(propertyId) {
        PropertyValuation storage valuation = propertyValuations[propertyId];
        
        require(newPrice > 0, "Price must be positive");
        require(block.timestamp >= valuation.lastUpdateTime + minUpdateInterval, 
                "Update interval not met");
        
        // Validate price change is within acceptable range
        uint256 priceChange = newPrice > valuation.lastPrice 
            ? ((newPrice - valuation.lastPrice) * 10000) / valuation.lastPrice
            : ((valuation.lastPrice - newPrice) * 10000) / valuation.lastPrice;
        
        if (priceChange > maxPriceChangePercent) {
            emit PriceUpdateRejected(propertyId, newPrice, "Price change exceeds maximum");
            require(hasRole(ADMIN_ROLE, msg.sender), "Price change too large, admin approval required");
        }
        
        uint256 oldPrice = valuation.lastPrice;
        valuation.lastPrice = newPrice;
        valuation.lastUpdateTime = block.timestamp;
        valuation.dataSource = msg.sender;
        
        // Record in history
        priceHistory[propertyId].push(PriceUpdate({
            oldPrice: oldPrice,
            newPrice: newPrice,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: reason
        }));
        
        emit PropertyValuationUpdated(propertyId, oldPrice, newPrice, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Apply automatic price appreciation based on rate
     */
    function applyAutomaticAppreciation(uint256 propertyId) external onlyRole(ORACLE_UPDATER_ROLE) validProperty(propertyId) {
        PropertyValuation storage valuation = propertyValuations[propertyId];
        
        // Calculate time elapsed since last update
        uint256 timeElapsed = block.timestamp - valuation.lastUpdateTime;
        require(timeElapsed >= minUpdateInterval, "Update interval not met");
        
        // Calculate appreciation (simple interest for simplicity)
        // Formula: newPrice = lastPrice * (1 + (rate * timeElapsed / 365 days))
        uint256 appreciation = (valuation.lastPrice * valuation.appreciationRate * timeElapsed) / (10000 * 365 days);
        uint256 newPrice = valuation.lastPrice + appreciation;
        
        uint256 oldPrice = valuation.lastPrice;
        valuation.lastPrice = newPrice;
        valuation.lastUpdateTime = block.timestamp;
        
        // Record in history
        priceHistory[propertyId].push(PriceUpdate({
            oldPrice: oldPrice,
            newPrice: newPrice,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: "Automatic appreciation adjustment"
        }));
        
        emit AutomaticPriceAdjustment(propertyId, newPrice, block.timestamp);
        emit PropertyValuationUpdated(propertyId, oldPrice, newPrice, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Batch update multiple property prices
     */
    function batchUpdatePrices(
        uint256[] calldata propertyIds,
        uint256[] calldata newPrices,
        string memory reason
    ) external onlyRole(ORACLE_UPDATER_ROLE) {
        require(propertyIds.length == newPrices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < propertyIds.length; i++) {
            if (propertyValuations[propertyIds[i]].isActive) {
                _updatePriceInternal(propertyIds[i], newPrices[i], reason);
            }
        }
    }
    
    /**
     * @dev Internal function to update price without checks (for batch operations)
     */
    function _updatePriceInternal(
        uint256 propertyId,
        uint256 newPrice,
        string memory reason
    ) internal {
        PropertyValuation storage valuation = propertyValuations[propertyId];
        
        uint256 oldPrice = valuation.lastPrice;
        valuation.lastPrice = newPrice;
        valuation.lastUpdateTime = block.timestamp;
        
        priceHistory[propertyId].push(PriceUpdate({
            oldPrice: oldPrice,
            newPrice: newPrice,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            reason: reason
        }));
        
        emit PropertyValuationUpdated(propertyId, oldPrice, newPrice, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Update appreciation rate for a property
     */
    function updateAppreciationRate(
        uint256 propertyId,
        uint256 newRate
    ) external onlyRole(PROPERTY_MANAGER_ROLE) validProperty(propertyId) {
        PropertyValuation storage valuation = propertyValuations[propertyId];
        
        uint256 oldRate = valuation.appreciationRate;
        valuation.appreciationRate = newRate;
        
        emit AppreciationRateUpdated(propertyId, oldRate, newRate);
    }
    
    // ============ Chainlink Integration ============
    
    /**
     * @dev Get latest USDC price from Chainlink
     */
    function getUSDCPrice() public view returns (uint256) {
        if (address(usdcPriceFeed) == address(0)) {
            return 1e8; // Default 1:1 ratio if no feed
        }
        
        (, int256 price, , , ) = usdcPriceFeed.latestRoundData();
        require(price > 0, "Invalid price from Chainlink");
        
        return uint256(price);
    }
    
    /**
     * @dev Update Chainlink price feed address
     */
    function setChainlinkFeed(address _feed) external onlyRole(ADMIN_ROLE) {
        require(_feed != address(0), "Invalid feed address");
        usdcPriceFeed = AggregatorV3Interface(_feed);
        emit ChainlinkFeedUpdated(_feed);
    }
    
    /**
     * @dev Convert amount using Chainlink price feed
     */
    function convertToUSDC(uint256 amount) external view returns (uint256) {
        uint256 usdcPrice = getUSDCPrice();
        return (amount * usdcPrice) / 1e8;
    }
    
    // ============ Data Source Management ============
    
    /**
     * @dev Authorize data source
     */
    function authorizeDataSource(address dataSource, bool authorized) external onlyRole(ADMIN_ROLE) {
        require(dataSource != address(0), "Invalid data source");
        authorizedDataSources[dataSource] = authorized;
        emit DataSourceAuthorized(dataSource, authorized);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set maximum price change percent
     */
    function setMaxPriceChangePercent(uint256 percent) external onlyRole(ADMIN_ROLE) {
        require(percent > 0 && percent <= 5000, "Invalid percent (max 50%)");
        maxPriceChangePercent = percent;
    }
    
    /**
     * @dev Set minimum update interval
     */
    function setMinUpdateInterval(uint256 interval) external onlyRole(ADMIN_ROLE) {
        require(interval >= 1 hours, "Interval too short");
        minUpdateInterval = interval;
    }
    
    /**
     * @dev Deactivate property tracking
     */
    function deactivateProperty(uint256 propertyId) external onlyRole(PROPERTY_MANAGER_ROLE) {
        propertyValuations[propertyId].isActive = false;
    }
    
    /**
     * @dev Reactivate property tracking
     */
    function reactivateProperty(uint256 propertyId) external onlyRole(PROPERTY_MANAGER_ROLE) {
        require(propertyValuations[propertyId].lastPrice > 0, "Property not initialized");
        propertyValuations[propertyId].isActive = true;
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get current property price
     */
    function getCurrentPrice(uint256 propertyId) external view returns (uint256) {
        return propertyValuations[propertyId].lastPrice;
    }
    
    /**
     * @dev Get property valuation details
     */
    function getPropertyValuation(uint256 propertyId) external view returns (PropertyValuation memory) {
        return propertyValuations[propertyId];
    }
    
    /**
     * @dev Get price history length
     */
    function getPriceHistoryLength(uint256 propertyId) external view returns (uint256) {
        return priceHistory[propertyId].length;
    }
    
    /**
     * @dev Get specific price update from history
     */
    function getPriceUpdate(uint256 propertyId, uint256 index) external view returns (PriceUpdate memory) {
        require(index < priceHistory[propertyId].length, "Index out of bounds");
        return priceHistory[propertyId][index];
    }
    
    /**
     * @dev Get latest price update
     */
    function getLatestPriceUpdate(uint256 propertyId) external view returns (PriceUpdate memory) {
        require(priceHistory[propertyId].length > 0, "No price history");
        return priceHistory[propertyId][priceHistory[propertyId].length - 1];
    }
    
    /**
     * @dev Calculate projected price based on appreciation rate
     */
    function getProjectedPrice(uint256 propertyId, uint256 futureTimestamp) external view validProperty(propertyId) returns (uint256) {
        PropertyValuation memory valuation = propertyValuations[propertyId];
        
        require(futureTimestamp > valuation.lastUpdateTime, "Invalid future timestamp");
        
        uint256 timeElapsed = futureTimestamp - valuation.lastUpdateTime;
        uint256 appreciation = (valuation.lastPrice * valuation.appreciationRate * timeElapsed) / (10000 * 365 days);
        
        return valuation.lastPrice + appreciation;
    }
    
    /**
     * @dev Get price change percentage since last update
     */
    function getPriceChangePercent(uint256 propertyId) external view returns (int256) {
        if (priceHistory[propertyId].length < 2) {
            return 0;
        }
        
        uint256 historyLength = priceHistory[propertyId].length;
        PriceUpdate memory latest = priceHistory[propertyId][historyLength - 1];
        PriceUpdate memory previous = priceHistory[propertyId][historyLength - 2];
        
        if (previous.oldPrice == 0) {
            return 0;
        }
        
        int256 change = int256(latest.newPrice) - int256(previous.newPrice);
        return (change * 10000) / int256(previous.newPrice);
    }
    
    /**
     * @dev Authorize upgrade (UUPS)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
}

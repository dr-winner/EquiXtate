// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @title PropertyFactory
/// @notice Registry + orchestrator for standardized property setup across modules
/// @dev This factory coordinates configuration across token/KYC/oracle/auction/rental systems.
/// @custom:oz-upgrades-from PropertyFactory
contract PropertyFactory is 
    Initializable,
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /// @notice High-level property categories; mirrors the ERC-1155 token contract
    enum PropertyType {
        FRACTIONAL,
        BUY,
        RENT,
        AUCTION
    }

    /// @notice External module pointers coordinated by the factory
    struct Modules {
        address token;        // PropertyTokenERC1155
        address kycRegistry;  // KYCRegistry
        address oracle;       // PropertyOracle
        address auction;      // AuctionHouse
        address rental;       // RentalManager
    }

    /// @notice Canonical metadata/config captured at creation time
    struct PropertyConfig {
        address creator;
        address manager;
        PropertyType propertyType;
        uint256 initialSupply;      // total supply intended for minting
        uint256 tokenPriceUSDC;     // 6 decimals implied
        bool kycRequired;
        string uri;                 // off-chain metadata
        uint64 createdAt;
        uint32 version;             // config versioning for future upgrades
        bool exists;
    }

    /// @notice Current module wiring
    Modules public modules;

    /// @notice Auto-incrementing property id counter
    uint256 public nextPropertyId;

    /// @notice Default version for new properties
    uint32 public currentVersion;
    
    /// @notice Tracks if modules have been initialized
    bool public modulesInitialized;

    /// @notice Property registry
    mapping(uint256 => PropertyConfig) private properties;

    /// @notice Emitted on module address updates
    event ModulesUpdated(address token, address kyc, address oracle, address auction, address rental);
    
    /// @notice Emitted on initial module initialization
    event ModulesInitialized(address token, address kyc, address oracle, address auction, address rental);
    
    /// @notice Emitted on pause/unpause
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);

    /// @notice Emitted when a new property is registered
    event PropertyRegistered(
        uint256 indexed propertyId,
        address indexed creator,
        address indexed manager,
        PropertyType propertyType,
        uint256 initialSupply,
        uint256 tokenPriceUSDC,
        bool kycRequired,
        string uri,
        uint32 version
    );

    /// @notice Emitted when property manager changes
    event PropertyManagerUpdated(uint256 indexed propertyId, address indexed oldManager, address indexed newManager);

    /// @notice Emitted when a property's KYC requirement changes
    event PropertyKYCRequirementUpdated(uint256 indexed propertyId, bool required);

    /// @notice Emitted when a property's URI changes
    event PropertyURIUpdated(uint256 indexed propertyId, string uri);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ============ Initializer ============

    function initialize(address admin) public initializer {
        require(admin != address(0), "admin required");
        
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        
        // Initialize property ID counter
        nextPropertyId = 1;
        currentVersion = 1;
    }

    // --- Admin controls ---

    function pause() external onlyRole(ADMIN_ROLE) { 
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) { 
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    function setModules(Modules calldata m) external onlyRole(ADMIN_ROLE) {
        modules = m;
        if (!modulesInitialized) {
            modulesInitialized = true;
            emit ModulesInitialized(m.token, m.kycRegistry, m.oracle, m.auction, m.rental);
        }
        emit ModulesUpdated(m.token, m.kycRegistry, m.oracle, m.auction, m.rental);
    }

    function setCurrentVersion(uint32 newVersion) external onlyRole(ADMIN_ROLE) {
        require(newVersion > 0, "invalid version");
        currentVersion = newVersion;
    }

    // --- Property lifecycle ---

    /// @notice Register a property in the canonical registry. This does not mint tokens by itself.
    function registerProperty(
        PropertyType pType,
        uint256 initialSupply,
        uint256 tokenPriceUSDC,
        bool kycRequired,
        address manager,
        string calldata uri
    ) external whenNotPaused nonReentrant onlyRole(MANAGER_ROLE) returns (uint256 propertyId) {
        require(manager != address(0), "manager required");

        propertyId = nextPropertyId++;

        properties[propertyId] = PropertyConfig({
            creator: msg.sender,
            manager: manager,
            propertyType: pType,
            initialSupply: initialSupply,
            tokenPriceUSDC: tokenPriceUSDC,
            kycRequired: kycRequired,
            uri: uri,
            createdAt: uint64(block.timestamp),
            version: currentVersion,
            exists: true
        });

        emit PropertyRegistered(
            propertyId,
            msg.sender,
            manager,
            pType,
            initialSupply,
            tokenPriceUSDC,
            kycRequired,
            uri,
            currentVersion
        );
    }

    function updatePropertyManager(uint256 propertyId, address newManager)
        external
        whenNotPaused
        onlyRole(ADMIN_ROLE)
    {
        require(newManager != address(0), "manager required");
        PropertyConfig storage p = _requireProperty(propertyId);
        address old = p.manager;
        p.manager = newManager;
        emit PropertyManagerUpdated(propertyId, old, newManager);
    }

    function updatePropertyKYC(uint256 propertyId, bool required)
        external
        whenNotPaused
        onlyRole(ADMIN_ROLE)
    {
        PropertyConfig storage p = _requireProperty(propertyId);
        p.kycRequired = required;
        emit PropertyKYCRequirementUpdated(propertyId, required);
    }

    function updatePropertyURI(uint256 propertyId, string calldata uri)
        external
        whenNotPaused
        onlyRole(ADMIN_ROLE)
    {
        PropertyConfig storage p = _requireProperty(propertyId);
        p.uri = uri;
        emit PropertyURIUpdated(propertyId, uri);
    }

    // --- Views ---

    function getProperty(uint256 propertyId)
        external
        view
        returns (
            address creator,
            address manager,
            PropertyType pType,
            uint256 initialSupply,
            uint256 tokenPriceUSDC,
            bool kycRequired,
            string memory uri,
            uint64 createdAt,
            uint32 version
        )
    {
        PropertyConfig storage p = _requireProperty(propertyId);
        return (
            p.creator,
            p.manager,
            p.propertyType,
            p.initialSupply,
            p.tokenPriceUSDC,
            p.kycRequired,
            p.uri,
            p.createdAt,
            p.version
        );
    }

    /**
     * @dev Authorize upgrade (UUPS)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    function propertyExists(uint256 propertyId) external view returns (bool) {
        return properties[propertyId].exists;
    }

    // --- Internal helpers ---

    function _requireProperty(uint256 propertyId) internal view returns (PropertyConfig storage) {
        PropertyConfig storage p = properties[propertyId];
        require(p.exists, "property not found");
        return p;
    }
}

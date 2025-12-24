// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title KYCRegistry
 * @dev Manages KYC/AML verification for property token purchasers
 * Integrates with external KYC providers (Civic, Polygon ID, etc.)
 * @custom:oz-upgrades-from KYCRegistry
 */
contract KYCRegistry is 
    Initializable,
    AccessControlUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable
{
    
    // ============ Enums ============
    
    enum VerificationLevel {
        NONE,           // Not verified
        BASIC,          // Basic ID verification
        ENHANCED,       // Enhanced due diligence
        ACCREDITED      // Accredited investor status
    }
    
    enum JurisdictionStatus {
        ALLOWED,        // Jurisdiction is allowed
        RESTRICTED,     // Jurisdiction has restrictions
        BLOCKED         // Jurisdiction is blocked
    }
    
    // ============ Roles ============
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KYC_PROVIDER_ROLE = keccak256("KYC_PROVIDER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // ============ Structs ============
    
    struct UserKYC {
        VerificationLevel level;        // Verification level
        uint256 verificationDate;       // Timestamp of verification
        uint256 expiryDate;            // Expiry timestamp
        string jurisdiction;            // Country code (ISO 3166-1 alpha-2)
        bool isAccredited;              // Accredited investor status
        bool isBlacklisted;             // AML blacklist status
        address verifiedBy;             // KYC provider address
        bytes32 documentHash;           // Hash of verification documents
    }
    
    struct KYCProvider {
        string name;                    // Provider name
        bool isActive;                  // Whether provider is active
        uint256 verificationsCount;     // Total verifications performed
        uint256 addedDate;             // When provider was added
    }
    
    // ============ State Variables ============
    
    // User address => KYC data
    mapping(address => UserKYC) public userKYC;
    
    // Jurisdiction code => status
    mapping(string => JurisdictionStatus) public jurisdictions;
    
    // KYC provider address => provider data
    mapping(address => KYCProvider) public kycProviders;
    
    // Address => daily transaction count (for AML monitoring)
    mapping(address => mapping(uint256 => uint256)) public dailyTransactions;
    
    // Daily transaction limit for AML
    uint256 public dailyTransactionLimit;
    
    // Maximum transaction amount without enhanced verification (in USDC, 6 decimals)
    uint256 public enhancedVerificationThreshold;
    
    // List of blocked addresses (sanctions)
    mapping(address => bool) public sanctionedAddresses;
    
    // ============ Events ============
    
    event UserVerified(
        address indexed user,
        VerificationLevel level,
        string jurisdiction,
        address verifiedBy
    );
    
    event VerificationExpired(
        address indexed user,
        uint256 expiryDate
    );
    
    event UserBlacklisted(
        address indexed user,
        string reason
    );
    
    event UserWhitelisted(
        address indexed user
    );
    
    event JurisdictionUpdated(
        string jurisdiction,
        JurisdictionStatus status
    );
    
    event KYCProviderAdded(
        address indexed provider,
        string name
    );
    
    event KYCProviderRemoved(
        address indexed provider
    );
    
    event AccreditedStatusUpdated(
        address indexed user,
        bool isAccredited
    );
    
    event SuspiciousActivity(
        address indexed user,
        string reason,
        uint256 timestamp
    );
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // ============ Initializer ============
    
    function initialize() public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        // Initialize AML limits
        dailyTransactionLimit = 10;
        enhancedVerificationThreshold = 10000 * 10**6; // $10,000
        
        // Initialize allowed jurisdictions (expand as needed)
        jurisdictions["US"] = JurisdictionStatus.ALLOWED;
        jurisdictions["GB"] = JurisdictionStatus.ALLOWED;
        jurisdictions["GH"] = JurisdictionStatus.ALLOWED; // Ghana
        jurisdictions["CA"] = JurisdictionStatus.ALLOWED;
        jurisdictions["AU"] = JurisdictionStatus.ALLOWED;
        
        // Restricted jurisdictions require enhanced verification
        jurisdictions["CN"] = JurisdictionStatus.RESTRICTED;
        jurisdictions["RU"] = JurisdictionStatus.RESTRICTED;
        
        // Blocked jurisdictions (OFAC sanctioned countries)
        jurisdictions["KP"] = JurisdictionStatus.BLOCKED; // North Korea
        jurisdictions["IR"] = JurisdictionStatus.BLOCKED; // Iran
        jurisdictions["SY"] = JurisdictionStatus.BLOCKED; // Syria
    }
    
    // ============ Modifiers ============
    
    modifier onlyActiveProvider() {
        require(kycProviders[msg.sender].isActive, "Not an active KYC provider");
        _;
    }
    
    modifier notSanctioned(address user) {
        require(!sanctionedAddresses[user], "Address is sanctioned");
        _;
    }
    
    // ============ KYC Verification Functions ============
    
    /**
     * @dev Verify a user's KYC
     */
    function verifyUser(
        address user,
        VerificationLevel level,
        string memory jurisdiction,
        bool _isAccredited,
        uint256 validityPeriod,
        bytes32 documentHash
    ) external onlyRole(KYC_PROVIDER_ROLE) onlyActiveProvider whenNotPaused notSanctioned(user) {
        require(user != address(0), "Invalid user address");
        require(level != VerificationLevel.NONE, "Invalid verification level");
        require(jurisdictions[jurisdiction] != JurisdictionStatus.BLOCKED, "Jurisdiction blocked");
        
        // Enhanced verification required for restricted jurisdictions
        if (jurisdictions[jurisdiction] == JurisdictionStatus.RESTRICTED) {
            require(level >= VerificationLevel.ENHANCED, "Enhanced verification required");
        }
        
        uint256 expiryDate = block.timestamp + validityPeriod;
        
        userKYC[user] = UserKYC({
            level: level,
            verificationDate: block.timestamp,
            expiryDate: expiryDate,
            jurisdiction: jurisdiction,
            isAccredited: _isAccredited,
            isBlacklisted: false,
            verifiedBy: msg.sender,
            documentHash: documentHash
        });
        
        kycProviders[msg.sender].verificationsCount++;
        
        emit UserVerified(user, level, jurisdiction, msg.sender);
        
        if (_isAccredited) {
            emit AccreditedStatusUpdated(user, true);
        }
    }
    
    /**
     * @dev Check if user is verified
     */
    function isVerified(address user) external view returns (bool) {
        UserKYC memory kyc = userKYC[user];
        
        // Check if verified, not expired, not blacklisted, and jurisdiction allowed
        return kyc.level != VerificationLevel.NONE &&
               block.timestamp <= kyc.expiryDate &&
               !kyc.isBlacklisted &&
               !sanctionedAddresses[user] &&
               jurisdictions[kyc.jurisdiction] != JurisdictionStatus.BLOCKED;
    }
    
    /**
     * @dev Get user verification level
     */
    function getVerificationLevel(address user) external view returns (uint8) {
        return uint8(userKYC[user].level);
    }
    
    /**
     * @dev Check if user is accredited investor
     */
    function isAccredited(address user) external view returns (bool) {
        UserKYC memory kyc = userKYC[user];
        return kyc.isAccredited && 
               block.timestamp <= kyc.expiryDate && 
               !kyc.isBlacklisted;
    }
    
    /**
     * @dev Check if user can transact given amount
     */
    function canTransact(address user, uint256 amount) external view returns (bool) {
        UserKYC memory kyc = userKYC[user];
        
        // Basic checks
        if (kyc.level == VerificationLevel.NONE || 
            block.timestamp > kyc.expiryDate || 
            kyc.isBlacklisted ||
            sanctionedAddresses[user]) {
            return false;
        }
        
        // Check if enhanced verification required for large amounts
        if (amount > enhancedVerificationThreshold) {
            return kyc.level >= VerificationLevel.ENHANCED;
        }
        
        return true;
    }
    
    /**
     * @dev Record transaction for AML monitoring
     */
    function recordTransaction(address user) external onlyRole(COMPLIANCE_ROLE) {
        uint256 today = block.timestamp / 1 days;
        dailyTransactions[user][today]++;
        
        // Flag suspicious activity if daily limit exceeded
        if (dailyTransactions[user][today] > dailyTransactionLimit) {
            emit SuspiciousActivity(user, "Daily transaction limit exceeded", block.timestamp);
        }
    }
    
    /**
     * @dev Get daily transaction count for user
     */
    function getDailyTransactionCount(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return dailyTransactions[user][today];
    }
    
    // ============ Blacklist Management ============
    
    /**
     * @dev Blacklist a user
     */
    function blacklistUser(address user, string memory reason) external onlyRole(COMPLIANCE_ROLE) {
        userKYC[user].isBlacklisted = true;
        emit UserBlacklisted(user, reason);
    }
    
    /**
     * @dev Remove user from blacklist
     */
    function whitelistUser(address user) external onlyRole(COMPLIANCE_ROLE) {
        userKYC[user].isBlacklisted = false;
        emit UserWhitelisted(user);
    }
    
    /**
     * @dev Add address to sanctions list
     */
    function addToSanctionsList(address user) external onlyRole(COMPLIANCE_ROLE) {
        sanctionedAddresses[user] = true;
        emit UserBlacklisted(user, "Added to sanctions list");
    }
    
    /**
     * @dev Remove address from sanctions list
     */
    function removeFromSanctionsList(address user) external onlyRole(COMPLIANCE_ROLE) {
        sanctionedAddresses[user] = false;
        emit UserWhitelisted(user);
    }
    
    // ============ Jurisdiction Management ============
    
    /**
     * @dev Update jurisdiction status
     */
    function updateJurisdiction(
        string memory jurisdiction,
        JurisdictionStatus status
    ) external onlyRole(ADMIN_ROLE) {
        jurisdictions[jurisdiction] = status;
        emit JurisdictionUpdated(jurisdiction, status);
    }
    
    /**
     * @dev Check if jurisdiction is allowed
     */
    function isJurisdictionAllowed(string memory jurisdiction) external view returns (bool) {
        return jurisdictions[jurisdiction] == JurisdictionStatus.ALLOWED ||
               jurisdictions[jurisdiction] == JurisdictionStatus.RESTRICTED;
    }
    
    // ============ KYC Provider Management ============
    
    /**
     * @dev Add KYC provider
     */
    function addKYCProvider(address provider, string memory name) external onlyRole(ADMIN_ROLE) {
        require(provider != address(0), "Invalid provider address");
        require(!kycProviders[provider].isActive, "Provider already exists");
        
        kycProviders[provider] = KYCProvider({
            name: name,
            isActive: true,
            verificationsCount: 0,
            addedDate: block.timestamp
        });
        
        _grantRole(KYC_PROVIDER_ROLE, provider);
        
        emit KYCProviderAdded(provider, name);
    }
    
    /**
     * @dev Remove KYC provider
     */
    function removeKYCProvider(address provider) external onlyRole(ADMIN_ROLE) {
        require(kycProviders[provider].isActive, "Provider not active");
        
        kycProviders[provider].isActive = false;
        _revokeRole(KYC_PROVIDER_ROLE, provider);
        
        emit KYCProviderRemoved(provider);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update daily transaction limit
     */
    function setDailyTransactionLimit(uint256 limit) external onlyRole(ADMIN_ROLE) {
        require(limit > 0, "Limit must be positive");
        dailyTransactionLimit = limit;
    }
    
    /**
     * @dev Update enhanced verification threshold
     */
    function setEnhancedVerificationThreshold(uint256 threshold) external onlyRole(ADMIN_ROLE) {
        require(threshold > 0, "Threshold must be positive");
        enhancedVerificationThreshold = threshold;
    }
    
    /**
     * @dev Update user accredited status
     */
    function updateAccreditedStatus(
        address user,
        bool _isAccredited
    ) external onlyRole(COMPLIANCE_ROLE) {
        userKYC[user].isAccredited = _isAccredited;
        emit AccreditedStatusUpdated(user, _isAccredited);
    }
    
    /**
     * @dev Revoke user verification
     */
    function revokeVerification(address user) external onlyRole(COMPLIANCE_ROLE) {
        userKYC[user].level = VerificationLevel.NONE;
        emit VerificationExpired(user, block.timestamp);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get user KYC details
     */
    function getUserKYC(address user) external view returns (UserKYC memory) {
        return userKYC[user];
    }
    
    /**
     * @dev Check if KYC is expired
     */
    function isExpired(address user) external view returns (bool) {
        return block.timestamp > userKYC[user].expiryDate;
    }
    
    /**
     * @dev Authorize upgrade (UUPS)
     * @param newImplementation Address of new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}
    
    /**
     * @dev Get KYC provider details
     */
    function getKYCProvider(address provider) external view returns (KYCProvider memory) {
        return kycProviders[provider];
    }
}

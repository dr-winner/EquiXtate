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
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

interface IKYCRegistry {
    function isVerified(address user) external view returns (bool);
}

/**
 * @title RentalManager
 * @dev Manages rental agreements for RENT type properties
 * Handles lease creation, rent collection, and distribution to token holders
 * @custom:oz-upgrades-from RentalManager
 */
contract RentalManager is 
    Initializable,
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;
    
    // ============ Enums ============
    
    enum LeaseStatus {
        ACTIVE,         // Lease is active
        EXPIRED,        // Lease term ended
        TERMINATED,     // Lease terminated early
        DEFAULTED       // Tenant defaulted on payment
    }
    
    enum LeaseTerm {
        MONTHLY,        // 30 days
        QUARTERLY,      // 90 days
        SEMI_ANNUAL,    // 180 days
        ANNUAL,         // 365 days
        CUSTOM          // Custom duration
    }
    
    // ============ Roles ============
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    
    // ============ Structs ============
    
    struct Lease {
        uint256 propertyId;         // Property token ID
        address tenant;             // Tenant address
        LeaseTerm term;             // Lease term type
        uint256 monthlyRent;        // Monthly rent in USDC
        uint256 securityDeposit;    // Security deposit in USDC
        uint256 startDate;          // Lease start timestamp
        uint256 endDate;            // Lease end timestamp
        uint256 customDuration;     // Custom duration (if CUSTOM term)
        LeaseStatus status;         // Current lease status
        uint256 rentsPaid;          // Number of rent payments made
        uint256 lastPaymentDate;    // Last rent payment timestamp
        uint256 totalPaid;          // Total amount paid
        bool depositReturned;       // Whether deposit was returned
        bool autoRenew;             // Auto-renewal flag
    }
    
    struct RentPayment {
        uint256 leaseId;
        uint256 amount;
        uint256 timestamp;
        uint256 periodStart;
        uint256 periodEnd;
        bool latePayment;
        uint256 lateFee;
    }
    
    // ============ State Variables ============
    
    IPropertyTokenERC1155 public propertyToken;
    IERC20 public usdcToken;
    IKYCRegistry public kycRegistry;
    
    uint256 public nextLeaseId;
    uint256 public platformFee;             // Fee in basis points (e.g., 100 = 1%)
    address public feeRecipient;
    
    // Late payment settings
    uint256 public latePaymentGracePeriod;
    uint256 public latePaymentFeePercent;
    
    // Lease ID => Lease details
    mapping(uint256 => Lease) public leases;
    
    // Lease ID => Array of rent payments
    mapping(uint256 => RentPayment[]) public rentPayments;
    
    // Property ID => Active lease IDs
    mapping(uint256 => uint256[]) public propertyLeases;
    
    // Tenant => Lease IDs
    mapping(address => uint256[]) public tenantLeases;
    
    // Property ID => Total rental income collected
    mapping(uint256 => uint256) public propertyRentalIncome;
    
    // ============ Events ============
    
    event LeaseCreated(
        uint256 indexed leaseId,
        uint256 indexed propertyId,
        address indexed tenant,
        uint256 monthlyRent,
        uint256 startDate,
        uint256 endDate
    );
    
    event RentPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        uint256 timestamp,
        bool latePayment
    );
    
    event LeaseTerminated(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 timestamp,
        string reason
    );
    
    event LeaseRenewed(
        uint256 indexed leaseId,
        uint256 newEndDate
    );
    
    event DepositReturned(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount
    );
    
    event DepositForfeited(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        string reason
    );
    
    event LateFeeCharged(
        uint256 indexed leaseId,
        uint256 amount
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
    
    event LatePaymentSettingsUpdated(
        uint256 gracePeriod,
        uint256 feePercent,
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
        platformFee = 100; // 1% default
        
        // Initialize late payment settings
        latePaymentGracePeriod = 3 days;
        latePaymentFeePercent = 500; // 5%
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
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
    
    modifier leaseExists(uint256 leaseId) {
        require(leaseId < nextLeaseId, "Lease does not exist");
        _;
    }
    
    modifier onlyTenant(uint256 leaseId) {
        require(leases[leaseId].tenant == msg.sender, "Only tenant can call");
        _;
    }
    
    // ============ Lease Management ============
    
    /**
     * @dev Create a new lease agreement
     */
    function createLease(
        uint256 propertyId,
        address tenant,
        LeaseTerm term,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 customDuration,
        bool autoRenew
    ) external onlyRole(PROPERTY_MANAGER_ROLE) onlyKYCVerified(tenant) returns (uint256) {
        require(tenant != address(0), "Invalid tenant address");
        require(monthlyRent > 0, "Monthly rent must be positive");
        require(startDate >= block.timestamp, "Start date must be in future");
        
        uint256 leaseId = nextLeaseId++;
        
        // Calculate end date based on term
        uint256 duration;
        if (term == LeaseTerm.MONTHLY) {
            duration = 30 days;
        } else if (term == LeaseTerm.QUARTERLY) {
            duration = 90 days;
        } else if (term == LeaseTerm.SEMI_ANNUAL) {
            duration = 180 days;
        } else if (term == LeaseTerm.ANNUAL) {
            duration = 365 days;
        } else {
            require(customDuration > 0, "Custom duration required");
            duration = customDuration;
        }
        
        uint256 endDate = startDate + duration;
        
        leases[leaseId] = Lease({
            propertyId: propertyId,
            tenant: tenant,
            term: term,
            monthlyRent: monthlyRent,
            securityDeposit: securityDeposit,
            startDate: startDate,
            endDate: endDate,
            customDuration: customDuration,
            status: LeaseStatus.ACTIVE,
            rentsPaid: 0,
            lastPaymentDate: 0,
            totalPaid: 0,
            depositReturned: false,
            autoRenew: autoRenew
        });
        
        propertyLeases[propertyId].push(leaseId);
        tenantLeases[tenant].push(leaseId);
        
        // Collect security deposit
        if (securityDeposit > 0) {
            usdcToken.safeTransferFrom(tenant, address(this), securityDeposit);
        }
        
        emit LeaseCreated(leaseId, propertyId, tenant, monthlyRent, startDate, endDate);
        
        return leaseId;
    }
    
    /**
     * @dev Pay monthly rent
     */
    function payRent(
        uint256 leaseId
    ) external nonReentrant whenNotPaused leaseExists(leaseId) onlyTenant(leaseId) {
        Lease storage lease = leases[leaseId];
        
        require(lease.status == LeaseStatus.ACTIVE, "Lease not active");
        require(block.timestamp >= lease.startDate, "Lease not started");
        require(block.timestamp <= lease.endDate, "Lease expired");
        
        uint256 rentAmount = lease.monthlyRent;
        uint256 lateFee = 0;
        bool isLate = false;
        
        // Calculate if payment is late
        uint256 dueDate = lease.lastPaymentDate == 0 
            ? lease.startDate 
            : lease.lastPaymentDate + 30 days;
        
        if (block.timestamp > dueDate + latePaymentGracePeriod) {
            isLate = true;
            lateFee = (rentAmount * latePaymentFeePercent) / 10000;
            emit LateFeeCharged(leaseId, lateFee);
        }
        
        uint256 totalPayment = rentAmount + lateFee;
        
        // Transfer rent from tenant
        usdcToken.safeTransferFrom(msg.sender, address(this), totalPayment);
        
        // Calculate and transfer platform fee
        uint256 fee = (rentAmount * platformFee) / 10000;
        if (fee > 0) {
            usdcToken.safeTransfer(feeRecipient, fee);
        }
        
        // Update lease state
        lease.rentsPaid++;
        lease.lastPaymentDate = block.timestamp;
        lease.totalPaid += totalPayment;
        
        // Add to property rental income pool (for distribution to token holders)
        propertyRentalIncome[lease.propertyId] += (rentAmount - fee);
        
        // Record payment
        rentPayments[leaseId].push(RentPayment({
            leaseId: leaseId,
            amount: rentAmount,
            timestamp: block.timestamp,
            periodStart: dueDate,
            periodEnd: dueDate + 30 days,
            latePayment: isLate,
            lateFee: lateFee
        }));
        
        emit RentPaid(leaseId, msg.sender, totalPayment, block.timestamp, isLate);
    }
    
    /**
     * @dev Terminate lease early
     */
    function terminateLease(
        uint256 leaseId,
        string memory reason
    ) external leaseExists(leaseId) {
        Lease storage lease = leases[leaseId];
        
        require(
            msg.sender == lease.tenant || hasRole(PROPERTY_MANAGER_ROLE, msg.sender),
            "Not authorized"
        );
        require(lease.status == LeaseStatus.ACTIVE, "Lease not active");
        
        lease.status = LeaseStatus.TERMINATED;
        
        emit LeaseTerminated(leaseId, lease.tenant, block.timestamp, reason);
    }
    
    /**
     * @dev Renew lease
     */
    function renewLease(
        uint256 leaseId,
        uint256 additionalDuration
    ) external leaseExists(leaseId) onlyRole(PROPERTY_MANAGER_ROLE) {
        Lease storage lease = leases[leaseId];
        
        require(lease.status == LeaseStatus.ACTIVE || lease.status == LeaseStatus.EXPIRED, "Cannot renew");
        require(additionalDuration > 0, "Duration must be positive");
        
        lease.endDate += additionalDuration;
        lease.status = LeaseStatus.ACTIVE;
        
        emit LeaseRenewed(leaseId, lease.endDate);
    }
    
    /**
     * @dev Return security deposit to tenant
     */
    function returnDeposit(uint256 leaseId) external nonReentrant leaseExists(leaseId) onlyRole(PROPERTY_MANAGER_ROLE) {
        Lease storage lease = leases[leaseId];
        
        require(!lease.depositReturned, "Deposit already returned");
        require(lease.status != LeaseStatus.ACTIVE, "Lease still active");
        require(lease.securityDeposit > 0, "No deposit to return");
        
        uint256 depositAmount = lease.securityDeposit;
        lease.depositReturned = true;
        
        usdcToken.safeTransfer(lease.tenant, depositAmount);
        
        emit DepositReturned(leaseId, lease.tenant, depositAmount);
    }
    
    /**
     * @dev Forfeit security deposit (for damages/unpaid rent)
     */
    function forfeitDeposit(
        uint256 leaseId,
        string memory reason
    ) external leaseExists(leaseId) onlyRole(PROPERTY_MANAGER_ROLE) {
        Lease storage lease = leases[leaseId];
        
        require(!lease.depositReturned, "Deposit already returned");
        require(lease.securityDeposit > 0, "No deposit to forfeit");
        
        uint256 depositAmount = lease.securityDeposit;
        lease.depositReturned = true;
        
        // Add to property rental income pool
        propertyRentalIncome[lease.propertyId] += depositAmount;
        
        emit DepositForfeited(leaseId, lease.tenant, depositAmount, reason);
    }
    
    /**
     * @dev Mark lease as defaulted
     */
    function markAsDefaulted(uint256 leaseId) external leaseExists(leaseId) onlyRole(PROPERTY_MANAGER_ROLE) {
        Lease storage lease = leases[leaseId];
        
        require(lease.status == LeaseStatus.ACTIVE, "Lease not active");
        
        // Check if payment is significantly overdue (more than 30 days past grace period)
        uint256 dueDate = lease.lastPaymentDate == 0 
            ? lease.startDate 
            : lease.lastPaymentDate + 30 days;
        
        require(
            block.timestamp > dueDate + latePaymentGracePeriod + 30 days,
            "Not yet in default"
        );
        
        lease.status = LeaseStatus.DEFAULTED;
        
        emit LeaseTerminated(leaseId, lease.tenant, block.timestamp, "Payment default");
    }
    
    /**
     * @dev Auto-check and update lease status
     */
    function updateLeaseStatus(uint256 leaseId) external leaseExists(leaseId) {
        Lease storage lease = leases[leaseId];
        
        if (lease.status == LeaseStatus.ACTIVE && block.timestamp > lease.endDate) {
            if (lease.autoRenew) {
                // Auto-renew for same duration
                uint256 duration = lease.endDate - lease.startDate;
                lease.endDate += duration;
                emit LeaseRenewed(leaseId, lease.endDate);
            } else {
                lease.status = LeaseStatus.EXPIRED;
            }
        }
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
     * @dev Update late payment settings
     */
    function setLatePaymentSettings(
        uint256 gracePeriod,
        uint256 feePercent
    ) external onlyRole(ADMIN_ROLE) {
        if (gracePeriod > 0) latePaymentGracePeriod = gracePeriod;
        if (feePercent > 0 && feePercent <= 2000) latePaymentFeePercent = feePercent; // Max 20%
        emit LatePaymentSettingsUpdated(gracePeriod, feePercent, msg.sender);
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
     * @dev Withdraw rental income for distribution
     */
    function withdrawRentalIncome(
        uint256 propertyId,
        uint256 amount
    ) external onlyRole(PROPERTY_MANAGER_ROLE) returns (uint256) {
        require(amount <= propertyRentalIncome[propertyId], "Insufficient balance");
        
        propertyRentalIncome[propertyId] -= amount;
        
        usdcToken.safeTransfer(msg.sender, amount);
        
        return amount;
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
     * @dev Get lease details
     */
    function getLease(uint256 leaseId) external view returns (Lease memory) {
        return leases[leaseId];
    }
    
    /**
     * @dev Get rent payment history
     */
    function getRentPayments(uint256 leaseId) external view returns (RentPayment[] memory) {
        return rentPayments[leaseId];
    }
    
    /**
     * @dev Get active leases for property
     */
    function getPropertyLeases(uint256 propertyId) external view returns (uint256[] memory) {
        return propertyLeases[propertyId];
    }
    
    /**
     * @dev Get tenant's leases
     */
    function getTenantLeases(address tenant) external view returns (uint256[] memory) {
        return tenantLeases[tenant];
    }
    
    /**
     * @dev Check if rent is overdue
     */
    function isRentOverdue(uint256 leaseId) external view leaseExists(leaseId) returns (bool) {
        Lease memory lease = leases[leaseId];
        
        if (lease.status != LeaseStatus.ACTIVE) {
            return false;
        }
        
        uint256 dueDate = lease.lastPaymentDate == 0 
            ? lease.startDate 
            : lease.lastPaymentDate + 30 days;
        
        return block.timestamp > dueDate;
    }
    
    /**
     * @dev Get next rent due date
     */
    function getNextDueDate(uint256 leaseId) external view leaseExists(leaseId) returns (uint256) {
        Lease memory lease = leases[leaseId];
        
        return lease.lastPaymentDate == 0 
            ? lease.startDate 
            : lease.lastPaymentDate + 30 days;
    }
    
    /**
     * @dev Get total rent collected for property
     */
    function getTotalRentCollected(uint256 propertyId) external view returns (uint256) {
        return propertyRentalIncome[propertyId];
    }
    
    /**
     * @dev Get active lease count for property
     */
    function getActiveLeaseCount(uint256 propertyId) external view returns (uint256) {
        uint256[] memory leaseIds = propertyLeases[propertyId];
        uint256 count = 0;
        
        for (uint256 i = 0; i < leaseIds.length; i++) {
            if (leases[leaseIds[i]].status == LeaseStatus.ACTIVE) {
                count++;
            }
        }
        
        return count;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RentDistribution
 * @dev Manages rental income collection and distribution to property token holders
 * 
 * Features:
 * - Automatic pro-rata yield distribution based on token holdings
 * - Support for multiple payment tokens (ETH, USDC, etc.)
 * - Dividend checkpoint system for accurate distribution
 * - Claim interface for token holders
 * - Property manager deposits
 */
contract RentDistribution is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ Structs ============
    
    struct PropertyRent {
        address propertyToken;           // ERC20 token representing property ownership
        address paymentToken;            // Token used for rent payments (address(0) for ETH)
        uint256 totalDistributed;        // Total rent distributed to date
        uint256 lastDistributionTime;    // Last distribution timestamp
        uint256 accumulatedRentPerShare; // Accumulated rent per share (scaled by 1e18)
        bool isActive;
    }
    
    struct UserInfo {
        uint256 rewardDebt;              // Reward debt for calculating pending rewards
        uint256 totalClaimed;            // Total amount claimed by user
        uint256 lastClaimTime;           // Last claim timestamp
    }
    
    struct Distribution {
        uint256 amount;
        uint256 timestamp;
        uint256 totalShares;             // Total token supply at distribution time
        string description;              // e.g., "January 2026 Rent"
    }
    
    // ============ Constants ============
    
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MIN_DISTRIBUTION_AMOUNT = 1e6; // Minimum 1 USDC (6 decimals)
    
    // ============ State Variables ============
    
    // Property token => PropertyRent info
    mapping(address => PropertyRent) public propertyRents;
    address[] public registeredProperties;
    
    // Property token => user => UserInfo
    mapping(address => mapping(address => UserInfo)) public userInfo;
    
    // Property token => distribution history
    mapping(address => Distribution[]) public distributionHistory;
    
    // Property managers who can deposit rent
    mapping(address => mapping(address => bool)) public propertyManagers;
    
    // Supported payment tokens (USDC, etc.)
    mapping(address => bool) public supportedPaymentTokens;
    
    // Treasury for platform fees (optional)
    address public treasury;
    uint256 public platformFeeBps; // Fee in basis points (100 = 1%)
    
    // ============ Events ============
    
    event PropertyRegistered(
        address indexed propertyToken,
        address indexed paymentToken
    );
    
    event RentDeposited(
        address indexed propertyToken,
        address indexed depositor,
        uint256 amount,
        string description
    );
    
    event RentClaimed(
        address indexed propertyToken,
        address indexed user,
        uint256 amount
    );
    
    event PropertyManagerUpdated(
        address indexed propertyToken,
        address indexed manager,
        bool isManager
    );
    
    event PlatformFeeUpdated(uint256 newFeeBps);
    
    // ============ Constructor ============
    
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
        platformFeeBps = 0; // No fee by default
        
        // ETH is always supported (represented by address(0))
        supportedPaymentTokens[address(0)] = true;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Register a property token for rent distribution
     */
    function registerProperty(
        address propertyToken,
        address paymentToken
    ) external onlyOwner {
        require(propertyToken != address(0), "Invalid property token");
        require(!propertyRents[propertyToken].isActive, "Already registered");
        require(
            paymentToken == address(0) || supportedPaymentTokens[paymentToken],
            "Payment token not supported"
        );
        
        propertyRents[propertyToken] = PropertyRent({
            propertyToken: propertyToken,
            paymentToken: paymentToken,
            totalDistributed: 0,
            lastDistributionTime: 0,
            accumulatedRentPerShare: 0,
            isActive: true
        });
        
        registeredProperties.push(propertyToken);
        
        emit PropertyRegistered(propertyToken, paymentToken);
    }
    
    /**
     * @dev Add/remove a property manager
     */
    function setPropertyManager(
        address propertyToken,
        address manager,
        bool isManager
    ) external onlyOwner {
        require(propertyRents[propertyToken].isActive, "Property not registered");
        require(manager != address(0), "Invalid manager");
        
        propertyManagers[propertyToken][manager] = isManager;
        
        emit PropertyManagerUpdated(propertyToken, manager, isManager);
    }
    
    /**
     * @dev Add a supported payment token
     */
    function addPaymentToken(address token) external onlyOwner {
        supportedPaymentTokens[token] = true;
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }
    
    /**
     * @dev Update treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
    }
    
    // ============ Rent Deposit Functions ============
    
    /**
     * @dev Deposit rent for distribution (ERC20 tokens)
     */
    function depositRent(
        address propertyToken,
        uint256 amount,
        string memory description
    ) external nonReentrant {
        PropertyRent storage rent = propertyRents[propertyToken];
        require(rent.isActive, "Property not registered");
        require(rent.paymentToken != address(0), "Property uses ETH");
        require(
            msg.sender == owner() || propertyManagers[propertyToken][msg.sender],
            "Not authorized"
        );
        require(amount >= MIN_DISTRIBUTION_AMOUNT, "Amount too small");
        
        // Transfer rent payment
        IERC20(rent.paymentToken).safeTransferFrom(msg.sender, address(this), amount);
        
        // Handle platform fee
        uint256 netAmount = _handleFee(rent.paymentToken, amount);
        
        // Update distribution
        _distribute(propertyToken, netAmount, description);
    }
    
    /**
     * @dev Deposit rent in ETH
     */
    function depositRentETH(
        address propertyToken,
        string memory description
    ) external payable nonReentrant {
        PropertyRent storage rent = propertyRents[propertyToken];
        require(rent.isActive, "Property not registered");
        require(rent.paymentToken == address(0), "Property uses ERC20");
        require(
            msg.sender == owner() || propertyManagers[propertyToken][msg.sender],
            "Not authorized"
        );
        require(msg.value >= MIN_DISTRIBUTION_AMOUNT, "Amount too small");
        
        // Handle platform fee
        uint256 netAmount = _handleFeeETH(msg.value);
        
        // Update distribution
        _distribute(propertyToken, netAmount, description);
    }
    
    function _handleFee(address paymentToken, uint256 amount) internal returns (uint256) {
        if (platformFeeBps == 0 || treasury == address(0)) {
            return amount;
        }
        
        uint256 fee = (amount * platformFeeBps) / 10000;
        if (fee > 0) {
            IERC20(paymentToken).safeTransfer(treasury, fee);
        }
        
        return amount - fee;
    }
    
    function _handleFeeETH(uint256 amount) internal returns (uint256) {
        if (platformFeeBps == 0 || treasury == address(0)) {
            return amount;
        }
        
        uint256 fee = (amount * platformFeeBps) / 10000;
        if (fee > 0) {
            (bool success, ) = treasury.call{value: fee}("");
            require(success, "Fee transfer failed");
        }
        
        return amount - fee;
    }
    
    function _distribute(
        address propertyToken,
        uint256 amount,
        string memory description
    ) internal {
        PropertyRent storage rent = propertyRents[propertyToken];
        
        uint256 totalShares = IERC20(propertyToken).totalSupply();
        require(totalShares > 0, "No token supply");
        
        // Update accumulated rent per share
        rent.accumulatedRentPerShare += (amount * PRECISION) / totalShares;
        rent.totalDistributed += amount;
        rent.lastDistributionTime = block.timestamp;
        
        // Record distribution
        distributionHistory[propertyToken].push(Distribution({
            amount: amount,
            timestamp: block.timestamp,
            totalShares: totalShares,
            description: description
        }));
        
        emit RentDeposited(propertyToken, msg.sender, amount, description);
    }
    
    // ============ Claim Functions ============
    
    /**
     * @dev Claim pending rental income
     */
    function claimRent(address propertyToken) external nonReentrant {
        uint256 pending = pendingRent(propertyToken, msg.sender);
        require(pending > 0, "Nothing to claim");
        
        PropertyRent storage rent = propertyRents[propertyToken];
        UserInfo storage user = userInfo[propertyToken][msg.sender];
        
        // Update user info
        uint256 userShares = IERC20(propertyToken).balanceOf(msg.sender);
        user.rewardDebt = (userShares * rent.accumulatedRentPerShare) / PRECISION;
        user.totalClaimed += pending;
        user.lastClaimTime = block.timestamp;
        
        // Transfer rent to user
        if (rent.paymentToken == address(0)) {
            (bool success, ) = msg.sender.call{value: pending}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(rent.paymentToken).safeTransfer(msg.sender, pending);
        }
        
        emit RentClaimed(propertyToken, msg.sender, pending);
    }
    
    /**
     * @dev Claim rent from multiple properties
     */
    function claimAllRent(address[] calldata propertyTokens) external nonReentrant {
        for (uint256 i = 0; i < propertyTokens.length; i++) {
            address propertyToken = propertyTokens[i];
            uint256 pending = pendingRent(propertyToken, msg.sender);
            
            if (pending > 0) {
                PropertyRent storage rent = propertyRents[propertyToken];
                UserInfo storage user = userInfo[propertyToken][msg.sender];
                
                uint256 userShares = IERC20(propertyToken).balanceOf(msg.sender);
                user.rewardDebt = (userShares * rent.accumulatedRentPerShare) / PRECISION;
                user.totalClaimed += pending;
                user.lastClaimTime = block.timestamp;
                
                if (rent.paymentToken == address(0)) {
                    (bool success, ) = msg.sender.call{value: pending}("");
                    require(success, "ETH transfer failed");
                } else {
                    IERC20(rent.paymentToken).safeTransfer(msg.sender, pending);
                }
                
                emit RentClaimed(propertyToken, msg.sender, pending);
            }
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Calculate pending rent for a user
     */
    function pendingRent(address propertyToken, address user) public view returns (uint256) {
        PropertyRent storage rent = propertyRents[propertyToken];
        if (!rent.isActive) return 0;
        
        UserInfo storage info = userInfo[propertyToken][user];
        uint256 userShares = IERC20(propertyToken).balanceOf(user);
        
        if (userShares == 0) return 0;
        
        uint256 accumulatedReward = (userShares * rent.accumulatedRentPerShare) / PRECISION;
        
        if (accumulatedReward <= info.rewardDebt) return 0;
        
        return accumulatedReward - info.rewardDebt;
    }
    
    /**
     * @dev Get total pending rent across all properties for a user
     */
    function totalPendingRent(address user) external view returns (uint256 totalPending) {
        for (uint256 i = 0; i < registeredProperties.length; i++) {
            totalPending += pendingRent(registeredProperties[i], user);
        }
    }
    
    /**
     * @dev Get user's rent info for a property
     */
    function getUserInfo(
        address propertyToken,
        address user
    ) external view returns (
        uint256 pending,
        uint256 totalClaimed,
        uint256 lastClaimTime,
        uint256 tokenBalance,
        uint256 sharePercentage
    ) {
        pending = pendingRent(propertyToken, user);
        
        UserInfo storage info = userInfo[propertyToken][user];
        totalClaimed = info.totalClaimed;
        lastClaimTime = info.lastClaimTime;
        
        tokenBalance = IERC20(propertyToken).balanceOf(user);
        uint256 totalSupply = IERC20(propertyToken).totalSupply();
        sharePercentage = totalSupply > 0 ? (tokenBalance * 10000) / totalSupply : 0;
    }
    
    /**
     * @dev Get property rent info
     */
    function getPropertyInfo(address propertyToken) external view returns (
        address paymentToken,
        uint256 totalDistributed,
        uint256 lastDistributionTime,
        uint256 distributionCount,
        bool isActive
    ) {
        PropertyRent storage rent = propertyRents[propertyToken];
        return (
            rent.paymentToken,
            rent.totalDistributed,
            rent.lastDistributionTime,
            distributionHistory[propertyToken].length,
            rent.isActive
        );
    }
    
    /**
     * @dev Get distribution history for a property
     */
    function getDistributionHistory(
        address propertyToken,
        uint256 offset,
        uint256 limit
    ) external view returns (Distribution[] memory) {
        Distribution[] storage history = distributionHistory[propertyToken];
        
        if (offset >= history.length) {
            return new Distribution[](0);
        }
        
        uint256 end = offset + limit;
        if (end > history.length) {
            end = history.length;
        }
        
        Distribution[] memory result = new Distribution[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = history[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get all registered properties
     */
    function getRegisteredProperties() external view returns (address[] memory) {
        return registeredProperties;
    }
    
    /**
     * @dev Calculate APY based on recent distributions
     */
    function estimateAPY(address propertyToken) external view returns (uint256) {
        Distribution[] storage history = distributionHistory[propertyToken];
        if (history.length == 0) return 0;
        
        // Get distributions from last 90 days
        uint256 total90Days = 0;
        uint256 cutoff = block.timestamp - 90 days;
        
        for (uint256 i = history.length; i > 0; i--) {
            Distribution storage dist = history[i - 1];
            if (dist.timestamp < cutoff) break;
            total90Days += dist.amount;
        }
        
        if (total90Days == 0) return 0;
        
        // Annualize: (90-day total * 4) / total supply * 10000 for basis points
        uint256 totalSupply = IERC20(propertyToken).totalSupply();
        if (totalSupply == 0) return 0;
        
        return (total90Days * 4 * 10000) / totalSupply;
    }
    
    // ============ Update Reward Debt on Transfer ============
    
    /**
     * @dev Should be called by PropertyToken on transfers to update reward debt
     * This ensures accurate reward tracking when tokens are transferred
     */
    function updateUserOnTransfer(
        address propertyToken,
        address from,
        address to,
        uint256 /* amount */
    ) external {
        // Only callable by the property token itself
        require(msg.sender == propertyToken, "Only property token can call");
        
        PropertyRent storage rent = propertyRents[propertyToken];
        if (!rent.isActive) return;
        
        // Update sender's reward debt
        if (from != address(0)) {
            UserInfo storage fromInfo = userInfo[propertyToken][from];
            uint256 fromShares = IERC20(propertyToken).balanceOf(from);
            fromInfo.rewardDebt = (fromShares * rent.accumulatedRentPerShare) / PRECISION;
        }
        
        // Update receiver's reward debt
        if (to != address(0)) {
            UserInfo storage toInfo = userInfo[propertyToken][to];
            uint256 toShares = IERC20(propertyToken).balanceOf(to);
            toInfo.rewardDebt = (toShares * rent.accumulatedRentPerShare) / PRECISION;
        }
    }
    
    // ============ Emergency Functions ============
    
    /**
     * @dev Emergency withdraw for stuck tokens (only owner)
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }
    
    // Allow receiving ETH
    receive() external payable {}
}

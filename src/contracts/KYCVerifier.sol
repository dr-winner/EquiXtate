// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYCVerifier
 * @dev On-chain registry of KYC-verified addresses
 * Updated by backend oracle after Sumsub verification
 */
contract KYCVerifier is Ownable {
    
    enum KYCTier {
        NONE,      // Not verified
        BASIC,     // Basic identity check
        STANDARD,  // + Address verification
        ENHANCED   // + Source of funds (can list properties)
    }
    
    struct KYCRecord {
        bool isVerified;
        KYCTier tier;
        uint256 verifiedAt;
        uint256 expiresAt; // KYC expires after 1 year
        string sumsubApplicantId;
    }
    
    // Wallet address => KYC status
    mapping(address => KYCRecord) public kycRecords;
    
    // Backend oracle address that can update KYC status
    address public kycOracle;
    
    // Events
    event KYCUpdated(
        address indexed user,
        bool isVerified,
        KYCTier tier,
        uint256 expiresAt
    );
    event KYCRevoked(address indexed user);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    constructor(address _kycOracle) Ownable(msg.sender) {
        require(_kycOracle != address(0), "Invalid oracle address");
        kycOracle = _kycOracle;
    }
    
    /**
     * @dev Update KYC status for a user (called by backend oracle)
     */
    function setKYCStatus(
        address user,
        bool isVerified,
        KYCTier tier,
        string memory sumsubApplicantId
    ) external {
        require(msg.sender == kycOracle, "Only oracle can update KYC");
        require(user != address(0), "Invalid address");
        
        uint256 expiresAt = isVerified 
            ? block.timestamp + 365 days 
            : 0;
        
        kycRecords[user] = KYCRecord({
            isVerified: isVerified,
            tier: tier,
            verifiedAt: block.timestamp,
            expiresAt: expiresAt,
            sumsubApplicantId: sumsubApplicantId
        });
        
        emit KYCUpdated(user, isVerified, tier, expiresAt);
    }
    
    /**
     * @dev Revoke KYC status for a user
     */
    function revokeKYC(address user) external {
        require(msg.sender == kycOracle, "Only oracle can revoke KYC");
        require(user != address(0), "Invalid address");
        
        kycRecords[user].isVerified = false;
        kycRecords[user].expiresAt = block.timestamp;
        
        emit KYCRevoked(user);
    }
    
    /**
     * @dev Check if a user is KYC verified and not expired
     */
    function isKYCVerified(address user) public view returns (bool) {
        KYCRecord memory record = kycRecords[user];
        return record.isVerified && block.timestamp < record.expiresAt;
    }
    
    /**
     * @dev Get user's KYC tier
     */
    function getUserTier(address user) public view returns (KYCTier) {
        if (!isKYCVerified(user)) {
            return KYCTier.NONE;
        }
        return kycRecords[user].tier;
    }
    
    /**
     * @dev Check if user can list properties (requires ENHANCED tier)
     */
    function canListProperties(address user) public view returns (bool) {
        return isKYCVerified(user) && getUserTier(user) == KYCTier.ENHANCED;
    }
    
    /**
     * @dev Get full KYC record for a user
     */
    function getKYCRecord(address user) external view returns (
        bool isVerified,
        KYCTier tier,
        uint256 verifiedAt,
        uint256 expiresAt,
        string memory sumsubApplicantId
    ) {
        KYCRecord memory record = kycRecords[user];
        return (
            record.isVerified,
            record.tier,
            record.verifiedAt,
            record.expiresAt,
            record.sumsubApplicantId
        );
    }
    
    /**
     * @dev Update the oracle address (only owner)
     */
    function setOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = kycOracle;
        kycOracle = newOracle;
        emit OracleUpdated(oldOracle, newOracle);
    }
    
    /**
     * @dev Check if KYC is expiring soon (within 30 days)
     */
    function isKYCExpiringSoon(address user) public view returns (bool) {
        KYCRecord memory record = kycRecords[user];
        if (!record.isVerified) return false;
        return (record.expiresAt - block.timestamp) < 30 days;
    }
}

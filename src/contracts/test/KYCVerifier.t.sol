// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {KYCVerifier} from "../KYCVerifier.sol";

/**
 * @title KYCVerifier Tests
 * @dev Comprehensive test suite for KYC verification contract
 */
contract KYCVerifierTest is Test {
    KYCVerifier public kycVerifier;
    
    address public owner;
    address public oracle;
    address public user1;
    address public user2;
    address public attacker;
    
    // Events to test
    event KYCUpdated(
        address indexed user,
        bool isVerified,
        KYCVerifier.KYCTier tier,
        uint256 expiresAt
    );
    event KYCRevoked(address indexed user);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    function setUp() public {
        owner = address(this);
        oracle = makeAddr("oracle");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        attacker = makeAddr("attacker");
        
        kycVerifier = new KYCVerifier(oracle);
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor_SetsOwner() public view {
        assertEq(kycVerifier.owner(), owner);
    }
    
    function test_Constructor_SetsOracle() public view {
        assertEq(kycVerifier.kycOracle(), oracle);
    }
    
    function test_Constructor_RevertOnZeroOracle() public {
        vm.expectRevert("Invalid oracle address");
        new KYCVerifier(address(0));
    }
    
    // ============ setKYCStatus Tests ============
    
    function test_SetKYCStatus_BasicTier() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        (bool isVerified, KYCVerifier.KYCTier tier, , , string memory applicantId) = kycVerifier.getKYCRecord(user1);
        
        assertTrue(isVerified);
        assertEq(uint8(tier), uint8(KYCVerifier.KYCTier.BASIC));
        assertEq(applicantId, "sumsub_123");
    }
    
    function test_SetKYCStatus_StandardTier() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.STANDARD, "sumsub_456");
        
        assertEq(uint8(kycVerifier.getUserTier(user1)), uint8(KYCVerifier.KYCTier.STANDARD));
    }
    
    function test_SetKYCStatus_EnhancedTier() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_789");
        
        assertEq(uint8(kycVerifier.getUserTier(user1)), uint8(KYCVerifier.KYCTier.ENHANCED));
        assertTrue(kycVerifier.canListProperties(user1));
    }
    
    function test_SetKYCStatus_SetsExpiry() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        (, , , uint256 expiresAt, ) = kycVerifier.getKYCRecord(user1);
        
        // Should expire in 365 days
        assertEq(expiresAt, block.timestamp + 365 days);
    }
    
    function test_SetKYCStatus_Unverified_NoExpiry() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, false, KYCVerifier.KYCTier.NONE, "");
        
        (, , , uint256 expiresAt, ) = kycVerifier.getKYCRecord(user1);
        
        assertEq(expiresAt, 0);
    }
    
    function test_SetKYCStatus_EmitsEvent() public {
        vm.prank(oracle);
        
        vm.expectEmit(true, false, false, true);
        emit KYCUpdated(user1, true, KYCVerifier.KYCTier.BASIC, block.timestamp + 365 days);
        
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
    }
    
    function test_SetKYCStatus_RevertOnNonOracle() public {
        vm.prank(attacker);
        vm.expectRevert("Only oracle can update KYC");
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
    }
    
    function test_SetKYCStatus_RevertOnZeroAddress() public {
        vm.prank(oracle);
        vm.expectRevert("Invalid address");
        kycVerifier.setKYCStatus(address(0), true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
    }
    
    function test_SetKYCStatus_CanUpdate() public {
        // First set to BASIC
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        // Update to ENHANCED
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_123_updated");
        
        assertEq(uint8(kycVerifier.getUserTier(user1)), uint8(KYCVerifier.KYCTier.ENHANCED));
    }
    
    // ============ revokeKYC Tests ============
    
    function test_RevokeKYC_Success() public {
        // First verify user
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_123");
        assertTrue(kycVerifier.isKYCVerified(user1));
        
        // Revoke
        vm.prank(oracle);
        kycVerifier.revokeKYC(user1);
        
        assertFalse(kycVerifier.isKYCVerified(user1));
    }
    
    function test_RevokeKYC_EmitsEvent() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        vm.prank(oracle);
        vm.expectEmit(true, false, false, false);
        emit KYCRevoked(user1);
        kycVerifier.revokeKYC(user1);
    }
    
    function test_RevokeKYC_RevertOnNonOracle() public {
        vm.prank(attacker);
        vm.expectRevert("Only oracle can revoke KYC");
        kycVerifier.revokeKYC(user1);
    }
    
    function test_RevokeKYC_RevertOnZeroAddress() public {
        vm.prank(oracle);
        vm.expectRevert("Invalid address");
        kycVerifier.revokeKYC(address(0));
    }
    
    // ============ isKYCVerified Tests ============
    
    function test_IsKYCVerified_ReturnsTrueWhenVerified() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        assertTrue(kycVerifier.isKYCVerified(user1));
    }
    
    function test_IsKYCVerified_ReturnsFalseWhenNotVerified() public view {
        assertFalse(kycVerifier.isKYCVerified(user1));
    }
    
    function test_IsKYCVerified_ReturnsFalseWhenExpired() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        // Fast forward past expiry
        vm.warp(block.timestamp + 366 days);
        
        assertFalse(kycVerifier.isKYCVerified(user1));
    }
    
    // ============ getUserTier Tests ============
    
    function test_GetUserTier_ReturnsNoneWhenNotVerified() public view {
        assertEq(uint8(kycVerifier.getUserTier(user1)), uint8(KYCVerifier.KYCTier.NONE));
    }
    
    function test_GetUserTier_ReturnsNoneWhenExpired() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_123");
        
        vm.warp(block.timestamp + 366 days);
        
        assertEq(uint8(kycVerifier.getUserTier(user1)), uint8(KYCVerifier.KYCTier.NONE));
    }
    
    // ============ canListProperties Tests ============
    
    function test_CanListProperties_TrueForEnhanced() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_123");
        
        assertTrue(kycVerifier.canListProperties(user1));
    }
    
    function test_CanListProperties_FalseForBasic() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        assertFalse(kycVerifier.canListProperties(user1));
    }
    
    function test_CanListProperties_FalseForStandard() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.STANDARD, "sumsub_123");
        
        assertFalse(kycVerifier.canListProperties(user1));
    }
    
    function test_CanListProperties_FalseWhenExpired() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_123");
        
        vm.warp(block.timestamp + 366 days);
        
        assertFalse(kycVerifier.canListProperties(user1));
    }
    
    // ============ setOracle Tests ============
    
    function test_SetOracle_Success() public {
        address newOracle = makeAddr("newOracle");
        
        kycVerifier.setOracle(newOracle);
        
        assertEq(kycVerifier.kycOracle(), newOracle);
    }
    
    function test_SetOracle_EmitsEvent() public {
        address newOracle = makeAddr("newOracle");
        
        vm.expectEmit(true, true, false, false);
        emit OracleUpdated(oracle, newOracle);
        
        kycVerifier.setOracle(newOracle);
    }
    
    function test_SetOracle_RevertOnNonOwner() public {
        address newOracle = makeAddr("newOracle");
        
        vm.prank(attacker);
        vm.expectRevert();
        kycVerifier.setOracle(newOracle);
    }
    
    function test_SetOracle_RevertOnZeroAddress() public {
        vm.expectRevert("Invalid oracle address");
        kycVerifier.setOracle(address(0));
    }
    
    // ============ isKYCExpiringSoon Tests ============
    
    function test_IsKYCExpiringSoon_FalseWhenNotExpiring() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        assertFalse(kycVerifier.isKYCExpiringSoon(user1));
    }
    
    function test_IsKYCExpiringSoon_TrueWhenExpiringSoon() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        // Fast forward to 340 days (25 days until expiry)
        vm.warp(block.timestamp + 340 days);
        
        assertTrue(kycVerifier.isKYCExpiringSoon(user1));
    }
    
    function test_IsKYCExpiringSoon_FalseWhenNotVerified() public view {
        assertFalse(kycVerifier.isKYCExpiringSoon(user1));
    }
    
    // ============ getKYCRecord Tests ============
    
    function test_GetKYCRecord_ReturnsAllFields() public {
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_app_id_123");
        
        (
            bool isVerified,
            KYCVerifier.KYCTier tier,
            uint256 verifiedAt,
            uint256 expiresAt,
            string memory applicantId
        ) = kycVerifier.getKYCRecord(user1);
        
        assertTrue(isVerified);
        assertEq(uint8(tier), uint8(KYCVerifier.KYCTier.ENHANCED));
        assertEq(verifiedAt, block.timestamp);
        assertEq(expiresAt, block.timestamp + 365 days);
        assertEq(applicantId, "sumsub_app_id_123");
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_SetKYCStatus_AnyUser(address user) public {
        vm.assume(user != address(0));
        
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user, true, KYCVerifier.KYCTier.BASIC, "fuzz_test");
        
        assertTrue(kycVerifier.isKYCVerified(user));
    }
    
    function testFuzz_KYCExpiry(uint256 daysToWarp) public {
        vm.assume(daysToWarp < 365 * 10); // Bound to reasonable range
        
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "sumsub_123");
        
        vm.warp(block.timestamp + daysToWarp * 1 days);
        
        if (daysToWarp >= 365) {
            assertFalse(kycVerifier.isKYCVerified(user1));
        } else {
            assertTrue(kycVerifier.isKYCVerified(user1));
        }
    }
    
    // ============ Edge Cases ============
    
    function test_MultipleUsers_IndependentStatus() public {
        vm.startPrank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.BASIC, "user1_id");
        kycVerifier.setKYCStatus(user2, true, KYCVerifier.KYCTier.ENHANCED, "user2_id");
        vm.stopPrank();
        
        assertEq(uint8(kycVerifier.getUserTier(user1)), uint8(KYCVerifier.KYCTier.BASIC));
        assertEq(uint8(kycVerifier.getUserTier(user2)), uint8(KYCVerifier.KYCTier.ENHANCED));
        
        assertFalse(kycVerifier.canListProperties(user1));
        assertTrue(kycVerifier.canListProperties(user2));
    }
    
    function test_RevokeDoesNotAffectOtherUsers() public {
        vm.startPrank(oracle);
        kycVerifier.setKYCStatus(user1, true, KYCVerifier.KYCTier.ENHANCED, "user1_id");
        kycVerifier.setKYCStatus(user2, true, KYCVerifier.KYCTier.ENHANCED, "user2_id");
        kycVerifier.revokeKYC(user1);
        vm.stopPrank();
        
        assertFalse(kycVerifier.isKYCVerified(user1));
        assertTrue(kycVerifier.isKYCVerified(user2));
    }
}

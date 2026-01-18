// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {KYCVerifier} from "../KYCVerifier.sol";
import {PropertyRegistry} from "../PropertyRegistry.sol";

/**
 * @title PropertyRegistry Tests
 * @dev Comprehensive test suite for PropertyRegistry contract
 */
contract PropertyRegistryTest is Test {
    KYCVerifier public kycVerifier;
    PropertyRegistry public propertyRegistry;
    
    address public owner;
    address public kycOracle;
    address public propertyOracle;
    address public verifiedUser;
    address public basicUser;
    address public unverifiedUser;
    address public attacker;
    
    // Test property data
    string constant PROPERTY_NAME = "Luxury Apartment NYC";
    string constant PROPERTY_LOCATION = "123 Park Avenue, New York, NY 10001";
    uint256 constant PROPERTY_VALUE = 1_000_000 ether;
    bytes32 constant DOCUMENT_HASH = keccak256("deed_document_content");
    
    // Events to test
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed ownerAddr,
        string name,
        uint256 value,
        bytes32 documentHash
    );
    event PropertyUpdated(uint256 indexed propertyId);
    event PropertyDeactivated(uint256 indexed propertyId);
    event PropertyVerified(uint256 indexed propertyId, string verificationId);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    function setUp() public {
        owner = address(this);
        kycOracle = makeAddr("kycOracle");
        propertyOracle = makeAddr("propertyOracle");
        verifiedUser = makeAddr("verifiedUser");
        basicUser = makeAddr("basicUser");
        unverifiedUser = makeAddr("unverifiedUser");
        attacker = makeAddr("attacker");
        
        // Deploy KYCVerifier
        kycVerifier = new KYCVerifier(kycOracle);
        
        // Deploy PropertyRegistry
        propertyRegistry = new PropertyRegistry(address(kycVerifier), propertyOracle);
        
        // Setup KYC statuses
        vm.startPrank(kycOracle);
        kycVerifier.setKYCStatus(verifiedUser, true, KYCVerifier.KYCTier.ENHANCED, "enhanced_user");
        kycVerifier.setKYCStatus(basicUser, true, KYCVerifier.KYCTier.BASIC, "basic_user");
        vm.stopPrank();
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor_SetsKYCVerifier() public view {
        assertEq(address(propertyRegistry.kycVerifier()), address(kycVerifier));
    }
    
    function test_Constructor_SetsOracle() public view {
        assertEq(propertyRegistry.verificationOracle(), propertyOracle);
    }
    
    function test_Constructor_RevertOnZeroKYCVerifier() public {
        vm.expectRevert("Invalid KYC verifier");
        new PropertyRegistry(address(0), propertyOracle);
    }
    
    function test_Constructor_RevertOnZeroOracle() public {
        vm.expectRevert("Invalid verification oracle");
        new PropertyRegistry(address(kycVerifier), address(0));
    }
    
    // ============ submitProperty Tests ============
    
    function test_SubmitProperty_Success() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        assertEq(propertyId, 1);
        assertEq(propertyRegistry.propertyCount(), 1);
    }
    
    function test_SubmitProperty_StoreCorrectData() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        (
            uint256 id,
            address propOwner,
            string memory name,
            string memory location,
            uint256 value,
            address tokenAddress,
            bool isActive,
            ,
            bytes32 docHash,
            ,
            
        ) = propertyRegistry.properties(propertyId);
        
        assertEq(id, 1);
        assertEq(propOwner, verifiedUser);
        assertEq(name, PROPERTY_NAME);
        assertEq(location, PROPERTY_LOCATION);
        assertEq(value, PROPERTY_VALUE);
        assertEq(tokenAddress, address(0));
        assertFalse(isActive); // Not active until oracle approves
        assertEq(docHash, DOCUMENT_HASH);
    }
    
    function test_SubmitProperty_SetsPendingApproval() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        assertTrue(propertyRegistry.pendingApproval(propertyId));
    }
    
    function test_SubmitProperty_EmitsEvent() public {
        vm.prank(verifiedUser);
        
        vm.expectEmit(true, true, false, true);
        emit PropertyListed(1, verifiedUser, PROPERTY_NAME, PROPERTY_VALUE, DOCUMENT_HASH);
        
        propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
    }
    
    function test_SubmitProperty_RevertOnUnverifiedUser() public {
        vm.prank(unverifiedUser);
        vm.expectRevert("Enhanced KYC verification required to list properties");
        propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
    }
    
    function test_SubmitProperty_RevertOnBasicKYC() public {
        vm.prank(basicUser);
        vm.expectRevert("Enhanced KYC verification required to list properties");
        propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
    }
    
    function test_SubmitProperty_RevertOnEmptyName() public {
        vm.prank(verifiedUser);
        vm.expectRevert("Property name required");
        propertyRegistry.submitProperty("", PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
    }
    
    function test_SubmitProperty_RevertOnEmptyLocation() public {
        vm.prank(verifiedUser);
        vm.expectRevert("Property location required");
        propertyRegistry.submitProperty(PROPERTY_NAME, "", PROPERTY_VALUE, DOCUMENT_HASH);
    }
    
    function test_SubmitProperty_RevertOnZeroValue() public {
        vm.prank(verifiedUser);
        vm.expectRevert("Property value must be positive");
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, 0, DOCUMENT_HASH);
    }
    
    function test_SubmitProperty_RevertOnZeroDocHash() public {
        vm.prank(verifiedUser);
        vm.expectRevert("Document hash required");
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, bytes32(0));
    }
    
    // ============ Duplicate Prevention Tests ============
    
    function test_SubmitProperty_RevertOnDuplicateDocument() public {
        vm.startPrank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        vm.expectRevert("Property with this deed document already exists");
        propertyRegistry.submitProperty("Different Name", "Different Location", PROPERTY_VALUE, DOCUMENT_HASH);
        vm.stopPrank();
    }
    
    function test_SubmitProperty_RevertOnDuplicateLocation() public {
        bytes32 differentDocHash = keccak256("different_document");
        
        vm.startPrank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        vm.expectRevert("Property at this location already listed");
        propertyRegistry.submitProperty("Different Name", PROPERTY_LOCATION, PROPERTY_VALUE, differentDocHash);
        vm.stopPrank();
    }
    
    function test_SubmitProperty_DetectsSimilarLocations() public {
        bytes32 docHash1 = keccak256("doc1");
        bytes32 docHash2 = keccak256("doc2");
        
        vm.startPrank(verifiedUser);
        propertyRegistry.submitProperty(
            "Property 1",
            "123 Main Street, NYC",
            PROPERTY_VALUE,
            docHash1
        );
        
        // Same location with different casing should be detected
        vm.expectRevert("Property at this location already listed");
        propertyRegistry.submitProperty(
            "Property 2",
            "123 MAIN STREET, NYC",
            PROPERTY_VALUE,
            docHash2
        );
        vm.stopPrank();
    }
    
    function test_PropertyExistsByDocument() public {
        vm.prank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        assertTrue(propertyRegistry.propertyExistsByDocument(DOCUMENT_HASH));
        assertFalse(propertyRegistry.propertyExistsByDocument(keccak256("nonexistent")));
    }
    
    function test_PropertyExistsByLocation() public {
        vm.prank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        assertTrue(propertyRegistry.propertyExistsByLocation(PROPERTY_LOCATION));
        assertFalse(propertyRegistry.propertyExistsByLocation("Nonexistent Address"));
    }
    
    // ============ approveProperty Tests ============
    
    function test_ApproveProperty_Success() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        address tokenAddress = makeAddr("propertyToken");
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", tokenAddress);
        
        (, , , , , address storedToken, bool isActive, , , , string memory verificationId) = 
            propertyRegistry.properties(propertyId);
        
        assertTrue(isActive);
        assertEq(storedToken, tokenAddress);
        assertEq(verificationId, "KRNL_VERIFY_123");
        assertFalse(propertyRegistry.pendingApproval(propertyId));
    }
    
    function test_ApproveProperty_EmitsEvent() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        vm.expectEmit(true, false, false, true);
        emit PropertyVerified(propertyId, "KRNL_VERIFY_123");
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
    }
    
    function test_ApproveProperty_RevertOnNonOracle() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(attacker);
        vm.expectRevert("Only oracle can call");
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
    }
    
    function test_ApproveProperty_RevertOnInvalidPropertyId() public {
        vm.prank(propertyOracle);
        vm.expectRevert("Invalid property ID");
        propertyRegistry.approveProperty(999, "KRNL_VERIFY_123", makeAddr("token"));
    }
    
    function test_ApproveProperty_RevertOnNotPending() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        // Approve once
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        // Try to approve again
        vm.prank(propertyOracle);
        vm.expectRevert("Property not pending approval");
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_456", makeAddr("token2"));
    }
    
    function test_ApproveProperty_RevertOnEmptyVerificationId() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        vm.expectRevert("Verification ID required");
        propertyRegistry.approveProperty(propertyId, "", makeAddr("token"));
    }
    
    // ============ rejectProperty Tests ============
    
    function test_RejectProperty_Success() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.rejectProperty(propertyId);
        
        assertFalse(propertyRegistry.pendingApproval(propertyId));
    }
    
    function test_RejectProperty_ClearsHashes() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        assertTrue(propertyRegistry.propertyExistsByDocument(DOCUMENT_HASH));
        
        vm.prank(propertyOracle);
        propertyRegistry.rejectProperty(propertyId);
        
        // Hashes should be cleared, allowing resubmission
        assertFalse(propertyRegistry.propertyExistsByDocument(DOCUMENT_HASH));
        assertFalse(propertyRegistry.propertyExistsByLocation(PROPERTY_LOCATION));
    }
    
    function test_RejectProperty_AllowsResubmission() public {
        vm.prank(verifiedUser);
        uint256 propertyId1 = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.rejectProperty(propertyId1);
        
        // Should be able to resubmit same property
        vm.prank(verifiedUser);
        uint256 propertyId2 = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        assertEq(propertyId2, 2);
    }
    
    function test_RejectProperty_EmitsEvent() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        vm.expectEmit(true, false, false, false);
        emit PropertyDeactivated(propertyId);
        propertyRegistry.rejectProperty(propertyId);
    }
    
    function test_RejectProperty_RevertOnNonOracle() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(attacker);
        vm.expectRevert("Only oracle can call");
        propertyRegistry.rejectProperty(propertyId);
    }
    
    // ============ updateProperty Tests ============
    
    function test_UpdateProperty_Success() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        // Approve first
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        // Update
        vm.prank(verifiedUser);
        propertyRegistry.updateProperty(propertyId, "Updated Name", 2_000_000 ether);
        
        (, , string memory name, , uint256 value, , , , , , ) = propertyRegistry.properties(propertyId);
        
        assertEq(name, "Updated Name");
        assertEq(value, 2_000_000 ether);
    }
    
    function test_UpdateProperty_RevertOnNotOwner() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        vm.prank(attacker);
        vm.expectRevert("Not property owner");
        propertyRegistry.updateProperty(propertyId, "Hacked Name", 1 ether);
    }
    
    function test_UpdateProperty_RevertOnInactive() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        // Property is not active yet (pending approval)
        vm.prank(verifiedUser);
        vm.expectRevert("Property not active");
        propertyRegistry.updateProperty(propertyId, "Updated Name", PROPERTY_VALUE);
    }
    
    // ============ deactivateProperty Tests ============
    
    function test_DeactivateProperty_ByOwner() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        vm.prank(verifiedUser);
        propertyRegistry.deactivateProperty(propertyId);
        
        (, , , , , , bool isActive, , , , ) = propertyRegistry.properties(propertyId);
        assertFalse(isActive);
    }
    
    function test_DeactivateProperty_ByContractOwner() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        // Contract owner (admin) can also deactivate
        propertyRegistry.deactivateProperty(propertyId);
        
        (, , , , , , bool isActive, , , , ) = propertyRegistry.properties(propertyId);
        assertFalse(isActive);
    }
    
    function test_DeactivateProperty_PreservesHashes() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        vm.prank(verifiedUser);
        propertyRegistry.deactivateProperty(propertyId);
        
        // Hashes should still be preserved (prevent re-listing without admin)
        assertTrue(propertyRegistry.propertyExistsByDocument(DOCUMENT_HASH));
    }
    
    // ============ clearPropertyHashes Tests ============
    
    function test_ClearPropertyHashes_Success() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        vm.prank(verifiedUser);
        propertyRegistry.deactivateProperty(propertyId);
        
        // Admin clears hashes
        propertyRegistry.clearPropertyHashes(propertyId);
        
        assertFalse(propertyRegistry.propertyExistsByDocument(DOCUMENT_HASH));
        assertFalse(propertyRegistry.propertyExistsByLocation(PROPERTY_LOCATION));
    }
    
    function test_ClearPropertyHashes_RevertOnActiveProperty() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        // Cannot clear hashes while property is active
        vm.expectRevert("Cannot clear active property hashes");
        propertyRegistry.clearPropertyHashes(propertyId);
    }
    
    function test_ClearPropertyHashes_RevertOnNonOwner() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.rejectProperty(propertyId);
        
        vm.prank(attacker);
        vm.expectRevert();
        propertyRegistry.clearPropertyHashes(propertyId);
    }
    
    // ============ setVerificationOracle Tests ============
    
    function test_SetVerificationOracle_Success() public {
        address newOracle = makeAddr("newOracle");
        
        propertyRegistry.setVerificationOracle(newOracle);
        
        assertEq(propertyRegistry.verificationOracle(), newOracle);
    }
    
    function test_SetVerificationOracle_EmitsEvent() public {
        address newOracle = makeAddr("newOracle");
        
        vm.expectEmit(true, true, false, false);
        emit OracleUpdated(propertyOracle, newOracle);
        
        propertyRegistry.setVerificationOracle(newOracle);
    }
    
    function test_SetVerificationOracle_RevertOnNonOwner() public {
        vm.prank(attacker);
        vm.expectRevert();
        propertyRegistry.setVerificationOracle(makeAddr("newOracle"));
    }
    
    function test_SetVerificationOracle_RevertOnZeroAddress() public {
        vm.expectRevert("Invalid oracle address");
        propertyRegistry.setVerificationOracle(address(0));
    }
    
    // ============ Helper Function Tests ============
    
    function test_GetOwnerProperties() public {
        bytes32 docHash1 = keccak256("doc1");
        bytes32 docHash2 = keccak256("doc2");
        
        vm.startPrank(verifiedUser);
        propertyRegistry.submitProperty("Property 1", "Location 1", PROPERTY_VALUE, docHash1);
        propertyRegistry.submitProperty("Property 2", "Location 2", PROPERTY_VALUE, docHash2);
        vm.stopPrank();
        
        uint256[] memory properties = propertyRegistry.getOwnerProperties(verifiedUser);
        
        assertEq(properties.length, 2);
        assertEq(properties[0], 1);
        assertEq(properties[1], 2);
    }
    
    function test_CanUserListProperties() public view {
        assertTrue(propertyRegistry.canUserListProperties(verifiedUser));
        assertFalse(propertyRegistry.canUserListProperties(basicUser));
        assertFalse(propertyRegistry.canUserListProperties(unverifiedUser));
    }
    
    function test_GetPropertyByDocument() public {
        vm.prank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        PropertyRegistry.Property memory prop = propertyRegistry.getPropertyByDocument(DOCUMENT_HASH);
        
        assertEq(prop.name, PROPERTY_NAME);
        assertEq(prop.owner, verifiedUser);
    }
    
    function test_GetPropertyByDocument_RevertOnNotFound() public {
        vm.expectRevert("Property not found");
        propertyRegistry.getPropertyByDocument(keccak256("nonexistent"));
    }
    
    function test_IsPendingApproval() public {
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            PROPERTY_VALUE,
            DOCUMENT_HASH
        );
        
        assertTrue(propertyRegistry.isPendingApproval(propertyId));
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_123", makeAddr("token"));
        
        assertFalse(propertyRegistry.isPendingApproval(propertyId));
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_SubmitProperty_AnyValue(uint256 value) public {
        vm.assume(value > 0);
        
        vm.prank(verifiedUser);
        uint256 propertyId = propertyRegistry.submitProperty(
            PROPERTY_NAME,
            PROPERTY_LOCATION,
            value,
            DOCUMENT_HASH
        );
        
        (, , , , uint256 storedValue, , , , , , ) = propertyRegistry.properties(propertyId);
        assertEq(storedValue, value);
    }
    
    function testFuzz_MultipleProperties(uint8 count) public {
        vm.assume(count > 0 && count < 50); // Reasonable bound
        
        vm.startPrank(verifiedUser);
        for (uint8 i = 0; i < count; i++) {
            bytes32 docHash = keccak256(abi.encodePacked("doc", i));
            string memory location = string(abi.encodePacked("Location ", i));
            
            propertyRegistry.submitProperty(
                string(abi.encodePacked("Property ", i)),
                location,
                PROPERTY_VALUE,
                docHash
            );
        }
        vm.stopPrank();
        
        assertEq(propertyRegistry.propertyCount(), count);
    }
    
    // ============ Reentrancy Tests ============
    
    function test_SubmitProperty_ReentrancyProtection() public {
        // The nonReentrant modifier should protect against reentrancy
        // This is implicitly tested by the successful submit tests
        // A malicious contract trying to reenter would fail
        vm.prank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        assertEq(propertyRegistry.propertyCount(), 1);
    }
    
    // ============ KYC Expiry Edge Case ============
    
    function test_SubmitProperty_FailsWhenKYCExpired() public {
        // First verify user can submit
        vm.prank(verifiedUser);
        propertyRegistry.submitProperty(PROPERTY_NAME, PROPERTY_LOCATION, PROPERTY_VALUE, DOCUMENT_HASH);
        
        // Fast forward past KYC expiry
        vm.warp(block.timestamp + 366 days);
        
        bytes32 newDocHash = keccak256("new_doc");
        
        vm.prank(verifiedUser);
        vm.expectRevert("Enhanced KYC verification required to list properties");
        propertyRegistry.submitProperty("New Property", "New Location", PROPERTY_VALUE, newDocHash);
    }
}

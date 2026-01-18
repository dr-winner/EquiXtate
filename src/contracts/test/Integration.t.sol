// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {KYCVerifier} from "../KYCVerifier.sol";
import {PropertyRegistry} from "../PropertyRegistry.sol";

/**
 * @title Integration Tests
 * @dev End-to-end tests simulating real-world scenarios
 * Tests the full flow from KYC verification to property listing and approval
 */
contract IntegrationTest is Test {
    KYCVerifier public kycVerifier;
    PropertyRegistry public propertyRegistry;
    
    address public platformOwner;
    address public kycOracle;
    address public propertyOracle;
    
    // Test users simulating real users
    address public alice; // Property seller
    address public bob;   // Another property seller
    address public charlie; // Unverified user
    address public dave;  // Basic KYC user
    
    // Property token mock addresses
    address public alicePropertyToken;
    address public bobPropertyToken;
    
    function setUp() public {
        // Setup platform
        platformOwner = address(this);
        kycOracle = makeAddr("SumsubOracle");
        propertyOracle = makeAddr("KRNLOracle");
        
        // Setup users
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        dave = makeAddr("dave");
        
        // Deploy token mocks
        alicePropertyToken = makeAddr("alicePropertyToken");
        bobPropertyToken = makeAddr("bobPropertyToken");
        
        // Give users some ETH for transactions
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
        vm.deal(dave, 10 ether);
        
        // Deploy contracts
        kycVerifier = new KYCVerifier(kycOracle);
        propertyRegistry = new PropertyRegistry(address(kycVerifier), propertyOracle);
    }
    
    // ============ Full Flow Tests ============
    
    /**
     * @dev Test complete happy path: KYC → Submit → Approve → List
     */
    function test_FullFlow_HappyPath() public {
        // Step 1: Alice completes Sumsub KYC
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice_123");
        
        // Verify Alice's KYC status
        assertTrue(kycVerifier.isKYCVerified(alice));
        assertTrue(kycVerifier.canListProperties(alice));
        
        // Step 2: Alice submits property
        bytes32 deedHash = keccak256("alice_property_deed_document");
        
        vm.prank(alice);
        uint256 propertyId = propertyRegistry.submitProperty(
            "Alice's Beach House",
            "123 Ocean Drive, Miami, FL 33139",
            500_000 ether,
            deedHash
        );
        
        // Verify property is pending
        assertTrue(propertyRegistry.isPendingApproval(propertyId));
        assertFalse(_isPropertyActive(propertyId));
        
        // Step 3: KRNL Oracle verifies and approves property
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_VERIFY_ALICE_001", alicePropertyToken);
        
        // Verify property is now active
        assertFalse(propertyRegistry.isPendingApproval(propertyId));
        assertTrue(_isPropertyActive(propertyId));
        
        // Step 4: Verify all data is correct
        (
            uint256 id,
            address owner,
            string memory name,
            string memory location,
            uint256 value,
            address tokenAddr,
            bool isActive,
            ,
            bytes32 docHash,
            ,
            string memory verificationId
        ) = propertyRegistry.properties(propertyId);
        
        assertEq(id, 1);
        assertEq(owner, alice);
        assertEq(name, "Alice's Beach House");
        assertEq(location, "123 Ocean Drive, Miami, FL 33139");
        assertEq(value, 500_000 ether);
        assertEq(tokenAddr, alicePropertyToken);
        assertTrue(isActive);
        assertEq(docHash, deedHash);
        assertEq(verificationId, "KRNL_VERIFY_ALICE_001");
    }
    
    /**
     * @dev Test KYC upgrade path: Basic → Enhanced
     */
    function test_KYCUpgradePath() public {
        // Dave starts with BASIC KYC
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(dave, true, KYCVerifier.KYCTier.BASIC, "sumsub_dave_basic");
        
        // Dave cannot list properties with BASIC tier
        assertTrue(kycVerifier.isKYCVerified(dave));
        assertFalse(kycVerifier.canListProperties(dave));
        
        // Dave tries to submit property - should fail
        vm.prank(dave);
        vm.expectRevert("Enhanced KYC verification required to list properties");
        propertyRegistry.submitProperty(
            "Dave's Property",
            "456 Main St",
            100_000 ether,
            keccak256("dave_deed")
        );
        
        // Dave upgrades to ENHANCED KYC
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(dave, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_dave_enhanced");
        
        // Now Dave can list properties
        assertTrue(kycVerifier.canListProperties(dave));
        
        vm.prank(dave);
        uint256 propertyId = propertyRegistry.submitProperty(
            "Dave's Property",
            "456 Main St",
            100_000 ether,
            keccak256("dave_deed")
        );
        
        assertEq(propertyId, 1);
    }
    
    /**
     * @dev Test property rejection and resubmission flow
     */
    function test_RejectionAndResubmissionFlow() public {
        // Setup Alice with KYC
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        
        bytes32 deedHash = keccak256("alice_deed");
        string memory location = "789 Park Ave, NYC";
        
        // Alice submits property
        vm.prank(alice);
        uint256 propertyId1 = propertyRegistry.submitProperty(
            "Alice's NYC Condo",
            location,
            1_000_000 ether,
            deedHash
        );
        
        // Oracle rejects due to document issues
        vm.prank(propertyOracle);
        propertyRegistry.rejectProperty(propertyId1);
        
        // Alice can resubmit the same property with corrected documents
        bytes32 correctedDeedHash = keccak256("alice_deed_corrected");
        
        vm.prank(alice);
        uint256 propertyId2 = propertyRegistry.submitProperty(
            "Alice's NYC Condo - Updated",
            location, // Same location is now allowed
            1_000_000 ether,
            correctedDeedHash
        );
        
        assertEq(propertyId2, 2);
        
        // Oracle approves corrected submission
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId2, "KRNL_VERIFY_ALICE_002", alicePropertyToken);
        
        assertTrue(_isPropertyActive(propertyId2));
    }
    
    /**
     * @dev Test multiple users listing different properties
     */
    function test_MultiUserPropertyListing() public {
        // Setup KYC for both Alice and Bob
        vm.startPrank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        kycVerifier.setKYCStatus(bob, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_bob");
        vm.stopPrank();
        
        // Alice submits her property
        vm.prank(alice);
        uint256 alicePropertyId = propertyRegistry.submitProperty(
            "Alice's Beach House",
            "123 Ocean Drive, Miami",
            500_000 ether,
            keccak256("alice_deed")
        );
        
        // Bob submits his property
        vm.prank(bob);
        uint256 bobPropertyId = propertyRegistry.submitProperty(
            "Bob's Mountain Cabin",
            "456 Mountain Road, Aspen",
            750_000 ether,
            keccak256("bob_deed")
        );
        
        // Both properties pending
        assertTrue(propertyRegistry.isPendingApproval(alicePropertyId));
        assertTrue(propertyRegistry.isPendingApproval(bobPropertyId));
        
        // Oracle approves both
        vm.startPrank(propertyOracle);
        propertyRegistry.approveProperty(alicePropertyId, "KRNL_ALICE", alicePropertyToken);
        propertyRegistry.approveProperty(bobPropertyId, "KRNL_BOB", bobPropertyToken);
        vm.stopPrank();
        
        // Verify ownership
        uint256[] memory aliceProperties = propertyRegistry.getOwnerProperties(alice);
        uint256[] memory bobProperties = propertyRegistry.getOwnerProperties(bob);
        
        assertEq(aliceProperties.length, 1);
        assertEq(bobProperties.length, 1);
        assertEq(aliceProperties[0], alicePropertyId);
        assertEq(bobProperties[0], bobPropertyId);
    }
    
    /**
     * @dev Test KYC revocation blocks property submission
     */
    function test_KYCRevocationBlocksSubmission() public {
        // Alice gets verified
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        
        // Alice submits first property successfully
        vm.prank(alice);
        propertyRegistry.submitProperty(
            "Alice's First Property",
            "123 First St",
            100_000 ether,
            keccak256("deed1")
        );
        
        // Oracle revokes Alice's KYC (suspicious activity detected)
        vm.prank(kycOracle);
        kycVerifier.revokeKYC(alice);
        
        // Alice cannot submit new properties
        vm.prank(alice);
        vm.expectRevert("Enhanced KYC verification required to list properties");
        propertyRegistry.submitProperty(
            "Alice's Second Property",
            "456 Second St",
            200_000 ether,
            keccak256("deed2")
        );
    }
    
    /**
     * @dev Test KYC expiry blocks property submission
     */
    function test_KYCExpiryBlocksSubmission() public {
        // Alice gets verified
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        
        // Submit first property
        vm.prank(alice);
        propertyRegistry.submitProperty(
            "Alice's Property",
            "123 Main St",
            100_000 ether,
            keccak256("deed1")
        );
        
        // Fast forward past KYC expiry (366 days)
        vm.warp(block.timestamp + 366 days);
        
        // Alice's KYC has expired
        assertFalse(kycVerifier.isKYCVerified(alice));
        assertFalse(kycVerifier.canListProperties(alice));
        
        // Alice cannot submit new properties
        vm.prank(alice);
        vm.expectRevert("Enhanced KYC verification required to list properties");
        propertyRegistry.submitProperty(
            "Alice's New Property",
            "456 Another St",
            200_000 ether,
            keccak256("deed2")
        );
        
        // Alice renews KYC
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice_renewed");
        
        // Now Alice can submit again
        vm.prank(alice);
        uint256 newPropertyId = propertyRegistry.submitProperty(
            "Alice's New Property",
            "456 Another St",
            200_000 ether,
            keccak256("deed2")
        );
        
        assertEq(newPropertyId, 2);
    }
    
    /**
     * @dev Test property ownership update flow
     */
    function test_PropertyUpdateFlow() public {
        // Setup
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        
        // Submit and approve property
        vm.prank(alice);
        uint256 propertyId = propertyRegistry.submitProperty(
            "Original Name",
            "123 Main St",
            100_000 ether,
            keccak256("deed")
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_123", alicePropertyToken);
        
        // Alice updates property value (market price increased)
        vm.prank(alice);
        propertyRegistry.updateProperty(propertyId, "Updated Name", 150_000 ether);
        
        // Verify update
        (, , string memory name, , uint256 value, , , , , , ) = propertyRegistry.properties(propertyId);
        assertEq(name, "Updated Name");
        assertEq(value, 150_000 ether);
    }
    
    /**
     * @dev Test admin deactivation and hash clearing for legitimate re-listing
     */
    function test_AdminDeactivationAndReListing() public {
        // Setup
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        
        bytes32 deedHash = keccak256("alice_deed");
        string memory location = "123 Main St";
        
        // Submit and approve property
        vm.prank(alice);
        uint256 propertyId = propertyRegistry.submitProperty(
            "Alice's Property",
            location,
            100_000 ether,
            deedHash
        );
        
        vm.prank(propertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_123", alicePropertyToken);
        
        // Property sold off-platform, needs to be relisted by new owner Bob
        // Admin deactivates the property
        propertyRegistry.deactivateProperty(propertyId);
        
        // Hashes still exist (can't relist same property without admin)
        assertTrue(propertyRegistry.propertyExistsByDocument(deedHash));
        
        // Admin clears hashes for legitimate re-listing
        propertyRegistry.clearPropertyHashes(propertyId);
        
        // Now Bob (new owner) can get KYC and list the same property
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(bob, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_bob");
        
        vm.prank(bob);
        uint256 newPropertyId = propertyRegistry.submitProperty(
            "Bob's Property (formerly Alice's)",
            location,
            120_000 ether, // New price
            deedHash // Same deed, new owner
        );
        
        assertEq(newPropertyId, 2);
    }
    
    /**
     * @dev Test fraud prevention: same property cannot be listed twice
     */
    function test_FraudPrevention_DuplicateListing() public {
        // Both Alice and Bob get verified
        vm.startPrank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        kycVerifier.setKYCStatus(bob, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_bob");
        vm.stopPrank();
        
        bytes32 deedHash = keccak256("property_deed");
        
        // Alice lists property
        vm.prank(alice);
        propertyRegistry.submitProperty(
            "Property",
            "123 Main St",
            100_000 ether,
            deedHash
        );
        
        // Bob (fraudster) tries to list same property with same deed
        vm.prank(bob);
        vm.expectRevert("Property with this deed document already exists");
        propertyRegistry.submitProperty(
            "Same Property",
            "Different Address",
            90_000 ether,
            deedHash
        );
        
        // Bob tries with different deed but same location
        vm.prank(bob);
        vm.expectRevert("Property at this location already listed");
        propertyRegistry.submitProperty(
            "Same Location Property",
            "123 Main St",
            100_000 ether,
            keccak256("fake_deed")
        );
    }
    
    /**
     * @dev Test oracle change and continued operation
     */
    function test_OracleChangeAndContinuedOperation() public {
        // Setup
        vm.prank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "sumsub_alice");
        
        // Submit property
        vm.prank(alice);
        uint256 propertyId = propertyRegistry.submitProperty(
            "Alice's Property",
            "123 Main St",
            100_000 ether,
            keccak256("deed")
        );
        
        // Platform upgrades to new oracle
        address newPropertyOracle = makeAddr("NewKRNLOracle");
        propertyRegistry.setVerificationOracle(newPropertyOracle);
        
        // Old oracle can no longer approve
        vm.prank(propertyOracle);
        vm.expectRevert("Only oracle can call");
        propertyRegistry.approveProperty(propertyId, "KRNL_OLD", alicePropertyToken);
        
        // New oracle can approve
        vm.prank(newPropertyOracle);
        propertyRegistry.approveProperty(propertyId, "KRNL_NEW", alicePropertyToken);
        
        assertTrue(_isPropertyActive(propertyId));
    }
    
    /**
     * @dev Test concurrent KYC and property operations
     */
    function test_ConcurrentOperations() public {
        // Multiple users get KYC at same time
        vm.startPrank(kycOracle);
        kycVerifier.setKYCStatus(alice, true, KYCVerifier.KYCTier.ENHANCED, "alice");
        kycVerifier.setKYCStatus(bob, true, KYCVerifier.KYCTier.ENHANCED, "bob");
        kycVerifier.setKYCStatus(dave, true, KYCVerifier.KYCTier.ENHANCED, "dave");
        vm.stopPrank();
        
        // Multiple properties submitted
        vm.prank(alice);
        uint256 p1 = propertyRegistry.submitProperty("P1", "Loc1", 100 ether, keccak256("d1"));
        
        vm.prank(bob);
        uint256 p2 = propertyRegistry.submitProperty("P2", "Loc2", 200 ether, keccak256("d2"));
        
        vm.prank(dave);
        uint256 p3 = propertyRegistry.submitProperty("P3", "Loc3", 300 ether, keccak256("d3"));
        
        // Oracle approves in different order
        vm.startPrank(propertyOracle);
        propertyRegistry.approveProperty(p3, "v3", makeAddr("t3"));
        propertyRegistry.approveProperty(p1, "v1", makeAddr("t1"));
        propertyRegistry.rejectProperty(p2);
        vm.stopPrank();
        
        // Verify states
        assertTrue(_isPropertyActive(p1));
        assertFalse(_isPropertyActive(p2));
        assertTrue(_isPropertyActive(p3));
    }
    
    // ============ Helper Functions ============
    
    function _isPropertyActive(uint256 propertyId) internal view returns (bool) {
        (, , , , , , bool isActive, , , , ) = propertyRegistry.properties(propertyId);
        return isActive;
    }
}

/**
 * @title Gas Optimization Tests
 * @dev Tests to measure and track gas consumption
 */
contract GasTest is Test {
    KYCVerifier public kycVerifier;
    PropertyRegistry public propertyRegistry;
    
    address public oracle;
    address public user;
    
    function setUp() public {
        oracle = makeAddr("oracle");
        user = makeAddr("user");
        
        kycVerifier = new KYCVerifier(oracle);
        propertyRegistry = new PropertyRegistry(address(kycVerifier), oracle);
        
        vm.prank(oracle);
        kycVerifier.setKYCStatus(user, true, KYCVerifier.KYCTier.ENHANCED, "user");
    }
    
    function test_Gas_SetKYCStatus() public {
        uint256 gasBefore = gasleft();
        
        vm.prank(oracle);
        kycVerifier.setKYCStatus(makeAddr("newUser"), true, KYCVerifier.KYCTier.ENHANCED, "new");
        
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas used for setKYCStatus:", gasUsed);
        
        // Should be reasonable (< 150k gas)
        assertLt(gasUsed, 150_000);
    }
    
    function test_Gas_SubmitProperty() public {
        uint256 gasBefore = gasleft();
        
        vm.prank(user);
        propertyRegistry.submitProperty(
            "Property Name",
            "123 Main Street, City, State 12345",
            1_000_000 ether,
            keccak256("document")
        );
        
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas used for submitProperty:", gasUsed);
        
        // Should be reasonable (< 500k gas)
        assertLt(gasUsed, 500_000);
    }
    
    function test_Gas_ApproveProperty() public {
        vm.prank(user);
        uint256 propertyId = propertyRegistry.submitProperty(
            "Property",
            "Location",
            1 ether,
            keccak256("doc")
        );
        
        uint256 gasBefore = gasleft();
        
        vm.prank(oracle);
        propertyRegistry.approveProperty(propertyId, "verification", makeAddr("token"));
        
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas used for approveProperty:", gasUsed);
        
        // Should be reasonable (< 100k gas)
        assertLt(gasUsed, 100_000);
    }
    
    function test_Gas_IsKYCVerified() public view {
        uint256 gasBefore = gasleft();
        
        kycVerifier.isKYCVerified(user);
        
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas used for isKYCVerified:", gasUsed);
        
        // View function should be cheap (< 20k gas)
        assertLt(gasUsed, 20_000);
    }
}

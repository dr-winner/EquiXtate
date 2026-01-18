// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {RentDistribution} from "../RentDistribution.sol";

// Mock ERC20 token for property tokens
contract MockPropertyToken {
    string public name = "Property Token";
    string public symbol = "PROP";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

// Mock ERC20 for payment token (USDC-like)
contract MockPaymentToken {
    string public name = "USD Coin";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract RentDistributionTest is Test {
    RentDistribution public rentDist;
    MockPropertyToken public propertyToken;
    MockPaymentToken public paymentToken;
    
    address public owner = address(1);
    address public propertyManager = address(2);
    address public holder1 = address(3);
    address public holder2 = address(4);
    address public holder3 = address(5);
    address public treasury = address(6);
    
    uint256 constant HOLDER1_TOKENS = 500_000 ether; // 50%
    uint256 constant HOLDER2_TOKENS = 300_000 ether; // 30%
    uint256 constant HOLDER3_TOKENS = 200_000 ether; // 20%
    uint256 constant TOTAL_TOKENS = 1_000_000 ether;
    
    uint256 constant RENT_AMOUNT = 10_000 * 1e6; // 10,000 USDC
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        rentDist = new RentDistribution(treasury);
        propertyToken = new MockPropertyToken();
        paymentToken = new MockPaymentToken();
        
        // Mint property tokens to holders
        propertyToken.mint(holder1, HOLDER1_TOKENS);
        propertyToken.mint(holder2, HOLDER2_TOKENS);
        propertyToken.mint(holder3, HOLDER3_TOKENS);
        
        // Add payment token to supported list
        rentDist.addPaymentToken(address(paymentToken));
        
        // Register property with payment token
        rentDist.registerProperty(address(propertyToken), address(paymentToken));
        
        // Set property manager
        rentDist.setPropertyManager(address(propertyToken), propertyManager, true);
        
        vm.stopPrank();
    }
    
    // ============ Registration Tests ============
    
    function test_RegisterProperty() public {
        MockPropertyToken newToken = new MockPropertyToken();
        
        vm.prank(owner);
        rentDist.registerProperty(address(newToken), address(paymentToken));
        
        // Check property is registered via propertyRents mapping
        (address propertyTokenAddr, , , , , bool isActive) = rentDist.propertyRents(address(newToken));
        assertTrue(isActive);
        assertEq(propertyTokenAddr, address(newToken));
    }
    
    function test_RegisterProperty_WithETH() public {
        MockPropertyToken newToken = new MockPropertyToken();
        
        vm.prank(owner);
        rentDist.registerProperty(address(newToken), address(0)); // ETH
        
        // Check property is registered
        (, , , , , bool isActive) = rentDist.propertyRents(address(newToken));
        assertTrue(isActive);
    }
    
    function test_RevertWhen_RegisteringZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid property token");
        rentDist.registerProperty(address(0), address(paymentToken));
    }
    
    function test_RevertWhen_AlreadyRegistered() public {
        vm.prank(owner);
        vm.expectRevert("Already registered");
        rentDist.registerProperty(address(propertyToken), address(paymentToken));
    }
    
    // ============ Deposit Tests ============
    
    function test_DepositRent() public {
        // Give property manager payment tokens
        paymentToken.mint(propertyManager, RENT_AMOUNT);
        
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "January rent");
        vm.stopPrank();
        
        // Check total distributed
        (, , uint256 totalDistributed, , , ) = rentDist.propertyRents(address(propertyToken));
        assertTrue(totalDistributed > 0);
    }
    
    function test_DepositRentETH() public {
        // Create property with ETH payment
        MockPropertyToken ethProperty = new MockPropertyToken();
        ethProperty.mint(holder1, TOTAL_TOKENS);
        
        vm.prank(owner);
        rentDist.registerProperty(address(ethProperty), address(0));
        
        vm.prank(owner);
        rentDist.setPropertyManager(address(ethProperty), propertyManager, true);
        
        // Deposit ETH
        vm.deal(propertyManager, 10 ether);
        vm.prank(propertyManager);
        rentDist.depositRentETH{value: 10 ether}(address(ethProperty), "ETH rent deposit");
        
        // Check total distributed
        (, , uint256 totalDistributed, , , ) = rentDist.propertyRents(address(ethProperty));
        assertTrue(totalDistributed > 0);
    }
    
    function test_RevertWhen_NonManagerDeposits() public {
        paymentToken.mint(holder1, RENT_AMOUNT);
        
        vm.startPrank(holder1);
        paymentToken.approve(address(rentDist), RENT_AMOUNT);
        vm.expectRevert("Not authorized");
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "Rent");
        vm.stopPrank();
    }
    
    // ============ Pending Rent Tests ============
    
    function test_PendingRent() public {
        // Deposit rent
        paymentToken.mint(propertyManager, RENT_AMOUNT);
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "Rent");
        vm.stopPrank();
        
        // Check pending rent for each holder
        uint256 pending1 = rentDist.pendingRent(address(propertyToken), holder1);
        uint256 pending2 = rentDist.pendingRent(address(propertyToken), holder2);
        uint256 pending3 = rentDist.pendingRent(address(propertyToken), holder3);
        
        // All holders should have pending rent
        assertTrue(pending1 > 0);
        assertTrue(pending2 > 0);
        assertTrue(pending3 > 0);
        
        // holder1 (50%) should have more than holder3 (20%)
        assertTrue(pending1 > pending3);
    }
    
    // ============ Claim Tests ============
    
    function test_ClaimRent() public {
        // Deposit rent
        paymentToken.mint(propertyManager, RENT_AMOUNT);
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "Rent");
        vm.stopPrank();
        
        uint256 pendingBefore = rentDist.pendingRent(address(propertyToken), holder1);
        uint256 balanceBefore = paymentToken.balanceOf(holder1);
        
        // Claim
        vm.prank(holder1);
        rentDist.claimRent(address(propertyToken));
        
        uint256 pendingAfter = rentDist.pendingRent(address(propertyToken), holder1);
        uint256 balanceAfter = paymentToken.balanceOf(holder1);
        
        // Pending should be 0 after claim
        assertEq(pendingAfter, 0);
        // Balance should have increased
        assertEq(balanceAfter - balanceBefore, pendingBefore);
    }
    
    function test_ClaimRent_ETH() public {
        // Create property with ETH payment
        MockPropertyToken ethProperty = new MockPropertyToken();
        ethProperty.mint(holder1, TOTAL_TOKENS);
        
        vm.prank(owner);
        rentDist.registerProperty(address(ethProperty), address(0));
        vm.prank(owner);
        rentDist.setPropertyManager(address(ethProperty), propertyManager, true);
        
        // Deposit ETH
        vm.deal(propertyManager, 10 ether);
        vm.prank(propertyManager);
        rentDist.depositRentETH{value: 10 ether}(address(ethProperty), "ETH rent");
        
        uint256 balanceBefore = holder1.balance;
        
        vm.prank(holder1);
        rentDist.claimRent(address(ethProperty));
        
        uint256 balanceAfter = holder1.balance;
        
        // holder1 owns 100%, so gets all distributed ETH
        assertTrue(balanceAfter > balanceBefore);
    }
    
    function test_ClaimAllRent() public {
        // Create second property
        MockPropertyToken property2 = new MockPropertyToken();
        property2.mint(holder1, TOTAL_TOKENS);
        
        vm.startPrank(owner);
        rentDist.registerProperty(address(property2), address(paymentToken));
        rentDist.setPropertyManager(address(property2), propertyManager, true);
        vm.stopPrank();
        
        // Deposit rent to both properties
        paymentToken.mint(propertyManager, RENT_AMOUNT * 2);
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT * 2);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "Rent 1");
        rentDist.depositRent(address(property2), RENT_AMOUNT, "Rent 2");
        vm.stopPrank();
        
        uint256 balanceBefore = paymentToken.balanceOf(holder1);
        
        // Claim all
        address[] memory properties = new address[](2);
        properties[0] = address(propertyToken);
        properties[1] = address(property2);
        
        vm.prank(holder1);
        rentDist.claimAllRent(properties);
        
        uint256 balanceAfter = paymentToken.balanceOf(holder1);
        
        // Balance should have increased
        assertTrue(balanceAfter > balanceBefore);
    }
    
    // ============ User Info Tests ============
    
    function test_GetUserInfo() public {
        // Deposit and claim
        paymentToken.mint(propertyManager, RENT_AMOUNT);
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "Rent");
        vm.stopPrank();
        
        vm.prank(holder1);
        rentDist.claimRent(address(propertyToken));
        
        (uint256 pending, uint256 totalClaimed, uint256 lastClaimTime, , ) = 
            rentDist.getUserInfo(address(propertyToken), holder1);
        
        assertEq(pending, 0);
        assertTrue(totalClaimed > 0);
        assertTrue(lastClaimTime > 0);
    }
    
    // ============ Distribution History Tests ============
    
    function test_GetDistributionHistory() public {
        // Make multiple deposits
        paymentToken.mint(propertyManager, RENT_AMOUNT * 3);
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT * 3);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "January");
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "February");
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "March");
        vm.stopPrank();
        
        RentDistribution.Distribution[] memory history = rentDist.getDistributionHistory(address(propertyToken), 0, 10);
        
        assertEq(history.length, 3);
    }
    
    // ============ Fee Tests ============
    
    function test_PlatformFeeCollection() public {
        // Set a platform fee first
        vm.prank(owner);
        rentDist.setPlatformFee(200); // 2%
        
        uint256 treasuryBefore = paymentToken.balanceOf(treasury);
        
        // Deposit rent
        paymentToken.mint(propertyManager, RENT_AMOUNT);
        vm.startPrank(propertyManager);
        paymentToken.approve(address(rentDist), RENT_AMOUNT);
        rentDist.depositRent(address(propertyToken), RENT_AMOUNT, "Rent");
        vm.stopPrank();
        
        uint256 treasuryAfter = paymentToken.balanceOf(treasury);
        
        // 2% fee
        uint256 expectedFee = RENT_AMOUNT * 200 / 10000;
        assertEq(treasuryAfter - treasuryBefore, expectedFee);
    }
    
    function test_SetPlatformFee() public {
        vm.prank(owner);
        rentDist.setPlatformFee(100); // 1%
        
        assertEq(rentDist.platformFeeBps(), 100);
    }
    
    function test_RevertWhen_FeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert("Fee too high");
        rentDist.setPlatformFee(1001); // > 10%
    }
    
    // ============ Property Manager Tests ============
    
    function test_SetPropertyManager() public {
        address newManager = address(10);
        
        vm.prank(owner);
        rentDist.setPropertyManager(address(propertyToken), newManager, true);
        
        assertTrue(rentDist.propertyManagers(address(propertyToken), newManager));
    }
    
    function test_RemovePropertyManager() public {
        vm.prank(owner);
        rentDist.setPropertyManager(address(propertyToken), propertyManager, false);
        
        assertFalse(rentDist.propertyManagers(address(propertyToken), propertyManager));
    }
    
    function test_RevertWhen_NonOwnerSetsManager() public {
        vm.prank(holder1);
        vm.expectRevert();
        rentDist.setPropertyManager(address(propertyToken), address(10), true);
    }
    
    // ============ Registered Properties Tests ============
    
    function test_GetRegisteredProperties() public {
        // Register more properties
        MockPropertyToken prop2 = new MockPropertyToken();
        MockPropertyToken prop3 = new MockPropertyToken();
        
        vm.startPrank(owner);
        rentDist.registerProperty(address(prop2), address(paymentToken));
        rentDist.registerProperty(address(prop3), address(paymentToken));
        vm.stopPrank();
        
        address[] memory properties = rentDist.getRegisteredProperties();
        
        assertEq(properties.length, 3);
        assertEq(properties[0], address(propertyToken));
        assertEq(properties[1], address(prop2));
        assertEq(properties[2], address(prop3));
    }
    
    // ============ APY Estimation Tests ============
    
    function test_EstimateAPY_NoDistributions() public {
        // New property with no distributions
        MockPropertyToken newToken = new MockPropertyToken();
        newToken.mint(holder1, 1000 ether);
        
        vm.prank(owner);
        rentDist.registerProperty(address(newToken), address(paymentToken));
        
        uint256 apy = rentDist.estimateAPY(address(newToken));
        
        // APY should be 0 with no distributions
        assertEq(apy, 0);
    }
    
    // ============ Treasury Tests ============
    
    function test_SetTreasury() public {
        address newTreasury = address(100);
        
        vm.prank(owner);
        rentDist.setTreasury(newTreasury);
        
        assertEq(rentDist.treasury(), newTreasury);
    }
    
    function test_RevertWhen_SetInvalidTreasury() public {
        vm.prank(owner);
        vm.expectRevert("Invalid treasury");
        rentDist.setTreasury(address(0));
    }
}

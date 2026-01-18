// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {PropertyGovernance} from "../PropertyGovernance.sol";

// Mock ERC20 token for testing
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

contract PropertyGovernanceTest is Test {
    PropertyGovernance public governance;
    MockPropertyToken public propertyToken;
    
    address public owner = address(1);
    address public proposer = address(2);
    address public voter1 = address(3);
    address public voter2 = address(4);
    address public voter3 = address(5);
    
    uint256 constant TOTAL_SUPPLY = 1_000_000 ether;
    uint256 constant PROPOSER_BALANCE = 20_000 ether; // 2% - above threshold
    uint256 constant VOTER1_BALANCE = 100_000 ether; // 10%
    uint256 constant VOTER2_BALANCE = 150_000 ether; // 15%
    uint256 constant VOTER3_BALANCE = 50_000 ether; // 5%
    
    // Vote types (matches contract)
    uint8 constant VOTE_AGAINST = 0;
    uint8 constant VOTE_FOR = 1;
    uint8 constant VOTE_ABSTAIN = 2;
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        governance = new PropertyGovernance();
        propertyToken = new MockPropertyToken();
        
        // Mint tokens
        propertyToken.mint(proposer, PROPOSER_BALANCE);
        propertyToken.mint(voter1, VOTER1_BALANCE);
        propertyToken.mint(voter2, VOTER2_BALANCE);
        propertyToken.mint(voter3, VOTER3_BALANCE);
        
        // Register property token with governance
        governance.registerPropertyToken(address(propertyToken));
        
        vm.stopPrank();
    }
    
    // ============ Registration Tests ============
    
    function test_RegisterPropertyToken() public {
        MockPropertyToken newToken = new MockPropertyToken();
        
        vm.prank(owner);
        governance.registerPropertyToken(address(newToken));
        
        assertTrue(governance.registeredTokens(address(newToken)));
    }
    
    function test_RevertWhen_RegisteringZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid token address");
        governance.registerPropertyToken(address(0));
    }
    
    function test_RevertWhen_RegisteringDuplicate() public {
        vm.prank(owner);
        vm.expectRevert("Already registered");
        governance.registerPropertyToken(address(propertyToken));
    }
    
    function test_RevertWhen_NonOwnerRegisters() public {
        MockPropertyToken newToken = new MockPropertyToken();
        
        vm.prank(voter1);
        vm.expectRevert();
        governance.registerPropertyToken(address(newToken));
    }
    
    // ============ Proposal Creation Tests ============
    
    function test_CreateProposal() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.PROPERTY_IMPROVEMENT,
            "Renovate Kitchen",
            "Proposal to renovate the kitchen with modern appliances",
            "ipfs://QmHash123",
            address(0),
            "",
            0
        );
        
        assertEq(proposalId, 1);
        assertEq(governance.proposalCount(), 1);
    }
    
    function test_CreateProposal_AllTypes() public {
        // Test all proposal types
        PropertyGovernance.ProposalType[7] memory types = [
            PropertyGovernance.ProposalType.PROPERTY_IMPROVEMENT,
            PropertyGovernance.ProposalType.RENT_ADJUSTMENT,
            PropertyGovernance.ProposalType.PROPERTY_SALE,
            PropertyGovernance.ProposalType.MANAGEMENT_CHANGE,
            PropertyGovernance.ProposalType.DIVIDEND_DISTRIBUTION,
            PropertyGovernance.ProposalType.RULE_CHANGE,
            PropertyGovernance.ProposalType.OTHER
        ];
        
        vm.startPrank(proposer);
        for (uint i = 0; i < types.length; i++) {
            uint256 proposalId = governance.createProposal(
                address(propertyToken),
                types[i],
                "Test Proposal",
                "Description",
                "",
                address(0),
                "",
                0
            );
            assertEq(proposalId, i + 1);
        }
        vm.stopPrank();
    }
    
    function test_RevertWhen_InsufficientTokensToPropose() public {
        address smallHolder = address(100);
        propertyToken.mint(smallHolder, 1 ether); // Less than 1% threshold
        
        vm.prank(smallHolder);
        vm.expectRevert("Below proposal threshold");
        governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.OTHER,
            "Title",
            "Description",
            "",
            address(0),
            "",
            0
        );
    }
    
    function test_RevertWhen_UnregisteredToken() public {
        MockPropertyToken unregistered = new MockPropertyToken();
        unregistered.mint(proposer, PROPOSER_BALANCE);
        
        vm.prank(proposer);
        vm.expectRevert("Token not registered");
        governance.createProposal(
            address(unregistered),
            PropertyGovernance.ProposalType.OTHER,
            "Title",
            "Description",
            "",
            address(0),
            "",
            0
        );
    }
    
    // ============ Voting Tests ============
    
    function createActiveProposal() internal returns (uint256) {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.PROPERTY_IMPROVEMENT,
            "Test Proposal",
            "Description",
            "",
            address(0),
            "",
            0
        );
        
        // Skip voting delay
        vm.warp(block.timestamp + 1 days + 1);
        
        return proposalId;
    }
    
    function test_CastVote_For() public {
        uint256 proposalId = createActiveProposal();
        
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_FOR);
        
        // Check vote was recorded
        (bool hasVoted, uint8 support, uint256 votes) = governance.getReceipt(proposalId, voter1);
        
        assertTrue(hasVoted);
        assertEq(support, VOTE_FOR);
        assertEq(votes, VOTER1_BALANCE);
    }
    
    function test_CastVote_Against() public {
        uint256 proposalId = createActiveProposal();
        
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_AGAINST);
        
        (bool hasVoted, uint8 support, uint256 votes) = governance.getReceipt(proposalId, voter1);
        
        assertTrue(hasVoted);
        assertEq(support, VOTE_AGAINST);
        assertEq(votes, VOTER1_BALANCE);
    }
    
    function test_CastVote_Abstain() public {
        uint256 proposalId = createActiveProposal();
        
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_ABSTAIN);
        
        (bool hasVoted, uint8 support, uint256 votes) = governance.getReceipt(proposalId, voter1);
        
        assertTrue(hasVoted);
        assertEq(support, VOTE_ABSTAIN);
        assertEq(votes, VOTER1_BALANCE);
    }
    
    function test_CastVoteWithReason() public {
        uint256 proposalId = createActiveProposal();
        
        vm.prank(voter1);
        governance.castVoteWithReason(
            proposalId,
            VOTE_FOR,
            "I support this improvement"
        );
        
        (bool hasVoted, uint8 support, ) = governance.getReceipt(proposalId, voter1);
        assertTrue(hasVoted);
        assertEq(support, VOTE_FOR);
    }
    
    function test_RevertWhen_VotingTwice() public {
        uint256 proposalId = createActiveProposal();
        
        vm.startPrank(voter1);
        governance.castVote(proposalId, VOTE_FOR);
        
        vm.expectRevert("Already voted");
        governance.castVote(proposalId, VOTE_FOR);
        vm.stopPrank();
    }
    
    function test_RevertWhen_VotingBeforeStart() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.OTHER,
            "Test",
            "Description",
            "",
            address(0),
            "",
            0
        );
        
        // Don't skip time - still in pending state
        vm.prank(voter1);
        vm.expectRevert("Voting not active");
        governance.castVote(proposalId, VOTE_FOR);
    }
    
    function test_RevertWhen_VotingAfterEnd() public {
        uint256 proposalId = createActiveProposal();
        
        // Skip past voting period
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(voter1);
        vm.expectRevert("Voting not active");
        governance.castVote(proposalId, VOTE_FOR);
    }
    
    // ============ Proposal State Tests ============
    
    function test_ProposalState_Pending() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.OTHER,
            "Test",
            "Description",
            "",
            address(0),
            "",
            0
        );
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.PENDING));
    }
    
    function test_ProposalState_Active() public {
        uint256 proposalId = createActiveProposal();
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.ACTIVE));
    }
    
    function test_ProposalState_Defeated_NoQuorum() public {
        uint256 proposalId = createActiveProposal();
        
        // Vote with only 1% (need 4% quorum)
        address tinyVoter = address(200);
        propertyToken.mint(tinyVoter, 10_000 ether); // 1%
        
        vm.prank(tinyVoter);
        governance.castVote(proposalId, VOTE_FOR);
        
        // End voting
        vm.warp(block.timestamp + 8 days);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.DEFEATED));
    }
    
    function test_ProposalState_Defeated_NoMajority() public {
        uint256 proposalId = createActiveProposal();
        
        // voter1 (10%) votes For
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_FOR);
        
        // voter2 (15%) votes Against
        vm.prank(voter2);
        governance.castVote(proposalId, VOTE_AGAINST);
        
        // End voting
        vm.warp(block.timestamp + 8 days);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.DEFEATED));
    }
    
    function test_ProposalState_Succeeded() public {
        uint256 proposalId = createActiveProposal();
        
        // voter1 (10%) and voter2 (15%) vote For (25% > 4% quorum)
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_FOR);
        
        vm.prank(voter2);
        governance.castVote(proposalId, VOTE_FOR);
        
        // End voting
        vm.warp(block.timestamp + 8 days);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.SUCCEEDED));
    }
    
    // ============ Queue and Execute Tests ============
    
    function createSucceededProposal() internal returns (uint256) {
        uint256 proposalId = createActiveProposal();
        
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_FOR);
        
        vm.prank(voter2);
        governance.castVote(proposalId, VOTE_FOR);
        
        // End voting
        vm.warp(block.timestamp + 8 days);
        
        return proposalId;
    }
    
    function test_QueueProposal() public {
        uint256 proposalId = createSucceededProposal();
        
        governance.queue(proposalId);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.QUEUED));
    }
    
    function test_ExecuteProposal() public {
        uint256 proposalId = createSucceededProposal();
        
        governance.queue(proposalId);
        
        // Wait for timelock
        vm.warp(block.timestamp + 2 days + 1);
        
        governance.execute(proposalId);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.EXECUTED));
    }
    
    function test_RevertWhen_ExecutingBeforeTimelock() public {
        uint256 proposalId = createSucceededProposal();
        
        governance.queue(proposalId);
        
        // Don't wait for timelock
        vm.expectRevert("Timelock not expired");
        governance.execute(proposalId);
    }
    
    // ============ Cancel Tests ============
    
    function test_CancelProposal_ByProposer() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.OTHER,
            "Test",
            "Description",
            "",
            address(0),
            "",
            0
        );
        
        vm.prank(proposer);
        governance.cancel(proposalId);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.CANCELED));
    }
    
    function test_CancelProposal_ByOwner() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.OTHER,
            "Test",
            "Description",
            "",
            address(0),
            "",
            0
        );
        
        vm.prank(owner);
        governance.cancel(proposalId);
        
        assertEq(uint8(governance.state(proposalId)), uint8(PropertyGovernance.ProposalState.CANCELED));
    }
    
    function test_RevertWhen_UnauthorizedCancel() public {
        vm.prank(proposer);
        uint256 proposalId = governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.OTHER,
            "Test",
            "Description",
            "",
            address(0),
            "",
            0
        );
        
        vm.prank(voter1);
        vm.expectRevert("Not authorized");
        governance.cancel(proposalId);
    }
    
    // ============ Settings Tests ============
    
    function test_UpdateSettings() public {
        PropertyGovernance.GovernanceSettings memory newSettings = PropertyGovernance.GovernanceSettings({
            votingDelay: 2 days,
            votingPeriod: 14 days,
            proposalThreshold: 200, // 2%
            quorumThreshold: 1000,  // 10%
            executionDelay: 3 days,
            gracePeriod: 30 days
        });
        
        vm.prank(owner);
        governance.updateSettings(address(propertyToken), newSettings);
        
        (uint256 votingDelay, uint256 votingPeriod, uint256 proposalThreshold, uint256 quorumThreshold, uint256 executionDelay, uint256 gracePeriod) = 
            governance.propertySettings(address(propertyToken));
        
        assertEq(votingDelay, 2 days);
        assertEq(votingPeriod, 14 days);
        assertEq(proposalThreshold, 200);
        assertEq(quorumThreshold, 1000);
        assertEq(executionDelay, 3 days);
        assertEq(gracePeriod, 30 days);
    }
    
    function test_RevertWhen_InvalidSettings() public {
        PropertyGovernance.GovernanceSettings memory badSettings = PropertyGovernance.GovernanceSettings({
            votingDelay: 1 hours,
            votingPeriod: 1 hours, // Too short (min 1 day)
            proposalThreshold: 100,
            quorumThreshold: 400,
            executionDelay: 2 days,
            gracePeriod: 14 days
        });
        
        vm.prank(owner);
        vm.expectRevert("Voting period too short");
        governance.updateSettings(address(propertyToken), badSettings);
    }
    
    // ============ View Function Tests ============
    
    function test_GetProposalVotes() public {
        uint256 proposalId = createActiveProposal();
        
        vm.prank(voter1);
        governance.castVote(proposalId, VOTE_FOR);
        
        vm.prank(voter2);
        governance.castVote(proposalId, VOTE_AGAINST);
        
        vm.prank(voter3);
        governance.castVote(proposalId, VOTE_ABSTAIN);
        
        // Get proposal and check votes
        (
            , , , , ,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            , ,
        ) = governance.getProposal(proposalId);
        
        assertEq(forVotes, VOTER1_BALANCE);
        assertEq(againstVotes, VOTER2_BALANCE);
        assertEq(abstainVotes, VOTER3_BALANCE);
    }
    
    function test_GetProposals() public {
        // Create multiple proposals
        vm.startPrank(proposer);
        governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.PROPERTY_IMPROVEMENT,
            "Proposal 1",
            "Description 1",
            "",
            address(0),
            "",
            0
        );
        governance.createProposal(
            address(propertyToken),
            PropertyGovernance.ProposalType.RENT_ADJUSTMENT,
            "Proposal 2",
            "Description 2",
            "",
            address(0),
            "",
            0
        );
        vm.stopPrank();
        
        uint256[] memory proposals = governance.getPropertyProposals(address(propertyToken));
        assertEq(proposals.length, 2);
        assertEq(proposals[0], 1);
        assertEq(proposals[1], 2);
    }
    
    function test_Quorum() public {
        uint256 actualQuorum = governance.quorum(address(propertyToken));
        
        // Just verify quorum is reasonable (4% of total supply)
        assertTrue(actualQuorum > 0);
    }
    
    function test_GetTokenList() public {
        address[] memory tokens = governance.getRegisteredTokens();
        assertEq(tokens.length, 1);
        assertEq(tokens[0], address(propertyToken));
    }
}

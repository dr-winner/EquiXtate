// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PropertyGovernance
 * @dev Governance contract for property token holders
 */
contract PropertyGovernance is Ownable, ReentrancyGuard {
    // Property token address
    address public propertyToken;

    // Proposal status
    enum ProposalStatus {
        Active,
        Executed,
        Cancelled,
        Defeated,
        Expired
    }

    // Vote options
    enum VoteType {
        For,
        Against
    }

    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        ProposalStatus status;
        mapping(address => bool) hasVoted;
    }

    // Storage
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Voting threshold (percentage of total supply needed to pass)
    uint256 public quorumPercentage = 10; // 10% of total supply

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint256 votes,
        VoteType voteType
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    constructor(address _propertyToken) Ownable(msg.sender) {
        propertyToken = _propertyToken;
    }

    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param durationInDays Duration in days for voting
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 durationInDays
    ) external {
        // Require minimum token balance to create proposal
        require(
            IERC20(propertyToken).balanceOf(msg.sender) >= 100 * 10 ** 18,
            "Insufficient tokens to create proposal"
        );

        require(durationInDays > 0 && durationInDays <= 30, "Invalid duration");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (durationInDays * 1 days);

        proposalCount++;

        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.startTime = startTime;
        newProposal.endTime = endTime;
        newProposal.status = ProposalStatus.Active;

        emit ProposalCreated(
            proposalCount,
            msg.sender,
            title,
            startTime,
            endTime
        );
    }

    /**
     * @dev Cast a vote on a proposal
     * @param proposalId Proposal ID
     * @param voteType Vote type (For or Against)
     */
    function castVote(
        uint256 proposalId,
        VoteType voteType
    ) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id == proposalId, "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 votes = IERC20(propertyToken).balanceOf(msg.sender);
        require(votes > 0, "No tokens to vote with");

        proposal.hasVoted[msg.sender] = true;

        if (voteType == VoteType.For) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }

        emit VoteCast(msg.sender, proposalId, votes, voteType);
    }

    /**
     * @dev Execute a proposal after voting ends
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id == proposalId, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");

        uint256 totalSupply = IERC20(propertyToken).totalSupply();
        uint256 quorumVotes = (totalSupply * quorumPercentage) / 100;

        if (proposal.forVotes + proposal.againstVotes < quorumVotes) {
            proposal.status = ProposalStatus.Defeated;
            revert("Quorum not reached");
        }

        if (proposal.forVotes <= proposal.againstVotes) {
            proposal.status = ProposalStatus.Defeated;
            revert("Majority not in favor");
        }

        proposal.executed = true;
        proposal.status = ProposalStatus.Executed;

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a proposal
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id == proposalId, "Proposal does not exist");
        require(
            proposal.proposer == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        require(proposal.status == ProposalStatus.Active, "Cannot cancel");

        proposal.status = ProposalStatus.Cancelled;

        emit ProposalCancelled(proposalId);
    }

    /**
     * @dev Update proposal status
     * @param proposalId Proposal ID
     */
    function updateProposalStatus(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id == proposalId, "Proposal does not exist");

        // Update expired proposals
        if (
            proposal.status == ProposalStatus.Active &&
            block.timestamp > proposal.endTime
        ) {
            proposal.status = ProposalStatus.Expired;
        }
    }

    /**
     * @dev Update quorum percentage
     * @param newQuorumPercentage New quorum percentage
     */
    function updateQuorumPercentage(
        uint256 newQuorumPercentage
    ) external onlyOwner {
        require(
            newQuorumPercentage > 0 && newQuorumPercentage <= 51,
            "Invalid quorum percentage"
        );
        quorumPercentage = newQuorumPercentage;
    }

    /**
     * @dev Check if an address has voted on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Whether the address has voted
     */
    function hasVoted(
        uint256 proposalId,
        address voter
    ) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
}

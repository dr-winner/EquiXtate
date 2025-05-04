// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyToken.sol";

/**
 * @title PropertyGovernance
 * @dev Governance contract for property token holders
 */
contract PropertyGovernance is Ownable, ReentrancyGuard {
    PropertyToken public propertyToken;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_QUORUM = 51; // 51% quorum required

    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        uint256 startTime,
        uint256 endTime
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _propertyToken) {
        require(_propertyToken != address(0), "Invalid token address");
        propertyToken = PropertyToken(_propertyToken);
        _transferOwnership(msg.sender);
    }

    function createProposal(string memory description) external onlyOwner {
        proposalCount++;
        
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.description = description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        
        emit ProposalCreated(
            proposalCount,
            description,
            block.timestamp,
            block.timestamp + VOTING_PERIOD
        );
    }

    function vote(uint256 proposalId, bool support) external {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votes = propertyToken.balanceOf(msg.sender);
        require(votes > 0, "No voting power");

        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }

        proposal.hasVoted[msg.sender] = true;
        
        emit Voted(proposalId, msg.sender, support, votes);
    }

    function executeProposal(uint256 proposalId) external onlyOwner {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 totalSupply = propertyToken.totalSupply();
        
        require(
            (totalVotes * 100) / totalSupply >= MIN_QUORUM,
            "Quorum not reached"
        );
        
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            string memory description,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 startTime,
            uint256 endTime,
            bool executed
        )
    {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }

    function hasVoted(uint256 proposalId, address voter)
        external
        view
        returns (bool)
    {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        return proposals[proposalId].hasVoted[voter];
    }
}

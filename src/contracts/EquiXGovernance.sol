
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./EquiXToken.sol";

/**
 * @title EquiXGovernance
 * @dev Governance contract for property DAO voting
 */
contract EquiXGovernance is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    
    // EquiX token contract
    EquiXToken public equiXToken;
    
    // Proposal struct
    struct Proposal {
        uint256 id;
        uint256 propertyId; // Related property ID (0 if general governance)
        string title;
        string description;
        bytes callData; // Call data for execution
        address targetContract; // Contract to call if executing code
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
    }
    
    // Mapping from proposal ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    
    // Proposal counter
    uint256 private _proposalIdCounter = 0;
    
    // Governance parameters
    uint256 public votingPeriodDays = 7;
    uint256 public proposalThreshold = 100; // Minimum tokens required to create a proposal
    uint256 public executionDelay = 2 days; // Delay before execution after voting ends
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, uint256 indexed propertyId, string title, address proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event GovernanceParametersChanged(uint256 votingPeriodDays, uint256 proposalThreshold, uint256 executionDelay);
    
    /**
     * @dev Constructor
     * @param _equiXToken Address of the EquiX token contract
     */
    constructor(address _equiXToken) {
        equiXToken = EquiXToken(_equiXToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new proposal
     * @param propertyId Related property ID (0 if general governance)
     * @param title Proposal title
     * @param description Proposal description
     * @param targetContract Contract to call if executing code
     * @param callData Call data for execution
     * @return proposalId ID of the created proposal
     */
    function createProposal(
        uint256 propertyId,
        string memory title,
        string memory description,
        address targetContract,
        bytes memory callData
    ) external returns (uint256) {
        // Check if proposer has minimum token balance (any property) or has PROPOSER_ROLE
        bool hasMinBalance = false;
        
        if (!hasRole(PROPOSER_ROLE, msg.sender)) {
            // For property-specific proposals, check token balance for that property
            if (propertyId > 0) {
                hasMinBalance = equiXToken.balanceOf(msg.sender, propertyId) >= proposalThreshold;
            } else {
                // For general governance, check total tokens across all properties
                // This is a simplified check, in a real implementation you would sum all property tokens
                hasMinBalance = false; // Placeholder - would need to iterate through all properties
            }
            
            require(hasMinBalance, "Insufficient tokens to create proposal");
        }
        
        uint256 proposalId = _proposalIdCounter++;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.propertyId = propertyId;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.targetContract = targetContract;
        newProposal.callData = callData;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriodDays * 1 days;
        
        emit ProposalCreated(proposalId, propertyId, title, msg.sender);
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Whether to support the proposal
     */
    function castVote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        // Mark as voted
        proposal.hasVoted[msg.sender] = true;
        
        uint256 weight;
        
        // Calculate voting weight based on token balance
        if (proposal.propertyId > 0) {
            // For property-specific proposals, use tokens for that property
            weight = equiXToken.balanceOf(msg.sender, proposal.propertyId);
        } else {
            // For general governance, sum tokens across all properties (simplified)
            // In real implementation, this would need to iterate through all properties
            weight = 0; // Placeholder
        }
        
        require(weight > 0, "No voting weight");
        
        // Cast vote
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Execute a proposal
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(block.timestamp >= proposal.endTime + executionDelay, "Execution delay not met");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved");
        
        // Mark as executed
        proposal.executed = true;
        
        // Execute proposal if target contract is set
        if (proposal.targetContract != address(0) && proposal.callData.length > 0) {
            (bool success, ) = proposal.targetContract.call(proposal.callData);
            require(success, "Proposal execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (admin only)
     * @param proposalId ID of the proposal
     */
    function cancelProposal(uint256 proposalId) external onlyRole(ADMIN_ROLE) {
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }
    
    /**
     * @dev Set governance parameters (admin only)
     * @param _votingPeriodDays New voting period in days
     * @param _proposalThreshold New proposal threshold
     * @param _executionDelay New execution delay
     */
    function setGovernanceParameters(
        uint256 _votingPeriodDays,
        uint256 _proposalThreshold,
        uint256 _executionDelay
    ) external onlyRole(ADMIN_ROLE) {
        require(_votingPeriodDays > 0, "Voting period must be positive");
        
        votingPeriodDays = _votingPeriodDays;
        proposalThreshold = _proposalThreshold;
        executionDelay = _executionDelay;
        
        emit GovernanceParametersChanged(votingPeriodDays, proposalThreshold, executionDelay);
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     * @return id Proposal ID
     * @return propertyId Related property ID
     * @return title Proposal title
     * @return description Proposal description
     * @return votesFor Votes for the proposal
     * @return votesAgainst Votes against the proposal
     * @return startTime Start time of the proposal
     * @return endTime End time of the proposal
     * @return executed Whether the proposal has been executed
     * @return canceled Whether the proposal has been canceled
     */
    function getProposalDetails(uint256 proposalId) external view returns (
        uint256 id,
        uint256 propertyId,
        string memory title,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.propertyId,
            proposal.title,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.canceled
        );
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Whether the address has voted
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
}

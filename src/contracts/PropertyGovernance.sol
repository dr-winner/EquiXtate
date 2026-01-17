// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PropertyGovernance
 * @dev Governance system for property token holders to vote on property decisions
 * 
 * Features:
 * - Token-weighted voting
 * - Proposal creation by token holders
 * - Configurable quorum and voting periods
 * - Timelock before execution
 * - Support for multiple proposal types
 */
contract PropertyGovernance is Ownable, ReentrancyGuard {
    
    // ============ Enums ============
    
    enum ProposalType {
        PROPERTY_IMPROVEMENT,    // Renovations, repairs, upgrades
        RENT_ADJUSTMENT,         // Change rental price
        PROPERTY_SALE,           // Sell the property
        MANAGEMENT_CHANGE,       // Change property manager
        DIVIDEND_DISTRIBUTION,   // Special dividend payout
        RULE_CHANGE,            // Change governance rules
        OTHER                    // General proposals
    }
    
    enum ProposalState {
        PENDING,     // Waiting for voting to start
        ACTIVE,      // Voting is open
        CANCELED,    // Proposal was canceled
        DEFEATED,    // Did not reach quorum or majority
        SUCCEEDED,   // Passed and waiting for execution
        QUEUED,      // In timelock waiting period
        EXPIRED,     // Grace period expired without execution
        EXECUTED     // Successfully executed
    }
    
    // ============ Structs ============
    
    struct Proposal {
        uint256 id;
        address proposer;
        address propertyToken;           // The property this proposal applies to
        ProposalType proposalType;
        string title;
        string description;
        string ipfsHash;                 // IPFS hash for detailed documentation
        
        // Voting
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 snapshotBlock;           // Block number for vote weight snapshot
        
        // Timing
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;           // When proposal can be executed (after timelock)
        
        // Execution
        bytes executionData;             // Encoded function call data
        address executionTarget;         // Contract to call
        uint256 executionValue;          // ETH value to send
        bool executed;
        bool canceled;
    }
    
    struct Receipt {
        bool hasVoted;
        uint8 support;    // 0 = Against, 1 = For, 2 = Abstain
        uint256 votes;
    }
    
    struct GovernanceSettings {
        uint256 votingDelay;          // Delay before voting starts (in seconds)
        uint256 votingPeriod;         // How long voting lasts (in seconds)
        uint256 proposalThreshold;    // Min tokens to create proposal (as % of total supply, basis points)
        uint256 quorumThreshold;      // Min participation for valid vote (as % of total supply, basis points)
        uint256 executionDelay;       // Timelock delay before execution (in seconds)
        uint256 gracePeriod;          // Time after success to execute before expiry (in seconds)
    }
    
    // ============ State Variables ============
    
    // Proposal tracking
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Voter receipts: proposalId => voter => Receipt
    mapping(uint256 => mapping(address => Receipt)) public receipts;
    
    // Property token => Governance settings
    mapping(address => GovernanceSettings) public propertySettings;
    
    // Registered property tokens that can use this governance
    mapping(address => bool) public registeredTokens;
    address[] public tokenList;
    
    // Proposal IDs by property token
    mapping(address => uint256[]) public propertyProposals;
    
    // Default governance settings
    GovernanceSettings public defaultSettings;
    
    // ============ Events ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address indexed propertyToken,
        ProposalType proposalType,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 weight,
        string reason
    );
    
    event ProposalCanceled(uint256 indexed proposalId);
    event ProposalQueued(uint256 indexed proposalId, uint256 executionTime);
    event ProposalExecuted(uint256 indexed proposalId);
    event PropertyTokenRegistered(address indexed propertyToken);
    event GovernanceSettingsUpdated(address indexed propertyToken);
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Set default governance settings
        defaultSettings = GovernanceSettings({
            votingDelay: 1 days,           // 1 day before voting starts
            votingPeriod: 7 days,          // 7 days of voting
            proposalThreshold: 100,        // 1% of tokens to propose (100 basis points)
            quorumThreshold: 400,          // 4% participation required (400 basis points)
            executionDelay: 2 days,        // 2 day timelock
            gracePeriod: 14 days           // 14 days to execute after passing
        });
    }
    
    // ============ Token Registration ============
    
    /**
     * @dev Register a property token for governance
     */
    function registerPropertyToken(address propertyToken) external onlyOwner {
        require(propertyToken != address(0), "Invalid token address");
        require(!registeredTokens[propertyToken], "Already registered");
        
        registeredTokens[propertyToken] = true;
        tokenList.push(propertyToken);
        propertySettings[propertyToken] = defaultSettings;
        
        emit PropertyTokenRegistered(propertyToken);
    }
    
    /**
     * @dev Update governance settings for a property
     */
    function updateSettings(
        address propertyToken,
        GovernanceSettings memory settings
    ) external onlyOwner {
        require(registeredTokens[propertyToken], "Token not registered");
        require(settings.votingPeriod >= 1 days, "Voting period too short");
        require(settings.quorumThreshold >= 100 && settings.quorumThreshold <= 5000, "Invalid quorum");
        require(settings.proposalThreshold >= 10 && settings.proposalThreshold <= 1000, "Invalid threshold");
        
        propertySettings[propertyToken] = settings;
        emit GovernanceSettingsUpdated(propertyToken);
    }
    
    // ============ Proposal Creation ============
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        address propertyToken,
        ProposalType proposalType,
        string memory title,
        string memory description,
        string memory ipfsHash,
        address executionTarget,
        bytes memory executionData,
        uint256 executionValue
    ) external nonReentrant returns (uint256) {
        require(registeredTokens[propertyToken], "Token not registered");
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        
        GovernanceSettings memory settings = propertySettings[propertyToken];
        IERC20 token = IERC20(propertyToken);
        
        // Check proposer has enough tokens
        uint256 proposerBalance = token.balanceOf(msg.sender);
        uint256 totalSupply = token.totalSupply();
        uint256 threshold = (totalSupply * settings.proposalThreshold) / 10000;
        
        require(proposerBalance >= threshold, "Below proposal threshold");
        
        proposalCount++;
        uint256 proposalId = proposalCount;
        
        uint256 startTime = block.timestamp + settings.votingDelay;
        uint256 endTime = startTime + settings.votingPeriod;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            propertyToken: propertyToken,
            proposalType: proposalType,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            snapshotBlock: block.number,
            startTime: startTime,
            endTime: endTime,
            executionTime: 0,
            executionData: executionData,
            executionTarget: executionTarget,
            executionValue: executionValue,
            executed: false,
            canceled: false
        });
        
        propertyProposals[propertyToken].push(proposalId);
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            propertyToken,
            proposalType,
            title,
            startTime,
            endTime
        );
        
        return proposalId;
    }
    
    // ============ Voting ============
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId The proposal to vote on
     * @param support 0 = Against, 1 = For, 2 = Abstain
     */
    function castVote(uint256 proposalId, uint8 support) external {
        _castVote(proposalId, msg.sender, support, "");
    }
    
    /**
     * @dev Cast a vote with a reason
     */
    function castVoteWithReason(
        uint256 proposalId,
        uint8 support,
        string memory reason
    ) external {
        _castVote(proposalId, msg.sender, support, reason);
    }
    
    function _castVote(
        uint256 proposalId,
        address voter,
        uint8 support,
        string memory reason
    ) internal {
        require(state(proposalId) == ProposalState.ACTIVE, "Voting not active");
        require(support <= 2, "Invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        Receipt storage receipt = receipts[proposalId][voter];
        
        require(!receipt.hasVoted, "Already voted");
        
        // Get voting power at snapshot block
        uint256 votes = _getVotingPower(proposal.propertyToken, voter, proposal.snapshotBlock);
        require(votes > 0, "No voting power");
        
        receipt.hasVoted = true;
        receipt.support = support;
        receipt.votes = votes;
        
        if (support == 0) {
            proposal.againstVotes += votes;
        } else if (support == 1) {
            proposal.forVotes += votes;
        } else {
            proposal.abstainVotes += votes;
        }
        
        emit VoteCast(voter, proposalId, support, votes, reason);
    }
    
    /**
     * @dev Get voting power for an address
     * Note: In production, use ERC20Votes for historical balance tracking
     */
    function _getVotingPower(
        address propertyToken,
        address voter,
        uint256 /* blockNumber */
    ) internal view returns (uint256) {
        // Simplified: uses current balance
        // Production should use ERC20Votes.getPastVotes(voter, blockNumber)
        return IERC20(propertyToken).balanceOf(voter);
    }
    
    // ============ Proposal Lifecycle ============
    
    /**
     * @dev Get the current state of a proposal
     */
    function state(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId > 0 && proposalId <= proposalCount, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.canceled) {
            return ProposalState.CANCELED;
        }
        
        if (proposal.executed) {
            return ProposalState.EXECUTED;
        }
        
        if (block.timestamp < proposal.startTime) {
            return ProposalState.PENDING;
        }
        
        if (block.timestamp <= proposal.endTime) {
            return ProposalState.ACTIVE;
        }
        
        // Voting ended - check results
        GovernanceSettings memory settings = propertySettings[proposal.propertyToken];
        uint256 totalSupply = IERC20(proposal.propertyToken).totalSupply();
        uint256 requiredQuorum = (totalSupply * settings.quorumThreshold) / 10000;
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        // Check quorum
        if (totalVotes < requiredQuorum) {
            return ProposalState.DEFEATED;
        }
        
        // Check majority (forVotes > againstVotes)
        if (proposal.forVotes <= proposal.againstVotes) {
            return ProposalState.DEFEATED;
        }
        
        // Proposal succeeded
        if (proposal.executionTime == 0) {
            return ProposalState.SUCCEEDED;
        }
        
        // In timelock queue
        if (block.timestamp < proposal.executionTime) {
            return ProposalState.QUEUED;
        }
        
        // Check grace period
        if (block.timestamp > proposal.executionTime + settings.gracePeriod) {
            return ProposalState.EXPIRED;
        }
        
        return ProposalState.QUEUED;
    }
    
    /**
     * @dev Queue a successful proposal for execution
     */
    function queue(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.SUCCEEDED, "Not in succeeded state");
        
        Proposal storage proposal = proposals[proposalId];
        GovernanceSettings memory settings = propertySettings[proposal.propertyToken];
        
        proposal.executionTime = block.timestamp + settings.executionDelay;
        
        emit ProposalQueued(proposalId, proposal.executionTime);
    }
    
    /**
     * @dev Execute a queued proposal
     */
    function execute(uint256 proposalId) external payable nonReentrant {
        require(state(proposalId) == ProposalState.QUEUED, "Not in queued state");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.executionTime, "Timelock not expired");
        
        proposal.executed = true;
        
        // Execute the proposal action if there is one
        if (proposal.executionTarget != address(0)) {
            (bool success, ) = proposal.executionTarget.call{value: proposal.executionValue}(
                proposal.executionData
            );
            require(success, "Execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or admin)
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        
        ProposalState currentState = state(proposalId);
        require(
            currentState == ProposalState.PENDING || currentState == ProposalState.ACTIVE,
            "Cannot cancel"
        );
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        address propertyToken,
        ProposalType proposalType,
        string memory title,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 startTime,
        uint256 endTime,
        ProposalState currentState
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.propertyToken,
            p.proposalType,
            p.title,
            p.description,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes,
            p.startTime,
            p.endTime,
            state(proposalId)
        );
    }
    
    /**
     * @dev Get all proposals for a property
     */
    function getPropertyProposals(address propertyToken) external view returns (uint256[] memory) {
        return propertyProposals[propertyToken];
    }
    
    /**
     * @dev Get voter receipt for a proposal
     */
    function getReceipt(uint256 proposalId, address voter) external view returns (
        bool hasVoted,
        uint8 support,
        uint256 votes
    ) {
        Receipt storage receipt = receipts[proposalId][voter];
        return (receipt.hasVoted, receipt.support, receipt.votes);
    }
    
    /**
     * @dev Check if user has enough tokens to create a proposal
     */
    function canPropose(address propertyToken, address user) external view returns (bool) {
        if (!registeredTokens[propertyToken]) return false;
        
        GovernanceSettings memory settings = propertySettings[propertyToken];
        IERC20 token = IERC20(propertyToken);
        
        uint256 userBalance = token.balanceOf(user);
        uint256 totalSupply = token.totalSupply();
        uint256 threshold = (totalSupply * settings.proposalThreshold) / 10000;
        
        return userBalance >= threshold;
    }
    
    /**
     * @dev Get user's voting power for a property
     */
    function getVotingPower(address propertyToken, address user) external view returns (uint256) {
        return IERC20(propertyToken).balanceOf(user);
    }
    
    /**
     * @dev Get all registered property tokens
     */
    function getRegisteredTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Calculate current quorum requirement
     */
    function quorum(address propertyToken) external view returns (uint256) {
        GovernanceSettings memory settings = propertySettings[propertyToken];
        uint256 totalSupply = IERC20(propertyToken).totalSupply();
        return (totalSupply * settings.quorumThreshold) / 10000;
    }
}

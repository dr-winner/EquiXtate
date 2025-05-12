// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token representing fractional ownership of a real estate property
 * @custom:dev-run-script ./scripts/deploy_property_token.js
 */
contract PropertyToken is ERC20, ERC20Burnable, Ownable {
    // Property details
    string public propertyId;
    string public propertyLocation;
    string public propertyType;
    uint256 public propertyValuation;
    uint256 public tokenPrice;
    uint256 public maxTokenSupply;

    // Distribution details
    uint256 public availableTokens;
    mapping(address => bool) public whitelist;

    // Revenue distribution
    uint256 public accumulatedRevenue;
    mapping(address => uint256) public lastRevenueDistribution;
    mapping(address => uint256) public unclaimedRevenue;

    // Governance
    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event RevenueDistributed(uint256 amount);
    event RevenueWithdrawn(address indexed holder, uint256 amount);
    event ProposalCreated(
        uint256 indexed proposalId,
        string description,
        address creator
    );
    event VoteCast(uint256 indexed proposalId, address voter, bool inFavor);
    event ProposalExecuted(uint256 indexed proposalId);

    // Modifiers
    modifier onlyTokenHolder() {
        require(balanceOf(msg.sender) > 0, "Not a token holder");
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _propertyId,
        string memory _propertyLocation,
        string memory _propertyType,
        uint256 _propertyValuation,
        uint256 _tokenPrice,
        uint256 _maxTokenSupply
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        propertyId = _propertyId;
        propertyLocation = _propertyLocation;
        propertyType = _propertyType;
        propertyValuation = _propertyValuation;
        tokenPrice = _tokenPrice;
        maxTokenSupply = _maxTokenSupply;
        availableTokens = _maxTokenSupply;
    }

    /**
     * @dev Purchase tokens for a property
     * @param _tokenAmount Number of tokens to purchase
     */
    function purchaseTokens(uint256 _tokenAmount) external payable {
        require(availableTokens >= _tokenAmount, "Not enough tokens available");
        require(
            msg.value >= tokenPrice * _tokenAmount,
            "Insufficient funds sent"
        );

        // Transfer tokens to buyer
        _mint(msg.sender, _tokenAmount);
        availableTokens -= _tokenAmount;

        // Emit event
        emit TokensPurchased(msg.sender, _tokenAmount, msg.value);
    }

    /**
     * @dev Distribute revenue to token holders
     */
    function distributeRevenue() external payable onlyOwner {
        require(msg.value > 0, "No revenue to distribute");
        require(totalSupply() > 0, "No token holders");

        accumulatedRevenue += msg.value;
        emit RevenueDistributed(msg.value);
    }

    /**
     * @dev Withdraw accrued revenue
     */
    function withdrawRevenue() external onlyTokenHolder {
        uint256 amount = calculateUnclaimedRevenue(msg.sender);
        require(amount > 0, "No unclaimed revenue");

        lastRevenueDistribution[msg.sender] = accumulatedRevenue;
        payable(msg.sender).transfer(amount);

        emit RevenueWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Calculate unclaimed revenue for an address
     * @param _holder Address of the token holder
     * @return Amount of unclaimed revenue
     */
    function calculateUnclaimedRevenue(
        address _holder
    ) public view returns (uint256) {
        uint256 ownershipPercentage = (balanceOf(_holder) * 1e18) /
            totalSupply();
        uint256 totalRevenue = accumulatedRevenue -
            lastRevenueDistribution[_holder];

        return (totalRevenue * ownershipPercentage) / 1e18;
    }

    /**
     * @dev Create a governance proposal
     * @param _description Description of the proposal
     * @param _votingPeriod Voting period in days
     */
    function createProposal(
        string calldata _description,
        uint256 _votingPeriod
    ) external onlyTokenHolder {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_votingPeriod > 0, "Voting period must be greater than 0");

        uint256 proposalId = proposalCount;
        Proposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.description = _description;
        newProposal.deadline = block.timestamp + (_votingPeriod * 1 days);

        proposalCount++;

        emit ProposalCreated(proposalId, _description, msg.sender);
    }

    /**
     * @dev Vote on a proposal
     * @param _proposalId ID of the proposal
     * @param _inFavor True if voting in favor, false if against
     */
    function vote(
        uint256 _proposalId,
        bool _inFavor
    ) external onlyTokenHolder proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        require(block.timestamp < proposal.deadline, "Voting period has ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;
        uint256 voteWeight = balanceOf(msg.sender);

        if (_inFavor) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }

        emit VoteCast(_proposalId, msg.sender, _inFavor);
    }

    /**
     * @dev Execute a proposal if it has passed
     * @param _proposalId ID of the proposal
     */
    function executeProposal(
        uint256 _proposalId
    ) external onlyOwner proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];

        require(
            block.timestamp >= proposal.deadline,
            "Voting still in progress"
        );
        require(!proposal.executed, "Proposal already executed");
        require(
            proposal.votesFor > proposal.votesAgainst,
            "Proposal not approved"
        );

        proposal.executed = true;

        emit ProposalExecuted(_proposalId);
    }

    /**
     * @dev Update token price (only owner)
     * @param _newPrice New token price
     */
    function updateTokenPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        tokenPrice = _newPrice;
    }

    /**
     * @dev Add addresses to whitelist (for presale)
     * @param _addresses Array of addresses to whitelist
     */
    function addToWhitelist(address[] calldata _addresses) external onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
        }
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

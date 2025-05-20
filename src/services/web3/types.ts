
// Common types used across Web3 services

// Property Token contract response types
export interface PropertyToken {
  id: string;
  price: number;
  available: number;
  total: number;
}

// Governance contract response types
export interface GovernanceProposal {
  id: number;
  description: string;
  target: string;
  callData: string;
  votesFor: number;
  votesAgainst: number;
  executed: boolean;
}

// Network information
export interface NetworkInfo {
  name: string;
  chainId: number;
}

// Property details from smart contract
export interface PropertyDetails {
  id: number;
  name: string;
  propertyType: string;
  location: string;
  totalTokens: number;
  availableTokens: number;
  pricePerToken: number;
  owner: string;
  isActive: boolean;
}

// Contract ABIs
export const propertyTokenABI = [
  // EquiXToken ABI
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function properties(uint256 propertyId) view returns (uint256 id, string name, string propertyType, string location, uint256 totalTokens, uint256 availableTokens, uint256 pricePerToken, address owner, bool isActive, string metadataURI)",
  "function getProperty(uint256 propertyId) view returns (tuple(uint256 id, string name, string propertyType, string location, uint256 totalTokens, uint256 availableTokens, uint256 pricePerToken, address owner, bool isActive, string metadataURI))",
  "function purchaseTokens(uint256 propertyId, uint256 amount)",
  "function createProperty(string name, string propertyType, string location, uint256 valueUSD, string metadataURI) returns (uint256)",
  "function distributeRentalIncome(uint256 propertyId, uint256 amount)",
  "function claimRentalIncome(uint256 propertyId)",
  "function createAuction(uint256 propertyId, uint256 startingPrice, uint256 durationDays)",
  "function placeBid(uint256 propertyId, uint256 bidAmount)",
  "function endAuction(uint256 propertyId)",
  "event PropertyCreated(uint256 indexed propertyId, string name, string propertyType, uint256 totalTokens)",
  "event TokensPurchased(uint256 indexed propertyId, address buyer, uint256 amount, uint256 cost)",
  "event RentalIncomeDistributed(uint256 indexed propertyId, uint256 amount)",
  "event RentalIncomeClaimed(uint256 indexed propertyId, address user, uint256 amount)",
  "event AuctionCreated(uint256 indexed propertyId, uint256 startingPrice, uint256 endTime)",
  "event AuctionBid(uint256 indexed propertyId, address bidder, uint256 bidAmount)",
  "event AuctionEnded(uint256 indexed propertyId, address winner, uint256 bidAmount)"
];

export const marketplaceABI = [
  // Using the EquiXToken contract for marketplace functionality
  "function purchaseTokens(uint256 propertyId, uint256 amount)",
  "function createAuction(uint256 propertyId, uint256 startingPrice, uint256 durationDays)",
  "function placeBid(uint256 propertyId, uint256 bidAmount)",
  "function endAuction(uint256 propertyId)",
  "function getProperty(uint256 propertyId) view returns (tuple(uint256 id, string name, string propertyType, string location, uint256 totalTokens, uint256 availableTokens, uint256 pricePerToken, address owner, bool isActive, string metadataURI))"
];

export const governanceABI = [
  // EquiXGovernance ABI
  "function createProposal(uint256 propertyId, string title, string description, address targetContract, bytes callData) returns (uint256)",
  "function castVote(uint256 proposalId, bool support)",
  "function executeProposal(uint256 proposalId)",
  "function cancelProposal(uint256 proposalId)",
  "function getProposalDetails(uint256 proposalId) view returns (uint256 id, uint256 propertyId, string title, string description, uint256 votesFor, uint256 votesAgainst, uint256 startTime, uint256 endTime, bool executed, bool canceled)",
  "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
  "event ProposalCreated(uint256 indexed proposalId, uint256 indexed propertyId, string title, address proposer)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight)",
  "event ProposalExecuted(uint256 indexed proposalId)",
  "event ProposalCanceled(uint256 indexed proposalId)"
];

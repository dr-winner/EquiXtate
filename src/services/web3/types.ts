
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

// Contract ABIs
export const propertyTokenABI = [
  "function balanceOf(address owner, uint256 id) view returns (uint256)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function tokenPrice(uint256 id) view returns (uint256)",
  "function buyTokens(uint256 propertyId, uint256 amount) payable",
  "function availableTokens(uint256 propertyId) view returns (uint256)",
  "function totalSupply(uint256 propertyId) view returns (uint256)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)"
];

export const marketplaceABI = [
  "function listProperty(uint256 propertyId, uint256 price)",
  "function buyProperty(uint256 propertyId) payable",
  "function cancelListing(uint256 propertyId)",
  "function getPropertyListings() view returns (tuple(uint256, uint256, address)[])",
  "event PropertyListed(uint256 indexed propertyId, uint256 price, address seller)",
  "event PropertySold(uint256 indexed propertyId, address buyer, address seller, uint256 price)"
];

export const governanceABI = [
  "function createProposal(string description, address target, bytes calldata) external returns (uint256)",
  "function castVote(uint256 proposalId, bool support) external",
  "function executeProposal(uint256 proposalId) external",
  "function getProposalState(uint256 proposalId) external view returns (uint8)",
  "function getActiveProposalCount() external view returns (uint256)",
  "function getProposals() external view returns (tuple(uint256, string, address, bytes, uint256, uint256, bool)[])"
];

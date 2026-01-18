// PropertyGovernance Contract ABI and Address
export const PROPERTY_GOVERNANCE_ADDRESS = import.meta.env.VITE_PROPERTY_GOVERNANCE_ADDRESS || '';

export const PropertyGovernanceABI = [
  // Enums represented as uint8
  // ProposalType: PROPERTY_IMPROVEMENT(0), RENT_ADJUSTMENT(1), PROPERTY_SALE(2), MANAGEMENT_CHANGE(3), DIVIDEND_DISTRIBUTION(4), RULE_CHANGE(5), OTHER(6)
  // ProposalState: PENDING(0), ACTIVE(1), CANCELED(2), DEFEATED(3), SUCCEEDED(4), QUEUED(5), EXPIRED(6), EXECUTED(7)
  
  // Read Functions
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'proposals',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'proposer', type: 'address' },
      { name: 'propertyToken', type: 'address' },
      { name: 'proposalType', type: 'uint8' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'ipfsHash', type: 'string' },
      { name: 'forVotes', type: 'uint256' },
      { name: 'againstVotes', type: 'uint256' },
      { name: 'abstainVotes', type: 'uint256' },
      { name: 'snapshotBlock', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'executionTime', type: 'uint256' },
      { name: 'executionData', type: 'bytes' },
      { name: 'executionTarget', type: 'address' },
      { name: 'executionValue', type: 'uint256' },
      { name: 'executed', type: 'bool' },
      { name: 'canceled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposalCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'state',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { name: 'proposer', type: 'address' },
      { name: 'propertyToken', type: 'address' },
      { name: 'proposalType', type: 'uint8' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'forVotes', type: 'uint256' },
      { name: 'againstVotes', type: 'uint256' },
      { name: 'abstainVotes', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'currentState', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'getPropertyProposals',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'voter', type: 'address' },
    ],
    name: 'getReceipt',
    outputs: [
      { name: 'hasVoted', type: 'bool' },
      { name: 'support', type: 'uint8' },
      { name: 'votes', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'canPropose',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'getVotingPower',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRegisteredTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'quorum',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'registeredTokens',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'propertySettings',
    outputs: [
      { name: 'votingDelay', type: 'uint256' },
      { name: 'votingPeriod', type: 'uint256' },
      { name: 'proposalThreshold', type: 'uint256' },
      { name: 'quorumThreshold', type: 'uint256' },
      { name: 'executionDelay', type: 'uint256' },
      { name: 'gracePeriod', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  
  // Write Functions
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'proposalType', type: 'uint8' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'ipfsHash', type: 'string' },
      { name: 'executionTarget', type: 'address' },
      { name: 'executionData', type: 'bytes' },
      { name: 'executionValue', type: 'uint256' },
    ],
    name: 'createProposal',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'uint8' },
    ],
    name: 'castVote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'uint8' },
      { name: 'reason', type: 'string' },
    ],
    name: 'castVoteWithReason',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'queue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'proposalId', type: 'uint256' },
      { indexed: true, name: 'proposer', type: 'address' },
      { indexed: true, name: 'propertyToken', type: 'address' },
      { indexed: false, name: 'proposalType', type: 'uint8' },
      { indexed: false, name: 'title', type: 'string' },
      { indexed: false, name: 'startTime', type: 'uint256' },
      { indexed: false, name: 'endTime', type: 'uint256' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'voter', type: 'address' },
      { indexed: true, name: 'proposalId', type: 'uint256' },
      { indexed: false, name: 'support', type: 'uint8' },
      { indexed: false, name: 'weight', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'proposalId', type: 'uint256' }],
    name: 'ProposalCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'proposalId', type: 'uint256' },
      { indexed: false, name: 'executionTime', type: 'uint256' },
    ],
    name: 'ProposalQueued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'proposalId', type: 'uint256' }],
    name: 'ProposalExecuted',
    type: 'event',
  },
] as const;

// Proposal Types
export enum ProposalType {
  PROPERTY_IMPROVEMENT = 0,
  RENT_ADJUSTMENT = 1,
  PROPERTY_SALE = 2,
  MANAGEMENT_CHANGE = 3,
  DIVIDEND_DISTRIBUTION = 4,
  RULE_CHANGE = 5,
  OTHER = 6,
}

export const ProposalTypeLabels: Record<ProposalType, string> = {
  [ProposalType.PROPERTY_IMPROVEMENT]: 'Property Improvement',
  [ProposalType.RENT_ADJUSTMENT]: 'Rent Adjustment',
  [ProposalType.PROPERTY_SALE]: 'Property Sale',
  [ProposalType.MANAGEMENT_CHANGE]: 'Management Change',
  [ProposalType.DIVIDEND_DISTRIBUTION]: 'Dividend Distribution',
  [ProposalType.RULE_CHANGE]: 'Governance Rule Change',
  [ProposalType.OTHER]: 'Other',
};

// Proposal States
export enum ProposalState {
  PENDING = 0,
  ACTIVE = 1,
  CANCELED = 2,
  DEFEATED = 3,
  SUCCEEDED = 4,
  QUEUED = 5,
  EXPIRED = 6,
  EXECUTED = 7,
}

export const ProposalStateLabels: Record<ProposalState, string> = {
  [ProposalState.PENDING]: 'Pending',
  [ProposalState.ACTIVE]: 'Active',
  [ProposalState.CANCELED]: 'Canceled',
  [ProposalState.DEFEATED]: 'Defeated',
  [ProposalState.SUCCEEDED]: 'Succeeded',
  [ProposalState.QUEUED]: 'Queued',
  [ProposalState.EXPIRED]: 'Expired',
  [ProposalState.EXECUTED]: 'Executed',
};

export const ProposalStateColors: Record<ProposalState, string> = {
  [ProposalState.PENDING]: 'bg-yellow-500',
  [ProposalState.ACTIVE]: 'bg-blue-500',
  [ProposalState.CANCELED]: 'bg-gray-500',
  [ProposalState.DEFEATED]: 'bg-red-500',
  [ProposalState.SUCCEEDED]: 'bg-green-500',
  [ProposalState.QUEUED]: 'bg-purple-500',
  [ProposalState.EXPIRED]: 'bg-gray-400',
  [ProposalState.EXECUTED]: 'bg-emerald-600',
};

// Vote support types
export enum VoteSupport {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2,
}

// Helper functions
export function getProposalTypeLabel(type: ProposalType): string {
  return ProposalTypeLabels[type] || 'Unknown';
}

export function getProposalStateLabel(state: ProposalState): string {
  return ProposalStateLabels[state] || 'Unknown';
}

export function getProposalStateColor(state: ProposalState): string {
  const colors: Record<ProposalState, string> = {
    [ProposalState.PENDING]: 'bg-yellow-500/20 text-yellow-400',
    [ProposalState.ACTIVE]: 'bg-blue-500/20 text-blue-400',
    [ProposalState.CANCELED]: 'bg-gray-500/20 text-gray-400',
    [ProposalState.DEFEATED]: 'bg-red-500/20 text-red-400',
    [ProposalState.SUCCEEDED]: 'bg-green-500/20 text-green-400',
    [ProposalState.QUEUED]: 'bg-purple-500/20 text-purple-400',
    [ProposalState.EXPIRED]: 'bg-gray-500/20 text-gray-400',
    [ProposalState.EXECUTED]: 'bg-emerald-500/20 text-emerald-400',
  };
  return colors[state] || 'bg-gray-500/20 text-gray-400';
}

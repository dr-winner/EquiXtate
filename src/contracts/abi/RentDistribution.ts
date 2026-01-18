// RentDistribution Contract ABI and Address
export const RENT_DISTRIBUTION_ADDRESS = import.meta.env.VITE_RENT_DISTRIBUTION_ADDRESS || '';

export const RentDistributionABI = [
  // Read Functions
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'propertyRents',
    outputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'paymentToken', type: 'address' },
      { name: 'totalDistributed', type: 'uint256' },
      { name: 'lastDistributionTime', type: 'uint256' },
      { name: 'accumulatedRentPerShare', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'pendingRent',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'totalPendingRent',
    outputs: [{ name: 'totalPending', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'getUserInfo',
    outputs: [
      { name: 'pending', type: 'uint256' },
      { name: 'totalClaimed', type: 'uint256' },
      { name: 'lastClaimTime', type: 'uint256' },
      { name: 'tokenBalance', type: 'uint256' },
      { name: 'sharePercentage', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'getPropertyInfo',
    outputs: [
      { name: 'paymentToken', type: 'address' },
      { name: 'totalDistributed', type: 'uint256' },
      { name: 'lastDistributionTime', type: 'uint256' },
      { name: 'distributionCount', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    name: 'getDistributionHistory',
    outputs: [
      {
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'totalShares', type: 'uint256' },
          { name: 'description', type: 'string' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRegisteredProperties',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'estimateAPY',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'userInfo',
    outputs: [
      { name: 'rewardDebt', type: 'uint256' },
      { name: 'totalClaimed', type: 'uint256' },
      { name: 'lastClaimTime', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  
  // Write Functions
  {
    inputs: [{ name: 'propertyToken', type: 'address' }],
    name: 'claimRent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'propertyTokens', type: 'address[]' }],
    name: 'claimAllRent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'description', type: 'string' },
    ],
    name: 'depositRent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'propertyToken', type: 'address' },
      { name: 'description', type: 'string' },
    ],
    name: 'depositRentETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'propertyToken', type: 'address' },
      { indexed: true, name: 'paymentToken', type: 'address' },
    ],
    name: 'PropertyRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'propertyToken', type: 'address' },
      { indexed: true, name: 'depositor', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'description', type: 'string' },
    ],
    name: 'RentDeposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'propertyToken', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'RentClaimed',
    type: 'event',
  },
] as const;

// Distribution interface for frontend
export interface Distribution {
  amount: bigint;
  timestamp: bigint;
  totalShares: bigint;
  description: string;
}

// User rent info interface
export interface UserRentInfo {
  pending: bigint;
  totalClaimed: bigint;
  lastClaimTime: bigint;
  tokenBalance: bigint;
  sharePercentage: bigint; // In basis points (100 = 1%)
}

// Property rent info interface
export interface PropertyRentInfo {
  paymentToken: string;
  totalDistributed: bigint;
  lastDistributionTime: bigint;
  distributionCount: bigint;
  isActive: boolean;
}

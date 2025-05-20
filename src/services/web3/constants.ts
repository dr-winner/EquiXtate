
// Contract addresses and other constants

// Contract addresses - update these after deploying the contracts
export const CONTRACT_ADDRESSES = {
  TOKEN: "0x1234567890123456789012345678901234567890", // EquiXToken contract address
  MARKETPLACE: "0x1234567890123456789012345678901234567890", // Same as TOKEN since marketplace functionality is in the token contract
  GOVERNANCE: "0xabcdef1234567890abcdef1234567890abcdef12" // EquiXGovernance contract address
};

// Network names mapping
export const NETWORK_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  56: "BSC Mainnet",
  97: "BSC Testnet"
};

// EquiX token constants
export const EQUIX_TOKEN_CONSTANTS = {
  USD_VALUE: 5.00, // $5.00 per token (updated from $2.00)
  DECIMALS: 18
};

// Helper functions
export const convertUsdToEquixTokens = (usdAmount: number): number => {
  return usdAmount / EQUIX_TOKEN_CONSTANTS.USD_VALUE;
};

export const convertEquixTokensToUsd = (tokens: number): number => {
  return tokens * EQUIX_TOKEN_CONSTANTS.USD_VALUE;
};

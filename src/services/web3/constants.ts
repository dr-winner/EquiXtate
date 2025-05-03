// Contract addresses and other constants

// Contract addresses from environment variables
export const CONTRACT_ADDRESSES = {
  TOKEN: process.env.VITE_PROPERTY_TOKEN_ADDRESS || "0x1234567890123456789012345678901234567890",
  MARKETPLACE: process.env.VITE_MARKETPLACE_ADDRESS || "0x0987654321098765432109876543210987654321",
  GOVERNANCE: process.env.VITE_GOVERNANCE_ADDRESS || "0xabcdef1234567890abcdef1234567890abcdef12",
  SONIC_TOKEN: process.env.VITE_SONIC_TOKEN_ADDRESS || "0x1234567890123456789012345678901234567890"
};

// Network names mapping
export const NETWORK_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  56: "BSC Mainnet",
  97: "BSC Testnet",
  148: "Sonic Labs Testnet",
  149: "Sonic Labs Mainnet"
};

// Sonic Labs Testnet specific constants
export const SONIC_LABS_CONFIG = {
  RPC_URL: process.env.VITE_SONIC_LABS_RPC_URL || "https://testnet-rpc.soniclabs.io",
  CHAIN_ID: Number(process.env.VITE_SONIC_LABS_CHAIN_ID) || 148,
  EXPLORER_URL: process.env.VITE_SONIC_LABS_EXPLORER_URL || "https://testnet-explorer.soniclabs.io",
  NATIVE_TOKEN: "SONIC",
  NATIVE_TOKEN_DECIMALS: 18,
  GAS_SETTINGS: {
    DEFAULT_GAS_LIMIT: Number(process.env.VITE_GAS_LIMIT) || 300000,
    DEFAULT_GAS_PRICE: Number(process.env.VITE_GAS_PRICE) || 50000000000,
    MAX_GAS_PRICE: Number(process.env.VITE_MAX_GAS_PRICE) || 100000000000
  }
};

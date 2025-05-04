// Contract addresses and other constants

// Contract addresses from environment variables
export const CONTRACT_ADDRESSES = {
  TOKEN: process.env.VITE_PROPERTY_TOKEN_ADDRESS || "0x3Bf4D30D47d3510d5706993d0ad322b934189E29",
  MARKETPLACE: process.env.VITE_MARKETPLACE_ADDRESS || "0xb1DA65F4c7BcC54c725FCE4aBaf5588472c73E5b",
  GOVERNANCE: process.env.VITE_GOVERNANCE_ADDRESS || "0x9c6731B43E5407324F31a54AB9e918Be382C20eC",
  SONIC_TOKEN: process.env.VITE_SONIC_TOKEN_ADDRESS || "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"
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
  57054: "Sonic Blaze Testnet"
};

// Sonic Blaze Testnet specific constants
export const SONIC_LABS_CONFIG = {
  RPC_URL: process.env.VITE_SONIC_LABS_RPC_URL || "https://rpc.blaze.soniclabs.com",
  CHAIN_ID: Number(process.env.VITE_SONIC_LABS_CHAIN_ID) || 57054,
  EXPLORER_URL: process.env.VITE_SONIC_LABS_EXPLORER_URL || "https://explorer.blaze.soniclabs.com",
  NATIVE_TOKEN: "SONIC",
  NATIVE_TOKEN_DECIMALS: 18,
  GAS_SETTINGS: {
    DEFAULT_GAS_LIMIT: Number(process.env.VITE_GAS_LIMIT) || 300000,
    DEFAULT_GAS_PRICE: Number(process.env.VITE_GAS_PRICE) || 50000000000,
    MAX_GAS_PRICE: Number(process.env.VITE_MAX_GAS_PRICE) || 100000000000
  }
};

// Contract addresses and other constants

// Sonic Testnet deployed contract addresses (UUPS Proxies)
// Deployed: 2025-11-19
export const CONTRACT_ADDRESSES = {
  // Sonic Testnet (Chain ID: 14601)
  SONIC_TESTNET: {
    KYC_REGISTRY: "0xE5386Ee767d33Bd760b0Bc27228aE7b32434d28c",
    PROPERTY_ORACLE: "0xb6Cd0223C0506464f2ED89829A828de717E44a28",
    PROPERTY_TOKEN: "0xf7b2710619d18c8dE370D4951B8f683Dcfa185D6",
    AUCTION_HOUSE: "0x7C2B1Ae9A296697b8900fFe14092930E0faa0654",
    RENTAL_MANAGER: "0xD8A3D36Bb0214c9e87A8fc20B019D8c5f58DC2c6",
    PROPERTY_FACTORY: "0x3FC244D95bCbC6eBceE6FA19c0E0b708cB1f89dc",
  },
  // Legacy placeholder addresses (deprecated)
  TOKEN: "0x1234567890123456789012345678901234567890",
  MARKETPLACE: "0x0987654321098765432109876543210987654321",
  GOVERNANCE: "0xabcdef1234567890abcdef1234567890abcdef12"
};

// Network names mapping
export const NETWORK_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  80002: "Polygon Amoy Testnet",
  56: "BSC Mainnet",
  97: "BSC Testnet",
  14601: "Sonic Testnet", // Correct chain ID
  146: "Sonic Mainnet"
};

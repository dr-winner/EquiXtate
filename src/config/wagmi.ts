import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { defineChain } from 'viem'

// Get WalletConnect Project ID from environment or use empty string (WalletConnect will be disabled)
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Define Sonic Testnet chain
export const sonicTestnet = defineChain({
  id: 57054, // Sonic testnet chain ID
  name: 'Sonic Testnet',
  network: 'sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.soniclabs.com'],
    },
    public: {
      http: ['https://rpc.testnet.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Sonic Testnet Explorer', url: 'https://testnet.sonicscan.org' },
  },
  testnet: true,
})

// Configure chains & providers
// Note: When using Privy, connectors are managed by Privy's PrivyWagmiConnector
// We just need to set up the chains and transports
export const config = createConfig({
  chains: [sepolia, sonicTestnet],
  connectors: [], // Privy will provide connectors
  transports: {
    [sepolia.id]: http(),
    [sonicTestnet.id]: http('https://rpc.testnet.soniclabs.com'),
  },
})

// Contract ABIs will be imported here
// Example:
// import { propertyTokenABI } from './abis/propertyToken' 
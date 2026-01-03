import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Get WalletConnect Project ID from environment or use empty string (WalletConnect will be disabled)
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Configure chains & providers
// Note: When using Privy, connectors are managed by Privy's PrivyWagmiConnector
// We just need to set up the chains and transports
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [], // Privy will provide connectors
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Contract ABIs will be imported here
// Example:
// import { propertyTokenABI } from './abis/propertyToken' 
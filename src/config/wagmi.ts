import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Get WalletConnect Project ID from environment or use empty string (WalletConnect will be disabled)
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Configure chains & providers
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    // Only add WalletConnect if project ID is provided
    ...(WALLETCONNECT_PROJECT_ID ? [walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
    })] : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Contract ABIs will be imported here
// Example:
// import { propertyTokenABI } from './abis/propertyToken' 
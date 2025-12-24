/**
 * RainbowKit Configuration
 * 
 * Configures wagmi and RainbowKit for wallet connections
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { mainnet, sepolia, polygon, polygonAmoy } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Sonic Testnet chain
export const sonicTestnet = defineChain({
  id: 14601, // Correct chain ID from RPC
  name: 'Sonic Testnet',
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
    default: {
      name: 'Sonic Explorer',
      url: 'https://testnet.soniclabs.com',
    },
  },
  testnet: true,
});

// Define Sonic Mainnet chain
export const sonicMainnet = defineChain({
  id: 146,
  name: 'Sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.soniclabs.com'],
    },
    public: {
      http: ['https://rpc.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Explorer',
      url: 'https://soniclabs.com',
    },
  },
});

// Get project ID from environment (optional for WalletConnect)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'EquiXtate',
  projectId,
  chains: [sonicTestnet, mainnet, sepolia, polygon, polygonAmoy, sonicMainnet],
  transports: {
    [sonicTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
    [sonicMainnet.id]: http(),
  },
  ssr: false, // Not using server-side rendering
});

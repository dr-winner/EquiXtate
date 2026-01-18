/**
 * KRNL SDK React Configuration
 * 
 * This configures the @krnl-dev/sdk-react-7702 for EIP-7702 delegated account
 * workflows with decentralized attestation.
 */

import { createConfig } from '@krnl-dev/sdk-react-7702';
import { sepolia } from 'viem/chains';

// Get environment variables with fallbacks
const delegatedContractAddress = import.meta.env.VITE_DELEGATED_ACCOUNT_ADDRESS || '0x9969827E2CB0582e08787B23F641b49Ca82bc774';
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || '';
const krnlNodeUrl = import.meta.env.VITE_KRNL_NODE_URL || 'https://node.krnl.xyz';
const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

// Create KRNL config with viem chain
export const krnlConfig = createConfig({
  chain: sepolia as any,
  delegatedContractAddress,
  privyAppId,
  krnlNodeUrl,
  rpcUrl
});

// Export constants for use throughout the app
export const KRNL_CONSTANTS = {
  // Standard KRNL delegated account (don't change)
  DELEGATED_ACCOUNT: delegatedContractAddress,
  
  // Your attestor image
  ATTESTOR_IMAGE: import.meta.env.VITE_ATTESTOR_IMAGE || '',
  
  // Your EOA that controls the attestor
  DELEGATE_OWNER: import.meta.env.VITE_DELEGATE_OWNER || '',
  
  // Contract addresses
  PROPERTY_REGISTRY: import.meta.env.VITE_PROPERTY_REGISTRY_ADDRESS || '0xE11D19503029Ed7D059A0022288FB88d61C7c3b4',
  KYC_VERIFIER: import.meta.env.VITE_KYC_VERIFIER_CONTRACT || '0x6eeA600d2AbC11D3fF82a6732b1042Eec52A111d',
  PROPERTY_GOVERNANCE: import.meta.env.VITE_PROPERTY_GOVERNANCE_ADDRESS || '0xCd7b9006207F0DA7287f692A7250B64E1B3c8453',
  RENT_DISTRIBUTION: import.meta.env.VITE_RENT_DISTRIBUTION_ADDRESS || '0xd1b544926e3e8761aD4c06605A7aA9689A169dF0',
  MOCK_USDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '0xaC66E9916dCe765405E4A4297DdDF61729CbDFF9',
  
  // Chain config
  CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
  RPC_URL: rpcUrl,
  
  // KRNL node
  NODE_URL: krnlNodeUrl,
};

export default krnlConfig;

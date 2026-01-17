/**
 * KRNL Kernel Configuration
 * 
 * This file configures the KRNL Protocol integration for cross-chain
 * property verification and data attestation.
 * 
 * KRNL Kernels Used:
 * - Kernel 1529: Property verification kernel
 * - Kernel 337: Identity verification kernel (KYC)
 * - Kernel 7702: Real estate investment kernel
 */

// KRNL Delegated Smart Contract Account (standard for all KRNL apps)
export const KRNL_DELEGATED_ACCOUNT = '0x9969827E2CB0582e08787B23F641b49Ca82bc774';

// Mock USDC address on Sepolia (provided by KRNL)
export const MOCK_USDC_ADDRESS = '0xF2Ea67F83b58225edF11F3Af4A5733B3E0844509';

// KRNL Protocol RPC (Sepolia)
export const KRNL_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

// Kernel IDs
export const KERNEL_IDS = {
  PROPERTY_VERIFICATION: '1529',
  IDENTITY_VERIFICATION: '337',
  REAL_ESTATE_INVESTMENT: '7702',
} as const;

// Property verification kernel request types
export interface PropertyVerificationKernelRequest {
  propertyId: string;
  ownerAddress: string;
  documentHashes: string[];
  locationHash: string;
}

// Identity verification kernel request types
export interface IdentityVerificationKernelRequest {
  walletAddress: string;
  kycLevel: 'basic' | 'advanced' | 'accredited';
  documentHash: string;
}

// Cross-chain property data request
export interface CrossChainPropertyRequest {
  sourceChainId: number;
  targetChainId: number;
  propertyTokenAddress: string;
  requestType: 'ownership' | 'valuation' | 'compliance';
}

// KRNL response structure
export interface KRNLKernelResponse {
  auth: string;
  kernel_responses: string;
  kernel_params: {
    [kernelId: string]: {
      functionParams: string;
    };
  };
  timestamp: number;
  attestationHash?: string;
}

// Supported chains for cross-chain operations
export const SUPPORTED_CHAINS = {
  ETHEREUM_SEPOLIA: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  },
  POLYGON_MUMBAI: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.polygon.technology',
  },
  BASE_SEPOLIA: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
  },
  ARBITRUM_SEPOLIA: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  },
} as const;

// Property verification workflow DSL template
export const PROPERTY_VERIFICATION_WORKFLOW = `
workflow PropertyVerification {
  // Step 1: Validate owner identity
  step validateIdentity {
    kernel: "${KERNEL_IDS.IDENTITY_VERIFICATION}"
    input: ownerAddress, kycLevel
    output: identityVerified
  }
  
  // Step 2: Check property records against government database
  step checkPropertyRecords {
    kernel: "${KERNEL_IDS.PROPERTY_VERIFICATION}"
    input: propertyId, locationHash, documentHashes
    output: recordsValid, ownershipConfirmed
  }
  
  // Step 3: Generate attestation
  step generateAttestation {
    requires: [validateIdentity.identityVerified, checkPropertyRecords.ownershipConfirmed]
    action: createOnChainAttestation
    output: attestationHash
  }
}
`;

// Cross-chain property sync workflow
export const CROSS_CHAIN_SYNC_WORKFLOW = `
workflow CrossChainPropertySync {
  // Step 1: Read property state from source chain
  step readSourceState {
    chain: sourceChainId
    action: readPropertyToken
    input: propertyTokenAddress
    output: propertyData
  }
  
  // Step 2: Verify property data integrity
  step verifyIntegrity {
    kernel: "${KERNEL_IDS.PROPERTY_VERIFICATION}"
    input: propertyData.hash
    output: integrityValid
  }
  
  // Step 3: Bridge data to target chain
  step bridgeData {
    requires: [verifyIntegrity.integrityValid]
    chain: targetChainId
    action: updatePropertyMirror
    input: propertyData
  }
}
`;

// KRNL Attestor configuration (to be filled when attestor is created)
export interface AttestorConfig {
  imageUrl: string;  // e.g., "image://docker.io/username/attestor-equixtate:latest"
  encryptionSecret: string;
  secrets: {
    rpcSepoliaURL: string;
    pimlicoApiKey: string;
    openaiApiKey: string;
  };
}

// Default attestor config (placeholder)
export const DEFAULT_ATTESTOR_CONFIG: AttestorConfig = {
  imageUrl: '', // Set via VITE_ATTESTOR_IMAGE
  encryptionSecret: '', // Auto-generated during attestor setup
  secrets: {
    rpcSepoliaURL: KRNL_RPC_URL,
    pimlicoApiKey: '', // Set via VITE_PIMLICO_API_KEY
    openaiApiKey: 'mock-api', // Using mock for demo
  },
};

// Export configuration loader
export function loadKRNLConfig() {
  return {
    rpcUrl: import.meta.env.VITE_RPC_KRNL || KRNL_RPC_URL,
    entryId: import.meta.env.VITE_KRNL_ENTRY_ID || '',
    accessToken: import.meta.env.VITE_KRNL_ACCESS_TOKEN || '',
    kernelId: import.meta.env.VITE_KRNL_KERNEL_ID || KERNEL_IDS.PROPERTY_VERIFICATION,
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
    delegatedAccount: KRNL_DELEGATED_ACCOUNT,
    attestorImage: import.meta.env.VITE_ATTESTOR_IMAGE || '',
    delegateOwner: import.meta.env.VITE_DELEGATE_OWNER || '',
    mockUsdcAddress: MOCK_USDC_ADDRESS,
  };
}

// Check if KRNL is fully configured
export function isKRNLFullyConfigured(): boolean {
  const config = loadKRNLConfig();
  return !!(
    config.rpcUrl &&
    config.entryId &&
    config.accessToken &&
    config.contractAddress &&
    config.attestorImage
  );
}

// Get mock mode status
export function isKRNLMockMode(): boolean {
  return !isKRNLFullyConfigured();
}

/**
 * Cross-Chain Property Data Service
 * 
 * This service handles cross-chain property data synchronization
 * and verification using KRNL Protocol.
 */

import { ethers } from 'ethers';
import { executeKrnl } from '@/krnl/1529';
import {
  SUPPORTED_CHAINS,
  CrossChainPropertyRequest,
  KRNLKernelResponse,
  KERNEL_IDS,
  loadKRNLConfig,
  isKRNLMockMode,
} from '@/krnl/kernelConfig';

// Property data structure for cross-chain sync
export interface PropertyData {
  tokenAddress: string;
  chainId: number;
  propertyId: string;
  totalSupply: string;
  ownerCount: number;
  lastSyncTime: number;
  dataHash: string;
  metadata: {
    name: string;
    location: string;
    valuation: string;
    verified: boolean;
  };
}

// Cross-chain sync result
export interface CrossChainSyncResult {
  success: boolean;
  sourceChain: number;
  targetChain: number;
  propertyData: PropertyData;
  attestationHash?: string;
  error?: string;
}

// Chain provider cache
const providerCache: Map<number, ethers.JsonRpcProvider> = new Map();

function getProvider(chainId: number): ethers.JsonRpcProvider {
  if (providerCache.has(chainId)) {
    return providerCache.get(chainId)!;
  }

  const chain = Object.values(SUPPORTED_CHAINS).find(c => c.chainId === chainId);
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
  providerCache.set(chainId, provider);
  return provider;
}

// ERC20 ABI for reading property token data
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

class CrossChainPropertyService {
  private mockMode: boolean;

  constructor() {
    this.mockMode = isKRNLMockMode();
    if (this.mockMode) {
      console.warn('[CrossChain] Running in mock mode - KRNL not fully configured');
    }
  }

  /**
   * Read property data from a specific chain
   */
  async readPropertyData(
    chainId: number,
    tokenAddress: string
  ): Promise<PropertyData> {
    console.log(`📖 Reading property data from chain ${chainId}...`);

    try {
      const provider = getProvider(chainId);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      // Read on-chain data
      const [name, symbol, totalSupply] = await Promise.all([
        contract.name().catch(() => 'Unknown Property'),
        contract.symbol().catch(() => 'PROP'),
        contract.totalSupply().catch(() => BigInt(0)),
      ]);

      // Generate data hash for integrity verification
      const dataHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'uint256', 'uint256'],
          [name, totalSupply, Date.now()]
        )
      );

      const propertyData: PropertyData = {
        tokenAddress,
        chainId,
        propertyId: `${chainId}-${tokenAddress.slice(0, 10)}`,
        totalSupply: totalSupply.toString(),
        ownerCount: 0, // Would require indexer to get accurate count
        lastSyncTime: Date.now(),
        dataHash,
        metadata: {
          name,
          location: 'On-chain',
          valuation: '0',
          verified: false,
        },
      };

      return propertyData;
    } catch (error) {
      console.error(`Failed to read property data:`, error);
      throw error;
    }
  }

  /**
   * Verify property data integrity using KRNL
   */
  async verifyPropertyData(
    propertyData: PropertyData,
    ownerAddress: string
  ): Promise<{ verified: boolean; attestationHash?: string }> {
    console.log(`🔍 Verifying property data integrity via KRNL...`);

    if (this.mockMode) {
      console.warn('[CrossChain] Mock verification - returning simulated result');
      return {
        verified: true,
        attestationHash: `0xmock_${propertyData.dataHash.slice(0, 16)}`,
      };
    }

    try {
      // Execute KRNL verification kernel
      const krnlResult = await executeKrnl(ownerAddress, KERNEL_IDS.PROPERTY_VERIFICATION);

      // Decode the verification response
      const abiCoder = new ethers.AbiCoder();
      const decoded = abiCoder.decode(
        ['address', 'bool', 'uint256'],
        krnlResult.kernel_responses
      );

      const verified = decoded[1] as boolean;
      const attestationHash = krnlResult.auth;

      return { verified, attestationHash };
    } catch (error) {
      console.error('KRNL verification failed:', error);
      return { verified: false };
    }
  }

  /**
   * Sync property data across chains
   */
  async syncPropertyAcrossChains(
    request: CrossChainPropertyRequest,
    ownerAddress: string
  ): Promise<CrossChainSyncResult> {
    console.log(`🔄 Syncing property from chain ${request.sourceChainId} to ${request.targetChainId}...`);

    try {
      // Step 1: Read data from source chain
      const sourceData = await this.readPropertyData(
        request.sourceChainId,
        request.propertyTokenAddress
      );

      // Step 2: Verify data integrity
      const verification = await this.verifyPropertyData(sourceData, ownerAddress);

      if (!verification.verified) {
        return {
          success: false,
          sourceChain: request.sourceChainId,
          targetChain: request.targetChainId,
          propertyData: sourceData,
          error: 'Property data verification failed',
        };
      }

      // Step 3: In production, this would bridge the data to target chain
      // For now, we return the verified data
      sourceData.metadata.verified = true;

      return {
        success: true,
        sourceChain: request.sourceChainId,
        targetChain: request.targetChainId,
        propertyData: sourceData,
        attestationHash: verification.attestationHash,
      };
    } catch (error) {
      console.error('Cross-chain sync failed:', error);
      return {
        success: false,
        sourceChain: request.sourceChainId,
        targetChain: request.targetChainId,
        propertyData: {} as PropertyData,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Get property data from multiple chains
   */
  async getMultiChainPropertyData(
    tokenAddresses: { chainId: number; address: string }[]
  ): Promise<PropertyData[]> {
    console.log(`📊 Fetching property data from ${tokenAddresses.length} chains...`);

    const results = await Promise.allSettled(
      tokenAddresses.map(({ chainId, address }) =>
        this.readPropertyData(chainId, address)
      )
    );

    return results
      .filter((r): r is PromiseFulfilledResult<PropertyData> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  /**
   * Check if a chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return Object.values(SUPPORTED_CHAINS).some(c => c.chainId === chainId);
  }

  /**
   * Get supported chains
   */
  getSupportedChains() {
    return Object.values(SUPPORTED_CHAINS);
  }
}

// Export singleton instance
export const crossChainPropertyService = new CrossChainPropertyService();

// Export class for testing
export { CrossChainPropertyService };

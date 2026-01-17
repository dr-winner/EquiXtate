/**
 * Real KRNL Integration Service
 * 
 * This service provides production-ready KRNL Protocol integration
 * for property verification and cross-chain attestation.
 * 
 * Requirements:
 * - VITE_KRNL_ENTRY_ID: Entry ID from krnl create-attestor
 * - VITE_KRNL_ACCESS_TOKEN: Access token from krnl create-attestor
 * - VITE_RPC_KRNL: Sepolia RPC endpoint
 * - VITE_ATTESTOR_IMAGE: Docker image for attestor
 */

import { ethers } from 'krnl-sdk';
import { KRNL_CONFIG } from '@/utils/envConfig';
import { AbiCoder } from 'ethers';

// KRNL Integration Status
export interface KRNLStatus {
  mode: 'real' | 'mock';
  hasEntryId: boolean;
  hasAccessToken: boolean;
  hasRpcUrl: boolean;
  isReady: boolean;
  message: string;
}

// KRNL Execution Result
export interface KRNLExecutionResult {
  success: boolean;
  mode: 'real' | 'mock';
  auth: string;
  kernelResponses: string;
  kernelParams: Record<string, { functionParams: string }>;
  timestamp: number;
  decodedData?: unknown;
  error?: string;
}

// Property Verification Payload
export interface PropertyVerificationPayload {
  propertyId: string;
  ownerAddress: string;
  documentHashes: string[];
  propertyValue: bigint;
}

// KYC Verification Payload
export interface KYCVerificationPayload {
  walletAddress: string;
  kycLevel: 'basic' | 'advanced' | 'accredited';
  documentHash: string;
}

class RealKRNLService {
  private abiCoder: AbiCoder;

  constructor() {
    this.abiCoder = new AbiCoder();
  }

  /**
   * Get current KRNL integration status
   */
  getStatus(): KRNLStatus {
    const hasEntryId = !!KRNL_CONFIG.entryId && KRNL_CONFIG.entryId.length > 0;
    const hasAccessToken = !!KRNL_CONFIG.accessToken && KRNL_CONFIG.accessToken.length > 0;
    const hasRpcUrl = !!KRNL_CONFIG.rpcUrl && KRNL_CONFIG.rpcUrl.length > 0;
    const hasAttestorImage = !!KRNL_CONFIG.attestorImage && KRNL_CONFIG.attestorImage.length > 0;
    
    // KRNL is ready if we have RPC + attestor image (SDK can work with image-based approach)
    // OR if we have traditional Entry ID + Access Token
    const isReady = hasRpcUrl && (hasAttestorImage || (hasEntryId && hasAccessToken));

    let message: string;
    if (isReady) {
      if (hasAttestorImage) {
        message = `KRNL attestor configured: ${KRNL_CONFIG.attestorImage}`;
      } else {
        message = 'KRNL integration is fully configured and ready';
      }
    } else {
      const missing = [];
      if (!hasRpcUrl) missing.push('VITE_RPC_KRNL');
      if (!hasAttestorImage && !hasEntryId) missing.push('VITE_ATTESTOR_IMAGE or VITE_KRNL_ENTRY_ID');
      if (!hasAttestorImage && !hasAccessToken) missing.push('VITE_KRNL_ACCESS_TOKEN');
      message = `Missing configuration: ${missing.join(', ')}. Run "krnl create-attestor" to configure.`;
    }

    return {
      mode: isReady ? 'real' : 'mock',
      hasEntryId,
      hasAccessToken,
      hasRpcUrl,
      isReady,
      message
    };
  }

  /**
   * Get KRNL Provider (real or mock)
   */
  private getProvider(): ethers.JsonRpcProvider {
    const rpcUrl = KRNL_CONFIG.rpcUrl || 'https://ethereum-sepolia-rpc.publicnode.com';
    return new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Execute KRNL kernel for property verification
   */
  async executePropertyVerification(
    payload: PropertyVerificationPayload
  ): Promise<KRNLExecutionResult> {
    const status = this.getStatus();
    
    if (!status.isReady) {
      console.warn('[KRNL] Running in mock mode:', status.message);
      return this.mockPropertyVerification(payload);
    }

    try {
      console.log('[KRNL] Executing real property verification kernel...');
      
      const provider = this.getProvider();
      
      // Encode property verification parameters
      const functionParams = this.abiCoder.encode(
        ['string', 'address', 'bytes32[]', 'uint256'],
        [
          payload.propertyId,
          payload.ownerAddress,
          payload.documentHashes.map(h => ethers.keccak256(ethers.toUtf8Bytes(h))),
          payload.propertyValue
        ]
      );

      // Kernel request structure for property verification (kernel 1529)
      const kernelRequestData = {
        senderAddress: payload.ownerAddress,
        kernelPayload: {
          '1529': {
            functionParams
          }
        }
      };

      // Execute KRNL kernels
      const krnlPayload = await provider.executeKernels(
        KRNL_CONFIG.entryId,
        KRNL_CONFIG.accessToken,
        kernelRequestData,
        functionParams
      );

      // Decode the response
      const decodedData = this.abiCoder.decode(
        ['address', 'bool', 'uint256', 'bytes32'],
        krnlPayload.kernel_responses
      );

      return {
        success: true,
        mode: 'real',
        auth: krnlPayload.auth,
        kernelResponses: krnlPayload.kernel_responses,
        kernelParams: krnlPayload.kernel_params,
        timestamp: Date.now(),
        decodedData: {
          propertyTokenAddress: decodedData[0],
          isVerified: decodedData[1],
          verificationTimestamp: decodedData[2],
          attestationHash: decodedData[3]
        }
      };
    } catch (error) {
      console.error('[KRNL] Property verification failed:', error);
      return {
        success: false,
        mode: 'real',
        auth: '',
        kernelResponses: '',
        kernelParams: {},
        timestamp: Date.now(),
        error: (error as Error).message
      };
    }
  }

  /**
   * Execute KRNL kernel for KYC verification
   */
  async executeKYCVerification(
    payload: KYCVerificationPayload
  ): Promise<KRNLExecutionResult> {
    const status = this.getStatus();
    
    if (!status.isReady) {
      console.warn('[KRNL] Running in mock mode:', status.message);
      return this.mockKYCVerification(payload);
    }

    try {
      console.log('[KRNL] Executing real KYC verification kernel...');
      
      const provider = this.getProvider();
      
      // Encode KYC parameters
      const kycLevelMap = { basic: 1, advanced: 2, accredited: 3 };
      const functionParams = this.abiCoder.encode(
        ['address', 'uint8', 'bytes32'],
        [
          payload.walletAddress,
          kycLevelMap[payload.kycLevel],
          ethers.keccak256(ethers.toUtf8Bytes(payload.documentHash))
        ]
      );

      // Kernel request structure for KYC verification (kernel 337)
      const kernelRequestData = {
        senderAddress: payload.walletAddress,
        kernelPayload: {
          '337': {
            functionParams
          }
        }
      };

      // Execute KRNL kernels
      const krnlPayload = await provider.executeKernels(
        KRNL_CONFIG.entryId,
        KRNL_CONFIG.accessToken,
        kernelRequestData,
        functionParams
      );

      // Decode the response
      const decodedData = this.abiCoder.decode(
        ['address', 'bool', 'uint256'],
        krnlPayload.kernel_responses
      );

      return {
        success: true,
        mode: 'real',
        auth: krnlPayload.auth,
        kernelResponses: krnlPayload.kernel_responses,
        kernelParams: krnlPayload.kernel_params,
        timestamp: Date.now(),
        decodedData: {
          verifiedAddress: decodedData[0],
          isKYCVerified: decodedData[1],
          verificationTimestamp: decodedData[2]
        }
      };
    } catch (error) {
      console.error('[KRNL] KYC verification failed:', error);
      return {
        success: false,
        mode: 'real',
        auth: '',
        kernelResponses: '',
        kernelParams: {},
        timestamp: Date.now(),
        error: (error as Error).message
      };
    }
  }

  /**
   * Execute cross-chain property data sync
   */
  async executeCrossChainSync(
    sourceChainId: number,
    targetChainId: number,
    propertyTokenAddress: string,
    ownerAddress: string
  ): Promise<KRNLExecutionResult> {
    const status = this.getStatus();
    
    if (!status.isReady) {
      console.warn('[KRNL] Running in mock mode:', status.message);
      return this.mockCrossChainSync(sourceChainId, targetChainId, propertyTokenAddress);
    }

    try {
      console.log(`[KRNL] Executing cross-chain sync: ${sourceChainId} -> ${targetChainId}`);
      
      const provider = this.getProvider();
      
      // Encode cross-chain parameters
      const functionParams = this.abiCoder.encode(
        ['uint256', 'uint256', 'address'],
        [sourceChainId, targetChainId, propertyTokenAddress]
      );

      // Kernel request structure for cross-chain (kernel 7702)
      const kernelRequestData = {
        senderAddress: ownerAddress,
        kernelPayload: {
          '7702': {
            functionParams
          }
        }
      };

      // Execute KRNL kernels
      const krnlPayload = await provider.executeKernels(
        KRNL_CONFIG.entryId,
        KRNL_CONFIG.accessToken,
        kernelRequestData,
        functionParams
      );

      return {
        success: true,
        mode: 'real',
        auth: krnlPayload.auth,
        kernelResponses: krnlPayload.kernel_responses,
        kernelParams: krnlPayload.kernel_params,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('[KRNL] Cross-chain sync failed:', error);
      return {
        success: false,
        mode: 'real',
        auth: '',
        kernelResponses: '',
        kernelParams: {},
        timestamp: Date.now(),
        error: (error as Error).message
      };
    }
  }

  // Mock implementations for development without real KRNL credentials

  private mockPropertyVerification(payload: PropertyVerificationPayload): KRNLExecutionResult {
    const mockAuth = '0x' + 'a'.repeat(64);
    const mockResponse = this.abiCoder.encode(
      ['address', 'bool', 'uint256', 'bytes32'],
      [
        payload.ownerAddress,
        true,
        BigInt(Date.now()),
        ethers.keccak256(ethers.toUtf8Bytes(payload.propertyId))
      ]
    );

    return {
      success: true,
      mode: 'mock',
      auth: mockAuth,
      kernelResponses: mockResponse,
      kernelParams: {
        '1529': {
          functionParams: this.abiCoder.encode(['uint256', 'uint256'], [0, 1])
        }
      },
      timestamp: Date.now(),
      decodedData: {
        propertyTokenAddress: payload.ownerAddress,
        isVerified: true,
        verificationTimestamp: Date.now(),
        attestationHash: ethers.keccak256(ethers.toUtf8Bytes(payload.propertyId))
      }
    };
  }

  private mockKYCVerification(payload: KYCVerificationPayload): KRNLExecutionResult {
    const mockAuth = '0x' + 'b'.repeat(64);
    const mockResponse = this.abiCoder.encode(
      ['address', 'bool', 'uint256'],
      [payload.walletAddress, true, BigInt(Date.now())]
    );

    return {
      success: true,
      mode: 'mock',
      auth: mockAuth,
      kernelResponses: mockResponse,
      kernelParams: {
        '337': {
          functionParams: this.abiCoder.encode(['uint256', 'uint256'], [0, 1])
        }
      },
      timestamp: Date.now(),
      decodedData: {
        verifiedAddress: payload.walletAddress,
        isKYCVerified: true,
        verificationTimestamp: Date.now()
      }
    };
  }

  private mockCrossChainSync(
    sourceChainId: number,
    targetChainId: number,
    propertyTokenAddress: string
  ): KRNLExecutionResult {
    const mockAuth = '0x' + 'c'.repeat(64);
    const mockResponse = this.abiCoder.encode(
      ['uint256', 'uint256', 'address', 'bool'],
      [sourceChainId, targetChainId, propertyTokenAddress, true]
    );

    return {
      success: true,
      mode: 'mock',
      auth: mockAuth,
      kernelResponses: mockResponse,
      kernelParams: {
        '7702': {
          functionParams: this.abiCoder.encode(['uint256', 'uint256'], [0, 1])
        }
      },
      timestamp: Date.now()
    };
  }

  /**
   * Test KRNL connection with real credentials
   */
  async testConnection(): Promise<{
    success: boolean;
    mode: 'real' | 'mock';
    message: string;
    latency?: number;
  }> {
    const status = this.getStatus();
    
    if (!status.isReady) {
      return {
        success: false,
        mode: 'mock',
        message: status.message
      };
    }

    const startTime = Date.now();
    
    try {
      const provider = this.getProvider();
      
      // Simple test - try to get the current block number
      const blockNumber = await provider.getBlockNumber();
      const latency = Date.now() - startTime;

      return {
        success: true,
        mode: 'real',
        message: `Connected to KRNL RPC. Current block: ${blockNumber}`,
        latency
      };
    } catch (error) {
      return {
        success: false,
        mode: 'real',
        message: `Connection failed: ${(error as Error).message}`
      };
    }
  }
}

// Export singleton instance
export const realKRNLService = new RealKRNLService();

// Export class for testing
export { RealKRNLService };

// Export types
export type { KRNLStatus, KRNLExecutionResult, PropertyVerificationPayload, KYCVerificationPayload };

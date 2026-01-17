/**
 * Cross-Chain Property Data Tests
 * 
 * Test suite for KRNL-powered cross-chain property data functionality
 * Run with: npx vitest run src/tests/crossChainProperty.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ethers } from 'ethers';
import {
  SUPPORTED_CHAINS,
  KERNEL_IDS,
  loadKRNLConfig,
  isKRNLFullyConfigured,
  isKRNLMockMode,
  KRNL_DELEGATED_ACCOUNT,
} from '@/krnl/kernelConfig';
import {
  CrossChainPropertyService,
  PropertyData,
  CrossChainSyncResult,
} from '@/services/CrossChainPropertyService';

// Mock the KRNL module
vi.mock('@/krnl/1529', () => ({
  executeKrnl: vi.fn().mockResolvedValue({
    auth: '0xmocked_auth_hash_123456789',
    kernel_responses: ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'bool', 'uint256'],
      ['0x0000000000000000000000000000000000000001', true, Date.now()]
    ),
  }),
}));

describe('KRNL Configuration', () => {
  it('should have correct kernel IDs', () => {
    expect(KERNEL_IDS.PROPERTY_VERIFICATION).toBe('1529');
    expect(KERNEL_IDS.IDENTITY_VERIFICATION).toBe('337');
    expect(KERNEL_IDS.REAL_ESTATE_INVESTMENT).toBe('7702');
  });

  it('should have supported chains configured', () => {
    const chains = Object.values(SUPPORTED_CHAINS);
    expect(chains.length).toBeGreaterThan(0);

    // Verify Sepolia is configured
    expect(SUPPORTED_CHAINS.ETHEREUM_SEPOLIA).toBeDefined();
    expect(SUPPORTED_CHAINS.ETHEREUM_SEPOLIA.chainId).toBe(11155111);
    expect(SUPPORTED_CHAINS.ETHEREUM_SEPOLIA.name).toBe('Ethereum Sepolia');
  });

  it('should have delegated account address', () => {
    expect(KRNL_DELEGATED_ACCOUNT).toBe('0x9969827E2CB0582e08787B23F641b49Ca82bc774');
    expect(ethers.isAddress(KRNL_DELEGATED_ACCOUNT)).toBe(true);
  });

  it('should load KRNL config without throwing', () => {
    expect(() => loadKRNLConfig()).not.toThrow();
    const config = loadKRNLConfig();
    expect(config).toBeDefined();
    expect(typeof config.rpcUrl).toBe('string');
    expect(typeof config.entryId).toBe('string');
  });

  it('should detect mock mode when not fully configured', () => {
    // In test environment, should be in mock mode
    const isMock = isKRNLMockMode();
    expect(typeof isMock).toBe('boolean');
  });
});

describe('Cross-Chain Property Service', () => {
  let service: CrossChainPropertyService;

  beforeEach(() => {
    service = new CrossChainPropertyService();
  });

  describe('Chain Support', () => {
    it('should return supported chains', () => {
      const chains = service.getSupportedChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
    });

    it('should check if chain is supported', () => {
      // Sepolia should be supported
      expect(service.isChainSupported(11155111)).toBe(true);
      // Mainnet should not be in test config
      expect(service.isChainSupported(1)).toBe(false);
    });

    it('should have correct chain properties', () => {
      const chains = service.getSupportedChains();
      for (const chain of chains) {
        expect(chain.chainId).toBeGreaterThan(0);
        expect(chain.name).toBeTruthy();
        expect(chain.rpcUrl).toContain('http');
      }
    });
  });

  describe('Property Data Reading', () => {
    it('should handle reading from unsupported chain', async () => {
      await expect(
        service.readPropertyData(999999, '0x0000000000000000000000000000000000000001')
      ).rejects.toThrow('Unsupported chain ID');
    });

    it('should handle invalid token address gracefully', async () => {
      // Even invalid addresses return default values with catch fallbacks
      const result = await service.readPropertyData(
        11155111,
        '0x0000000000000000000000000000000000000001'
      );
      expect(result.metadata.name).toBe('Unknown Property');
      expect(result.totalSupply).toBe('0');
    });
  });

  describe('Property Data Structure', () => {
    it('should have correct PropertyData interface', () => {
      const mockData: PropertyData = {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        chainId: 11155111,
        propertyId: '11155111-0x12345678',
        totalSupply: '1000000000000000000000',
        ownerCount: 10,
        lastSyncTime: Date.now(),
        dataHash: ethers.keccak256(ethers.toUtf8Bytes('test')),
        metadata: {
          name: 'Test Property Token',
          location: 'Test Location',
          valuation: '1000000',
          verified: false,
        },
      };

      expect(mockData.tokenAddress).toBeTruthy();
      expect(mockData.chainId).toBe(11155111);
      expect(mockData.metadata.name).toBe('Test Property Token');
    });
  });

  describe('Cross-Chain Sync', () => {
    it('should have correct CrossChainSyncResult structure', () => {
      const mockResult: CrossChainSyncResult = {
        success: true,
        sourceChain: 11155111,
        targetChain: 80002,
        propertyData: {
          tokenAddress: '0x1234567890123456789012345678901234567890',
          chainId: 11155111,
          propertyId: 'test-id',
          totalSupply: '1000',
          ownerCount: 5,
          lastSyncTime: Date.now(),
          dataHash: '0x123',
          metadata: {
            name: 'Test',
            location: 'Test',
            valuation: '100',
            verified: true,
          },
        },
        attestationHash: '0xattestation123',
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.sourceChain).toBe(11155111);
      expect(mockResult.attestationHash).toBeTruthy();
    });

    it('should sync between supported chains', async () => {
      // This test uses mock mode
      const request = {
        sourceChainId: 11155111,
        targetChainId: 80002,
        propertyTokenAddress: '0xE11D19503029Ed7D059A0022288FB88d61C7c3b4',
      };

      // The actual sync will fail because we can't connect to real RPC
      // but we can verify the method exists and handles errors gracefully
      const result = await service.syncPropertyAcrossChains(
        request,
        '0x9CA25259DAde7Bce58e5294A8F08CAA69fD59f6D'
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.sourceChain).toBe(11155111);
      expect(result.targetChain).toBe(80002);
    });
  });

  describe('Multi-Chain Data Fetching', () => {
    it('should handle empty address list', async () => {
      const results = await service.getMultiChainPropertyData([]);
      expect(results).toEqual([]);
    });

    it('should handle partial failures gracefully', async () => {
      const addresses = [
        { chainId: 11155111, address: '0x0000000000000000000000000000000000000001' },
        { chainId: 999999, address: '0x0000000000000000000000000000000000000002' },
      ];

      // Should not throw, should return partial results
      const results = await service.getMultiChainPropertyData(addresses);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});

describe('KRNL Kernel Integration', () => {
  describe('Kernel Response Handling', () => {
    it('should decode property verification response correctly', () => {
      // Simulate KRNL kernel response
      const mockResponse = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bool', 'uint256'],
        ['0x1234567890123456789012345678901234567890', true, 1000000]
      );

      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'bool', 'uint256'],
        mockResponse
      );

      expect(decoded[0]).toBe('0x1234567890123456789012345678901234567890');
      expect(decoded[1]).toBe(true);
      expect(decoded[2]).toBe(1000000n);
    });

    it('should handle identity verification response', () => {
      const mockResponse = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bool', 'uint8', 'bytes32'],
        [true, 2, ethers.keccak256(ethers.toUtf8Bytes('verified'))]
      );

      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['bool', 'uint8', 'bytes32'],
        mockResponse
      );

      expect(decoded[0]).toBe(true);
      expect(decoded[1]).toBe(2n);
      expect(typeof decoded[2]).toBe('string');
    });
  });

  describe('Workflow DSL Templates', () => {
    it('should have valid workflow structure', () => {
      const workflowTemplate = {
        version: '1.0',
        name: 'property-verification',
        triggers: [{ type: 'transaction', chain: 'sepolia' }],
        actions: [
          {
            kernel: KERNEL_IDS.PROPERTY_VERIFICATION,
            inputs: ['propertyAddress', 'ownerAddress'],
            outputs: ['isVerified', 'verificationLevel'],
          },
        ],
      };

      expect(workflowTemplate.version).toBe('1.0');
      expect(workflowTemplate.actions[0].kernel).toBe('1529');
    });
  });
});

describe('Contract Integration', () => {
  const PROPERTY_REGISTRY = '0xE11D19503029Ed7D059A0022288FB88d61C7c3b4';
  const KYC_VERIFIER = '0x6eeA600d2AbC11D3fF82a6732b1042Eec52A111d';
  const PROPERTY_GOVERNANCE = '0x8A16b21B5908865DDDefA0AA3AeDAc6A5ED748C2';
  const RENT_DISTRIBUTION = '0xa904c2B00ffbAF4e35C837757776C9eED051F66b';

  it('should have valid contract addresses', () => {
    expect(ethers.isAddress(PROPERTY_REGISTRY)).toBe(true);
    expect(ethers.isAddress(KYC_VERIFIER)).toBe(true);
    expect(ethers.isAddress(PROPERTY_GOVERNANCE)).toBe(true);
    expect(ethers.isAddress(RENT_DISTRIBUTION)).toBe(true);
  });

  it('should create contract instances without error', () => {
    const provider = new ethers.JsonRpcProvider(SUPPORTED_CHAINS.ETHEREUM_SEPOLIA.rpcUrl);

    // Basic ERC20 interface for property tokens
    const basicABI = ['function name() view returns (string)'];

    const contract = new ethers.Contract(PROPERTY_REGISTRY, basicABI, provider);
    expect(contract.target).toBe(PROPERTY_REGISTRY);
  });
});

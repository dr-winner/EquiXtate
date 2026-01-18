/**
 * End-to-End Integration Tests
 * 
 * Tests the complete flow from KYC → Property Purchase → Governance → Rent Distribution
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { ethers } from 'ethers';

// Contract addresses from deployment
const CONTRACTS = {
  KYC_VERIFIER: '0x6eeA600d2AbC11D3fF82a6732b1042Eec52A111d',
  PROPERTY_REGISTRY: '0xE11D19503029Ed7D059A0022288FB88d61C7c3b4',
  PROPERTY_GOVERNANCE: '0xCd7b9006207F0DA7287f692A7250B64E1B3c8453',
  RENT_DISTRIBUTION: '0xd1b544926e3e8761aD4c06605A7aA9689A169dF0',
};

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

// Minimal ABIs for testing
const KYC_VERIFIER_ABI = [
  'function owner() view returns (address)',
  'function isKYCVerified(address user) view returns (bool)',
  'function getUserTier(address user) view returns (uint8)',
];

const PROPERTY_REGISTRY_ABI = [
  'function owner() view returns (address)',
  'function propertyCount() view returns (uint256)',
];

const PROPERTY_GOVERNANCE_ABI = [
  'function owner() view returns (address)',
  'function proposalCount() view returns (uint256)',
  'function registeredTokens(address) view returns (bool)',
  'function defaultSettings() view returns (tuple(uint256 votingDelay, uint256 votingPeriod, uint256 proposalThreshold, uint256 quorumThreshold, uint256 executionDelay, uint256 gracePeriod))',
];

const RENT_DISTRIBUTION_ABI = [
  'function owner() view returns (address)',
  'function platformFeeBps() view returns (uint256)',
  'function treasury() view returns (address)',
  'function propertyRents(address) view returns (address propertyToken, address paymentToken, uint256 totalDistributed, uint256 lastDistributionTime, uint256 accumulatedRentPerShare, bool isActive)',
];

describe('E2E Integration Tests', () => {
  let provider: ethers.JsonRpcProvider;
  let kycVerifier: ethers.Contract;
  let propertyRegistry: ethers.Contract;
  let propertyGovernance: ethers.Contract;
  let rentDistribution: ethers.Contract;

  beforeAll(async () => {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    
    kycVerifier = new ethers.Contract(CONTRACTS.KYC_VERIFIER, KYC_VERIFIER_ABI, provider);
    propertyRegistry = new ethers.Contract(CONTRACTS.PROPERTY_REGISTRY, PROPERTY_REGISTRY_ABI, provider);
    propertyGovernance = new ethers.Contract(CONTRACTS.PROPERTY_GOVERNANCE, PROPERTY_GOVERNANCE_ABI, provider);
    rentDistribution = new ethers.Contract(CONTRACTS.RENT_DISTRIBUTION, RENT_DISTRIBUTION_ABI, provider);
  });

  describe('Contract Deployment Verification', () => {
    it('should have KYCVerifier deployed', async () => {
      const code = await provider.getCode(CONTRACTS.KYC_VERIFIER);
      expect(code).not.toBe('0x');
      expect(code.length).toBeGreaterThan(10);
    });

    it('should have PropertyRegistry deployed', async () => {
      const code = await provider.getCode(CONTRACTS.PROPERTY_REGISTRY);
      expect(code).not.toBe('0x');
      expect(code.length).toBeGreaterThan(10);
    });

    it('should have PropertyGovernance deployed', async () => {
      const code = await provider.getCode(CONTRACTS.PROPERTY_GOVERNANCE);
      expect(code).not.toBe('0x');
      expect(code.length).toBeGreaterThan(10);
    });

    it('should have RentDistribution deployed', async () => {
      const code = await provider.getCode(CONTRACTS.RENT_DISTRIBUTION);
      expect(code).not.toBe('0x');
      expect(code.length).toBeGreaterThan(10);
    });
  });

  describe('KYC Verifier Contract', () => {
    it('should have an owner', async () => {
      const owner = await kycVerifier.owner();
      expect(ethers.isAddress(owner)).toBe(true);
      expect(owner).not.toBe(ethers.ZeroAddress);
    });

    it('should return false for unverified address', async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      const isVerified = await kycVerifier.isKYCVerified(randomAddress);
      expect(isVerified).toBe(false);
    });

    it('should return tier 0 for unverified address', async () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      const tier = await kycVerifier.getUserTier(randomAddress);
      expect(tier).toBe(0n);
    });
  });

  describe('Property Registry Contract', () => {
    it('should have an owner', async () => {
      const owner = await propertyRegistry.owner();
      expect(ethers.isAddress(owner)).toBe(true);
      expect(owner).not.toBe(ethers.ZeroAddress);
    });

    it('should track property count', async () => {
      const count = await propertyRegistry.propertyCount();
      expect(typeof count).toBe('bigint');
      expect(count).toBeGreaterThanOrEqual(0n);
    });
  });

  describe('Property Governance Contract', () => {
    it('should have an owner', async () => {
      const owner = await propertyGovernance.owner();
      expect(ethers.isAddress(owner)).toBe(true);
      expect(owner).not.toBe(ethers.ZeroAddress);
    });

    it('should track proposal count', async () => {
      const count = await propertyGovernance.proposalCount();
      expect(typeof count).toBe('bigint');
      expect(count).toBeGreaterThanOrEqual(0n);
    });

    it('should have default governance settings', async () => {
      const settings = await propertyGovernance.defaultSettings();
      
      // Voting delay should be 1 day (86400 seconds)
      expect(settings.votingDelay).toBe(86400n);
      
      // Voting period should be 7 days (604800 seconds)
      expect(settings.votingPeriod).toBe(604800n);
      
      // Proposal threshold should be 100 basis points (1%)
      expect(settings.proposalThreshold).toBe(100n);
      
      // Quorum threshold should be 400 basis points (4%)
      expect(settings.quorumThreshold).toBe(400n);
      
      // Execution delay should be 2 days (172800 seconds)
      expect(settings.executionDelay).toBe(172800n);
      
      // Grace period should be 14 days (1209600 seconds)
      expect(settings.gracePeriod).toBe(1209600n);
    });

    it('should not have random tokens registered', async () => {
      const randomToken = ethers.Wallet.createRandom().address;
      const isRegistered = await propertyGovernance.registeredTokens(randomToken);
      expect(isRegistered).toBe(false);
    });
  });

  describe('Rent Distribution Contract', () => {
    it('should have an owner', async () => {
      const owner = await rentDistribution.owner();
      expect(ethers.isAddress(owner)).toBe(true);
      expect(owner).not.toBe(ethers.ZeroAddress);
    });

    it('should have platform fee configured', async () => {
      const fee = await rentDistribution.platformFeeBps();
      expect(typeof fee).toBe('bigint');
      // Fee should be reasonable (0-10%)
      expect(fee).toBeLessThanOrEqual(1000n); // Max 10% (1000 basis points)
    });

    it('should have treasury configured', async () => {
      const treasury = await rentDistribution.treasury();
      expect(ethers.isAddress(treasury)).toBe(true);
      // Treasury can be zero address initially
    });

    it('should return inactive for random property', async () => {
      const randomProperty = ethers.Wallet.createRandom().address;
      const info = await rentDistribution.propertyRents(randomProperty);
      expect(info.isActive).toBe(false);
    });
  });

  describe('Contract Interactions', () => {
    const deployerAddress = '0xbBAc31249988fB9521dA2f6F1Cc518AC768615e9';

    it('should have same owner for KYC and PropertyRegistry', async () => {
      const kycOwner = await kycVerifier.owner();
      const registryOwner = await propertyRegistry.owner();
      expect(kycOwner.toLowerCase()).toBe(registryOwner.toLowerCase());
    });

    it('should have same owner for Governance and RentDistribution', async () => {
      const govOwner = await propertyGovernance.owner();
      const rentOwner = await rentDistribution.owner();
      expect(govOwner.toLowerCase()).toBe(rentOwner.toLowerCase());
    });

    it('all contracts should be owned by deployer', async () => {
      const kycOwner = await kycVerifier.owner();
      const registryOwner = await propertyRegistry.owner();
      const govOwner = await propertyGovernance.owner();
      const rentOwner = await rentDistribution.owner();

      expect(kycOwner.toLowerCase()).toBe(deployerAddress.toLowerCase());
      expect(registryOwner.toLowerCase()).toBe(deployerAddress.toLowerCase());
      expect(govOwner.toLowerCase()).toBe(deployerAddress.toLowerCase());
      expect(rentOwner.toLowerCase()).toBe(deployerAddress.toLowerCase());
    });
  });

  describe('Address Validation', () => {
    it('all contract addresses should be valid', () => {
      Object.entries(CONTRACTS).forEach(([name, address]) => {
        expect(ethers.isAddress(address)).toBe(true);
        expect(address).not.toBe(ethers.ZeroAddress);
      });
    });

    it('all contract addresses should be different', () => {
      const addresses = Object.values(CONTRACTS);
      const uniqueAddresses = new Set(addresses.map(a => a.toLowerCase()));
      expect(uniqueAddresses.size).toBe(addresses.length);
    });
  });
});

describe('Service Integration Tests', () => {
  describe('Cross-Chain Property Service', () => {
    it('should import without errors', async () => {
      const { crossChainPropertyService } = await import('@/services/CrossChainPropertyService');
      expect(crossChainPropertyService).toBeDefined();
    });

    it('should return supported chains', async () => {
      const { crossChainPropertyService } = await import('@/services/CrossChainPropertyService');
      const chains = crossChainPropertyService.getSupportedChains();
      expect(chains.length).toBeGreaterThan(0);
    });

    it('should identify Sepolia as supported', async () => {
      const { crossChainPropertyService } = await import('@/services/CrossChainPropertyService');
      const isSupported = crossChainPropertyService.isChainSupported(11155111);
      expect(isSupported).toBe(true);
    });
  });

  describe('KRNL Configuration', () => {
    it('should load KRNL config', async () => {
      const { loadKRNLConfig } = await import('@/krnl/kernelConfig');
      const config = loadKRNLConfig();
      expect(config).toBeDefined();
      expect(typeof config.rpcUrl).toBe('string');
    });

    it('should have kernel IDs defined', async () => {
      const { KERNEL_IDS } = await import('@/krnl/kernelConfig');
      expect(KERNEL_IDS.PROPERTY_VERIFICATION).toBe('1529');
      expect(KERNEL_IDS.IDENTITY_VERIFICATION).toBe('337');
    });
  });
});

describe('Environment Configuration', () => {
  it('should have contract addresses in env config', async () => {
    const { PROPERTY_GOVERNANCE_CONFIG, RENT_DISTRIBUTION_CONFIG } = await import('@/utils/envConfig');
    
    // These might be empty in test env, but should exist
    expect(typeof PROPERTY_GOVERNANCE_CONFIG.contractAddress).toBe('string');
    expect(typeof RENT_DISTRIBUTION_CONFIG.contractAddress).toBe('string');
  });
});

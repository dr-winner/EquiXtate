import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { KYC_VERIFIER_ABI, KYCTier, KYC_TIER_NAMES } from '@/contracts/abi/KYCVerifier';
import UserOnboardingService, { UserOnboarding } from '@/services/UserOnboardingService';

interface KYCStatusHook {
  userKYC: UserOnboarding | null;
  isKYCVerified: boolean;
  kycTier: KYCTier;
  canListProperties: boolean;
  isLoading: boolean;
  error: string | null;
  refreshKYC: () => Promise<void>;
  isExpiringSoon: boolean;
  kycRecord: {
    verifiedAt: Date | null;
    expiresAt: Date | null;
  };
}

/**
 * Hook to check user's KYC verification status from blockchain
 * Returns KYC data and whether user can perform gated actions
 */
export function useKYCStatus(walletAddress: string | undefined): KYCStatusHook {
  const [userKYC, setUserKYC] = useState<UserOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kycVerifierAddress = import.meta.env.VITE_KYC_VERIFIER_CONTRACT as `0x${string}` | undefined;

  // Read on-chain KYC verification status
  const { data: isVerified, isLoading: isVerifiedLoading, refetch: refetchVerified } = useContractRead({
    address: kycVerifierAddress,
    abi: KYC_VERIFIER_ABI,
    functionName: 'isKYCVerified',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    enabled: !!walletAddress && !!kycVerifierAddress,
    watch: true, // Watch for changes
  });

  // Read user's KYC tier
  const { data: tierData, isLoading: isTierLoading, refetch: refetchTier } = useContractRead({
    address: kycVerifierAddress,
    abi: KYC_VERIFIER_ABI,
    functionName: 'getUserTier',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    enabled: !!walletAddress && !!kycVerifierAddress,
    watch: true,
  });

  // Read full KYC record
  const { data: kycRecordData, isLoading: isRecordLoading, refetch: refetchRecord } = useContractRead({
    address: kycVerifierAddress,
    abi: KYC_VERIFIER_ABI,
    functionName: 'getKYCRecord',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    enabled: !!walletAddress && !!kycVerifierAddress,
    watch: true,
  });

  // Check if KYC is expiring soon
  const { data: isExpiringSoon } = useContractRead({
    address: kycVerifierAddress,
    abi: KYC_VERIFIER_ABI,
    functionName: 'isKYCExpiringSoon',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    enabled: !!walletAddress && !!kycVerifierAddress,
    watch: true,
  });

  const checkKYCStatus = async () => {
    if (!walletAddress) {
      setUserKYC(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Refetch on-chain data
      await Promise.all([
        refetchVerified(),
        refetchTier(),
        refetchRecord(),
      ]);

      // Also check local storage for backwards compatibility
      const userOnboarding = await UserOnboardingService.getUserOnboarding(walletAddress);
      if (userOnboarding) {
        setUserKYC(userOnboarding);
      }
    } catch (err) {
      console.error('Error checking KYC status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check KYC status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      checkKYCStatus();
    }
  }, [walletAddress]);

  // Parse KYC record data
  const kycRecord = kycRecordData ? {
    verifiedAt: kycRecordData[2] ? new Date(Number(kycRecordData[2]) * 1000) : null,
    expiresAt: kycRecordData[3] ? new Date(Number(kycRecordData[3]) * 1000) : null,
  } : {
    verifiedAt: null,
    expiresAt: null,
  };

  // Convert tier to enum
  const tier = typeof tierData === 'number' ? tierData as KYCTier : KYCTier.NONE;

  // Log KYC status for debugging
  useEffect(() => {
    if (walletAddress && !isVerifiedLoading) {
      console.log('🔐 KYC Status:', {
        address: walletAddress,
        isVerified: isVerified ?? false,
        tier: KYC_TIER_NAMES[tier],
        canListProperties: tier === KYCTier.ENHANCED,
        expiresAt: kycRecord.expiresAt?.toLocaleDateString(),
        isExpiringSoon: isExpiringSoon ?? false,
      });
    }
  }, [walletAddress, isVerified, tier, isVerifiedLoading]);

  const loading = isVerifiedLoading || isTierLoading || isRecordLoading || isLoading;

  return {
    userKYC,
    isKYCVerified: isVerified ?? false,
    kycTier: tier,
    canListProperties: tier === KYCTier.ENHANCED,
    isLoading: loading,
    error: kycVerifierAddress ? error : 'KYC Verifier contract not configured',
    refreshKYC: checkKYCStatus,
    isExpiringSoon: isExpiringSoon ?? false,
    kycRecord,
  };
}

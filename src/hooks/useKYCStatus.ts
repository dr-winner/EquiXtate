import { useState, useEffect } from 'react';
import UserOnboardingService, { KYCTier, UserOnboarding } from '@/services/UserOnboardingService';

interface KYCStatusHook {
  userKYC: UserOnboarding | null;
  isKYCVerified: boolean;
  kycTier: KYCTier;
  canListProperties: boolean;
  isLoading: boolean;
  error: string | null;
  refreshKYC: () => Promise<void>;
}

/**
 * Hook to check user's KYC verification status
 * Returns KYC data and whether user can perform gated actions
 */
export function useKYCStatus(walletAddress: string | undefined): KYCStatusHook {
  const [userKYC, setUserKYC] = useState<UserOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkKYCStatus = async () => {
    if (!walletAddress) {
      setUserKYC(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user's onboarding/KYC status
      const userOnboarding = await UserOnboardingService.getUserOnboarding(walletAddress);
      
      if (userOnboarding) {
        setUserKYC(userOnboarding);
      } else {
        // User doesn't have KYC record yet
        setUserKYC(null);
      }
    } catch (err) {
      console.error('Error checking KYC status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check KYC status');
      setUserKYC(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      checkKYCStatus();
    }
  }, [walletAddress]);

  return {
    userKYC,
    isKYCVerified: userKYC !== null && userKYC.tier !== KYCTier.NONE,
    kycTier: userKYC?.tier || KYCTier.NONE,
    canListProperties: userKYC?.investmentLimits.canListProperties || false,
    isLoading,
    error,
    refreshKYC: checkKYCStatus,
  };
}

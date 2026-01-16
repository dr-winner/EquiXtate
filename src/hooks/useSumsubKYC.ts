import { useState, useCallback } from 'react';
import SumsubService from '@/services/SumsubService';

interface UseSumsubKYCOptions {
  userId: string;
  email: string;
  phone?: string;
  levelName?: string;
  onSuccess?: (result: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
}

interface UseSumsubKYCReturn {
  isOpen: boolean;
  openKYC: () => void;
  closeKYC: () => void;
  isLoading: boolean;
  error: Error | null;
  accessToken: string | null;
  verificationStatus: string | null;
  refreshVerificationStatus: () => Promise<void>;
}

/**
 * Hook for managing Sumsub KYC verification flow
 */
export function useSumsubKYC(options: UseSumsubKYCOptions): UseSumsubKYCReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const openKYC = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate userId before making request
      if (!options.userId) {
        throw new Error('Wallet address required for KYC verification. Please connect your wallet first.');
      }

      // Generate access token
      const tokenData = await SumsubService.generateAccessToken({
        userId: options.userId,
        email: options.email || `${options.userId}@equixtate.app`,
        phone: options.phone,
        levelName: options.levelName || 'id-and-liveness',
      });

      setAccessToken(tokenData.token);
      setIsOpen(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to open KYC');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const closeKYC = useCallback(() => {
    setIsOpen(false);
  }, []);

  const refreshVerificationStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await SumsubService.getApplicantData(options.userId);
      setVerificationStatus(result.status);

      if (result.status === 'success' && result.reviewResult?.reviewStatus === 'APPROVED') {
        options.onSuccess?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch status');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isOpen,
    openKYC,
    closeKYC,
    isLoading,
    error,
    accessToken,
    verificationStatus,
    refreshVerificationStatus,
  };
}

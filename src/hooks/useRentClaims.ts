import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  RentDistributionABI, 
  RENT_DISTRIBUTION_ADDRESS,
  Distribution,
  UserRentInfo,
  PropertyRentInfo
} from '@/contracts/abi/RentDistribution';

const CONTRACT_ADDRESS = RENT_DISTRIBUTION_ADDRESS;

interface UseRentClaimsReturn {
  // User data
  totalPendingRent: bigint | undefined;
  userInfo: UserRentInfo | undefined;
  
  // Property data
  registeredProperties: string[] | undefined;
  propertyInfo: PropertyRentInfo | undefined;
  estimatedAPY: bigint | undefined;
  distributionHistory: Distribution[] | undefined;
  
  // Actions
  claimRent: (propertyToken: string) => Promise<void>;
  claimAllRent: (propertyTokens: string[]) => Promise<void>;
  
  // Status
  isLoading: boolean;
  isClaiming: boolean;
  error: Error | null;
  txHash: string | undefined;
  
  // Utilities
  getPendingRent: (propertyToken: string, user: string) => Promise<bigint>;
  refresh: () => void;
}

/**
 * Hook for interacting with RentDistribution contract
 */
export function useRentClaims(
  walletAddress: string | undefined,
  propertyToken?: string
): UseRentClaimsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();
  
  // State for contract data
  const [totalPendingRent, setTotalPendingRent] = useState<bigint | undefined>();
  const [userInfo, setUserInfo] = useState<UserRentInfo | undefined>();
  const [registeredProperties, setRegisteredProperties] = useState<string[] | undefined>();
  const [propertyInfo, setPropertyInfo] = useState<PropertyRentInfo | undefined>();
  const [estimatedAPY, setEstimatedAPY] = useState<bigint | undefined>();
  const [distributionHistory, setDistributionHistory] = useState<Distribution[] | undefined>();

  // Get provider for read operations
  const getProvider = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to public RPC
    return new ethers.JsonRpcProvider('https://rpc.sepolia.org');
  }, []);

  // Get signer for write operations
  const getSigner = useCallback(async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider.getSigner();
    }
    throw new Error('No wallet provider available');
  }, []);

  // Fetch all rent data
  const fetchData = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    
    try {
      setIsLoading(true);
      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, RentDistributionABI, provider);
      
      // Fetch registered properties
      const properties = await contract.getRegisteredProperties().catch(() => []);
      setRegisteredProperties(properties);
      
      // Fetch user-specific data
      if (walletAddress) {
        const totalPending = await contract.totalPendingRent(walletAddress).catch(() => 0n);
        setTotalPendingRent(totalPending);
        
        // Fetch property-specific user info
        if (propertyToken) {
          try {
            const info = await contract.getUserInfo(propertyToken, walletAddress);
            setUserInfo({
              pending: info[0],
              totalClaimed: info[1],
              lastClaimTime: info[2],
              tokenBalance: info[3],
              sharePercentage: info[4],
            });
          } catch (err) {
            console.error('Failed to fetch user info:', err);
          }
        }
      }
      
      // Fetch property-specific data
      if (propertyToken) {
        try {
          const propInfo = await contract.getPropertyInfo(propertyToken);
          setPropertyInfo({
            paymentToken: propInfo[0],
            totalDistributed: propInfo[1],
            lastDistributionTime: propInfo[2],
            distributionCount: propInfo[3],
            isActive: propInfo[4],
          });
        } catch (err) {
          console.error('Failed to fetch property info:', err);
        }
        
        try {
          const apy = await contract.estimateAPY(propertyToken);
          setEstimatedAPY(apy);
        } catch (err) {
          console.error('Failed to fetch APY:', err);
        }
        
        // Fetch distribution history
        try {
          const history = await contract.getDistributionHistory(propertyToken, 0, 50);
          setDistributionHistory(history.map((d: any) => ({
            amount: d.amount,
            timestamp: d.timestamp,
            totalShares: d.totalShares,
            description: d.description,
          })));
        } catch (err) {
          console.error('Failed to fetch distribution history:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch rent data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getProvider, walletAddress, propertyToken]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Claim rent from single property
  const claimRent = useCallback(async (propertyTokenAddr: string) => {
    setIsClaiming(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, RentDistributionABI, signer);
      
      const tx = await contract.claimRent(propertyTokenAddr);
      setTxHash(tx.hash);
      await tx.wait();
      
      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to claim rent'));
      throw err;
    } finally {
      setIsClaiming(false);
    }
  }, [getSigner, fetchData]);

  // Claim rent from multiple properties
  const claimAllRent = useCallback(async (propertyTokens: string[]) => {
    setIsClaiming(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, RentDistributionABI, signer);
      
      const tx = await contract.claimAllRent(propertyTokens);
      setTxHash(tx.hash);
      await tx.wait();
      
      // Refresh data
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to claim all rent'));
      throw err;
    } finally {
      setIsClaiming(false);
    }
  }, [getSigner, fetchData]);

  // Get pending rent for specific property/user
  const getPendingRent = useCallback(async (
    propertyTokenAddr: string, 
    user: string
  ): Promise<bigint> => {
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, RentDistributionABI, provider);
      
      return await contract.pendingRent(propertyTokenAddr, user);
    } catch (err) {
      console.error('Failed to get pending rent:', err);
      return 0n;
    }
  }, [getProvider]);

  // Refresh all data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    totalPendingRent,
    userInfo,
    registeredProperties,
    propertyInfo,
    estimatedAPY,
    distributionHistory,
    claimRent,
    claimAllRent,
    isLoading,
    isClaiming,
    error,
    txHash,
    getPendingRent,
    refresh,
  };
}

/**
 * Utility function to format rent amounts
 */
export function formatRentAmount(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  
  if (fraction === 0n) {
    return whole.toString();
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fractionStr}`;
}

/**
 * Utility function to format APY
 */
export function formatAPY(apyBps: bigint): string {
  // APY is in basis points (100 = 1%)
  const percentage = Number(apyBps) / 100;
  return `${percentage.toFixed(2)}%`;
}

/**
 * Utility function to format share percentage
 */
export function formatSharePercentage(shareBps: bigint): string {
  // Share is in basis points (100 = 1%)
  const percentage = Number(shareBps) / 100;
  return `${percentage.toFixed(2)}%`;
}

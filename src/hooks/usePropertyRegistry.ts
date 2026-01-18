import { useState, useEffect, useCallback } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { PropertyRegistryABI, PROPERTY_REGISTRY_ADDRESS } from '@/contracts/abi/PropertyRegistry';
import { PROPERTY_REGISTRY_CONFIG } from '@/utils/envConfig';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = (PROPERTY_REGISTRY_CONFIG.contractAddress || PROPERTY_REGISTRY_ADDRESS) as `0x${string}`;

interface PropertyOnChain {
  id: bigint;
  owner: string;
  name: string;
  location: string;
  value: bigint;
  tokenAddress: string;
  isActive: boolean;
  listedAt: bigint;
  documentHash: string;
  locationHash: string;
  verificationId: string;
}

interface UsePropertyRegistryReturn {
  // Read functions
  propertyCount: bigint | undefined;
  canUserListProperties: boolean;
  isLoadingCanList: boolean;
  
  // Write functions
  submitProperty: (params: {
    name: string;
    location: string;
    value: bigint;
    documentHash: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  submitError: Error | null;
  submitTxHash: string | undefined;
  
  // Utility functions
  checkDuplicateDocument: (documentHash: string) => Promise<boolean>;
  checkDuplicateLocation: (location: string) => Promise<boolean>;
  getProperty: (propertyId: number) => Promise<PropertyOnChain | null>;
  
  // Refresh
  refresh: () => void;
}

/**
 * Hook for interacting with PropertyRegistry smart contract
 */
export function usePropertyRegistry(walletAddress: string | undefined): UsePropertyRegistryReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  // Read property count
  const { data: propertyCount, refetch: refetchCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: PropertyRegistryABI,
    functionName: 'propertyCount',
    enabled: !!CONTRACT_ADDRESS,
  });

  // Check if user can list properties (has ENHANCED KYC)
  const { data: canList, isLoading: isLoadingCanList, refetch: refetchCanList } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: PropertyRegistryABI,
    functionName: 'canUserListProperties',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    enabled: !!walletAddress && !!CONTRACT_ADDRESS,
  });

  // Prepare submit transaction
  const [submitParams, setSubmitParams] = useState<{
    name: string;
    location: string;
    value: bigint;
    documentHash: string;
  } | null>(null);

  const { config: submitConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: PropertyRegistryABI,
    functionName: 'submitProperty',
    args: submitParams ? [
      submitParams.name,
      submitParams.location,
      submitParams.value,
      submitParams.documentHash as `0x${string}`
    ] : undefined,
    enabled: !!submitParams,
  });

  const { write: writeSubmit, data: submitData, error: writeError } = useContractWrite(submitConfig);

  const { isLoading: isWaitingForTx } = useWaitForTransaction({
    hash: submitData?.hash,
    onSuccess: () => {
      setIsSubmitting(false);
      setSubmitParams(null);
      refetchCount();
    },
    onError: (error) => {
      setIsSubmitting(false);
      setSubmitError(error);
    }
  });

  // Update error state
  useEffect(() => {
    if (writeError) {
      setSubmitError(writeError);
      setIsSubmitting(false);
    }
  }, [writeError]);

  // Submit property function
  const submitProperty = useCallback(async (params: {
    name: string;
    location: string;
    value: bigint;
    documentHash: string;
  }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitParams(params);
    
    // Wait a tick for config to prepare
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (writeSubmit) {
      writeSubmit();
    } else {
      setSubmitError(new Error('Transaction not ready. Please try again.'));
      setIsSubmitting(false);
    }
  }, [writeSubmit]);

  // Check if document already exists
  const checkDuplicateDocument = useCallback(async (documentHash: string): Promise<boolean> => {
    if (!CONTRACT_ADDRESS) return false;
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyRegistryABI, provider);
      return await contract.propertyExistsByDocument(documentHash);
    } catch (error) {
      console.error('Error checking duplicate document:', error);
      return false;
    }
  }, []);

  // Check if location already exists
  const checkDuplicateLocation = useCallback(async (location: string): Promise<boolean> => {
    if (!CONTRACT_ADDRESS) return false;
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyRegistryABI, provider);
      return await contract.propertyExistsByLocation(location);
    } catch (error) {
      console.error('Error checking duplicate location:', error);
      return false;
    }
  }, []);

  // Get property by ID
  const getProperty = useCallback(async (propertyId: number): Promise<PropertyOnChain | null> => {
    if (!CONTRACT_ADDRESS) return null;
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyRegistryABI, provider);
      const property = await contract.properties(propertyId);
      return {
        id: property.id,
        owner: property.owner,
        name: property.name,
        location: property.location,
        value: property.value,
        tokenAddress: property.tokenAddress,
        isActive: property.isActive,
        listedAt: property.listedAt,
        documentHash: property.documentHash,
        locationHash: property.locationHash,
        verificationId: property.verificationId
      };
    } catch (error) {
      console.error('Error getting property:', error);
      return null;
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(() => {
    refetchCount();
    refetchCanList();
  }, [refetchCount, refetchCanList]);

  return {
    propertyCount: propertyCount as bigint | undefined,
    canUserListProperties: !!canList,
    isLoadingCanList,
    submitProperty,
    isSubmitting: isSubmitting || isWaitingForTx,
    submitError,
    submitTxHash: submitData?.hash,
    checkDuplicateDocument,
    checkDuplicateLocation,
    getProperty,
    refresh,
  };
}

export default usePropertyRegistry;

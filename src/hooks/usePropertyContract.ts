
import { useState, useEffect } from 'react';
import Web3Service from '@/services/Web3Service';
import { toast } from '@/components/ui/use-toast';
import { PropertyDetails } from '@/services/web3/types';
import { EQUIX_TOKEN_CONSTANTS } from '@/services/web3/constants';

export interface UsePropertyContractResult {
  isLoading: boolean;
  property: PropertyDetails | null;
  userBalance: number;
  buyTokens: (amount: number) => Promise<boolean>;
  createAuction: (startingPrice: number, durationDays: number) => Promise<boolean>;
  placeBid: (bidAmount: number) => Promise<boolean>;
  claimRentalIncome: () => Promise<boolean>;
}

export function usePropertyContract(propertyId: number): UsePropertyContractResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Load property data
  useEffect(() => {
    const loadPropertyData = async () => {
      setIsLoading(true);
      try {
        const isConnected = await Web3Service.isWalletConnected();
        if (!isConnected) {
          return;
        }

        const propertyDetails = await Web3Service.getPropertyDetails(propertyId);
        if (propertyDetails) {
          setProperty(propertyDetails);
          
          // Get user token balance
          const balance = await Web3Service.getUserTokenBalance(propertyId);
          setUserBalance(balance);
        }
      } catch (error) {
        console.error("Error loading property data:", error);
        toast({
          variant: "destructive",
          title: "Data Loading Error",
          description: "Failed to load property data from blockchain",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId]);

  // Function to buy tokens
  const buyTokens = async (amount: number): Promise<boolean> => {
    try {
      const isConnected = await Web3Service.isWalletConnected();
      if (!isConnected) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet to buy tokens",
        });
        return false;
      }
      
      setIsLoading(true);
      const result = await Web3Service.buyPropertyTokens(propertyId, amount);
      
      if (result) {
        // Refresh data
        const propertyDetails = await Web3Service.getPropertyDetails(propertyId);
        const balance = await Web3Service.getUserTokenBalance(propertyId);
        
        setProperty(propertyDetails);
        setUserBalance(balance);
      }
      
      return result;
    } catch (error) {
      console.error("Error buying tokens:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to create auction
  const createAuction = async (startingPrice: number, durationDays: number): Promise<boolean> => {
    try {
      const isConnected = await Web3Service.isWalletConnected();
      if (!isConnected) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet to create an auction",
        });
        return false;
      }
      
      setIsLoading(true);
      const result = await Web3Service.createAuction(propertyId, startingPrice, durationDays);
      
      if (result) {
        // Refresh data
        const propertyDetails = await Web3Service.getPropertyDetails(propertyId);
        setProperty(propertyDetails);
      }
      
      return result;
    } catch (error) {
      console.error("Error creating auction:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to place bid
  const placeBid = async (bidAmount: number): Promise<boolean> => {
    try {
      const isConnected = await Web3Service.isWalletConnected();
      if (!isConnected) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet to place a bid",
        });
        return false;
      }
      
      setIsLoading(true);
      const result = await Web3Service.placeBid(propertyId, bidAmount);
      
      if (result) {
        // Refresh data
        const propertyDetails = await Web3Service.getPropertyDetails(propertyId);
        setProperty(propertyDetails);
      }
      
      return result;
    } catch (error) {
      console.error("Error placing bid:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to claim rental income
  const claimRentalIncome = async (): Promise<boolean> => {
    try {
      const isConnected = await Web3Service.isWalletConnected();
      if (!isConnected) {
        toast({
          variant: "destructive",
          title: "Wallet Not Connected",
          description: "Please connect your wallet to claim rental income",
        });
        return false;
      }
      
      setIsLoading(true);
      const result = await Web3Service.claimRentalIncome(propertyId);
      
      return result;
    } catch (error) {
      console.error("Error claiming rental income:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    property,
    userBalance,
    buyTokens,
    createAuction,
    placeBid,
    claimRentalIncome
  };
}

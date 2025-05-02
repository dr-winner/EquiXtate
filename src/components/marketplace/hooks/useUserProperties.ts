
import { useState, useEffect } from 'react';
import { PropertyCardProps } from '@/components/PropertyCard';
import { PropertyType } from '@/types/property';
import { properties } from '@/data/propertyData';
import Web3Service from '@/services/Web3Service';

export const useUserProperties = (walletConnected: boolean) => {
  const [userProperties, setUserProperties] = useState<PropertyCardProps[]>([]);
  
  useEffect(() => {
    const fetchUserProperties = async () => {
      if (walletConnected) {
        // In a real app, fetch the user's owned properties from blockchain
        const userWalletAddress = Web3Service.getWalletAddress();
        if (userWalletAddress) {
          // Here we're simulating fetching owned properties
          // In a real application, this would query blockchain data
          const userOwnedProperties = properties
            .filter(p => Math.random() > 0.7) // Just for simulation
            .map(p => ({
              ...p,
              userTokenBalance: Math.floor(Math.random() * 50) + 1,
              type: p.type as PropertyType // Cast the type to ensure compatibility
            }));
          
          setUserProperties(userOwnedProperties as PropertyCardProps[]);
        }
      } else {
        setUserProperties([]);
      }
    };
    
    fetchUserProperties();
  }, [walletConnected]);
  
  return userProperties;
};

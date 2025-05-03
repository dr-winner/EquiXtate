
import { useState, useEffect } from 'react';
import { PropertyCardProps } from '@/components/PropertyCard';
import { PropertyType } from '@/types/property';
import { properties } from '@/data/propertyData';
import Web3Service from '@/services/Web3Service';

// Reliable Unsplash images as fallbacks
const reliableImageSources = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa',  // Modern apartment
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',  // Luxury home
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be',  // Apartment building
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716',  // Modern house
  'https://images.unsplash.com/photo-1494526585095-c41746248156',  // Beach house
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'   // Single-family home
];

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
            .map((p, index) => ({
              ...p,
              // Use reliable image sources instead of potentially broken links
              image: reliableImageSources[index % reliableImageSources.length],
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

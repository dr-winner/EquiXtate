
import { useWalletState } from './hooks/useWalletState';
import { usePropertyFilters } from './hooks/usePropertyFilters';
import { useUserProperties } from './hooks/useUserProperties';
import { usePropertyData } from './hooks/usePropertyData';

export const useMarketplaceState = () => {
  // Load property data
  const { propertyListing, formatPrice } = usePropertyData();
  
  // Handle wallet connection
  const { walletConnected, connectWallet } = useWalletState();
  
  // Handle property filtering and search
  const { 
    activeFilter, 
    searchTerm, 
    filteredProperties,
    handleFilterChange, 
    setSearchTerm 
  } = usePropertyFilters(propertyListing);
  
  // Get user properties based on wallet connection
  const userProperties = useUserProperties(walletConnected);

  return {
    activeFilter,
    searchTerm,
    walletConnected,
    filteredProperties,
    userProperties,
    connectWallet,
    handleFilterChange,
    setSearchTerm,
    formatPrice
  };
};

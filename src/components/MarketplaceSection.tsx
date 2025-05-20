
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PropertyFilters from './marketplace/PropertyFilters';
import PropertyList from './marketplace/PropertyList';
import ConnectWalletPrompt from './marketplace/ConnectWalletPrompt';
import { useMarketplaceState } from './marketplace/useMarketplaceState';

const MarketplaceSection: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeFilter,
    searchTerm,
    walletConnected,
    filteredProperties,
    userProperties,
    connectWallet,
    handleFilterChange,
    setSearchTerm
  } = useMarketplaceState();

  return (
    <section className="pt-12 pb-24">
      <div className="container mx-auto px-4">
        <PropertyFilters
          activeFilter={activeFilter}
          searchTerm={searchTerm}
          handleFilterChange={handleFilterChange}
          setSearchTerm={setSearchTerm}
        />
        
        <PropertyList properties={filteredProperties} />
        
        {/* My Properties Section */}
        {walletConnected && userProperties.length > 0 && (
          <PropertyList 
            properties={userProperties} 
            title="My Properties"
            showClearFiltersButton={true}
            onClearFilters={() => {
              handleFilterChange('all');
              setSearchTerm('');
            }}
          />
        )}
        
        {/* Connect Wallet Button */}
        {!walletConnected && (
          <ConnectWalletPrompt onConnect={connectWallet} />
        )}
      </div>
    </section>
  );
};

export default MarketplaceSection;

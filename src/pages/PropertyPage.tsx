import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Web3Service from '@/services/Web3Service';
import { formatPrice, stringToPropertyType } from '@/utils/propertyUtils';
import { handleShare } from '@/utils/buttonUtils';

// Import refactored components
import PropertyHeader from '@/components/property-page/PropertyHeader';
import PropertyImageGallery from '@/components/property-page/PropertyImageGallery';
import PropertyDetailsList from '@/components/property-page/PropertyDetailsList';
import PropertyPriceInfo from '@/components/property-details/PropertyPriceInfo';
import PropertyTokenDistribution from '@/components/property-page/PropertyTokenDistribution';
import PropertyTokenPurchase from '@/components/property-page/PropertyTokenPurchase';
import PropertyInvestmentMetrics from '@/components/property-page/PropertyInvestmentMetrics';
import PropertyDescription from '@/components/property-page/PropertyDescription';

// Mock properties data - in a real application, this would be fetched from blockchain
import { properties } from '@/data/propertyData';

const PropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  useEffect(() => {
    // In a real app, this would fetch property data from the blockchain
    const foundProperty = properties.find(p => p.id === id);
    if (foundProperty) {
      setProperty({
        ...foundProperty,
        type: stringToPropertyType(foundProperty.type)
      });
    } else {
      toast({
        title: "Property Not Found",
        description: "The requested property could not be found",
        variant: "destructive"
      });
      navigate('/');
    }
    
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      try {
        setWalletStatus('connecting');
        const connected = await Web3Service.isWalletConnected();
        setWalletConnected(connected);
        setWalletStatus(connected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        setWalletStatus('disconnected');
      }
    };
    
    checkWalletConnection();
    
    // Listen for wallet events
    const handleWalletDisconnect = () => {
      setWalletConnected(false);
      setWalletStatus('disconnected');
    };
    
    const handleWalletConnect = () => {
      setWalletConnected(true);
      setWalletStatus('connected');
    };
    
    window.addEventListener('walletDisconnected', handleWalletDisconnect);
    window.addEventListener('walletConnected', handleWalletConnect);
    
    return () => {
      window.removeEventListener('walletDisconnected', handleWalletDisconnect);
      window.removeEventListener('walletConnected', handleWalletConnect);
    };
  }, [id, navigate]);
  
  const handleConnectWallet = async () => {
    try {
      setWalletStatus('connecting');
      const connected = await Web3Service.connectWallet();
      if (connected) {
        setWalletConnected(true);
        setWalletStatus('connected');
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected"
        });
      } else {
        setWalletStatus('disconnected');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletStatus('disconnected');
    }
  };
  
  const handlePurchaseComplete = (tokenAmount: number) => {
    // Update property data to reflect token purchase
    if (property.tokensAvailable) {
      setProperty({
        ...property,
        tokensAvailable: property.tokensAvailable - tokenAmount,
        ownerCount: property.ownerCount + (property.ownerCount === 0 ? 1 : 0)
      });
    }
  };
  
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-black">
        <div className="text-space-neon-blue text-xl">Loading property data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white pt-20 pb-20">
      <div className="container mx-auto px-4">
        <PropertyHeader title={property.name} />
        
        {/* Wallet Status Indicator */}
        {walletStatus === 'connecting' && (
          <div className="mb-4 py-2 px-4 bg-yellow-600/30 text-yellow-400 rounded-md text-sm flex items-center justify-center">
            <div className="animate-pulse mr-2 h-2 w-2 bg-yellow-400 rounded-full"></div>
            Connecting to wallet...
          </div>
        )}
        {walletStatus === 'disconnected' && (
          <div className="mb-4 py-2 px-4 bg-red-600/20 text-red-400 rounded-md text-sm flex items-center justify-center">
            <div className="mr-2 h-2 w-2 bg-red-500 rounded-full"></div>
            Wallet disconnected. Connect your wallet to invest.
          </div>
        )}
        {walletStatus === 'connected' && (
          <div className="mb-4 py-2 px-4 bg-green-600/20 text-green-400 rounded-md text-sm flex items-center justify-center">
            <div className="mr-2 h-2 w-2 bg-green-500 rounded-full"></div>
            Wallet connected. You can now invest in this property.
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Images and property details */}
          <div>
            <PropertyImageGallery 
              images={property.images || [property.image]}
              name={property.name}
              type={property.type}
            />
            
            <PropertyDetailsList 
              location={property.location}
              squareFeet={property.squareFeet}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              yearBuilt={property.yearBuilt}
              ownerCount={property.ownerCount}
            />
          </div>
          
          {/* Right column - Property info and purchase */}
          <div>
            <h1 className="text-3xl font-orbitron font-bold mb-2">{property.name}</h1>
            
            <div className="flex items-center mb-6">
              <span className="text-gray-300">{property.location}</span>
            </div>
            
            <PropertyPriceInfo 
              price={property.price} 
              tokenPrice={property.tokenPrice} 
              formatPrice={formatPrice}
            />
            
            <PropertyTokenDistribution 
              tokensAvailable={property.tokensAvailable}
              totalTokenSupply={property.totalTokenSupply}
            />
            
            <PropertyInvestmentMetrics 
              roi={property.roi}
              rentalYield={property.rentalYield}
              rentalIncome={property.rentalIncome}
            />
            
            <PropertyTokenPurchase 
              id={property.id}
              name={property.name}
              tokenPrice={property.tokenPrice}
              tokensAvailable={property.tokensAvailable}
              totalTokenSupply={property.totalTokenSupply}
              walletConnected={walletConnected}
              handleConnectWallet={handleConnectWallet}
              formatPrice={formatPrice}
              onPurchaseComplete={handlePurchaseComplete}
              minTokenPurchase={property.minTokenPurchase}
              propertyPrice={property.price}
            />
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="text-space-neon-blue border-space-neon-blue mr-2" 
                onClick={() => handleShare(property.name, window.location.href)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
        
        <PropertyDescription 
          description={property.description}
          features={property.features}
          id={property.id}
        />
      </div>
    </div>
  );
};

export default PropertyPage;

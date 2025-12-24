
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatPrice, stringToPropertyType } from '@/utils/propertyUtils';
import { handleShare } from '@/utils/buttonUtils';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import StickyAside from '@/components/layout/StickyAside';

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
  const { isConnected } = useAccount();
  const [property, setProperty] = useState<any>(null);
  
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
  }, [id, navigate]);
  
  const handleConnectWallet = async () => {
    toast({
      title: "Connect Wallet",
      description: "Please use the Connect button in the navigation bar"
    });
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
      <Section spacing="normal">
        <PageContainer>
          <PropertyHeader title={property.name} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left content */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
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

              <PropertyDescription 
                description={property.description}
                features={property.features}
                id={property.id}
              />
            </div>

            {/* Right sticky aside */}
            <div className="lg:col-span-5 xl:col-span-4">
              <StickyAside>
                <div className="space-y-6">
                  <div className="glassmorphism p-5">
                    <h1 className="text-2xl font-semibold mb-1">{property.name}</h1>
                    <p className="ds-body-sm text-muted-foreground">{property.location}</p>
                  </div>

                  <div className="glassmorphism p-5">
                    <PropertyPriceInfo 
                      price={property.price} 
                      tokenPrice={property.tokenPrice} 
                      formatPrice={formatPrice}
                    />
                  </div>

                  <div className="glassmorphism p-5">
                    <PropertyTokenDistribution 
                      tokensAvailable={property.tokensAvailable}
                      totalTokenSupply={property.totalTokenSupply}
                    />
                  </div>

                  <div className="glassmorphism p-5">
                    <PropertyInvestmentMetrics 
                      roi={property.roi}
                      rentalYield={property.rentalYield}
                      rentalIncome={property.rentalIncome}
                    />
                  </div>

                  <div className="glassmorphism p-5">
                    <PropertyTokenPurchase 
                      id={property.id}
                      name={property.name}
                      tokenPrice={property.tokenPrice}
                      tokensAvailable={property.tokensAvailable}
                      walletConnected={isConnected}
                      handleConnectWallet={handleConnectWallet}
                      formatPrice={formatPrice}
                      onPurchaseComplete={handlePurchaseComplete}
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleShare(property.name, window.location.href)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </StickyAside>
            </div>
          </div>
        </PageContainer>
      </Section>
    </div>
  );
};

export default PropertyPage;

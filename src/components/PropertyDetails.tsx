
import React from 'react';
import { MapPin } from 'lucide-react';
import PropertyImagesGallery from './property-details/PropertyImagesGallery';
import PropertyPriceInfo from './property-details/PropertyPriceInfo';
import TokenAvailability from './property-details/TokenAvailability';
import TokenPurchaseControls from './property-details/TokenPurchaseControls';
import InvestmentMetrics from './property-details/InvestmentMetrics';
import PropertyDescription from './property-details/PropertyDescription';
import PropertyStats from './property-details/PropertyStats';
import { formatPrice } from '@/utils/propertyUtils';
import { PropertyType } from '@/types/property';

interface PropertyDetailsProps {
  id: string;
  name: string;
  location: string;
  images: string[];
  price: number;
  tokenPrice: number;
  ownerCount: number;
  type: PropertyType;
  roi?: number;
  tokensAvailable: number;
  totalTokenSupply: number;
  description: string;
  features: string[];
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lastRenovated?: number;
  rentalIncome?: number;
  rentalYield?: number;
  propertyManager?: string;
  minTokenPurchase?: number;  // Added minimum token purchase property
  onClose: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  id,
  name,
  location,
  images,
  price,
  tokenPrice,
  ownerCount,
  type,
  roi,
  tokensAvailable,
  totalTokenSupply,
  description,
  features,
  squareFeet,
  bedrooms,
  bathrooms,
  yearBuilt,
  lastRenovated,
  rentalIncome,
  rentalYield,
  propertyManager,
  minTokenPurchase = 1,
  onClose
}) => {
  // Token distribution percentage
  const tokensSoldPercentage = ((totalTokenSupply - tokensAvailable) / totalTokenSupply) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl glassmorphism relative animate-fade-in">
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Images */}
              <div>
                <PropertyImagesGallery 
                  images={images}
                  name={name}
                  type={type}
                />
              </div>
              
              {/* Right side - Details */}
              <div>
                <h2 className="text-3xl font-orbitron font-bold text-white mb-2">{name}</h2>
                
                <div className="flex items-center mb-4 text-gray-300">
                  <MapPin className="w-4 h-4 mr-1 text-space-neon-blue" />
                  <span className="font-inter">{location}</span>
                </div>
                
                <PropertyPriceInfo 
                  price={price}
                  tokenPrice={tokenPrice}
                  formatPrice={formatPrice}
                />
                
                <TokenAvailability 
                  tokensAvailable={tokensAvailable}
                  totalTokenSupply={totalTokenSupply}
                  tokensSoldPercentage={tokensSoldPercentage}
                />
                
                <TokenPurchaseControls 
                  id={id}
                  tokenPrice={tokenPrice}
                  tokensAvailable={tokensAvailable}
                  totalTokenSupply={totalTokenSupply}
                  minTokenPurchase={minTokenPurchase}
                  formatPrice={formatPrice}
                  propertyPrice={price} /* Add the missing propertyPrice prop */
                />
                
                <InvestmentMetrics 
                  roi={roi}
                  rentalYield={rentalYield}
                  rentalIncome={rentalIncome}
                />
              </div>
            </div>
            
            {/* Property details section */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Description */}
              <PropertyDescription 
                description={description}
                features={features}
                id={id}
              />
              
              {/* Right column - Property stats */}
              <PropertyStats 
                squareFeet={squareFeet}
                bedrooms={bedrooms}
                bathrooms={bathrooms}
                yearBuilt={yearBuilt}
                lastRenovated={lastRenovated}
                ownerCount={ownerCount}
                propertyManager={propertyManager}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

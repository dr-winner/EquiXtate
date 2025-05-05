
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropertyImage from './property-card/PropertyImage';
import PropertyTitle from './property-card/PropertyTitle';
import PropertyPriceInfo from './property-card/PropertyPriceInfo';
import TokenAvailability from './property-card/TokenAvailability';
import PropertyActions from './property-card/PropertyActions';
import { PropertyType, EQUIX_TOKEN_SYMBOL, EQUIX_TOKEN_VALUE } from '@/types/property';
import { formatPrice } from '@/utils/propertyUtils';

export interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  price: number;
  tokenPrice: number;
  ownerCount: number;
  type: PropertyType;
  roi?: number;
  tokensAvailable?: number;
  totalTokenSupply?: number;
  userTokenBalance?: number;
  minInvestment?: number;  // Minimum investment in EquiX tokens
  ownershipPercentage?: number; // Ownership percentage for minimum investment
  rentalYield?: number; // Expected rental yield percentage
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  name,
  location,
  image,
  price,
  tokenPrice,
  ownerCount,
  type,
  roi,
  tokensAvailable = 500,
  totalTokenSupply = 1000,
  minInvestment = 10,
  ownershipPercentage,
  rentalYield
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate ownership percentage using the correct formula:
  // ownershipPercentage = (equixAmount * equixToUSD) / propertyValueUSD * 100
  const calculateOwnershipPercentage = (tokens: number): number => {
    const tokenValue = tokens * EQUIX_TOKEN_VALUE;
    return (tokenValue / price) * 100;
  };

  // Calculate the actual ownership percentage for minimum investment
  const actualOwnershipPercentage = ownershipPercentage ?? calculateOwnershipPercentage(minInvestment);
  
  // Calculate tokens required for 1% ownership
  const tokensForOnePercent = Math.ceil((price * 0.01) / EQUIX_TOKEN_VALUE);

  return (
    <motion.div
      className="space-card h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -5,
        transition: { duration: 0.3 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <PropertyImage 
        image={image}
        name={name}
        type={type}
        roi={roi}
        isHovered={isHovered}
      />
      
      <div className="p-4 sm:p-5 flex-grow flex flex-col">
        <PropertyTitle name={name} location={location} />
        
        <PropertyPriceInfo 
          price={price}
          tokenPrice={tokenPrice}
          formatPrice={formatPrice}
        />
        
        <TokenAvailability 
          tokensAvailable={tokensAvailable}
          totalTokenSupply={totalTokenSupply}
        />
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm flex-grow">
          <div className="bg-space-deep-purple/30 p-2 rounded-lg">
            <p className="text-gray-400 text-xs sm:text-sm">Min. Investment</p>
            <p className="font-medium text-white text-sm sm:text-base">
              {minInvestment} {EQUIX_TOKEN_SYMBOL}
            </p>
          </div>
          
          <div className="bg-space-deep-purple/30 p-2 rounded-lg">
            <p className="text-gray-400 text-xs sm:text-sm">Ownership</p>
            <p className="font-medium text-white text-sm sm:text-base">
              {actualOwnershipPercentage.toFixed(4)}%
            </p>
          </div>
          
          {/* New card showing tokens needed for 1% ownership */}
          <div className="col-span-2 bg-space-deep-purple/30 p-2 rounded-lg">
            <p className="text-gray-400 text-xs sm:text-sm">1% Ownership Requires</p>
            <p className="font-medium text-space-neon-blue text-sm sm:text-base">
              {tokensForOnePercent.toLocaleString()} {EQUIX_TOKEN_SYMBOL}
            </p>
          </div>
          
          {rentalYield && (
            <div className="col-span-2 bg-space-neon-green/10 p-2 rounded-lg">
              <p className="text-gray-400 text-xs sm:text-sm">Est. Rental Yield</p>
              <p className="font-medium text-space-neon-green text-sm sm:text-base">
                {rentalYield}% annually
              </p>
            </div>
          )}
        </div>
        
        <PropertyActions id={id} ownerCount={ownerCount} />
      </div>
    </motion.div>
  );
};

export default PropertyCard;

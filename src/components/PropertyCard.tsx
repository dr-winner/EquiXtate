
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropertyImage from './property-card/PropertyImage';
import PropertyTitle from './property-card/PropertyTitle';
import PropertyPriceInfo from './property-card/PropertyPriceInfo';
import TokenAvailability from './property-card/TokenAvailability';
import PropertyActions from './property-card/PropertyActions';
import { PropertyType } from '@/types/property';
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
  userTokenBalance?: number; // Added for user profile page
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
  totalTokenSupply = 1000
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="space-card h-full"
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
      
      <div className="p-5">
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
        
        <PropertyActions id={id} ownerCount={ownerCount} />
      </div>
    </motion.div>
  );
};

export default PropertyCard;

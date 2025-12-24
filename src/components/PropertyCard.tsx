
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeSlideUp, cardHover } from '@/styles/motion-presets';
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
      className="space-card h-full group"
      initial="hidden"
      animate="visible"
      variants={fadeSlideUp}
      whileHover={cardHover}
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
      
      <div className="p-5 flex flex-col gap-3">
        <PropertyTitle name={name} location={location} />
        
        <div className="flex items-start justify-between gap-4">
          <PropertyPriceInfo 
            price={price}
            tokenPrice={tokenPrice}
            formatPrice={formatPrice}
          />
          {roi !== undefined && (
            <div className="text-right">
              <span className="ds-label">ROI</span>
              <p className="text-sm font-medium text-space-neon-green">{roi.toFixed(1)}%</p>
            </div>
          )}
        </div>
        
        <TokenAvailability 
          tokensAvailable={tokensAvailable}
          totalTokenSupply={totalTokenSupply}
        />
        
        <div className="mt-2">
          <PropertyActions id={id} ownerCount={ownerCount} />
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PropertyType } from '@/types/property';
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertyImageProps {
  image: string;
  name: string;
  type: PropertyType;
  roi?: number;
  isHovered: boolean;
}

const PropertyImage: React.FC<PropertyImageProps> = ({ image, name, type, roi, isHovered }) => {
  const [imageError, setImageError] = useState(false);
  const isMobile = useIsMobile();
  
  // Updated fallback images to luxury estates and exclusive apartments
  const fallbackImages = {
    [PropertyType.FRACTIONAL]: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80',
    [PropertyType.BUY]: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80',
    [PropertyType.RENT]: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80',
    [PropertyType.AUCTION]: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80'
  };
  
  const getBadgeClass = () => {
    switch (type) {
      case PropertyType.FRACTIONAL:
        return 'bg-space-neon-purple text-white';
      case PropertyType.BUY:
        return 'bg-space-neon-green text-space-black';
      case PropertyType.RENT:
        return 'bg-space-neon-blue text-white';
      case PropertyType.AUCTION:
        return 'bg-amber-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Use fallback image if original fails or use the type-specific fallback
  const imageToDisplay = imageError 
    ? fallbackImages[type] || fallbackImages[PropertyType.FRACTIONAL]
    : image;

  return (
    <div className="relative overflow-hidden rounded-t-lg h-48 sm:h-56">
      <img 
        src={imageToDisplay} 
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
        style={{ transform: isHovered && !isMobile ? 'scale(1.05)' : 'scale(1)' }}
        onError={() => setImageError(true)}
      />
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
      
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
        <span className={`${getBadgeClass()} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-bold uppercase`}>
          {type}
        </span>
      </div>
      
      {roi && (
        <motion.div 
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-space-neon-green/80 text-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {roi}% ROI
        </motion.div>
      )}
    </div>
  );
};

export default PropertyImage;

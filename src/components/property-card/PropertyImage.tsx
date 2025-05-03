
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PropertyType } from '@/types/property';

interface PropertyImageProps {
  image: string;
  name: string;
  type: PropertyType;
  roi?: number;
  isHovered: boolean;
}

const PropertyImage: React.FC<PropertyImageProps> = ({ image, name, type, roi, isHovered }) => {
  const [imageError, setImageError] = useState(false);
  
  // Default fallback images from Unsplash that are known to work
  const fallbackImages = {
    [PropertyType.FRACTIONAL]: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
    [PropertyType.BUY]: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    [PropertyType.RENT]: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    [PropertyType.AUCTION]: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
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
    <div className="relative overflow-hidden rounded-t-lg h-56">
      <img 
        src={imageToDisplay} 
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        onError={() => setImageError(true)}
      />
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
      
      <div className="absolute top-4 right-4">
        <span className={`${getBadgeClass()} px-2 py-1 rounded-md text-xs font-bold uppercase`}>
          {type}
        </span>
      </div>
      
      {roi && (
        <motion.div 
          className="absolute bottom-4 left-4 bg-space-neon-green/80 text-black px-3 py-1 rounded-md text-sm font-bold"
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

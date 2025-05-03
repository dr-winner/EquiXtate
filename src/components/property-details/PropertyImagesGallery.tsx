
import React, { useState } from 'react';
import { PropertyType } from '@/types/property';
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertyImagesGalleryProps {
  images: string[];
  name: string;
  type: PropertyType;
}

const PropertyImagesGallery: React.FC<PropertyImagesGalleryProps> = ({
  images,
  name,
  type
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const isMobile = useIsMobile();
  
  // Fallback luxury real estate images if the provided ones fail
  const fallbackImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80',
  ];
  
  // Use provided images or fallbacks if array is empty
  const displayImages = images && images.length > 0 ? images : fallbackImages;

  // For mobile, limit the number of thumbnails shown
  const thumbnailsToShow = isMobile ? Math.min(3, displayImages.length) : displayImages.length;

  return (
    <>
      <div className="relative rounded-lg overflow-hidden aspect-[4/3] mb-2 md:mb-4 border border-space-neon-purple/30">
        <img 
          src={displayImages[selectedImage]} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, replace with a fallback
            const target = e.target as HTMLImageElement;
            if (!fallbackImages.includes(target.src)) {
              target.src = fallbackImages[0];
            }
          }}
        />
        <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-space-black/70 backdrop-blur-sm text-white px-2 md:px-3 py-1 rounded-full font-orbitron text-xs md:text-sm border border-space-neon-purple">
          {type}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-1 md:gap-2">
        {displayImages.slice(0, thumbnailsToShow).map((image, index) => (
          <div 
            key={index} 
            className={`rounded-md overflow-hidden cursor-pointer border-2 ${
              index === selectedImage 
                ? 'border-space-neon-blue' 
                : 'border-transparent'
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <img 
              src={image} 
              alt={`${name} ${index + 1}`} 
              className="w-full h-full object-cover aspect-[4/3]"
              onError={(e) => {
                // If image fails to load, replace with a fallback
                const target = e.target as HTMLImageElement;
                if (!fallbackImages.includes(target.src)) {
                  target.src = fallbackImages[index % fallbackImages.length];
                }
              }}
            />
          </div>
        ))}
        {isMobile && displayImages.length > thumbnailsToShow && (
          <div className="flex items-center justify-center border rounded-md bg-space-deep-purple/30">
            <span className="text-xs text-white">+{displayImages.length - thumbnailsToShow}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyImagesGallery;

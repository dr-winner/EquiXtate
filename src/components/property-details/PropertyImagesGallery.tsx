
import React, { useState } from 'react';
import { PropertyType } from '@/types/property';

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

  return (
    <>
      <div className="relative rounded-lg overflow-hidden aspect-[4/3] mb-4 border border-space-neon-purple/30">
        <img 
          src={images[selectedImage]} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-space-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full font-orbitron text-sm border border-space-neon-purple">
          {type}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
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
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default PropertyImagesGallery;

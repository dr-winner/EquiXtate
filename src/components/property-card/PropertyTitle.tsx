
import React from 'react';
import { MapPin } from 'lucide-react';

interface PropertyTitleProps {
  name: string;
  location: string;
}

const PropertyTitle: React.FC<PropertyTitleProps> = ({ name, location }) => {
  return (
    <>
      <h3 className="font-orbitron text-xl mb-2 text-white">{name}</h3>
      
      <div className="flex items-center mb-3 text-gray-300">
        <MapPin className="w-4 h-4 mr-1 text-space-neon-blue" />
        <span className="text-sm font-inter">{location}</span>
      </div>
    </>
  );
};

export default PropertyTitle;

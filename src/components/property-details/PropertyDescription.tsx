
import React from 'react';
import BlockchainDetails from './BlockchainDetails';

interface PropertyDescriptionProps {
  description: string;
  features: string[];
  id: string;
}

const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
  features,
  id
}) => {
  return (
    <div className="lg:col-span-2">
      <h3 className="font-orbitron text-xl mb-4 text-white">About this property</h3>
      <p className="text-gray-300 font-inter mb-6">{description}</p>
      
      <h3 className="font-orbitron text-xl mb-4 text-white">Features</h3>
      <ul className="grid grid-cols-2 gap-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300 font-inter">
            <span className="w-2 h-2 bg-space-neon-purple rounded-full mr-2"></span>
            {feature}
          </li>
        ))}
      </ul>
      
      <BlockchainDetails id={id} />
    </div>
  );
};

export default PropertyDescription;

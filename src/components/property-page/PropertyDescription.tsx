
import React from 'react';

interface PropertyDescriptionProps {
  description: string;
  features?: string[];
  id: string;
}

const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
  features,
  id
}) => {
  return (
    <div className="mt-12 glassmorphism p-6">
      <h2 className="text-2xl font-orbitron mb-4">About This Property</h2>
      <p className="text-gray-300 mb-6">
        {description || `
          This premium property offers an exceptional investment opportunity in one of the most
          sought-after locations. Fully tokenized on the blockchain, it provides fractional ownership
          with automated rental income distribution, transparent management, and governance rights
          proportional to token ownership.
        `}
      </p>
      
      {features && features.length > 0 && (
        <>
          <h3 className="font-orbitron text-xl mb-3">Features</h3>
          <ul className="grid grid-cols-2 gap-2 mb-6">
            {features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-space-neon-purple rounded-full mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
        </>
      )}
      
      {/* Blockchain details */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="font-orbitron text-xl mb-3">Blockchain Details</h3>
        <p className="text-gray-300 font-mono text-sm mb-2">Property Token Contract: {id}</p>
        <p className="text-gray-300 text-sm mb-2">Token Standard: ERC-1155</p>
        <p className="text-gray-300 text-sm mb-2">Blockchain: Ethereum</p>
        <p className="text-gray-300 text-sm">
          All property ownership is recorded on-chain with automatic rental distributions
          and governance rights assigned proportionally to token ownership.
        </p>
      </div>
    </div>
  );
};

export default PropertyDescription;


import React from 'react';

interface TokenAvailabilityProps {
  tokensAvailable: number;
  totalTokenSupply: number;
}

const TokenAvailability: React.FC<TokenAvailabilityProps> = ({
  tokensAvailable,
  totalTokenSupply
}) => {
  // Calculate percentage of tokens sold
  const tokensSoldPercentage = ((totalTokenSupply - tokensAvailable) / totalTokenSupply) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-gray-400 font-inter">Tokens Available</p>
        <p className="text-sm font-spacegrotesk text-space-neon-blue">
          {tokensAvailable} / {totalTokenSupply}
        </p>
      </div>
      <div className="w-full bg-space-deep-purple/50 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-space-neon-purple to-space-neon-blue h-full"
          style={{ width: `${tokensSoldPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TokenAvailability;

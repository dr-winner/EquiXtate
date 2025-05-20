
import React from 'react';
import { EQUIX_TOKEN_SYMBOL } from '@/types/property';

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
        <p className="text-sm text-gray-400 font-inter">{EQUIX_TOKEN_SYMBOL} Tokens Available</p>
        <p className="text-sm font-spacegrotesk text-space-neon-blue">
          {tokensAvailable.toLocaleString()} / {totalTokenSupply.toLocaleString()}
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

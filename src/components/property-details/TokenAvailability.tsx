
import React from 'react';
import { EQUIX_TOKEN_SYMBOL } from '@/types/property';

interface TokenAvailabilityProps {
  tokensAvailable: number;
  totalTokenSupply: number;
  tokensSoldPercentage: number;
}

const TokenAvailability: React.FC<TokenAvailabilityProps> = ({
  tokensAvailable,
  totalTokenSupply,
  tokensSoldPercentage
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <p className="text-gray-300 font-inter">{EQUIX_TOKEN_SYMBOL} Tokens Available</p>
        <p className="font-spacegrotesk text-space-neon-blue">
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

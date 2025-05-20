
import React from 'react';
import { EQUIX_TOKEN_SYMBOL } from '@/types/property';

interface PropertyTokenDistributionProps {
  tokensAvailable: number;
  totalTokenSupply: number;
}

const PropertyTokenDistribution: React.FC<PropertyTokenDistributionProps> = ({
  tokensAvailable,
  totalTokenSupply
}) => {
  // Calculate token distribution data
  const tokensSold = totalTokenSupply - tokensAvailable;
  const tokensSoldPercentage = (tokensSold / totalTokenSupply) * 100;
  
  return (
    <div className="glassmorphism p-4 mb-6">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-orbitron">{EQUIX_TOKEN_SYMBOL} Token Distribution</h3>
        <p className="text-sm font-spacegrotesk text-space-neon-blue">
          {tokensAvailable.toLocaleString()} / {totalTokenSupply.toLocaleString()} available
        </p>
      </div>
      
      <div className="w-full bg-space-deep-purple/50 rounded-full h-2.5 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-space-neon-purple to-space-neon-blue h-full"
          style={{ width: `${tokensSoldPercentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-gray-400">Tokens Sold</p>
          <p className="text-space-neon-purple">{tokensSold.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Tokens Available</p>
          <p className="text-space-neon-blue">{tokensAvailable.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Total Supply</p>
          <p className="text-white">{totalTokenSupply.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyTokenDistribution;

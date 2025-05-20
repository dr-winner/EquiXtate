
import React from 'react';

interface PropertyStatsProps {
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lastRenovated?: number;
  ownerCount: number;
  propertyManager?: string;
}

const PropertyStats: React.FC<PropertyStatsProps> = ({
  squareFeet,
  bedrooms,
  bathrooms,
  yearBuilt,
  lastRenovated,
  ownerCount,
  propertyManager
}) => {
  return (
    <div>
      <h3 className="font-orbitron text-xl mb-4 text-white">Property Details</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-300 font-inter">Area</span>
          <span className="text-white font-spacegrotesk">{squareFeet} sq ft</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-300 font-inter">Bedrooms</span>
          <span className="text-white font-spacegrotesk">{bedrooms}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-300 font-inter">Bathrooms</span>
          <span className="text-white font-spacegrotesk">{bathrooms}</span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-300 font-inter">Year Built</span>
          <span className="text-white font-spacegrotesk">{yearBuilt}</span>
        </div>
        
        {lastRenovated && (
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-300 font-inter">Last Renovated</span>
            <span className="text-white font-spacegrotesk">{lastRenovated}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
          <span className="text-gray-300 font-inter">Token Holders</span>
          <span className="text-white font-spacegrotesk">{ownerCount}</span>
        </div>
        
        {propertyManager && (
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <span className="text-gray-300 font-inter">Property Manager</span>
            <span className="text-white font-spacegrotesk">{propertyManager}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyStats;

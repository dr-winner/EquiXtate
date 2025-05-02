
import React from 'react';
import { getTokenPriceColorClass, getPriceTier } from '@/utils/propertyUtils';

interface PropertyPriceInfoProps {
  price: number;
  tokenPrice: number;
  formatPrice: (price: number) => string;
}

const PropertyPriceInfo: React.FC<PropertyPriceInfoProps> = ({
  price,
  tokenPrice,
  formatPrice
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="glassmorphism p-3">
        <p className="text-sm text-gray-400 font-inter">Property Value</p>
        <p className="text-xl font-spacegrotesk text-white">{formatPrice(price)}</p>
      </div>
      
      <div className="glassmorphism p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 font-inter">Token Price</p>
            <p className={`text-xl font-spacegrotesk ${getTokenPriceColorClass(tokenPrice)}`}>{formatPrice(tokenPrice)}</p>
          </div>
          
          <span className={`text-xs px-2 py-1 rounded ${getTokenPriceColorClass(tokenPrice)} bg-opacity-20`}>
            {getPriceTier(tokenPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyPriceInfo;


import React from 'react';
import { getTokenPriceColorClass } from '@/utils/propertyUtils';

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
    <div className="flex justify-between items-center mb-4">
      <div>
        <p className="text-sm text-gray-400 font-inter">Property Value</p>
        <p className="text-lg font-spacegrotesk text-white">{formatPrice(price)}</p>
      </div>
      
      <div className="text-right">
        <p className="text-sm text-gray-400 font-inter">Token Price</p>
        <p className={`text-lg font-spacegrotesk ${getTokenPriceColorClass(tokenPrice)}`}>{formatPrice(tokenPrice)}</p>
      </div>
    </div>
  );
};

export default PropertyPriceInfo;

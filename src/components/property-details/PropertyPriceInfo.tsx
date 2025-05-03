
import React from 'react';
import { getTokenPriceColorClass, getPriceTier } from '@/utils/propertyUtils';
import { calculateRequiredTokens, EQUIX_TOKEN_SYMBOL, STABLECOIN_SYMBOL } from '@/types/property';

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
  // Calculate minimum tokens required based on property price
  const minimumTokensRequired = calculateRequiredTokens(price);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="glassmorphism p-3">
        <p className="text-sm text-gray-400 font-inter">Property Value</p>
        <p className="text-xl font-spacegrotesk text-white">
          {formatPrice(price)} {STABLECOIN_SYMBOL}
        </p>
      </div>
      
      <div className="glassmorphism p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 font-inter">Minimum Tokens Required</p>
            <p className={`text-xl font-spacegrotesk ${getTokenPriceColorClass(tokenPrice)}`}>
              {minimumTokensRequired.toLocaleString()} {EQUIX_TOKEN_SYMBOL}
            </p>
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

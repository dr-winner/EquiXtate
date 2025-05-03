
import React from 'react';
import { getTokenPriceColorClass } from '@/utils/propertyUtils';
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
    <div className="flex justify-between items-center mb-4">
      <div>
        <p className="text-sm text-gray-400 font-inter">Property Value</p>
        <p className="text-lg font-spacegrotesk text-white">
          {formatPrice(price)} {STABLECOIN_SYMBOL}
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-sm text-gray-400 font-inter">Min. Tokens Required</p>
        <p className={`text-lg font-spacegrotesk ${getTokenPriceColorClass(tokenPrice)}`}>
          {minimumTokensRequired.toLocaleString()} {EQUIX_TOKEN_SYMBOL}
        </p>
      </div>
    </div>
  );
};

export default PropertyPriceInfo;

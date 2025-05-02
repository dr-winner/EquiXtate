
import React from 'react';
import { getTokenPriceColorClass } from '@/utils/propertyUtils';

interface TokenPurchaseDisplayProps {
  tokenAmount: number;
  tokenPrice: number;
  formatPrice: (price: number) => string;
}

const TokenPurchaseDisplay: React.FC<TokenPurchaseDisplayProps> = ({
  tokenAmount,
  tokenPrice,
  formatPrice
}) => {
  return (
    <div className="text-right">
      <p className="text-gray-300 font-inter">Total cost</p>
      <p className={`text-xl font-spacegrotesk ${getTokenPriceColorClass(tokenPrice)}`}>
        {formatPrice(tokenPrice * tokenAmount)}
      </p>
    </div>
  );
};

export default TokenPurchaseDisplay;

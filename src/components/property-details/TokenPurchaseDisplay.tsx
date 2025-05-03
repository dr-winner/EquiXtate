
import React from 'react';
import { getTokenPriceColorClass } from '@/utils/propertyUtils';
import { STABLECOIN_SYMBOL } from '@/types/property';

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
  // Calculate the total cost directly in USDC
  const totalCostInUSDC = tokenPrice * tokenAmount;

  return (
    <div className="text-right">
      <p className="text-gray-300 font-inter">Total cost</p>
      <p className={`text-xl font-spacegrotesk ${getTokenPriceColorClass(tokenPrice)}`}>
        {formatPrice(totalCostInUSDC)} {STABLECOIN_SYMBOL}
      </p>
    </div>
  );
};

export default TokenPurchaseDisplay;

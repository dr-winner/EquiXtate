
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Web3Service from '@/services/Web3Service';
import TokenAmountInput from './TokenAmountInput';
import TokenPurchaseDisplay from './TokenPurchaseDisplay';
import { getPriceTier, getTokenPriceColorClass } from '@/utils/propertyUtils';
import { EQUIX_TOKEN_SYMBOL, STABLECOIN_SYMBOL, calculateTokenValue } from '@/types/property';

interface TokenPurchaseControlsProps {
  id: string;
  tokenPrice: number;
  tokensAvailable: number;
  formatPrice: (price: number) => string;
}

const TokenPurchaseControls: React.FC<TokenPurchaseControlsProps> = ({
  id,
  tokenPrice,
  tokensAvailable,
  formatPrice
}) => {
  const [tokenAmount, setTokenAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      // Check if wallet is connected
      if (!Web3Service.isWeb3Available()) {
        toast({
          variant: "destructive",
          title: "Web3 Not Available",
          description: "Please install MetaMask or another Web3 wallet to purchase tokens.",
        });
        setIsLoading(false);
        return;
      }

      const walletConnected = await Web3Service.connectWallet();
      if (!walletConnected) {
        toast({
          title: "Connect Wallet Required",
          description: "Please connect your wallet to purchase property tokens",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      try {
        const result = await Web3Service.buyPropertyTokens(id, tokenAmount);
        if (result) {
          // Success toast
          toast({
            title: "Purchase Successful",
            description: `You've successfully purchased ${tokenAmount.toLocaleString()} ${EQUIX_TOKEN_SYMBOL} tokens for ${formatPrice(calculateTokenValue(tokenAmount))} ${STABLECOIN_SYMBOL}`,
          });
        }
      } catch (error) {
        console.error("Error buying tokens:", error);
        toast({
          title: "Purchase Failed",
          description: "There was an error processing your transaction. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glassmorphism p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-orbitron">Purchase {EQUIX_TOKEN_SYMBOL} Tokens</h3>
        <span className={`text-xs px-2 py-1 rounded ${getTokenPriceColorClass(tokenPrice)} bg-opacity-20 ${getTokenPriceColorClass(tokenPrice)}`}>
          {getPriceTier(tokenPrice)} Tier
        </span>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-300 font-inter">Amount to purchase</p>
          <TokenAmountInput 
            tokenAmount={tokenAmount} 
            setTokenAmount={setTokenAmount} 
            tokensAvailable={tokensAvailable} 
          />
        </div>
        
        <TokenPurchaseDisplay 
          tokenAmount={tokenAmount}
          tokenPrice={calculateTokenValue(1)} // Price per token in USDC
          formatPrice={formatPrice}
        />
      </div>
      
      <Button 
        className="cosmic-btn w-full py-3"
        onClick={handlePurchase}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : `Buy ${EQUIX_TOKEN_SYMBOL} Tokens Now`}
      </Button>
      
      <p className="text-xs text-gray-400 text-center mt-2">
        Payments processed in {STABLECOIN_SYMBOL} stablecoin
      </p>
    </div>
  );
};

export default TokenPurchaseControls;

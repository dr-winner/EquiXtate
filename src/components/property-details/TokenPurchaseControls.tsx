
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Web3Service from '@/services/Web3Service';
import TokenAmountInput from './TokenAmountInput';
import TokenPurchaseDisplay from './TokenPurchaseDisplay';
import { getPriceTier, getTokenPriceColorClass } from '@/utils/propertyUtils';
import { EQUIX_TOKEN_SYMBOL, STABLECOIN_SYMBOL, EQUIX_TOKEN_VALUE, calculateTokenValue } from '@/types/property';

interface TokenPurchaseControlsProps {
  id: string;
  tokenPrice: number;
  tokensAvailable: number;
  formatPrice: (price: number) => string;
  minTokenPurchase?: number;
  totalTokenSupply: number;
  propertyPrice: number; // Added propertyPrice for accurate ownership calculation
}

const TokenPurchaseControls: React.FC<TokenPurchaseControlsProps> = ({
  id,
  tokenPrice,
  tokensAvailable,
  formatPrice,
  minTokenPurchase = 1,
  totalTokenSupply = 1000,
  propertyPrice
}) => {
  const [tokenAmount, setTokenAmount] = useState(minTokenPurchase);
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  
  // Calculate ownership percentage using the correct formula:
  // ownershipPercentage = (equixAmount * equixToUSD) / propertyValueUSD * 100
  const calculateOwnershipPercentage = (amount: number): number => {
    const tokenValue = amount * EQUIX_TOKEN_VALUE;
    return (tokenValue / propertyPrice) * 100;
  };
  
  // Calculate tokens required for 1% ownership
  const tokensForOnePercent = Math.ceil((propertyPrice * 0.01) / EQUIX_TOKEN_VALUE);
  
  // Get current ownership percentage
  const currentOwnershipPercentage = calculateOwnershipPercentage(tokenAmount);
  
  // Update token amount if minimum changes
  useEffect(() => {
    setTokenAmount(minTokenPurchase);
  }, [minTokenPurchase]);
  
  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await Web3Service.isWalletConnected();
      setWalletConnected(connected);
    };
    
    checkWalletConnection();
    
    // Set up event listener for wallet connection status changes
    const handleWalletEvent = () => {
      checkWalletConnection();
    };
    
    window.addEventListener('walletDisconnected', handleWalletEvent);
    window.addEventListener('walletConnected', handleWalletEvent);
    
    return () => {
      window.removeEventListener('walletDisconnected', handleWalletEvent);
      window.removeEventListener('walletConnected', handleWalletEvent);
    };
  }, []);
  
  const handlePurchase = async () => {
    if (!walletConnected) {
      toast({
        title: "Connect Wallet Required",
        description: "Please connect your wallet to purchase property tokens",
        variant: "destructive"
      });
      
      try {
        await Web3Service.connectWallet();
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        return;
      }
      
      return;
    }
    
    setIsLoading(true);
    try {
      // Validate token amount against minimum purchase requirements
      if (tokenAmount < minTokenPurchase) {
        toast({
          variant: "destructive",
          title: "Minimum Token Requirement",
          description: `You must purchase at least ${minTokenPurchase} ${EQUIX_TOKEN_SYMBOL} tokens.`,
        });
        setIsLoading(false);
        return;
      }
      
      // Validate against maximum available tokens
      if (tokenAmount > tokensAvailable) {
        toast({
          variant: "destructive",
          title: "Insufficient Tokens Available",
          description: `Only ${tokensAvailable} ${EQUIX_TOKEN_SYMBOL} tokens are available for purchase.`,
        });
        setIsLoading(false);
        return;
      }
      
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
            minTokenAmount={minTokenPurchase} 
          />
        </div>
        
        <TokenPurchaseDisplay 
          tokenAmount={tokenAmount}
          tokenPrice={calculateTokenValue(1)} // Price per token in USDC
          formatPrice={formatPrice}
        />
      </div>
      
      {/* Token ownership percentage */}
      <div className="bg-space-deep-purple/20 p-3 rounded-md mb-4 flex justify-between">
        <span className="text-gray-300">Your ownership:</span>
        <span className="text-space-neon-green font-medium">
          {currentOwnershipPercentage.toFixed(4)}% 
          {tokenAmount === minTokenPurchase && " (minimum)"}
        </span>
      </div>
      
      {/* Tokens needed for 1% ownership */}
      <div className="bg-space-deep-purple/20 p-3 rounded-md mb-4 flex justify-between">
        <span className="text-gray-300">1% Ownership Requires:</span>
        <span className="text-space-neon-blue font-medium">
          {tokensForOnePercent.toLocaleString()} {EQUIX_TOKEN_SYMBOL}
        </span>
      </div>
      
      {minTokenPurchase > 1 && (
        <p className="text-xs text-amber-400 mb-4">
          Minimum purchase: {minTokenPurchase} {EQUIX_TOKEN_SYMBOL} tokens ({calculateOwnershipPercentage(minTokenPurchase).toFixed(4)}% ownership)
        </p>
      )}
      
      <Button 
        className="cosmic-btn w-full py-3"
        onClick={handlePurchase}
        disabled={isLoading || tokenAmount < minTokenPurchase || tokenAmount > tokensAvailable}
      >
        {!walletConnected ? 'Connect Wallet to Buy' : 
         isLoading ? 'Processing...' : `Buy ${EQUIX_TOKEN_SYMBOL} Tokens Now`}
      </Button>
      
      <p className="text-xs text-gray-400 text-center mt-2">
        Payments processed in {STABLECOIN_SYMBOL} stablecoin
      </p>
    </div>
  );
};

export default TokenPurchaseControls;

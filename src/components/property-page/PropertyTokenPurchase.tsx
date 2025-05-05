
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Web3Service from '@/services/Web3Service';
import { EQUIX_TOKEN_SYMBOL, STABLECOIN_SYMBOL, EQUIX_TOKEN_VALUE, calculateTokenValue } from '@/types/property';
import { Wallet } from 'lucide-react';

interface PropertyTokenPurchaseProps {
  id: string;
  name: string;
  tokenPrice: number;
  tokensAvailable: number;
  totalTokenSupply: number;
  walletConnected: boolean;
  handleConnectWallet: () => Promise<void>;
  formatPrice: (price: number) => string;
  onPurchaseComplete: (amount: number) => void;
  minTokenPurchase?: number;
  propertyPrice: number; // Required for correct ownership calculation
}

const PropertyTokenPurchase: React.FC<PropertyTokenPurchaseProps> = ({
  id,
  name,
  tokenPrice,
  tokensAvailable,
  totalTokenSupply,
  walletConnected,
  handleConnectWallet,
  formatPrice,
  onPurchaseComplete,
  minTokenPurchase = 1,
  propertyPrice
}) => {
  const [tokenAmount, setTokenAmount] = useState(minTokenPurchase);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update token amount when minimum purchase changes
  useEffect(() => {
    setTokenAmount(minTokenPurchase);
  }, [minTokenPurchase]);
  
  // Calculate total investment in USDC based on token amount
  const totalInvestment = calculateTokenValue(tokenAmount);
  
  // Calculate ownership percentage using the correct formula:
  // ownershipPercentage = (equixAmount * equixToUSD) / propertyValueUSD * 100
  const calculateOwnershipPercentage = (amount: number): number => {
    const tokenValue = amount * EQUIX_TOKEN_VALUE;
    return (tokenValue / propertyPrice) * 100;
  };
  
  // Calculate tokens needed for 1% ownership
  const tokensForOnePercent = Math.ceil((propertyPrice * 0.01) / EQUIX_TOKEN_VALUE);
  
  // Get current ownership percentage based on selected token amount
  const currentOwnershipPercentage = calculateOwnershipPercentage(tokenAmount);
  
  const handlePurchase = async () => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to continue with purchase",
        variant: "destructive"
      });
      handleConnectWallet();
      return;
    }
    
    // Validate token amount against minimum and maximum
    if (tokenAmount < minTokenPurchase) {
      toast({
        variant: "destructive",
        title: "Minimum Token Requirement",
        description: `You must purchase at least ${minTokenPurchase} ${EQUIX_TOKEN_SYMBOL} tokens.`
      });
      return;
    }
    
    if (tokenAmount > tokensAvailable) {
      toast({
        variant: "destructive",
        title: "Insufficient Tokens Available",
        description: `Only ${tokensAvailable} ${EQUIX_TOKEN_SYMBOL} tokens are available for purchase.`
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real application, this would trigger an actual blockchain transaction
      const success = await Web3Service.buyPropertyTokens(id, tokenAmount);
      
      if (success) {
        toast({
          title: "Transaction Successful",
          description: `You have successfully purchased ${tokenAmount.toLocaleString()} ${EQUIX_TOKEN_SYMBOL} tokens of ${name}!`,
        });
        
        // Update property data to reflect token purchase
        onPurchaseComplete(tokenAmount);
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="glassmorphism p-4 mb-6">
      <h3 className="font-orbitron mb-4">Purchase {EQUIX_TOKEN_SYMBOL} Tokens</h3>
      
      {!walletConnected ? (
        <div>
          <div className="bg-space-deep-purple/20 p-4 mb-4 rounded-md border border-space-neon-blue/30">
            <p className="text-gray-300 flex items-center mb-3">
              <Wallet className="h-5 w-5 mr-2 text-space-neon-blue" />
              Wallet connection required
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Connect your crypto wallet to purchase tokens and invest in this property
            </p>
            <Button 
              className="w-full cosmic-btn py-6"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <p className="text-gray-300">Amount to purchase</p>
              <div className="flex items-center mt-2">
                <button
                  className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-l-md"
                  onClick={() => setTokenAmount(Math.max(minTokenPurchase, tokenAmount - 1))}
                  aria-label="Decrease token amount"
                >-</button>
                
                <input
                  type="number"
                  min={minTokenPurchase}
                  max={tokensAvailable}
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Math.min(
                    tokensAvailable, 
                    Math.max(minTokenPurchase, parseInt(e.target.value) || minTokenPurchase)
                  ))}
                  className="bg-space-deep-purple/30 border-y border-space-deep-purple text-center text-white w-16 h-8 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Token amount"
                />
                
                <button
                  className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-r-md"
                  onClick={() => setTokenAmount(Math.min(tokensAvailable, tokenAmount + 1))}
                  aria-label="Increase token amount"
                >+</button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-gray-300">Total cost</p>
              <p className="text-xl font-spacegrotesk text-space-neon-green">
                {formatPrice(totalInvestment)} {STABLECOIN_SYMBOL}
              </p>
            </div>
          </div>
          
          {/* Token ownership percentage */}
          <div className="bg-space-deep-purple/20 p-3 rounded-md mb-4 flex justify-between">
            <span className="text-gray-300">Your ownership:</span>
            <span className="text-space-neon-green font-medium">
              {currentOwnershipPercentage.toFixed(4)}%
            </span>
          </div>
          
          {/* Tokens for 1% ownership */}
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
            className="w-full cosmic-btn py-6"
            onClick={handlePurchase}
            disabled={isLoading || tokenAmount < minTokenPurchase || tokenAmount > tokensAvailable}
          >
            {isLoading ? 'Processing Transaction...' : `Purchase ${tokenAmount.toLocaleString()} ${EQUIX_TOKEN_SYMBOL} Tokens`}
          </Button>
          
          <p className="text-xs text-gray-400 text-center mt-3">
            Transaction will be processed on the blockchain. Gas fees may apply.
          </p>
        </>
      )}
    </div>
  );
};

export default PropertyTokenPurchase;


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Web3Service from '@/services/Web3Service';

interface PropertyTokenPurchaseProps {
  id: string;
  name: string;
  tokenPrice: number;
  tokensAvailable: number;
  walletConnected: boolean;
  handleConnectWallet: () => Promise<void>;
  formatPrice: (price: number) => string;
  onPurchaseComplete: (amount: number) => void;
}

const PropertyTokenPurchase: React.FC<PropertyTokenPurchaseProps> = ({
  id,
  name,
  tokenPrice,
  tokensAvailable,
  walletConnected,
  handleConnectWallet,
  formatPrice,
  onPurchaseComplete
}) => {
  const [tokenAmount, setTokenAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const totalInvestment = tokenAmount * tokenPrice;
  
  const handlePurchase = async () => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to continue with purchase",
        variant: "destructive"
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
          description: `You have successfully purchased ${tokenAmount} tokens of ${name}!`,
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
      <h3 className="font-orbitron mb-4">Purchase Tokens</h3>
      
      {!walletConnected ? (
        <div>
          <p className="text-gray-300 mb-4">Connect your wallet to purchase tokens</p>
          <Button 
            className="w-full cosmic-btn py-6"
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-300">Amount to purchase</p>
              <div className="flex items-center mt-2">
                <button
                  className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-l-md"
                  onClick={() => setTokenAmount(Math.max(1, tokenAmount - 1))}
                >-</button>
                
                <input
                  type="number"
                  min="1"
                  max={tokensAvailable}
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Math.min(
                    tokensAvailable, 
                    Math.max(1, parseInt(e.target.value) || 1)
                  ))}
                  className="bg-space-deep-purple/30 border-y border-space-deep-purple text-center text-white w-16 h-8 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                <button
                  className="bg-space-deep-purple/50 text-white w-8 h-8 flex items-center justify-center rounded-r-md"
                  onClick={() => setTokenAmount(Math.min(tokensAvailable, tokenAmount + 1))}
                >+</button>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-gray-300">Total cost</p>
              <p className="text-xl font-spacegrotesk text-space-neon-green">
                {formatPrice(totalInvestment)}
              </p>
            </div>
          </div>
          
          <Button
            className="w-full cosmic-btn py-6"
            onClick={handlePurchase}
            disabled={isLoading || tokenAmount <= 0 || tokenAmount > tokensAvailable}
          >
            {isLoading ? 'Processing Transaction...' : `Purchase ${tokenAmount} Tokens`}
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

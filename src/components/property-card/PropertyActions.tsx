
import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Web3Service from '@/services/Web3Service';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface PropertyActionsProps {
  id: string;
  ownerCount: number;
}

const PropertyActions: React.FC<PropertyActionsProps> = ({ id, ownerCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleBuyTokens = async () => {
    setIsLoading(true);
    try {
      // Check if wallet is connected
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
      
      // Open property details modal/page for token purchase
      navigate(`/property/${id}`);
    } catch (error) {
      console.error('Error initiating token purchase:', error);
      toast({
        title: "Transaction Failed",
        description: "Could not initiate token purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
      <div className="flex items-center">
        <Users className="w-4 h-4 mr-1 text-space-neon-purple" />
        <span className="text-sm text-gray-300 font-inter">{ownerCount} token holders</span>
      </div>
      
      <Button 
        className="flex items-center text-space-neon-blue hover:text-space-neon-green transition-colors duration-300"
        onClick={handleBuyTokens}
        disabled={isLoading}
        variant="ghost"
      >
        <span className="font-spacegrotesk mr-1">{isLoading ? 'Processing...' : 'Buy tokens'}</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default PropertyActions;

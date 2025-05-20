
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Service from '@/services/Web3Service';
import { toast } from "@/components/ui/use-toast";

export const useWalletState = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await Web3Service.isWalletConnected();
      setWalletConnected(connected);
    };
    
    checkWalletConnection();
    
    // Set up event listeners for wallet events
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletConnected(true);
      } else {
        setWalletConnected(false);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);
  
  const connectWallet = async () => {
    try {
      await Web3Service.connectWallet();
      setWalletConnected(true);
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect your wallet. Please try again.",
      });
    }
  };
  
  const disconnectWallet = () => {
    Web3Service.disconnectWallet();
    setWalletConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return {
    walletConnected,
    connectWallet,
    disconnectWallet
  };
};


import { useState, useEffect } from 'react';
import Web3Service from '@/services/Web3Service';

export const useWalletState = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await Web3Service.isWalletConnected();
      setWalletConnected(connected);
    };
    
    checkWalletConnection();
  }, []);
  
  const connectWallet = async () => {
    try {
      await Web3Service.connectWallet();
      setWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return {
    walletConnected,
    connectWallet
  };
};

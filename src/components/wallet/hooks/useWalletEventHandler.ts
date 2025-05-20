
import { useEffect } from 'react';
import Web3Service from '@/services/Web3Service';

export const useWalletEventHandler = (
  walletConnected: boolean,
  fetchWalletInfo: () => Promise<void>,
  disconnectWallet: () => void
) => {
  // Handle wallet events (account changes, chain changes, etc.)
  useEffect(() => {
    if (walletConnected && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          fetchWalletInfo();
        } else {
          // Handle disconnection
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        // Refresh on chain change as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
    
    // Initial wallet info fetch
    if (walletConnected) {
      fetchWalletInfo();
    }
  }, [walletConnected, fetchWalletInfo, disconnectWallet]);
};

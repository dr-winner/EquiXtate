
import { useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectionStatus } from '../types';

export const useWalletEvents = (
  setWalletStatus: (status: ConnectionStatus) => void,
  setWalletAddress: (address: string) => void,
  setBalance: (balance: string) => void,
  setChainId: (chainId: string | null) => void,
  setSelectedWallet: (wallet: string | null) => void
) => {
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      handleDisconnect();
    } else {
      // User switched accounts
      const address = accounts[0];
      setWalletAddress(address);
      setWalletStatus(ConnectionStatus.CONNECTED);
      
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(address);
          const balanceEth = ethers.formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(4));
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  }, [setWalletAddress, setWalletStatus, setBalance]);

  const handleChainChanged = useCallback((chainId: string) => {
    setChainId(chainId);
    // Force page reload on chain change as recommended by MetaMask
    window.location.reload();
  }, [setChainId]);

  const handleDisconnect = useCallback(() => {
    setWalletStatus(ConnectionStatus.DISCONNECTED);
    setWalletAddress("");
    setBalance("0");
    setChainId(null);
    setSelectedWallet(null);
  }, [setWalletStatus, setWalletAddress, setBalance, setChainId, setSelectedWallet]);

  // Set up event listeners for wallet events
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect]);

  return {
    handleAccountsChanged,
    handleChainChanged,
    handleDisconnect
  };
};

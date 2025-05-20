
import { useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectionStatus } from '../types';

export const useInitialConnection = (
  setWalletStatus: (status: ConnectionStatus) => void,
  setWalletAddress: (address: string) => void,
  setChainId: (chainId: string | null) => void,
  setSelectedWallet: (wallet: string | null) => void
) => {
  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            setWalletAddress(accounts[0]);
            setWalletStatus(ConnectionStatus.CONNECTED);
            setChainId(network.chainId.toString());
            setSelectedWallet('metamask'); // Assuming MetaMask
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkConnection();
  }, [setWalletStatus, setWalletAddress, setChainId, setSelectedWallet]);
};

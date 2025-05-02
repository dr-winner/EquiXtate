
import { useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import Web3Service from '@/services/Web3Service';
import { ConnectionStatus } from '../types';

export const useWalletConnector = (
  setWalletStatus: (status: ConnectionStatus) => void,
  setWalletAddress: (address: string) => void,
  setBalance: (balance: string) => void,
  setChainId: (chainId: string | null) => void,
  setSelectedWallet: (wallet: string | null) => void,
  setShowDropdown: (show: boolean) => void,
  handleDisconnect: () => void
) => {
  const connectViaMetaMask = useCallback(async (): Promise<boolean> => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const network = await provider.getNetwork();
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        
        setWalletAddress(address);
        setBalance(parseFloat(balanceEth).toFixed(4));
        setChainId(network.chainId.toString());
        setWalletStatus(ConnectionStatus.CONNECTED);
        setShowDropdown(false);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("MetaMask connection error:", error);
      throw error;
    }
  }, [setWalletAddress, setBalance, setChainId, setWalletStatus, setShowDropdown]);

  const connectWallet = useCallback(async (walletId: string) => {
    setSelectedWallet(walletId);
    setWalletStatus(ConnectionStatus.CONNECTING);
    
    try {
      let connected = false;
      
      if (walletId === 'metamask') {
        if (!window.ethereum) {
          throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
        }
        
        connected = await connectViaMetaMask();
      } else if (walletId === 'walletconnect') {
        toast({
          title: "Coming Soon",
          description: "WalletConnect integration will be available soon!",
        });
        setWalletStatus(ConnectionStatus.DISCONNECTED);
        return;
      } else {
        // For other wallets
        toast({
          title: "Coming Soon",
          description: `Support for this wallet will be available soon!`,
        });
        setWalletStatus(ConnectionStatus.DISCONNECTED);
        return;
      }
      
      if (connected) {
        toast({
          title: "Wallet Connected",
          description: `Successfully connected to ${walletId}`,
        });
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      setWalletStatus(ConnectionStatus.ERROR);
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Could not connect to wallet. Please try again.",
      });
    }
  }, [connectViaMetaMask, setSelectedWallet, setWalletStatus]);

  const disconnectWallet = useCallback(() => {
    // Clear local connection state
    handleDisconnect();
    
    // Disconnect from Web3Service
    Web3Service.disconnectWallet();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [handleDisconnect]);

  return {
    connectWallet,
    disconnectWallet
  };
};


import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/use-toast';
import { ConnectionStatus } from '../types';

export const useWalletConnectionState = () => {
  const [walletStatus, setWalletStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);

  // Fetch wallet information (address, balance, etc.)
  const fetchWalletInfo = useCallback(async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        const address = await window.ethereum.request({ method: 'eth_accounts' });
        if (address && address.length > 0) {
          setWalletAddress(address[0]);
          
          // Get balance
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(address[0]);
          const balanceEth = ethers.formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(4));
        }
      } catch (error) {
        console.error("Error fetching wallet info:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch wallet information. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get network name
  const getNetworkName = () => {
    // Default to Ethereum Mainnet if unknown
    return 'Ethereum';
  };

  // Check authentication status from localStorage
  useEffect(() => {
    const userAuthStatus = localStorage.getItem('isAuthenticated');
    if (userAuthStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  return {
    walletStatus,
    setWalletStatus,
    walletAddress,
    setWalletAddress,
    balance,
    setBalance,
    showDropdown,
    setShowDropdown,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    connectionAttempts,
    setConnectionAttempts,
    fetchWalletInfo,
    formatAddress,
    getNetworkName
  };
};

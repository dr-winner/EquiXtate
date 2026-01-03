import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from '@/components/ui/use-toast';

/**
 * Unified wallet hook that integrates Privy authentication with Wagmi
 * This hook provides a single source of truth for wallet connection state
 */
export const useWallet = () => {
  const { 
    ready: privyReady, 
    authenticated: privyAuthenticated, 
    user: privyUser, 
    login: privyLogin, 
    logout: privyLogout,
    connectWallet: privyConnectWallet,
    linkWallet: privyLinkWallet,
  } = usePrivy();
  
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: address,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Format wallet address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  // Get formatted balance
  const getBalance = () => {
    if (!balanceData) return '0.0000';
    return parseFloat(formatEther(balanceData.value)).toFixed(4);
  };
  
  // Get network name
  const getNetworkName = () => {
    return chain?.name || 'Unknown Network';
  };
  
  // Connect wallet with Privy
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!privyAuthenticated) {
        // First authenticate with Privy (email, social, etc.)
        await privyLogin();
      } else {
        // If authenticated but no wallet, connect/link wallet
        await privyConnectWallet();
      }
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      
      // Disconnect wagmi
      disconnect();
      
      // Logout from Privy
      await privyLogout();
      
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle authentication state changes
  useEffect(() => {
    if (privyReady && privyAuthenticated && privyUser) {
      const email = privyUser.email?.address || 
                   privyUser.google?.email || 
                   privyUser.discord?.email || 
                   privyUser.github?.email || 
                   privyUser.apple?.email;
      
      if (email) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        
        // Dispatch event for other components
        const event = new Event('authStatusChanged');
        window.dispatchEvent(event);
      }
    } else if (privyReady && !privyAuthenticated) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
    }
  }, [privyReady, privyAuthenticated, privyUser]);
  
  return {
    // Connection state
    isReady: privyReady,
    isConnected: isConnected && privyAuthenticated,
    isAuthenticated: privyAuthenticated,
    isLoading,
    
    // Wallet info
    address,
    walletAddress: address,
    balance: getBalance(),
    chain,
    network: getNetworkName(),
    
    // User info from Privy
    user: privyUser,
    
    // Actions
    connectWallet,
    disconnectWallet,
    login: privyLogin,
    logout: privyLogout,
    
    // Utilities
    formatAddress,
  };
};

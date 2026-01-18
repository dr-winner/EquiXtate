import { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from '@/components/ui/use-toast';

/**
 * Unified wallet hook that integrates Privy authentication with Wagmi
 * 
 * IMPORTANT: With Privy, authentication and wallet are tightly coupled:
 * - Email/social login → Privy creates an embedded wallet automatically
 * - Wallet login → The wallet IS your auth method
 * - You cannot disconnect wallet without logging out
 * 
 * This hook provides a single source of truth for wallet connection state.
 */
export const useWallet = () => {
  const { 
    ready: privyReady, 
    authenticated: privyAuthenticated, 
    user: privyUser, 
    login: privyLogin, 
    logout: privyLogout,
    connectWallet: privyConnectWallet,
    linkWallet: privyLinkWallet, // For linking external wallets
  } = usePrivy();
  
  // Get all wallets from Privy (embedded + linked)
  const { wallets } = useWallets();
  
  const { address: wagmiAddress, chain } = useAccount();
  const { data: balanceData } = useBalance({
    address: wagmiAddress,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the active wallet address (prefer wagmi, fallback to privy wallets)
  const getActiveWalletAddress = (): string | undefined => {
    // If wagmi has an address, use it
    if (wagmiAddress) return wagmiAddress;
    
    // Fallback to first Privy wallet
    if (wallets && wallets.length > 0) {
      return wallets[0].address;
    }
    
    return undefined;
  };
  
  const address = getActiveWalletAddress();
  
  // Check if user has a wallet (embedded or external)
  const hasWallet = wallets && wallets.length > 0;
  
  // Check if connected (authenticated + has wallet)
  const isConnected = privyAuthenticated && hasWallet;
  
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
  
  // Get network name with fallback for actual chain detection
  const getNetworkName = () => {
    // If chain is detected by wagmi, use its name (preferred)
    if (chain?.name) {
      return chain.name;
    }
    
    // Fallback: Try to get chain ID from the provider directly
    if (address && window.ethereum) {
      try {
        const chainId = window.ethereum.chainId;
        if (chainId) {
          const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
          
          const chainNames: { [key: number]: string } = {
            1: 'Ethereum',
            11155111: 'Sepolia',
            57054: 'Sonic Testnet',
            146: 'Sonic',
          };
          
          return chainNames[id] || `Network (${id})`;
        }
      } catch (e) {
        // Silently fail and return unknown
      }
    }
    
    return 'Sepolia'; // Default to Sepolia for demo
  };
  
  // Login / Connect wallet with Privy
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      if (!privyAuthenticated) {
        // Authenticate with Privy (opens login modal)
        await privyLogin();
      } else if (!hasWallet) {
        // If authenticated but no wallet, connect/link wallet
        await privyConnectWallet();
      }
      // If already authenticated and has wallet, do nothing
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Link an additional external wallet
  const linkExternalWallet = async () => {
    try {
      setIsLoading(true);
      // Use linkWallet for linking external wallets like MetaMask
      await privyLinkWallet();
      toast({
        title: "Wallet Linked",
        description: "External wallet has been linked to your account.",
      });
    } catch (error) {
      console.error('Error linking wallet:', error);
      toast({
        variant: "destructive",
        title: "Link Failed",
        description: "Failed to link external wallet.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Full logout (the only way to "disconnect" with Privy)
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Logout from Privy (this disconnects all wallets)
      await privyLogout();
      
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      
      // Dispatch event for other components
      const event = new Event('authStatusChanged');
      window.dispatchEvent(event);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
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
      
      localStorage.setItem('isAuthenticated', 'true');
      if (email) {
        localStorage.setItem('userEmail', email);
      }
      
      // Dispatch event for other components
      const event = new Event('authStatusChanged');
      window.dispatchEvent(event);
      
    } else if (privyReady && !privyAuthenticated) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      
      // Dispatch event for other components
      const event = new Event('authStatusChanged');
      window.dispatchEvent(event);
    }
  }, [privyReady, privyAuthenticated, privyUser]);
  
  return {
    // Connection state
    isReady: privyReady,
    isConnected,
    isAuthenticated: privyAuthenticated,
    isLoading,
    hasWallet,
    
    // Wallet info
    address,
    walletAddress: address,
    balance: getBalance(),
    chain,
    network: getNetworkName(),
    wallets, // All linked wallets
    
    // User info from Privy
    user: privyUser,
    
    // Actions
    connectWallet,      // Login + connect wallet
    linkExternalWallet, // Link additional wallet
    logout,             // Full logout (only way to disconnect)
    login: privyLogin,  // Direct Privy login
    
    // Utilities
    formatAddress,
  };
};


import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import Web3Service from '@/services/Web3Service';
import { toast } from '@/components/ui/use-toast';
import { ConnectionStatus } from '../types';
import { useAuthenticationModal } from '@/hooks/use-authentication-modal';

interface WalletConnectorProps {
  walletConnected: boolean;
  setWalletStatus: (status: ConnectionStatus) => void;
  setWalletAddress: (address: string) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setConnectionAttempts: (callback: (prev: number) => number) => void;
  fetchWalletInfo: () => Promise<void>;
  setShowDropdown: (show: boolean) => void;
}

export const useWalletConnector = ({
  walletConnected,
  setWalletStatus,
  setWalletAddress,
  setIsAuthenticated,
  setIsLoading,
  setConnectionAttempts,
  fetchWalletInfo,
  setShowDropdown
}: WalletConnectorProps) => {
  const navigate = useNavigate();
  const { openModal: openAuthModal } = useAuthenticationModal();

  // Wallet options
  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗'
    }
  ];

  const handleConnectWallet = useCallback(async (walletId: string) => {
    try {
      setIsLoading(true);
      setConnectionAttempts(prev => prev + 1);
      
      // Mobile detection
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // For mobile users attempting to use MetaMask
      if (isMobile && walletId === 'metamask' && !window.ethereum) {
        // Prompt to open in MetaMask browser or install MetaMask
        const hasMetaMask = await new Promise<boolean>((resolve) => {
          // Check if MetaMask deep link works
          const mmTimeout = setTimeout(() => resolve(false), 3000);
          window.addEventListener('blur', () => {
            clearTimeout(mmTimeout);
            resolve(true);
          });
          
          // Try to open MetaMask
          window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}`;
        });
        
        if (!hasMetaMask) {
          toast({
            title: "MetaMask Not Detected",
            description: "Please install MetaMask mobile app to continue",
          });
          setIsLoading(false);
          return;
        }
      }
      
      await Web3Service.connectWallet();
      setWalletStatus(ConnectionStatus.CONNECTED);
      setShowDropdown(false);
      
      // Check if user is already authenticated
      const isUserAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isUserAuthenticated) {
        // Show authentication modal
        setTimeout(() => {
          openAuthModal();
        }, 500);
      } else {
        setIsAuthenticated(true);
      }
      
      // Fetch wallet info after connection
      await fetchWalletInfo();
      
      // If on profile page, refresh to ensure data is loaded with the new wallet
      if (window.location.pathname === '/profile') {
        // Short delay to allow connection to complete
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setWalletStatus(ConnectionStatus.ERROR);
      toast({
        title: "Connection Error",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWalletInfo, openAuthModal, setConnectionAttempts, setIsAuthenticated, setIsLoading, setShowDropdown, setWalletStatus]);

  const handleDisconnectWallet = useCallback(() => {
    Web3Service.disconnectWallet();
    setWalletStatus(ConnectionStatus.DISCONNECTED);
    setShowDropdown(false);
    setIsAuthenticated(false);
    setWalletAddress('');
    localStorage.removeItem('isAuthenticated');
    
    // If on profile page, redirect to home after wallet disconnect
    if (window.location.pathname === '/profile') {
      navigate('/');
    }
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [navigate, setIsAuthenticated, setShowDropdown, setWalletAddress, setWalletStatus]);

  // Handle authentication success
  const handleAuthSuccess = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Dispatch custom event to update UI components that listen for auth changes
    const event = new Event('authStatusChanged');
    window.dispatchEvent(event);
    
    toast({
      title: "Authentication Successful",
      description: "You are now fully verified and ready to invest!",
    });
    
    // If user is verifying on the profile page, reload to show dashboard
    if (window.location.pathname === '/profile') {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [setIsAuthenticated]);

  return {
    walletOptions,
    handleConnectWallet,
    handleDisconnectWallet,
    handleAuthSuccess
  };
};

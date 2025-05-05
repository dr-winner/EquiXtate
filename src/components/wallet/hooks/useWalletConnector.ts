
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3Service from '@/services/Web3Service';
import { toast } from '@/components/ui/use-toast';
import { ConnectionStatus } from '../types';
import { useAuthenticationModal } from '@/hooks/use-authentication-modal';
import { useWalletDetection } from './useWalletDetection';

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
  const { isMobile, detectedWallets } = useWalletDetection();
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Generate wallet options based on detected wallets
  const walletOptions = detectedWallets.map(wallet => {
    let icon = '🔗'; // Default icon
    let description = '';
    let mobileSupported = true;
    
    if (wallet.id === 'metamask' || wallet.id === 'metamask-mobile') {
      icon = '🦊';
      description = wallet.installed ? 'Detected' : 'Not installed';
    } else if (wallet.id === 'coinbase') {
      icon = '💰';
      description = wallet.installed ? 'Detected' : 'Not installed';
    } else if (wallet.id === 'trust') {
      icon = '🛡️';
      description = wallet.installed ? 'Detected' : 'Not installed';
    } else if (wallet.id === 'walletconnect') {
      icon = '🔗';
      description = 'Connect multiple wallets';
    }
    
    return {
      id: wallet.id,
      name: wallet.name,
      icon,
      description,
      mobileSupported,
      deepLink: wallet.deepLink || undefined
    };
  });
  
  // If no wallets were detected, provide default options
  if (walletOptions.length === 0) {
    walletOptions.push(
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        description: 'Popular browser extension',
        mobileSupported: !isMobile,
        deepLink: undefined
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        description: 'Connect multiple wallets',
        mobileSupported: true,
        deepLink: undefined
      }
    );
  }

  const handleConnectWallet = useCallback(async (walletId: string) => {
    try {
      console.log("Connecting wallet with ID:", walletId);
      setWalletStatus(ConnectionStatus.CONNECTING);
      setIsLoading(true);
      setConnectionAttempts(prev => prev + 1);
      
      // Clear any existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      // Set a timeout to reset loading state if connection takes too long
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setWalletStatus(ConnectionStatus.ERROR);
        toast({
          variant: "destructive",
          title: "Connection Timeout",
          description: "Wallet connection is taking longer than expected. Please try again.",
        });
      }, 20000); // 20 second timeout
      
      setConnectionTimeout(timeout);
      
      // Check for deep link if on mobile
      const selectedWallet = detectedWallets.find(w => w.id === walletId);
      if (isMobile && selectedWallet?.deepLink && !selectedWallet.installed) {
        console.log("Redirecting to wallet via deep link:", selectedWallet.deepLink);
        // Open wallet via deep link
        window.location.href = selectedWallet.deepLink;
        
        // Set a timeout to check if the app was opened
        setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Wallet Connection",
            description: "Please return to this page after connecting your wallet.",
          });
        }, 3000);
        
        // Clear the connection timeout
        clearTimeout(timeout);
        return;
      }
      
      console.log("Calling Web3Service.connectWallet()");
      const walletAddress = await Web3Service.connectWallet();
      
      // Clear the connection timeout
      clearTimeout(timeout);
      setConnectionTimeout(null);
      
      if (walletAddress) {
        console.log("Wallet connected successfully with address:", walletAddress);
        setWalletStatus(ConnectionStatus.CONNECTED);
        setWalletAddress(walletAddress);
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
      } else {
        console.log("Wallet address not received after connection");
        // The wallet connection might be pending (mobile case) or failed
        if (!isMobile) {
          setWalletStatus(ConnectionStatus.ERROR);
        }
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
      // Ensure timeout is cleared
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
    }
  }, [connectionTimeout, fetchWalletInfo, isMobile, detectedWallets, openAuthModal, setConnectionAttempts, setIsAuthenticated, setIsLoading, setShowDropdown, setWalletStatus, setWalletAddress]);

  const handleDisconnectWallet = useCallback(() => {
    console.log("Disconnecting wallet");
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
  }, [setIsAuthenticated]);

  return {
    walletOptions,
    handleConnectWallet,
    handleDisconnectWallet,
    handleAuthSuccess
  };
};

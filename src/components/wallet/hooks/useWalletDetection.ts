
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface DetectedWallet {
  name: string;
  id: string;
  installed: boolean;
  deepLink?: string;
}

export const useWalletDetection = () => {
  const isMobile = useIsMobile();
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  
  // Check for installed wallets based on user agent and window.ethereum
  useEffect(() => {
    const detectWallets = async () => {
      const detected: DetectedWallet[] = [];
      
      if (window.ethereum) {
        // Check if MetaMask is installed
        const isMetaMask = window.ethereum.isMetaMask;
        if (isMetaMask) {
          detected.push({
            id: 'metamask',
            name: 'MetaMask',
            installed: true
          });
        }
        
        // Check for Coinbase Wallet
        const hasCoinbaseWallet = Boolean(window.ethereum.isCoinbaseWallet);
        if (hasCoinbaseWallet) {
          detected.push({
            id: 'coinbase',
            name: 'Coinbase Wallet',
            installed: true
          });
        }
        
        // Check for multiple injected providers
        const hasMultipleProviders = Boolean(window.ethereum.providers && 
          Array.isArray(window.ethereum.providers) && 
          window.ethereum.providers.length > 0);
          
        if (hasMultipleProviders && window.ethereum.providers) {
          for (const provider of window.ethereum.providers) {
            if (provider.isMetaMask && !detected.find(w => w.id === 'metamask')) {
              detected.push({
                id: 'metamask',
                name: 'MetaMask',
                installed: true
              });
            }
            if (provider.isCoinbaseWallet && !detected.find(w => w.id === 'coinbase')) {
              detected.push({
                id: 'coinbase',
                name: 'Coinbase Wallet',
                installed: true
              });
            }
          }
        }
      }
      
      // For mobile detection
      if (isMobile) {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Check if we're already in a wallet browser
        const isMetaMaskBrowser = userAgent.includes('metamask');
        const isTrustWallet = userAgent.includes('trust');
        const isCoinbaseBrowser = userAgent.includes('coinbase');
        
        if (isMetaMaskBrowser && !detected.find(w => w.id === 'metamask')) {
          detected.push({
            id: 'metamask',
            name: 'MetaMask',
            installed: true
          });
        }
        
        if (isTrustWallet) {
          detected.push({
            id: 'trust',
            name: 'Trust Wallet',
            installed: true
          });
        }
        
        if (isCoinbaseBrowser && !detected.find(w => w.id === 'coinbase')) {
          detected.push({
            id: 'coinbase',
            name: 'Coinbase Wallet',
            installed: true
          });
        }
        
        // Add deep links for mobile wallets
        if (!isMetaMaskBrowser) {
          detected.push({
            id: 'metamask-mobile',
            name: 'MetaMask Mobile',
            installed: false,
            deepLink: `https://metamask.app.link/dapp/${window.location.hostname}`
          });
        }
        
        detected.push({
          id: 'walletconnect',
          name: 'WalletConnect',
          installed: false,
          deepLink: undefined // Will be handled separately
        });
      } else {
        // For desktop, always show these options
        if (!detected.find(w => w.id === 'metamask')) {
          detected.push({
            id: 'metamask',
            name: 'MetaMask',
            installed: false
          });
        }
        
        detected.push({
          id: 'walletconnect',
          name: 'WalletConnect',
          installed: false
        });
      }
      
      setDetectedWallets(detected);
    };
    
    detectWallets();
  }, [isMobile]);
  
  return {
    isMobile,
    detectedWallets
  };
};

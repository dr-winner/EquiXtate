
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletProvider from '../provider';
import ContractService from '../../ContractService';
import { handleWalletEvents } from './EventManager';
import ConnectionManager from './ConnectionManager';
import { getDeepLink } from '../utils/MobileUtils';

class WalletConnector {
  // Connect wallet with improved mobile and multi-wallet support
  public async connectWallet(): Promise<string | null> {
    try {
      // Get the appropriate ethereum object, handling multiple providers
      let ethereum = window.ethereum;
      
      if (!ethereum) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile users, try deep linking with fallback options
          const deepLink = getDeepLink();
          
          // Try to open the wallet app
          window.location.href = deepLink;
          
          toast({
            title: "Opening Mobile Wallet",
            description: "Please open your wallet app and connect to this site.",
          });
          
          // We don't wait for the app to open since we'll lose context
          // The user will need to come back to the site after connecting
          return null;
        } else {
          toast({
            variant: "destructive",
            title: "No Wallet Found",
            description: "Please install MetaMask or another Web3 wallet to continue.",
          });
          throw new Error("Web3 provider not found. Please install MetaMask or another Web3 wallet.");
        }
      }
      
      // Handle multiple providers (like MetaMask + Coinbase Wallet)
      if (ethereum.providers && Array.isArray(ethereum.providers)) {
        // Log for debugging
        console.log("Multiple providers detected:", ethereum.providers.length);
        
        // If the user has multiple wallets installed, prioritize MetaMask
        const providers = ethereum.providers;
        
        for (const provider of providers) {
          if (provider.isMetaMask) {
            // Make sure we're working with a full ethereum provider, not just a subset
            if (this.isValidProvider(provider)) {
              ethereum = provider;
              console.log("Using MetaMask provider");
              break;
            }
          }
        }
        
        // If no MetaMask, just use the first available provider that has required methods
        if (ethereum === window.ethereum) {
          for (const provider of providers) {
            if (this.isValidProvider(provider)) {
              ethereum = provider;
              console.log("Using alternative provider:", provider.isMetaMask ? "MetaMask" : 
                          provider.isCoinbaseWallet ? "Coinbase" : "Unknown");
              break;
            }
          }
        }
      }
      
      // Ensure we have a valid ethereum provider with required methods
      if (!this.isValidProvider(ethereum)) {
        toast({
          variant: "destructive",
          title: "Incompatible Wallet",
          description: "Your wallet doesn't support the required methods. Please try a different wallet.",
        });
        throw new Error("Invalid ethereum provider. Missing required methods.");
      }
      
      console.log("Requesting wallet accounts...");
      
      // Show connecting toast to provide immediate feedback
      toast({
        title: "Connecting Wallet",
        description: "Please check your wallet and approve the connection request...",
      });

      // Request accounts with improved timeout handling
      const accountsPromise = ethereum.request({
        method: "eth_requestAccounts",
      });
      
      // Set a longer timeout for the request (15 seconds instead of 8)
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Connection request timed out. Please check your wallet extension.")), 15000);
      });
      
      // Race the account request against the timeout
      const accounts = await Promise.race([accountsPromise, timeoutPromise]);
      
      if (!accounts || accounts.length === 0) {
        toast({
          variant: "destructive",
          title: "No Accounts Found",
          description: "Please unlock your wallet and try again.",
        });
        throw new Error("No accounts found. Please unlock your wallet.");
      }
      
      console.log("Wallet accounts received:", accounts);
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Get network information
      const network = await provider.getNetwork();
      const networkInfo = {
        name: network.name,
        chainId: network.chainId.toString()
      };
      
      console.log("Connected to network:", networkInfo.name, networkInfo.chainId);
      
      // Determine provider type
      let providerType = 'unknown';
      if (ethereum.isMetaMask) providerType = 'metamask';
      else if (ethereum.isCoinbaseWallet) providerType = 'coinbase';
      
      // Update provider info
      WalletProvider.setProviderInfo({
        provider,
        signer,
        address: accounts[0],
        networkInfo,
        providerType
      });
      
      // Initialize contracts with signer
      ContractService.initializeContracts(signer);
      
      // Set up event listeners for wallet events
      handleWalletEvents();
      
      // Dispatch custom event
      const event = new CustomEvent('walletConnected', { detail: accounts[0] });
      window.dispatchEvent(event);
      
      // Show success toast
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
      
      return accounts[0];
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      // User rejection handling
      if (error.code === 4001) {
        toast({
          title: "Connection Cancelled",
          description: "You declined the connection request. Please try again when ready.",
        });
      } 
      // Provider errors
      else if (error.code === -32002) {
        toast({
          title: "Connection Pending",
          description: "A connection request is already pending. Please check your wallet extension.",
        });
      }
      // Other errors
      else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error.message || "Could not connect to wallet",
        });
      }
      return null;
    }
  }
  
  // Helper method to check if provider has the required methods
  private isValidProvider(provider: any): provider is Window['ethereum'] {
    return (
      provider &&
      typeof provider.request === 'function' &&
      typeof provider.on === 'function' &&
      typeof provider.removeListener === 'function'
    );
  }
  
  // Disconnect wallet
  public disconnectWallet(): void {
    try {
      WalletProvider.resetProviderInfo();
      ContractService.resetContracts();
      
      // Custom event to notify UI components
      const event = new CustomEvent('walletDisconnected');
      window.dispatchEvent(event);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
      
      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Disconnect Error",
        description: "There was an issue disconnecting your wallet.",
      });
    }
  }
}

export default new WalletConnector();


import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletProvider from './provider';
import ContractService from '../ContractService';
import { parseWeb3Error } from '@/utils/web3Errors';
import { logger } from '@/utils/logger';

class WalletConnection {
  public async initialize(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if already connected without prompting
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          
          WalletProvider.setProviderInfo({
            provider,
            signer,
            address: accounts[0]
          });
          
          ContractService.initializeContracts(signer);
          logger.info('Wallet initialized', { address: accounts[0] });
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error("Failed to initialize WalletConnection", error);
      return false;
    }
  }
  
  // Connect wallet - now with better mobile support
  public async connectWallet(): Promise<string | null> {
    try {
      if (!window.ethereum) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile users, provide a link to open their wallet app with deep linking
          toast({
            title: "Mobile Wallet Required",
            description: "Please ensure you have MetaMask or another wallet app installed and open it to connect.",
          });
          
          // Some wallets support deep linking
          const deepLink = `https://metamask.app.link/dapp/${window.location.hostname}`;
          window.location.href = deepLink;
          return null;
        } else {
          throw new Error("Web3 provider not found. Please install MetaMask or another Web3 wallet.");
        }
      }
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Update provider info
      WalletProvider.setProviderInfo({
        provider,
        signer,
        address: accounts[0]
      });
      
      // Initialize contracts with signer
      ContractService.initializeContracts(signer);
      
      // Set up event listeners for wallet events
      this.setupEventListeners();
      
      logger.info('Wallet connected successfully', { address: accounts[0] });
      return accounts[0];
    } catch (error: any) {
      const parsed = parseWeb3Error(error);
      logger.error("Error connecting wallet", error);
      
      if (error.code === 4001) {
        // User rejected request
        toast({
          title: "Connection Cancelled",
          description: "You declined the connection request. Please try again when ready.",
        });
      } else {
        toast({
          variant: "destructive",
          title: parsed.title,
          description: parsed.message,
        });
      }
      return null;
    }
  }
  
  // Disconnect wallet
  public disconnectWallet(): void {
    WalletProvider.resetProviderInfo();
    ContractService.resetContracts();
    
    // Custom event to notify UI components
    const event = new CustomEvent('walletDisconnected');
    window.dispatchEvent(event);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }
  
  // Set up event listeners for wallet events
  private setupEventListeners() {
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          WalletProvider.setProviderInfo({ address: accounts[0] });
          this.initialize(); // Reinitialize with new account
        }
      });
      
      // Handle chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload page on chain change as recommended
      });
      
      // Handle disconnect
      window.ethereum.on('disconnect', () => {
        this.disconnectWallet();
      });
    }
  }
  
  // Check if wallet is connected
  public async isWalletConnected(): Promise<boolean> {
    try {
      const walletAddress = WalletProvider.getWalletAddress();
      const signer = WalletProvider.getSigner();
      
      if (walletAddress && signer) {
        return true;
      }
      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const newSigner = await provider.getSigner();
          
          WalletProvider.setProviderInfo({
            provider,
            signer: newSigner,
            address: accounts[0]
          });
          
          ContractService.initializeContracts(newSigner);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }
}

export default new WalletConnection();

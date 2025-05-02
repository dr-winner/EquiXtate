
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import ContractService from './ContractService';
import { NETWORK_NAMES } from './constants';
import { NetworkInfo } from './types';

class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private walletAddress: string | null = null;
  
  // Initialize wallet connection
  public async initialize(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        // Create provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if already connected
        const accounts = await this.provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          this.signer = await this.provider.getSigner();
          ContractService.initializeContracts(this.signer);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to initialize WalletService:", error);
      return false;
    }
  }
  
  // Connect wallet
  public async connectWallet(): Promise<string | null> {
    try {
      if (!window.ethereum) {
        throw new Error("Web3 provider not found. Please install MetaMask or another Web3 wallet.");
      }
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }
      
      this.walletAddress = accounts[0];
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Initialize contracts with signer
      ContractService.initializeContracts(this.signer);
      
      // Set up event listeners for wallet events
      this.setupEventListeners();
      
      return this.walletAddress;
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Could not connect to wallet",
      });
      return null;
    }
  }
  
  // Set up event listeners for wallet events
  private setupEventListeners() {
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          this.walletAddress = accounts[0];
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
  
  // Disconnect wallet
  public disconnectWallet(): void {
    this.walletAddress = null;
    this.signer = null;
    ContractService.resetContracts();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }
  
  // Check if wallet is connected
  public async isWalletConnected(): Promise<boolean> {
    try {
      if (this.walletAddress && this.signer) {
        return true;
      }
      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          this.provider = new ethers.BrowserProvider(window.ethereum);
          this.signer = await this.provider.getSigner();
          ContractService.initializeContracts(this.signer);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }
  
  // Get wallet address
  public getWalletAddress(): string | null {
    return this.walletAddress;
  }
  
  // Get signer
  public getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
  
  // Get provider
  public getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
  
  // Check if Web3 is available
  public isWeb3Available(): boolean {
    return window.ethereum !== undefined;
  }
  
  // Get network
  public async getNetwork(): Promise<NetworkInfo | null> {
    try {
      if (!this.provider) {
        return null;
      }
      
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Map chain ID to network name
      const name = NETWORK_NAMES[chainId] || "Unknown Network";
      
      return { name, chainId };
    } catch (error) {
      console.error("Error getting network:", error);
      return null;
    }
  }
}

export default new WalletService();

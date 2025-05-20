
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletProvider from '../provider';
import ContractService from '../../ContractService';
import { handleWalletEvents } from './EventManager';

class ConnectionManager {
  public async initialize(): Promise<boolean> {
    try {
      console.log("Initializing wallet connection...");
      // Check if any wallet provider is installed
      if (window.ethereum) {
        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if already connected without prompting
        const accounts = await provider.send("eth_accounts", []);
        console.log("Found accounts during initialization:", accounts);
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          
          // Get network information
          const network = await provider.getNetwork();
          const networkInfo = {
            name: network.name,
            chainId: network.chainId.toString()
          };
          
          console.log("Connected to network:", networkInfo.name, networkInfo.chainId);
          
          WalletProvider.setProviderInfo({
            provider,
            signer,
            address: accounts[0],
            networkInfo,
            providerType: window.ethereum.isMetaMask ? 'metamask' : 
                          window.ethereum.isCoinbaseWallet ? 'coinbase' : 'unknown'
          });
          
          ContractService.initializeContracts(signer);
          
          // Set up event listeners
          handleWalletEvents();
          
          // Create custom event to notify UI of wallet connection
          const event = new CustomEvent('walletConnected', { detail: accounts[0] });
          window.dispatchEvent(event);
          
          console.log("Wallet initialized successfully with address:", accounts[0]);
          return true;
        }
      }
      console.log("No wallet connection found during initialization");
      return false;
    } catch (error) {
      console.error("Failed to initialize WalletConnection:", error);
      return false;
    }
  }
  
  // Try to silently connect wallet without user interaction
  public async trySilentConnect(): Promise<boolean> {
    try {
      console.log("Attempting silent wallet connection...");
      if (!window.ethereum) {
        console.log("No ethereum object found");
        return false;
      }
      
      // Get the ethereum object, handling multiple providers if needed
      const ethereum = this.getEthereumObject();
      if (!ethereum) {
        console.log("No valid ethereum provider found");
        return false;
      }
      
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send("eth_accounts", []);
      
      console.log("Silent connection found accounts:", accounts);
      
      if (accounts.length === 0) {
        console.log("No accounts available for silent connection");
        return false;
      }
      
      const signer = await provider.getSigner();
      
      // Get network information
      const network = await provider.getNetwork();
      const networkInfo = {
        name: network.name,
        chainId: network.chainId.toString()
      };
      
      // Determine provider type
      let providerType = 'unknown';
      if (ethereum.isMetaMask) providerType = 'metamask';
      else if (ethereum.isCoinbaseWallet) providerType = 'coinbase';
      
      WalletProvider.setProviderInfo({
        provider,
        signer,
        address: accounts[0],
        networkInfo,
        providerType
      });
      
      ContractService.initializeContracts(signer);
      
      // Set up event listeners
      handleWalletEvents();
      
      // Dispatch custom event
      const event = new CustomEvent('walletConnected', { detail: accounts[0] });
      window.dispatchEvent(event);
      
      console.log("Silent wallet connection successful");
      return true;
    } catch (error) {
      console.error("Silent connection failed:", error);
      return false;
    }
  }
  
  // Check if wallet is connected with improved reliability
  public async isWalletConnected(): Promise<boolean> {
    try {
      console.log("Checking wallet connection status...");
      const walletAddress = WalletProvider.getWalletAddress();
      const signer = WalletProvider.getSigner();
      
      if (walletAddress && signer) {
        // Verify the connection is still valid
        try {
          const address = await signer.getAddress();
          console.log("Wallet is connected with address:", address);
          return true;
        } catch (error) {
          console.log("Signer invalidated, reconnecting silently...");
          // Signer is no longer valid, try to reconnect silently
        }
      }
      
      const silentConnectResult = await this.trySilentConnect();
      console.log("Silent connect result:", silentConnectResult);
      return silentConnectResult;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  }
  
  // Helper method to get the appropriate Ethereum object, handling multiple providers
  private getEthereumObject(): any {
    let ethereum = window.ethereum;
    
    // No provider available
    if (!ethereum) {
      console.log("No ethereum object found in window");
      return null;
    }
    
    // Simple case: only one provider
    if (!this.hasMultipleProviders(ethereum)) {
      console.log("Single provider detected");
      return ethereum;
    }
    
    // With multiple providers, try to find MetaMask or return first available
    if (ethereum.providers) {
      console.log("Multiple providers detected:", ethereum.providers?.length);
      for (const provider of ethereum.providers) {
        if (provider.isMetaMask) {
          console.log("Selected MetaMask provider from multiple providers");
          return provider;
        }
      }
      
      // Default to first provider if no MetaMask
      if (ethereum.providers?.[0]) {
        console.log("Selected first available provider");
        return ethereum.providers[0];
      }
    }
    
    console.log("Using default ethereum object");
    return ethereum;
  }
  
  // Check if multiple providers exist
  private hasMultipleProviders(ethereum: any): boolean {
    return Boolean(ethereum.providers && Array.isArray(ethereum.providers) && ethereum.providers.length > 0);
  }
}

export default new ConnectionManager();

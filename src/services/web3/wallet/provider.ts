
import { ethers } from 'ethers';
import { WalletProviderInfo, NetworkInfo } from './types';
import { toast } from "@/components/ui/use-toast";

class WalletProvider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private walletAddress: string | null = null;
  private networkInfo: NetworkInfo | null = null;
  private connected: boolean = false;
  private providerType: string | null = null;
  
  /**
   * Get the current provider instance
   */
  public getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
  
  /**
   * Get the current signer instance
   */
  public getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
  
  /**
   * Get the connected wallet address
   */
  public getWalletAddress(): string | null {
    return this.walletAddress;
  }
  
  /**
   * Get the network information for the connected wallet
   */
  public getNetworkInfo(): NetworkInfo | null {
    return this.networkInfo;
  }
  
  /**
   * Get the type of provider being used (e.g., metamask, coinbase)
   */
  public getProviderType(): string | null {
    return this.providerType;
  }
  
  /**
   * Check if wallet is currently connected
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Update provider information
   * @param info Partial provider information to update
   */
  public setProviderInfo(info: Partial<WalletProviderInfo>): void {
    try {
      if (info.provider !== undefined) this.provider = info.provider;
      if (info.signer !== undefined) this.signer = info.signer;
      if (info.address !== undefined) this.walletAddress = info.address;
      if (info.networkInfo !== undefined) this.networkInfo = info.networkInfo;
      if (info.providerType !== undefined) this.providerType = info.providerType;
      
      // Update connection status
      this.connected = Boolean(this.provider && this.walletAddress);
    } catch (error) {
      console.error("Error updating provider info:", error);
      toast({
        variant: "destructive",
        title: "Provider Error",
        description: "Failed to update wallet provider information."
      });
    }
  }
  
  /**
   * Reset all provider information when disconnecting
   */
  public resetProviderInfo(): void {
    this.provider = null;
    this.signer = null;
    this.walletAddress = null;
    this.networkInfo = null;
    this.connected = false;
    this.providerType = null;
  }
  
  /**
   * Check if Web3 is available in the browser
   */
  public isWeb3Available(): boolean {
    return window.ethereum !== undefined;
  }
  
  /**
   * Attempt to reconnect to the current provider
   * @returns Promise resolving to boolean indicating success of reconnection
   */
  public async reconnect(): Promise<boolean> {
    try {
      if (!this.isWeb3Available()) {
        return false;
      }
      
      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      const accounts = await this.provider.send("eth_accounts", []);
      if (accounts.length === 0) {
        return false;
      }
      
      this.signer = await this.provider.getSigner();
      this.walletAddress = accounts[0];
      this.connected = true;
      
      // Get network information
      const network = await this.provider.getNetwork();
      this.networkInfo = {
        name: network.name,
        chainId: network.chainId.toString()
      };
      
      return true;
    } catch (error) {
      console.error("Error reconnecting to wallet:", error);
      this.resetProviderInfo();
      return false;
    }
  }
  
  /**
   * Update the network information for the current provider
   */
  public async updateNetworkInfo(): Promise<NetworkInfo | null> {
    try {
      if (!this.provider) {
        return null;
      }
      
      const network = await this.provider.getNetwork();
      this.networkInfo = {
        name: network.name,
        chainId: network.chainId.toString()
      };
      
      return this.networkInfo;
    } catch (error) {
      console.error("Error updating network information:", error);
      return null;
    }
  }
  
  /**
   * Get the balance of the connected wallet
   * @returns Promise resolving to balance as a formatted string
   */
  public async getBalance(): Promise<string> {
    try {
      if (!this.provider || !this.walletAddress) {
        return "0";
      }
      
      const balanceWei = await this.provider.getBalance(this.walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      return parseFloat(balanceEth).toFixed(4);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      return "0";
    }
  }
  
  /**
   * Check if the current provider supports a specific feature
   * @param feature Feature name to check for
   * @returns Boolean indicating if feature is supported
   */
  public supportsFeature(feature: string): boolean {
    if (!window.ethereum) return false;
    
    switch (feature.toLowerCase()) {
      case 'eip-1559':
        return Boolean(window.ethereum && window.ethereum.request && window.ethereum._metamask?.isUnlocked);
      case 'erc-20':
      case 'erc-721':
        return true;
      case 'walletconnect':
        return Boolean(this.providerType === 'walletconnect');
      default:
        return false;
    }
  }
}

export default new WalletProvider();

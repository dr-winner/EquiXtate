
import { ethers } from 'ethers';
import WalletProvider from './provider';
import { NetworkInfo } from './types';
import { NETWORK_NAMES } from '../constants';

class WalletNetwork {
  // Get network
  public async getNetwork(): Promise<NetworkInfo | null> {
    try {
      const provider = WalletProvider.getProvider();
      if (!provider) {
        return null;
      }
      
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Map chain ID to network name
      const name = NETWORK_NAMES[chainId] || "Unknown Network";
      
      return { name, chainId };
    } catch (error) {
      console.error("Error getting network:", error);
      return null;
    }
  }
  
  // Get account balance
  public async getBalance(): Promise<string> {
    try {
      const provider = WalletProvider.getProvider();
      const walletAddress = WalletProvider.getWalletAddress();
      
      if (!provider || !walletAddress) {
        return "0";
      }
      
      const balanceWei = await provider.getBalance(walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      return parseFloat(balanceEth).toFixed(4);
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  }
}

export default new WalletNetwork();

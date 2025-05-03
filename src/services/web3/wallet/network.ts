import { ethers } from 'ethers';
import WalletProvider from './provider';
import { NetworkInfo } from './types';
import { NETWORK_NAMES, SONIC_LABS_CONFIG } from '../constants';

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
  
  // Switch to Sonic Labs Testnet
  public async switchToSonicLabsTestnet(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error("Web3 provider not found");
      }

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${SONIC_LABS_CONFIG.CHAIN_ID.toString(16)}`,
          chainName: 'Sonic Labs Testnet',
          nativeCurrency: {
            name: SONIC_LABS_CONFIG.NATIVE_TOKEN,
            symbol: SONIC_LABS_CONFIG.NATIVE_TOKEN,
            decimals: SONIC_LABS_CONFIG.NATIVE_TOKEN_DECIMALS
          },
          rpcUrls: [SONIC_LABS_CONFIG.RPC_URL],
          blockExplorerUrls: [SONIC_LABS_CONFIG.EXPLORER_URL]
        }]
      });

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SONIC_LABS_CONFIG.CHAIN_ID.toString(16)}` }]
      });

      return true;
    } catch (error) {
      console.error("Error switching to Sonic Labs Testnet:", error);
      return false;
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

  // Get gas settings for Sonic Labs Testnet
  public getGasSettings() {
    return SONIC_LABS_CONFIG.GAS_SETTINGS;
  }
}

export default new WalletNetwork();

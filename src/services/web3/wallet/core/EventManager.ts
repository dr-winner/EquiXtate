
import WalletProvider from '../provider';
import WalletConnector from './WalletConnector';
import ConnectionManager from './ConnectionManager';
import { toast } from "@/components/ui/use-toast";

// Set up event listeners for wallet events with improved error handling
export function handleWalletEvents(): void {
  if (window.ethereum) {
    console.log("Setting up wallet event listeners");
    // Remove any existing listeners before adding new ones
    removeWalletEventListeners();
    
    try {
      // Add listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
      window.ethereum.on('connect', handleConnect);
      console.log("Wallet event listeners set up successfully");
    } catch (error) {
      console.error("Error setting up wallet event listeners:", error);
      // Continue execution - don't let event listener errors block the app
    }
  } else {
    console.log("No ethereum object available to set up event listeners");
  }
}

// Remove event listeners
export function removeWalletEventListeners(): void {
  if (window.ethereum) {
    console.log("Removing wallet event listeners");
    try {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
      window.ethereum.removeListener('connect', handleConnect);
    } catch (error) {
      console.error("Error removing wallet event listeners:", error);
      // Continue execution - don't let event listener errors block the app
    }
  }
}

// Handle account changes
function handleAccountsChanged(accounts: string[]): void {
  try {
    console.log("Accounts changed:", accounts);
    if (accounts.length === 0) {
      console.log("No accounts found after account change, disconnecting wallet");
      WalletConnector.disconnectWallet();
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been locked or disconnected.",
      });
    } else {
      console.log("New active account:", accounts[0]);
      // Update the wallet address
      WalletProvider.setProviderInfo({ address: accounts[0] });
      
      // Reinitialize with new account
      ConnectionManager.initialize(); 
      
      // Notify UI of account change
      const event = new CustomEvent('walletAccountChanged', { detail: accounts[0] });
      window.dispatchEvent(event);
      
      toast({
        title: "Account Changed",
        description: "Your active wallet account has changed.",
      });
    }
  } catch (error) {
    console.error("Error handling account change:", error);
    toast({
      variant: "destructive",
      title: "Account Change Error",
      description: "There was an error updating your account.",
    });
  }
}

// Handle chain changes
function handleChainChanged(chainId: string): void {
  try {
    console.log("Chain changed to:", chainId);
    // Update chainId in provider
    WalletProvider.updateNetworkInfo().then(networkInfo => {
      if (networkInfo) {
        console.log("Updated network info:", networkInfo);
        
        toast({
          title: "Network Changed",
          description: `Connected to ${networkInfo.name}`,
        });
        
        // Notify UI of chain change
        const event = new CustomEvent('walletChainChanged', { detail: networkInfo });
        window.dispatchEvent(event);
      }
    });
    
    // Only reload if absolutely necessary - this can be a jarring user experience
    // For now, just update the network info instead of forcing a page reload
    // window.location.reload();
  } catch (error) {
    console.error("Error handling chain change:", error);
    toast({
      variant: "destructive",
      title: "Network Change Error",
      description: "There was an error updating the network.",
    });
  }
}

// Handle connect event
function handleConnect(connectInfo: { chainId: string }): void {
  try {
    console.log("Wallet connect event:", connectInfo);
    // This event is fired when the provider is first able to submit RPC requests to a chain
    toast({
      title: "Wallet Connected",
      description: "Your wallet is now connected to the network.",
    });
  } catch (error) {
    console.error("Error handling connect event:", error);
  }
}

// Handle disconnect
function handleDisconnect(error: any): void {
  try {
    console.log("Wallet disconnect event:", error);
    WalletConnector.disconnectWallet();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected from this site.",
    });
  } catch (err) {
    console.error("Error handling disconnect:", err);
    toast({
      variant: "destructive",
      title: "Disconnect Error",
      description: "There was an error disconnecting your wallet.",
    });
  }
}


import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { useWalletEvents } from './hooks/useWalletEvents';
import { useWalletConnector } from './hooks/useWalletConnector';
import { useInitialConnection } from './hooks/useInitialConnection';
import { formatAddress, getNetworkName as getNetworkNameUtil } from './utils/walletUtils';
import { ConnectionStatus } from './types';
import { UseWalletConnectionReturn } from './types/wallet-types';

export const useWalletConnection = (): UseWalletConnectionReturn => {
  const [walletStatus, setWalletStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [chainId, setChainId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);

  // Initialize wallet event handlers
  const { handleDisconnect } = useWalletEvents(
    setWalletStatus,
    setWalletAddress,
    setBalance,
    setChainId,
    setSelectedWallet
  );

  // Fetch wallet info (balance, network, etc.)
  const fetchWalletInfo = async () => {
    try {
      if (walletAddress && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(walletAddress);
        const network = await provider.getNetwork();
        
        setBalance((Number(balance) / 1e18).toFixed(4));
        setChainId(network.chainId.toString());
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
    }
  };

  // Initialize wallet connection methods
  const { walletOptions, handleConnectWallet, handleDisconnectWallet } = useWalletConnector({
    walletConnected: walletStatus === ConnectionStatus.CONNECTED,
    setWalletStatus,
    setWalletAddress,
    setIsAuthenticated,
    setIsLoading,
    setConnectionAttempts: (callback: (prev: number) => number) => {
      setConnectionAttempts(callback);
    },
    fetchWalletInfo,
    setShowDropdown
  });

  // Check initial connection
  useInitialConnection(
    setWalletStatus,
    setWalletAddress,
    setChainId,
    setSelectedWallet
  );

  const getNetworkName = () => getNetworkNameUtil(chainId);

  return {
    walletStatus,
    walletAddress,
    showDropdown,
    setShowDropdown,
    selectedWallet,
    balance,
    chainId,
    walletOptions,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnectWallet,
    formatAddress,
    getNetworkName
  };
};

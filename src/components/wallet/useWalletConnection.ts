
import { useState } from 'react';
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

  // Initialize wallet event handlers
  const { handleDisconnect } = useWalletEvents(
    setWalletStatus,
    setWalletAddress,
    setBalance,
    setChainId,
    setSelectedWallet
  );

  // Initialize wallet connection methods
  const { walletOptions, handleConnectWallet, handleDisconnectWallet } = useWalletConnector({
    walletConnected: walletStatus === ConnectionStatus.CONNECTED,
    setWalletStatus,
    setWalletAddress,
    setIsAuthenticated: () => {}, // Placeholder - will be implemented in parent component
    setIsLoading: () => {}, // Placeholder - will be implemented in parent component
    setConnectionAttempts: () => 0, // Placeholder
    fetchWalletInfo: async () => {}, // Placeholder - will be implemented in parent component
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


import { useWallet } from '@/hooks/useWallet';

/**
 * Wallet state hook for marketplace components
 * This is a wrapper around the unified useWallet hook for backward compatibility
 */
export const useWalletState = () => {
  const { 
    isConnected, 
    connectWallet: connect,
    disconnectWallet: disconnect,
    address,
    balance,
    isLoading 
  } = useWallet();
  
  const connectWallet = async () => {
    await connect();
  };
  
  const disconnectWallet = async () => {
    await disconnect();
  };
  
  return {
    walletConnected: isConnected,
    walletAddress: address,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
  };
};

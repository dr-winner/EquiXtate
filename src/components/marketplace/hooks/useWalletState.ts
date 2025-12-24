
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from "@/components/ui/use-toast";

export const useWalletState = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const connectWallet = async () => {
    // With RainbowKit, connection is handled by the ConnectButton
    // This function is kept for backward compatibility but does nothing
    toast({
      title: "Wallet Connection",
      description: "Please use the Connect button in the navigation bar.",
    });
  };
  
  const disconnectWallet = () => {
    disconnect();
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return {
    walletConnected: isConnected,
    connectWallet,
    disconnectWallet
  };
};

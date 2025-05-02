
import React from 'react';
import { Wallet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from './types';

interface WalletStatusProps {
  walletStatus: ConnectionStatus;
  walletAddress: string;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  formatAddress: (address: string) => string;
  onClick?: () => void; // Make onClick optional
}

const WalletStatus: React.FC<WalletStatusProps> = ({
  walletStatus,
  walletAddress,
  showDropdown,
  setShowDropdown,
  formatAddress,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  switch (walletStatus) {
    case ConnectionStatus.DISCONNECTED:
      return (
        <Button 
          variant="outline" 
          className="border border-space-neon-blue text-space-neon-blue hover:bg-space-neon-blue/10 hover:text-white transition-all duration-300 group"
          onClick={handleClick}
        >
          <Wallet className="mr-2 h-4 w-4 group-hover:animate-pulse" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </Button>
      );
      
    case ConnectionStatus.CONNECTING:
      return (
        <Button 
          variant="outline" 
          disabled
          className="border border-space-neon-purple text-space-neon-purple cursor-wait"
        >
          <span className="animate-pulse">Connecting...</span>
        </Button>
      );
      
    case ConnectionStatus.CONNECTED:
      return (
        <Button 
          variant="outline" 
          className="border border-space-neon-green text-space-neon-green hover:bg-space-neon-green/10 hover:text-white transition-all duration-300 group flex items-center"
          onClick={handleClick}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
        </Button>
      );
      
    case ConnectionStatus.ERROR:
      return (
        <Button 
          variant="outline" 
          className="border border-red-500 text-red-500 hover:bg-red-500/10 hover:text-white transition-all duration-300 group"
          onClick={handleClick}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Connection Failed</span>
        </Button>
      );
      
    default:
      return null;
  }
};

export default WalletStatus;

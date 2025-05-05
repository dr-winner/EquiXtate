
import React from 'react';
import { Wallet, CheckCircle, AlertCircle, Shield, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from './types';
import { motion } from 'framer-motion';

interface WalletStatusProps {
  walletStatus: ConnectionStatus;
  walletAddress: string;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  formatAddress: (address: string) => string;
  onClick?: () => void;
  isAuthenticated?: boolean;
  className?: string;
}

const WalletStatus: React.FC<WalletStatusProps> = ({
  walletStatus,
  walletAddress,
  showDropdown,
  setShowDropdown,
  formatAddress,
  onClick,
  isAuthenticated = false,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const baseClasses = `border transition-all duration-300 group flex items-center gap-2 ${className}`;

  switch (walletStatus) {
    case ConnectionStatus.DISCONNECTED:
      return (
        <Button 
          variant="outline" 
          className={`${baseClasses} border-space-neon-blue text-space-neon-blue hover:bg-space-neon-blue/10 hover:text-white`}
          onClick={handleClick}
          aria-label="Connect Wallet"
          data-testid="connect-wallet-button"
        >
          <motion.span 
            animate={{ rotate: showDropdown ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Wallet className="h-4 w-4 group-hover:animate-pulse" />
          </motion.span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </Button>
      );
      
    case ConnectionStatus.CONNECTING:
      return (
        <Button 
          variant="outline" 
          disabled
          className={`${baseClasses} border-space-neon-purple text-space-neon-purple cursor-wait`}
          aria-label="Connecting to wallet"
          data-testid="connecting-wallet-button"
        >
          <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
            <Wallet className="h-4 w-4" />
          </motion.span>
          <span className="hidden sm:inline animate-pulse">Connecting...</span>
        </Button>
      );
      
    case ConnectionStatus.CONNECTED:
      return (
        <Button 
          variant="outline" 
          className={`${baseClasses} ${isAuthenticated ? 'border-space-neon-green text-space-neon-green' : 'border-space-neon-purple text-space-neon-purple'} 
            hover:bg-space-neon-green/10 hover:text-white`}
          onClick={handleClick}
          aria-label={isAuthenticated ? "Authenticated user menu" : "Connected wallet menu"}
          data-testid="connected-wallet-button"
        >
          {isAuthenticated ? (
            <User className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
          <motion.span 
            animate={{ rotate: showDropdown ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs"
          >
            ▼
          </motion.span>
        </Button>
      );
      
    case ConnectionStatus.ERROR:
      return (
        <Button 
          variant="outline" 
          className={`${baseClasses} border-red-500 text-red-500 hover:bg-red-500/10 hover:text-white`}
          onClick={handleClick}
          aria-label="Wallet connection error"
          data-testid="wallet-error-button"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Connection Failed</span>
        </Button>
      );
      
    default:
      return null;
  }
};

export default WalletStatus;

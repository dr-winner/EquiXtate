
import React from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from './types';
import WalletOptions from './WalletOptions';
import WalletDetails from './WalletDetails';

interface WalletDropdownProps {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  walletStatus: ConnectionStatus;
  walletAddress: string;
  balance: string;
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  getNetworkName: () => string;
  walletOptions: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  isMobile?: boolean;
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({
  showDropdown,
  setShowDropdown,
  walletStatus,
  walletAddress,
  balance,
  connectWallet,
  disconnectWallet,
  getNetworkName,
  walletOptions,
  isMobile = false
}) => {
  if (!showDropdown) {
    return null;
  }

  // Position dropdown based on device type
  const positionClass = isMobile 
    ? "fixed left-4 right-4 top-20 z-50" 
    : "absolute right-0 mt-2 w-64 z-50";

  return (
    <div className={`${positionClass} rounded-lg glassmorphism neon-border-purple p-3 animate-fade-in`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-orbitron">
          {walletStatus === ConnectionStatus.CONNECTED ? 'Wallet Options' : 'Select Wallet'}
        </h3>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-6 w-6 rounded-full text-gray-400 hover:text-white"
          onClick={() => setShowDropdown(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {walletStatus === ConnectionStatus.CONNECTED ? (
        <WalletDetails 
          walletAddress={walletAddress}
          balance={balance}
          getNetworkName={getNetworkName}
          disconnectWallet={disconnectWallet}
        />
      ) : (
        <WalletOptions walletOptions={walletOptions} connectWallet={connectWallet} />
      )}
    </div>
  );
};

export default WalletDropdown;

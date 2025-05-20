
import React from 'react';
import { ConnectionStatus } from './types';
import WalletConnectOptions from './WalletConnectOptions';
import WalletMenuItems from './WalletMenuItems';
import WalletDetails from './WalletDetails';
import { useWalletDetection } from './hooks/useWalletDetection';

interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode | string;
  mobileSupported?: boolean;
  description?: string;
}

interface WalletDropdownProps {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  walletStatus: ConnectionStatus;
  walletAddress: string;
  balance: string;
  connectWallet: (walletId: string) => void;
  disconnectWallet: () => void;
  getNetworkName: () => string;
  walletOptions: WalletOption[];
  isAuthenticated?: boolean;
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
  isAuthenticated = false
}) => {
  const { isMobile } = useWalletDetection();
  
  if (!showDropdown) {
    return null;
  }

  const handleBackdropClick = () => {
    setShowDropdown(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={handleBackdropClick}></div>
      <div className="absolute right-0 mt-2 w-72 glassmorphism rounded-lg border border-space-neon-blue/30 z-20">
        <div className="p-4">
          {walletStatus === ConnectionStatus.DISCONNECTED ? (
            <WalletConnectOptions 
              walletOptions={walletOptions} 
              connectWallet={connectWallet}
              isMobile={isMobile}
            />
          ) : (
            <>
              <WalletDetails 
                walletAddress={walletAddress}
                balance={balance}
                getNetworkName={getNetworkName}
                isAuthenticated={isAuthenticated}
              />
              
              <WalletMenuItems 
                setShowDropdown={setShowDropdown}
                disconnectWallet={disconnectWallet}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletDropdown;

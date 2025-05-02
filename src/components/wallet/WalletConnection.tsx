
import React from 'react';
import { useWalletConnection } from './useWalletConnection';
import WalletStatus from './WalletStatus';
import WalletDropdown from './WalletDropdown';

const WalletConnection: React.FC = () => {
  const {
    walletStatus,
    walletAddress,
    showDropdown,
    setShowDropdown,
    balance,
    walletOptions,
    connectWallet,
    disconnectWallet,
    formatAddress,
    getNetworkName
  } = useWalletConnection();

  const handleStatusClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      <WalletStatus 
        walletStatus={walletStatus}
        walletAddress={walletAddress}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        formatAddress={formatAddress}
        onClick={handleStatusClick}
      />
      
      <WalletDropdown 
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        walletStatus={walletStatus}
        walletAddress={walletAddress}
        balance={balance}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        getNetworkName={getNetworkName}
        walletOptions={walletOptions}
      />
    </div>
  );
};

export default WalletConnection;

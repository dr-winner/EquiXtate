
import React, { useRef } from 'react';
import { useWalletState } from '@/components/marketplace/hooks/useWalletState';
import WalletStatus from './WalletStatus';
import WalletDropdown from './WalletDropdown';
import AuthenticationModal from '../auth/AuthenticationModal';
import { useAuthenticationModal } from '@/hooks/use-authentication-modal';
import { ConnectionStatus } from './types';
import { useWalletConnectionState } from './hooks/useWalletConnectionState';
import { useWalletConnector } from './hooks/useWalletConnector';
import { useWalletEventHandler } from './hooks/useWalletEventHandler';
import { useClickOutside } from './hooks/useClickOutside';

const WalletConnection: React.FC = () => {
  const { walletConnected } = useWalletState();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isOpen: isAuthModalOpen, openModal: openAuthModal, closeModal: closeAuthModal } = useAuthenticationModal();
  
  // Get wallet state from custom hook
  const {
    walletStatus,
    setWalletStatus,
    walletAddress,
    setWalletAddress,
    balance,
    setBalance,
    showDropdown,
    setShowDropdown,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    connectionAttempts,
    setConnectionAttempts,
    fetchWalletInfo,
    formatAddress,
    getNetworkName
  } = useWalletConnectionState();
  
  // Get wallet connector methods
  const {
    walletOptions,
    handleConnectWallet,
    handleDisconnectWallet,
    handleAuthSuccess
  } = useWalletConnector({
    walletConnected,
    setWalletStatus,
    setWalletAddress,
    setIsAuthenticated,
    setIsLoading,
    setConnectionAttempts,
    fetchWalletInfo,
    setShowDropdown
  });
  
  // Set up wallet event handlers
  useWalletEventHandler(walletConnected, fetchWalletInfo, handleDisconnectWallet);
  
  // Set up click outside handler
  useClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleStatusClick = () => {
    if (!walletConnected) {
      // If not connected, show wallet connection options
      setShowDropdown(!showDropdown);
    } else if (!isAuthenticated) {
      // If wallet is connected but user not authenticated, prompt for KYC
      openAuthModal();
    } else {
      // If both connected and authenticated, toggle dropdown 
      setShowDropdown(!showDropdown);
    }
  };

  // Determine wallet status based on loading and connection state
  const currentWalletStatus = isLoading ? ConnectionStatus.CONNECTING : 
                       walletConnected ? ConnectionStatus.CONNECTED : 
                       ConnectionStatus.DISCONNECTED;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <WalletStatus 
          walletStatus={currentWalletStatus}
          walletAddress={walletAddress}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          formatAddress={formatAddress}
          onClick={handleStatusClick}
          isAuthenticated={isAuthenticated}
        />
        
        <WalletDropdown 
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          walletStatus={currentWalletStatus}
          walletAddress={walletAddress}
          balance={balance}
          connectWallet={handleConnectWallet}
          disconnectWallet={handleDisconnectWallet}
          getNetworkName={getNetworkName}
          walletOptions={walletOptions}
          isAuthenticated={isAuthenticated}
        />
      </div>
      
      <AuthenticationModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default WalletConnection;

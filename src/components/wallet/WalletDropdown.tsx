
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Calculate position based on button location
  useEffect(() => {
    if (showDropdown) {
      const button = document.querySelector('[data-testid="connected-wallet-button"], [data-testid="connect-wallet-button"]') as HTMLElement;
      if (button) {
        const rect = button.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        });
      } else {
        // Fallback position
        setPosition({
          top: 80,
          right: 16
        });
      }
    }
  }, [showDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown, setShowDropdown]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      setShowDropdown(false);
    }
  };

  if (!showDropdown) {
    return null;
  }

  const dropdownContent = (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className="fixed z-[101] w-80 max-w-[calc(100vw-2rem)] glassmorphism rounded-xl border border-space-neon-blue/30 shadow-2xl bg-space-deep-purple/95 backdrop-blur-md overflow-hidden"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Wallet menu"
      >
        <div className="p-5 max-h-[80vh] overflow-y-auto">
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
              
              <div className="border-t border-space-neon-blue/20 my-4" />
              
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

  // Render to portal for proper z-index stacking
  return createPortal(dropdownContent, document.body);
};

export default WalletDropdown;

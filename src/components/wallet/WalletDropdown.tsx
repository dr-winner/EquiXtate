
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Shield } from 'lucide-react';
import { ConnectionStatus } from './types';
import WalletConnectOptions from './WalletConnectOptions';
import WalletMenuItems from './WalletMenuItems';
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
  const [shouldRender, setShouldRender] = useState(false);

  // Force remove backdrop and dropdown from DOM
  const forceRemove = useCallback(() => {
    // Remove backdrop immediately via direct DOM manipulation
    if (backdropRef.current) {
      backdropRef.current.style.display = 'none';
      backdropRef.current.style.visibility = 'hidden';
      backdropRef.current.style.opacity = '0';
      backdropRef.current.style.pointerEvents = 'none';
    }
    
    // Remove dropdown immediately
    if (dropdownRef.current) {
      dropdownRef.current.style.display = 'none';
      dropdownRef.current.style.visibility = 'hidden';
      dropdownRef.current.style.opacity = '0';
      dropdownRef.current.style.pointerEvents = 'none';
    }
    
    // Also try to remove any backdrop elements that might be lingering in the DOM
    // This is a safety net for any elements that might have been orphaned
    requestAnimationFrame(() => {
      const lingeringBackdrops = document.querySelectorAll('[data-wallet-dropdown-backdrop]');
      lingeringBackdrops.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.opacity = '0';
        htmlEl.style.pointerEvents = 'none';
      });
    });
    
    setShouldRender(false);
    setShowDropdown(false);
  }, [setShowDropdown]);

  // Calculate position based on button location
  useEffect(() => {
    if (showDropdown && shouldRender) {
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
  }, [showDropdown, shouldRender]);

  // Sync shouldRender with showDropdown prop
  useEffect(() => {
    if (showDropdown) {
      setShouldRender(true);
    } else {
      // Delay removal slightly to allow animations, but ensure it happens
      const timer = setTimeout(() => {
        setShouldRender(false);
        forceRemove();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showDropdown, forceRemove]);

  // CRITICAL: Immediately close and remove when wallet disconnects
  useEffect(() => {
    if (walletStatus === ConnectionStatus.DISCONNECTED) {
      // Force immediate removal - no delays, use requestAnimationFrame for immediate DOM update
      requestAnimationFrame(() => {
        forceRemove();
      });
    }
  }, [walletStatus, forceRemove]);

  // Close dropdown on escape key
  useEffect(() => {
    if (!shouldRender) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown, setShowDropdown, shouldRender]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      setShowDropdown(false);
    }
  }, [setShowDropdown]);

  // Listen for wallet disconnect events globally
  useEffect(() => {
    const handleWalletDisconnect = () => {
      console.log("Wallet disconnect event received, forcing dropdown removal");
      forceRemove();
    };
    
    window.addEventListener('walletDisconnected', handleWalletDisconnect);
    
    return () => {
      window.removeEventListener('walletDisconnected', handleWalletDisconnect);
      forceRemove();
    };
  }, [forceRemove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceRemove();
    };
  }, [forceRemove]);

  // Don't render if not visible
  if (!showDropdown || !shouldRender) {
    return null;
  }

  const dropdownContent = (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        data-wallet-dropdown-backdrop
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-150"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className="fixed z-[101] w-80 max-w-[calc(100vw-2rem)] glassmorphism rounded-xl border border-space-neon-blue/30 shadow-2xl bg-space-deep-purple/95 backdrop-blur-md overflow-hidden transition-opacity duration-150"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
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
              {/* Profile Header with Wallet Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-white text-lg">Profile</h3>
                  {isAuthenticated && (
                    <div className="flex items-center px-2 py-1 bg-space-neon-green/20 text-space-neon-green rounded-full text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                
                {/* Wallet Address */}
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                  <p className="text-white font-mono text-sm bg-space-deep-purple/30 p-2 rounded">{walletAddress}</p>
                </div>
                
                {/* Balance and Network */}
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-400">Balance</p>
                    <p className="text-white">{balance} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Network</p>
                    <p className="text-white">{getNetworkName()}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-space-neon-blue/20 my-4" />
              
              {/* Profile Menu Items */}
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

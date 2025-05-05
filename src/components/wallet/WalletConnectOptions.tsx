
import React from 'react';
import { WalletIcon, SmartphoneNfc, Smartphone } from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode | string;
  mobileSupported?: boolean;
  description?: string;
}

interface WalletConnectOptionsProps {
  walletOptions: WalletOption[];
  connectWallet: (walletId: string) => void;
  isMobile: boolean;
}

const WalletConnectOptions: React.FC<WalletConnectOptionsProps> = ({
  walletOptions,
  connectWallet,
  isMobile
}) => {
  return (
    <>
      <h3 className="font-orbitron text-white mb-3">Connect Wallet</h3>
      <p className="text-sm text-gray-400 mb-4">Select a wallet provider to continue</p>
      <div className="space-y-2">
        {walletOptions
          .filter(option => !isMobile || option.mobileSupported !== false)
          .map((option) => (
            <button
              key={option.id}
              className="w-full py-3 px-4 flex items-center justify-between bg-space-deep-purple/30 rounded-lg hover:bg-space-deep-purple/50 transition-colors"
              onClick={() => connectWallet(option.id)}
            >
              <div className="flex items-center">
                <div className="mr-3 text-xl">
                  {typeof option.icon === 'string' ? option.icon : option.icon}
                </div>
                <div>
                  <span className="text-white">{option.name}</span>
                  {option.description && (
                    <p className="text-xs text-gray-400">{option.description}</p>
                  )}
                </div>
              </div>
              {option.mobileSupported && isMobile && (
                <Smartphone className="h-4 w-4 text-space-neon-blue" />
              )}
            </button>
          ))}
      </div>
    </>
  );
};

export default WalletConnectOptions;

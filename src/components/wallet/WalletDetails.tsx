
import React from 'react';
import { Shield } from 'lucide-react';

interface WalletDetailsProps {
  walletAddress: string;
  balance: string;
  getNetworkName: () => string;
  isAuthenticated?: boolean;
}

const WalletDetails: React.FC<WalletDetailsProps> = ({
  walletAddress,
  balance,
  getNetworkName,
  isAuthenticated = false
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron text-white">Wallet Details</h3>
        {isAuthenticated && (
          <div className="flex items-center px-2 py-1 bg-space-neon-green/20 text-space-neon-green rounded-full text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </div>
        )}
      </div>
      
      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-400">Address</p>
        <p className="text-white font-mono text-sm bg-space-deep-purple/30 p-2 rounded">{walletAddress}</p>
      </div>
      
      <div className="flex justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400">Balance</p>
          <p className="text-white">{balance} ETH</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Network</p>
          <p className="text-white">{getNetworkName()}</p>
        </div>
      </div>
    </>
  );
};

export default WalletDetails;

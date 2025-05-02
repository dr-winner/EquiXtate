
import React from 'react';
import { Button } from "@/components/ui/button";

interface WalletDetailsProps {
  walletAddress: string;
  balance: string;
  getNetworkName: () => string;
  disconnectWallet: () => void;
}

const WalletDetails: React.FC<WalletDetailsProps> = ({
  walletAddress,
  balance,
  getNetworkName,
  disconnectWallet
}) => {
  return (
    <div className="space-y-2">
      <div className="p-3 border border-space-deep-purple rounded-md bg-space-deep-purple/30">
        <p className="text-gray-300 text-xs">Connected Address</p>
        <p className="text-space-neon-green font-mono text-sm break-all">{walletAddress}</p>
        
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-300 text-xs">Balance</p>
            <p className="text-space-neon-blue font-mono text-sm">{balance} ETH</p>
          </div>
          <div>
            <p className="text-gray-300 text-xs">Network</p>
            <p className="text-space-neon-purple font-mono text-sm">
              {getNetworkName()}
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-space-neon-purple to-red-500 hover:opacity-90"
        onClick={disconnectWallet}
      >
        Disconnect Wallet
      </Button>
    </div>
  );
};

export default WalletDetails;

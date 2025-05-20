
import React from 'react';
import { Button } from "@/components/ui/button";

interface WalletOptionsProps {
  walletOptions: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  connectWallet: (walletId: string) => Promise<void>;
}

const WalletOptions: React.FC<WalletOptionsProps> = ({
  walletOptions,
  connectWallet
}) => {
  return (
    <div className="space-y-2">
      {walletOptions.map((wallet) => (
        <Button
          key={wallet.id}
          variant="outline"
          className="w-full justify-start border border-space-neon-blue/30 hover:border-space-neon-blue hover:bg-space-deep-purple/30"
          onClick={() => connectWallet(wallet.id)}
        >
          <span className="mr-2">{wallet.icon}</span>
          {wallet.name}
        </Button>
      ))}
    </div>
  );
};

export default WalletOptions;

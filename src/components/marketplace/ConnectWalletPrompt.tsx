
import React from 'react';
import { Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ConnectWalletPromptProps {
  onConnect: () => Promise<void>;
}

const ConnectWalletPrompt: React.FC<ConnectWalletPromptProps> = ({ onConnect }) => {
  return (
    <div className="mt-12 text-center">
      <Button 
        className="cosmic-btn py-6"
        onClick={onConnect}
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect Wallet to View Your Properties
      </Button>
    </div>
  );
};

export default ConnectWalletPrompt;

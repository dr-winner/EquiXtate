
import React, { useState, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const WalletConnection: React.FC = () => {
  const {
    isReady,
    isConnected,
    isAuthenticated,
    isLoading,
    address,
    balance,
    network,
    connectWallet,
    disconnectWallet,
    formatAddress,
  } = useWallet();
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  // Open block explorer
  const handleViewOnExplorer = () => {
    if (address) {
      const explorerUrl = `https://etherscan.io/address/${address}`;
      window.open(explorerUrl, '_blank');
    }
  };
  
  if (!isReady) {
    return (
      <Button variant="outline" disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }
  
  if (!isConnected) {
    return (
      <Button 
        onClick={connectWallet}
        disabled={isLoading}
        className="bg-space-neon-purple hover:bg-space-neon-purple/90"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }
  
  return (
    <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">{formatAddress(address)}</span>
            <span className="text-xs text-muted-foreground">{balance} ETH</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatAddress(address)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Network: {network}
          </p>
          <p className="text-sm font-semibold mt-2">
            {balance} ETH
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleViewOnExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnectWallet}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletConnection;

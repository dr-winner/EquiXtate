
import React from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useWalletState } from '@/components/marketplace/hooks/useWalletState';
import WalletStatus from './WalletStatus';
import WalletDropdown from './WalletDropdown';
import { ConnectionStatus } from './types';

const WalletConnection: React.FC = () => {
  const { walletConnected, connectWallet, disconnectWallet } = useWalletState();
  const [showDropdown, setShowDropdown] = React.useState<boolean>(false);
  const [walletAddress, setWalletAddress] = React.useState<string>('');
  const [balance, setBalance] = React.useState<string>('0');
  const navigate = useNavigate();
  
  // Get wallet address and network information
  React.useEffect(() => {
    const getWalletInfo = async () => {
      if (walletConnected && window.ethereum) {
        try {
          const address = await window.ethereum.request({ method: 'eth_accounts' });
          if (address && address.length > 0) {
            setWalletAddress(address[0]);
            
            // Get balance
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balanceWei = await provider.getBalance(address[0]);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(parseFloat(balanceEth).toFixed(4));
          }
        } catch (error) {
          console.error("Error fetching wallet info:", error);
        }
      }
    };

    getWalletInfo();
  }, [walletConnected]);

  const handleStatusClick = () => {
    setShowDropdown(!showDropdown);
  };

  const walletStatus = walletConnected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED;

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNetworkName = () => {
    // Default to Ethereum Mainnet if unknown
    return 'Ethereum';
  };

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗'
    }
  ];

  const handleConnectWallet = async (walletId: string) => {
    await connectWallet();
    setShowDropdown(false);
    
    // If on profile page, refresh the page to ensure data is loaded with the new wallet
    if (window.location.pathname === '/profile') {
      // Short delay to allow connection to complete
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setShowDropdown(false);
    
    // If on profile page, redirect to home after wallet disconnect
    if (window.location.pathname === '/profile') {
      navigate('/');
    }
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
        connectWallet={handleConnectWallet}
        disconnectWallet={handleDisconnectWallet}
        getNetworkName={getNetworkName}
        walletOptions={walletOptions}
      />
    </div>
  );
};

export default WalletConnection;


export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const getNetworkName = (chainId: string | null): string => {
  if (!chainId) return "Unknown";
  
  // Convert hex chainId to decimal if needed
  const chainIdDecimal = chainId.startsWith('0x') ? parseInt(chainId, 16) : parseInt(chainId);
  
  switch (chainIdDecimal) {
    case 1: return "Ethereum Mainnet";
    case 5: return "Goerli Testnet";
    case 11155111: return "Sepolia Testnet";
    case 137: return "Polygon Mainnet";
    case 80001: return "Mumbai Testnet";
    case 56: return "BSC Mainnet";
    case 97: return "BSC Testnet";
    default: return `Chain ID: ${chainIdDecimal}`;
  }
};

export const getWalletOptions = () => [
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '💰' },
  { id: 'phantom', name: 'Phantom', icon: '👻' }
];

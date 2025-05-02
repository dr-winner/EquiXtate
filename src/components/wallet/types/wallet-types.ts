
import { ConnectionStatus } from '../types';

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

export interface UseWalletConnectionReturn {
  walletStatus: ConnectionStatus;
  walletAddress: string;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  selectedWallet: string | null;
  balance: string;
  chainId: string | null;
  walletOptions: WalletOption[];
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  formatAddress: (address: string) => string;
  getNetworkName: () => string;
}

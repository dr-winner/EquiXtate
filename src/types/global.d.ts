
// Type definitions for Ethereum provider
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    providers?: Array<{
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      [key: string]: any;
    }>;
    request: (request: { method: string; params?: Array<any> }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
    _metamask?: {
      isUnlocked?: boolean;
    };
  };
}


import { ethers } from 'ethers';

export interface WalletProviderInfo {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  networkInfo?: NetworkInfo | null;
  providerType?: string | null;
}

export interface NetworkInfo {
  name: string;
  chainId: number | string;
}

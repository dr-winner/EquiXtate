
import { ethers } from 'ethers';
import { WalletProviderInfo } from './types';

class WalletProvider {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private walletAddress: string | null = null;
  
  public getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
  
  public getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }
  
  public getWalletAddress(): string | null {
    return this.walletAddress;
  }
  
  public setProviderInfo(info: Partial<WalletProviderInfo>): void {
    if (info.provider !== undefined) this.provider = info.provider;
    if (info.signer !== undefined) this.signer = info.signer;
    if (info.address !== undefined) this.walletAddress = info.address;
  }
  
  public resetProviderInfo(): void {
    this.provider = null;
    this.signer = null;
    this.walletAddress = null;
  }
  
  public isWeb3Available(): boolean {
    return window.ethereum !== undefined;
  }
}

export default new WalletProvider();

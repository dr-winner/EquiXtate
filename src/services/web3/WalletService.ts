
import WalletProvider from './wallet/provider';
import WalletConnection from './wallet/connection';
import WalletNetwork from './wallet/network';

class WalletService {
  // Provider methods
  public getProvider = WalletProvider.getProvider.bind(WalletProvider);
  public getSigner = WalletProvider.getSigner.bind(WalletProvider);
  public getWalletAddress = WalletProvider.getWalletAddress.bind(WalletProvider);
  public isWeb3Available = WalletProvider.isWeb3Available.bind(WalletProvider);
  
  // Connection methods
  public initialize = WalletConnection.initialize.bind(WalletConnection);
  public connectWallet = WalletConnection.connectWallet.bind(WalletConnection);
  public disconnectWallet = WalletConnection.disconnectWallet.bind(WalletConnection);
  public isWalletConnected = WalletConnection.isWalletConnected.bind(WalletConnection);
  
  // Network methods
  public getNetwork = WalletNetwork.getNetwork.bind(WalletNetwork);
  public getBalance = WalletNetwork.getBalance.bind(WalletNetwork);
}

export default new WalletService();

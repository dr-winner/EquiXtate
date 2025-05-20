
import ConnectionManager from './core/ConnectionManager';
import WalletConnector from './core/WalletConnector';
import { handleWalletEvents, removeWalletEventListeners } from './core/EventManager';

class WalletConnection {
  // Initialize wallet connection
  public initialize = ConnectionManager.initialize.bind(ConnectionManager);
  
  // Connect wallet with improved mobile and multi-wallet support
  public connectWallet = WalletConnector.connectWallet.bind(WalletConnector);
  
  // Disconnect wallet
  public disconnectWallet = WalletConnector.disconnectWallet.bind(WalletConnector);
  
  // Set up event listeners for wallet events with improved error handling
  public setupEventListeners = handleWalletEvents;
  
  // Remove event listeners
  public removeEventListeners = removeWalletEventListeners;
  
  // Try to silently connect wallet without user interaction
  public trySilentConnect = ConnectionManager.trySilentConnect.bind(ConnectionManager);
  
  // Check if wallet is connected with improved reliability
  public isWalletConnected = ConnectionManager.isWalletConnected.bind(ConnectionManager);
}

export default new WalletConnection();


import WalletService from './web3/WalletService';

// List of admin wallet addresses
const ADMIN_ADDRESSES: string[] = [
  "0x9CA25259DAde7Bce58e5294A8F08CAA69fD59f6D",
  // Add more admin addresses here as needed
];

class AdminService {
  /**
   * Check if a wallet address has admin access
   * @param address Wallet address to check
   * @returns Boolean indicating if the address has admin access
   */
  public isAdminAddress(address: string): boolean {
    if (!address) return false;
    
    return ADMIN_ADDRESSES.some(
      adminAddress => adminAddress.toLowerCase() === address.toLowerCase()
    );
  }

  /**
   * Check if the currently connected wallet has admin access
   * @returns Promise resolving to boolean indicating admin status
   */
  public async checkAdminAccess(): Promise<boolean> {
    try {
      const isWalletConnected = await WalletService.isWalletConnected();
      
      if (!isWalletConnected) {
        return false;
      }
      
      const walletAddress = await WalletService.getWalletAddress();
      
      if (!walletAddress) {
        return false;
      }
      
      return this.isAdminAddress(walletAddress);
    } catch (error) {
      console.error("Error checking admin access:", error);
      return false;
    }
  }

  /**
   * Add a new admin address
   * @param address New admin wallet address
   * @param currentUserAddress Current user's wallet address (must be an admin)
   * @returns Boolean indicating success
   */
  public async addAdmin(address: string, currentUserAddress: string): Promise<boolean> {
    // This would typically interact with a smart contract
    // For now, we'll just simulate this with a console message
    if (!this.isAdminAddress(currentUserAddress)) {
      console.error("Only existing admins can add new admins");
      return false;
    }
    
    console.log(`Added new admin: ${address}`);
    // In a real implementation, this would update the admin list in a database or smart contract
    return true;
  }
}

export default new AdminService();

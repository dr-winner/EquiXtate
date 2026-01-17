
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletService from './WalletService';
import ContractService from './ContractService';

// Demo mode flag - set to false when PropertyToken contract is deployed
const DEMO_MODE = true;

class PropertyTokenService {
  // Get property token balance
  public async getPropertyTokenBalance(propertyId: string): Promise<number> {
    try {
      // In demo mode, return a mock balance
      if (DEMO_MODE) {
        const stored = localStorage.getItem(`equix_balance_${propertyId}`);
        return stored ? parseInt(stored, 10) : 0;
      }
      
      const contract = ContractService.getPropertyTokenContract();
      const walletAddress = WalletService.getWalletAddress();
      
      if (!contract || !walletAddress) {
        throw new Error("Property token contract not initialized or wallet not connected");
      }
      
      const balance = await contract.balanceOf(walletAddress, propertyId);
      return Number(balance);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return 0;
    }
  }
  
  // Buy property tokens
  public async buyPropertyTokens(propertyId: string, amount: number): Promise<boolean> {
    try {
      // In demo mode, simulate a successful purchase
      if (DEMO_MODE) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update local storage balance
        const currentBalance = await this.getPropertyTokenBalance(propertyId);
        localStorage.setItem(`equix_balance_${propertyId}`, String(currentBalance + amount));
        
        toast({
          title: "Demo Purchase Successful",
          description: `You have purchased ${amount} EquiX tokens of property #${propertyId}. Note: This is a demo transaction - no real tokens were transferred.`,
        });
        
        return true;
      }
      
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract || !WalletService.getSigner()) {
        throw new Error("Contract or wallet not initialized");
      }
      
      // Get property details to find the price per token
      const property = await contract.getProperty(propertyId);
      const pricePerToken = property.pricePerToken;
      const totalPrice = pricePerToken * BigInt(amount);
      
      // Execute purchase transaction using purchaseTokens
      const tx = await contract.purchaseTokens(propertyId, amount, {
        value: totalPrice
      });
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast({
        title: "Purchase Successful",
        description: `You have purchased ${amount} tokens of property #${propertyId}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error buying tokens:", error);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Failed to purchase property tokens",
      });
      return false;
    }
  }
  
  // Get available tokens for a property
  public async getAvailableTokens(propertyId: string): Promise<[number, number]> {
    try {
      // In demo mode, return mock data based on property data
      if (DEMO_MODE) {
        // Return default values - actual values come from property data
        return [1000, 1000];
      }
      
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Get property details which includes availableTokens and totalTokens
      const property = await contract.getProperty(propertyId);
      const available = property.availableTokens;
      const total = property.totalTokens;
      
      return [Number(available), Number(total)];
    } catch (error) {
      console.error("Error getting available tokens:", error);
      return [0, 0];
    }
  }
}

export default new PropertyTokenService();

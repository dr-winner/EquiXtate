
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletService from './WalletService';
import ContractService from './ContractService';

class PropertyTokenService {
  // Get property token balance
  public async getPropertyTokenBalance(propertyId: string): Promise<number> {
    try {
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
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract || !WalletService.getSigner()) {
        throw new Error("Contract or wallet not initialized");
      }
      
      // Get token price
      const tokenPrice = await contract.tokenPrice(propertyId);
      const totalPrice = tokenPrice * BigInt(amount);
      
      // Execute purchase transaction
      const tx = await contract.buyTokens(propertyId, amount, {
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
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      const available = await contract.availableTokens(propertyId);
      const total = await contract.totalSupply(propertyId);
      
      return [Number(available), Number(total)];
    } catch (error) {
      console.error("Error getting available tokens:", error);
      return [0, 0];
    }
  }
}

export default new PropertyTokenService();

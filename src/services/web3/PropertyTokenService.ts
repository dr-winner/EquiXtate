
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletService from './WalletService';
import ContractService from './ContractService';
import { parseWeb3Error } from '@/utils/web3Errors';
import { logger } from '@/utils/logger';

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
      logger.error("Error getting token balance", error, { propertyId });
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
      
      // Show pending toast
      const toastId = toast({
        title: "Transaction Pending",
        description: `Processing purchase of ${amount} tokens...`,
      }).id;
      
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
      
      logger.info('Token purchase completed', { propertyId, amount, txHash: tx.hash });
      return true;
    } catch (error: any) {
      const parsed = parseWeb3Error(error);
      logger.error("Error buying tokens", error, { propertyId, amount });
      
      toast({
        variant: "destructive",
        title: parsed.title,
        description: parsed.message,
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
      logger.error("Error getting available tokens", error, { propertyId });
      return [0, 0];
    }
  }
}

export default new PropertyTokenService();

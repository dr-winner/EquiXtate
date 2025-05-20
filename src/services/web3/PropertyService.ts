
import { ethers } from 'ethers';
import { toast } from "@/components/ui/use-toast";
import WalletService from './WalletService';
import ContractService from './ContractService';
import { PropertyDetails } from './types';
import { EQUIX_TOKEN_CONSTANTS } from './constants';

class PropertyService {
  // Get property details
  public async getPropertyDetails(propertyId: number): Promise<PropertyDetails | null> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      const property = await contract.getProperty(propertyId);
      
      return {
        id: Number(property.id),
        name: property.name,
        propertyType: property.propertyType,
        location: property.location,
        totalTokens: Number(ethers.formatUnits(property.totalTokens, EQUIX_TOKEN_CONSTANTS.DECIMALS)),
        availableTokens: Number(ethers.formatUnits(property.availableTokens, EQUIX_TOKEN_CONSTANTS.DECIMALS)),
        pricePerToken: Number(ethers.formatUnits(property.pricePerToken, 2)) / 100, // Convert cents to dollars
        owner: property.owner,
        isActive: property.isActive
      };
    } catch (error) {
      console.error("Error getting property details:", error);
      return null;
    }
  }
  
  // Buy property tokens
  public async buyPropertyTokens(propertyId: number, tokenAmount: number): Promise<boolean> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Convert token amount to proper units
      const tokenAmountBN = ethers.parseUnits(tokenAmount.toString(), EQUIX_TOKEN_CONSTANTS.DECIMALS);
      
      // Execute the purchase
      const tx = await contract.purchaseTokens(propertyId, tokenAmountBN);
      
      // Wait for transaction to be confirmed
      const receipt = await tx.wait();
      
      toast({
        title: "Purchase Successful",
        description: `You have purchased ${tokenAmount} EquiX tokens for property #${propertyId}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error buying property tokens:", error);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Failed to purchase property tokens",
      });
      return false;
    }
  }
  
  // Create a new property listing
  public async createProperty(
    name: string,
    propertyType: string,
    location: string,
    valueUSD: number,
    metadataURI: string
  ): Promise<number | null> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Convert USD to cents
      const valueUSDCents = Math.floor(valueUSD * 100);
      
      // Create the property
      const tx = await contract.createProperty(name, propertyType, location, valueUSDCents, metadataURI);
      
      // Wait for transaction to be confirmed
      const receipt = await tx.wait();
      
      // Extract property ID from event
      const event = receipt.logs
        .filter((log: any) => log.fragment && log.fragment.name === 'PropertyCreated')
        .map((log: any) => contract.interface.parseLog(log))
        .find((event: any) => event && event.args);
      
      if (event && event.args) {
        const propertyId = Number(event.args.propertyId);
        
        toast({
          title: "Property Created",
          description: `Property "${name}" has been created with ID: ${propertyId}`,
        });
        
        return propertyId;
      }
      
      toast({
        title: "Property Created",
        description: `Property "${name}" has been created`,
      });
      
      return null;
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create property",
      });
      return null;
    }
  }
  
  // Get user's token balance for a property
  public async getUserTokenBalance(propertyId: number): Promise<number> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      const walletAddress = WalletService.getWalletAddress();
      
      if (!contract || !walletAddress) {
        return 0;
      }
      
      const balance = await contract.balanceOf(walletAddress, propertyId);
      return Number(ethers.formatUnits(balance, EQUIX_TOKEN_CONSTANTS.DECIMALS));
    } catch (error) {
      console.error("Error getting token balance:", error);
      return 0;
    }
  }
  
  // Distribute rental income
  public async distributeRentalIncome(propertyId: number, amountUSDC: number): Promise<boolean> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Convert USDC amount to proper units (6 decimals)
      const amountUSDCBN = ethers.parseUnits(amountUSDC.toString(), 6);
      
      // Distribute rental income
      const tx = await contract.distributeRentalIncome(propertyId, amountUSDCBN);
      
      // Wait for transaction to be confirmed
      await tx.wait();
      
      toast({
        title: "Rental Income Distributed",
        description: `${amountUSDC} USDC has been distributed to token holders of property #${propertyId}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error distributing rental income:", error);
      toast({
        variant: "destructive",
        title: "Distribution Failed",
        description: error.message || "Failed to distribute rental income",
      });
      return false;
    }
  }
  
  // Claim rental income
  public async claimRentalIncome(propertyId: number): Promise<boolean> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Claim rental income
      const tx = await contract.claimRentalIncome(propertyId);
      
      // Wait for transaction to be confirmed
      await tx.wait();
      
      toast({
        title: "Rental Income Claimed",
        description: `You have successfully claimed your rental income for property #${propertyId}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error claiming rental income:", error);
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: error.message || "Failed to claim rental income",
      });
      return false;
    }
  }
  
  // Create auction
  public async createAuction(propertyId: number, startingPrice: number, durationDays: number): Promise<boolean> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Convert price to USDC (6 decimals)
      const startingPriceBN = ethers.parseUnits(startingPrice.toString(), 6);
      
      // Create auction
      const tx = await contract.createAuction(propertyId, startingPriceBN, durationDays);
      
      // Wait for transaction to be confirmed
      await tx.wait();
      
      toast({
        title: "Auction Created",
        description: `Auction created for property #${propertyId} with starting price ${startingPrice} USDC`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error creating auction:", error);
      toast({
        variant: "destructive",
        title: "Auction Creation Failed",
        description: error.message || "Failed to create auction",
      });
      return false;
    }
  }
  
  // Place a bid
  public async placeBid(propertyId: number, bidAmount: number): Promise<boolean> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // Convert bid to USDC (6 decimals)
      const bidAmountBN = ethers.parseUnits(bidAmount.toString(), 6);
      
      // Place bid
      const tx = await contract.placeBid(propertyId, bidAmountBN);
      
      // Wait for transaction to be confirmed
      await tx.wait();
      
      toast({
        title: "Bid Placed",
        description: `Your bid of ${bidAmount} USDC for property #${propertyId} has been placed`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        variant: "destructive",
        title: "Bid Failed",
        description: error.message || "Failed to place bid",
      });
      return false;
    }
  }
  
  // End auction
  public async endAuction(propertyId: number): Promise<boolean> {
    try {
      const contract = ContractService.getPropertyTokenContract();
      
      if (!contract) {
        throw new Error("Property token contract not initialized");
      }
      
      // End auction
      const tx = await contract.endAuction(propertyId);
      
      // Wait for transaction to be confirmed
      await tx.wait();
      
      toast({
        title: "Auction Ended",
        description: `Auction for property #${propertyId} has been ended`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Error ending auction:", error);
      toast({
        variant: "destructive",
        title: "End Auction Failed",
        description: error.message || "Failed to end auction",
      });
      return false;
    }
  }
}

export default new PropertyService();

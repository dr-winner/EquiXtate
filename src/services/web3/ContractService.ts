import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './constants';
import PropertyTokenERC1155ABI from './abi/PropertyTokenERC1155.json';
import AuctionHouseABI from './abi/AuctionHouse.json';
import RentalManagerABI from './abi/RentalManager.json';
import PropertyFactoryABI from './abi/PropertyFactory.json';
import KYCRegistryABI from './abi/KYCRegistry.json';
import PropertyOracleABI from './abi/PropertyOracle.json';

class ContractService {
  private propertyTokenContract: ethers.Contract | null = null;
  private auctionHouseContract: ethers.Contract | null = null;
  private rentalManagerContract: ethers.Contract | null = null;
  private propertyFactoryContract: ethers.Contract | null = null;
  private kycRegistryContract: ethers.Contract | null = null;
  private propertyOracleContract: ethers.Contract | null = null;
  
  // Initialize contracts with provider (read-only) or signer (write operations)
  public initializeContracts(providerOrSigner: ethers.BrowserProvider | ethers.JsonRpcSigner | null) {
    if (!providerOrSigner) return;
    
    const addresses = CONTRACT_ADDRESSES.SONIC_TESTNET;
    
    this.propertyTokenContract = new ethers.Contract(
      addresses.PROPERTY_TOKEN,
      PropertyTokenERC1155ABI,
      providerOrSigner
    );
    
    this.auctionHouseContract = new ethers.Contract(
      addresses.AUCTION_HOUSE,
      AuctionHouseABI,
      providerOrSigner
    );
    
    this.rentalManagerContract = new ethers.Contract(
      addresses.RENTAL_MANAGER,
      RentalManagerABI,
      providerOrSigner
    );
    
    this.propertyFactoryContract = new ethers.Contract(
      addresses.PROPERTY_FACTORY,
      PropertyFactoryABI,
      providerOrSigner
    );
    
    this.kycRegistryContract = new ethers.Contract(
      addresses.KYC_REGISTRY,
      KYCRegistryABI,
      providerOrSigner
    );
    
    this.propertyOracleContract = new ethers.Contract(
      addresses.PROPERTY_ORACLE,
      PropertyOracleABI,
      providerOrSigner
    );
  }
  
  // Get property token contract
  public getPropertyTokenContract(): ethers.Contract | null {
    return this.propertyTokenContract;
  }
  
  // Get auction house contract
  public getAuctionHouseContract(): ethers.Contract | null {
    return this.auctionHouseContract;
  }
  
  // Get rental manager contract
  public getRentalManagerContract(): ethers.Contract | null {
    return this.rentalManagerContract;
  }
  
  // Get property factory contract
  public getPropertyFactoryContract(): ethers.Contract | null {
    return this.propertyFactoryContract;
  }
  
  // Get KYC registry contract
  public getKYCRegistryContract(): ethers.Contract | null {
    return this.kycRegistryContract;
  }
  
  // Get property oracle contract
  public getPropertyOracleContract(): ethers.Contract | null {
    return this.propertyOracleContract;
  }
  
  // Legacy getters (for backward compatibility)
  public getMarketplaceContract(): ethers.Contract | null {
    return this.auctionHouseContract;
  }
  
  public getGovernanceContract(): ethers.Contract | null {
    return this.propertyFactoryContract;
  }
  
  // Reset contracts (for disconnect)
  public resetContracts() {
    this.propertyTokenContract = null;
    this.auctionHouseContract = null;
    this.rentalManagerContract = null;
    this.propertyFactoryContract = null;
    this.kycRegistryContract = null;
    this.propertyOracleContract = null;
  }
}

export default new ContractService();


import { ethers } from 'ethers';
import { propertyTokenABI, marketplaceABI, governanceABI } from './types';
import { CONTRACT_ADDRESSES } from './constants';

class ContractService {
  private propertyTokenContract: ethers.Contract | null = null;
  private marketplaceContract: ethers.Contract | null = null;
  private governanceContract: ethers.Contract | null = null;
  
  // Initialize contracts with provider (read-only) or signer (write operations)
  public initializeContracts(providerOrSigner: ethers.BrowserProvider | ethers.JsonRpcSigner | null) {
    if (!providerOrSigner) return;
    
    this.propertyTokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.TOKEN,
      propertyTokenABI,
      providerOrSigner
    );
    
    this.marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESSES.MARKETPLACE,
      marketplaceABI,
      providerOrSigner
    );
    
    this.governanceContract = new ethers.Contract(
      CONTRACT_ADDRESSES.GOVERNANCE,
      governanceABI,
      providerOrSigner
    );
  }
  
  // Get property token contract
  public getPropertyTokenContract(): ethers.Contract | null {
    return this.propertyTokenContract;
  }
  
  // Get marketplace contract  
  public getMarketplaceContract(): ethers.Contract | null {
    return this.marketplaceContract;
  }
  
  // Get governance contract
  public getGovernanceContract(): ethers.Contract | null {
    return this.governanceContract;
  }
  
  // Reset contracts (for disconnect)
  public resetContracts() {
    this.propertyTokenContract = null;
    this.marketplaceContract = null;
    this.governanceContract = null;
  }
}

export default new ContractService();

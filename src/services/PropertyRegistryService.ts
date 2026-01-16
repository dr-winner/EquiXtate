/**
 * Property Registry Service
 * 
 * Interacts with the PropertyRegistry smart contract for:
 * - Submitting properties for listing
 * - Checking duplicate properties
 * - Managing property lifecycle
 */

import { ethers } from 'ethers';
import { PropertyRegistryABI, PROPERTY_REGISTRY_ADDRESS } from '@/contracts/abi/PropertyRegistry';
import { PROPERTY_REGISTRY_CONFIG } from '@/utils/envConfig';

// Use config or fallback to hardcoded address
const CONTRACT_ADDRESS = PROPERTY_REGISTRY_CONFIG.contractAddress || PROPERTY_REGISTRY_ADDRESS;

export interface PropertyOnChain {
  id: bigint;
  owner: string;
  name: string;
  location: string;
  value: bigint;
  tokenAddress: string;
  isActive: boolean;
  listedAt: bigint;
  documentHash: string;
  locationHash: string;
  verificationId: string;
}

export interface SubmitPropertyParams {
  name: string;
  location: string;
  value: bigint; // In wei or smallest unit
  documentHash: string; // bytes32 hash of deed document
}

class PropertyRegistryService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;

  /**
   * Initialize the service with a provider
   */
  async initialize(provider: ethers.Provider | ethers.Signer): Promise<void> {
    if ('getAddress' in provider) {
      // It's a signer
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyRegistryABI, provider);
      this.provider = (provider as ethers.Signer).provider || null;
    } else {
      // It's a provider
      this.provider = provider;
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, PropertyRegistryABI, provider);
    }
    console.log('✅ PropertyRegistryService initialized with contract:', CONTRACT_ADDRESS);
  }

  /**
   * Connect with a signer for write operations
   */
  connectSigner(signer: ethers.Signer): void {
    if (!this.contract) {
      throw new Error('Service not initialized. Call initialize() first.');
    }
    this.contract = this.contract.connect(signer);
  }

  /**
   * Get the contract instance (for direct access if needed)
   */
  getContract(): ethers.Contract | null {
    return this.contract;
  }

  // ============================================
  // READ FUNCTIONS
  // ============================================

  /**
   * Get total number of properties
   */
  async getPropertyCount(): Promise<bigint> {
    if (!this.contract) throw new Error('Service not initialized');
    return await this.contract.propertyCount();
  }

  /**
   * Get property details by ID
   */
  async getProperty(propertyId: number): Promise<PropertyOnChain | null> {
    if (!this.contract) throw new Error('Service not initialized');
    try {
      const result = await this.contract.properties(propertyId);
      return {
        id: result.id,
        owner: result.owner,
        name: result.name,
        location: result.location,
        value: result.value,
        tokenAddress: result.tokenAddress,
        isActive: result.isActive,
        listedAt: result.listedAt,
        documentHash: result.documentHash,
        locationHash: result.locationHash,
        verificationId: result.verificationId
      };
    } catch (error) {
      console.error('Failed to get property:', error);
      return null;
    }
  }

  /**
   * Get all properties owned by an address
   */
  async getOwnerProperties(ownerAddress: string): Promise<bigint[]> {
    if (!this.contract) throw new Error('Service not initialized');
    return await this.contract.getOwnerProperties(ownerAddress);
  }

  /**
   * Check if user can list properties (has ENHANCED KYC)
   */
  async canUserListProperties(userAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error('Service not initialized');
    return await this.contract.canUserListProperties(userAddress);
  }

  /**
   * Check if property exists by document hash
   */
  async propertyExistsByDocument(documentHash: string): Promise<boolean> {
    if (!this.contract) throw new Error('Service not initialized');
    return await this.contract.propertyExistsByDocument(documentHash);
  }

  /**
   * Check if property exists at a location
   */
  async propertyExistsByLocation(location: string): Promise<boolean> {
    if (!this.contract) throw new Error('Service not initialized');
    return await this.contract.propertyExistsByLocation(location);
  }

  /**
   * Check if property is pending oracle approval
   */
  async isPendingApproval(propertyId: number): Promise<boolean> {
    if (!this.contract) throw new Error('Service not initialized');
    return await this.contract.isPendingApproval(propertyId);
  }

  /**
   * Get property by document hash
   */
  async getPropertyByDocument(documentHash: string): Promise<PropertyOnChain | null> {
    if (!this.contract) throw new Error('Service not initialized');
    try {
      const result = await this.contract.getPropertyByDocument(documentHash);
      return {
        id: result.id,
        owner: result.owner,
        name: result.name,
        location: result.location,
        value: result.value,
        tokenAddress: result.tokenAddress,
        isActive: result.isActive,
        listedAt: result.listedAt,
        documentHash: result.documentHash,
        locationHash: result.locationHash,
        verificationId: result.verificationId
      };
    } catch {
      return null;
    }
  }

  // ============================================
  // WRITE FUNCTIONS
  // ============================================

  /**
   * Submit a property for listing (requires ENHANCED KYC)
   * Property will be pending until oracle approves
   */
  async submitProperty(params: SubmitPropertyParams): Promise<{
    success: boolean;
    propertyId?: number;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error('Service not initialized');

    try {
      // Check for duplicates first
      const docExists = await this.propertyExistsByDocument(params.documentHash);
      if (docExists) {
        return {
          success: false,
          error: 'A property with this document already exists on the platform'
        };
      }

      const locExists = await this.propertyExistsByLocation(params.location);
      if (locExists) {
        return {
          success: false,
          error: 'A property at this location is already listed'
        };
      }

      // Submit the property
      const tx = await this.contract.submitProperty(
        params.name,
        params.location,
        params.value,
        params.documentHash
      );

      console.log('📝 Property submission tx:', tx.hash);
      const receipt = await tx.wait();
      
      // Get property ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract?.interface.parseLog(log);
          return parsed?.name === 'PropertyListed';
        } catch {
          return false;
        }
      });

      let propertyId: number | undefined;
      if (event) {
        const parsed = this.contract?.interface.parseLog(event);
        propertyId = Number(parsed?.args?.propertyId);
      }

      return {
        success: true,
        propertyId,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('❌ Property submission failed:', error);
      return {
        success: false,
        error: error.reason || error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Update property details (only owner, only active properties)
   */
  async updateProperty(propertyId: number, name: string, value: bigint): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error('Service not initialized');

    try {
      const tx = await this.contract.updateProperty(propertyId, name, value);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.reason || error.message
      };
    }
  }

  /**
   * Deactivate a property (only owner or admin)
   */
  async deactivateProperty(propertyId: number): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract) throw new Error('Service not initialized');

    try {
      const tx = await this.contract.deactivateProperty(propertyId);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.reason || error.message
      };
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Generate document hash from file
   */
  async hashDocument(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
  }

  /**
   * Generate location hash (for checking duplicates)
   */
  hashLocation(location: string): string {
    // Normalize: lowercase, trim, collapse spaces
    const normalized = location.toLowerCase().trim().replace(/\s+/g, ' ');
    return ethers.keccak256(ethers.toUtf8Bytes(normalized));
  }

  /**
   * Get all active properties (paginated)
   */
  async getActiveProperties(startId: number = 1, limit: number = 10): Promise<PropertyOnChain[]> {
    if (!this.contract) throw new Error('Service not initialized');
    
    const total = await this.getPropertyCount();
    const properties: PropertyOnChain[] = [];
    
    for (let i = startId; i <= Math.min(Number(total), startId + limit - 1); i++) {
      const property = await this.getProperty(i);
      if (property && property.isActive) {
        properties.push(property);
      }
    }
    
    return properties;
  }
}

// Export singleton instance
export const propertyRegistryService = new PropertyRegistryService();
export default propertyRegistryService;

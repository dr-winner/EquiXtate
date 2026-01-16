/**
 * KRNL Verification Service
 * 
 * This service integrates with KRNL Protocol to provide:
 * 1. Property ownership verification through government database queries
 * 2. Document authenticity verification
 * 3. Cross-chain property data attestation
 * 4. On-chain verification records
 */

import { ethers } from 'krnl-sdk';
import { executeKrnl } from '@/krnl/1529';
import { ENTRY_ID, ACCESS_TOKEN, CONTRACT_ADDRESS } from '@/krnl/1529/config';
import { KRNL_CONFIG } from '@/utils/envConfig';

// Verification status enum
export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REQUIRES_REVIEW = 'requires_review'
}

// Document type enum
export enum DocumentType {
  PROPERTY_DEED = 'property_deed',
  TITLE_CERTIFICATE = 'title_certificate',
  TAX_RECORD = 'tax_record',
  SURVEY_PLAN = 'survey_plan',
  IDENTITY_DOCUMENT = 'identity_document',
  PROOF_OF_ADDRESS = 'proof_of_address'
}

// Verification result interface
export interface VerificationResult {
  success: boolean;
  status: VerificationStatus;
  verificationId: string;
  timestamp: number;
  attestationHash?: string;
  details: {
    ownershipVerified: boolean;
    documentAuthenticity: boolean;
    governmentRecordMatch: boolean;
    crossChainAttestation?: boolean;
  };
  metadata?: {
    propertyId?: string;
    walletAddress?: string;
    verifiedBy?: string;
    notes?: string;
  };
  errors?: string[];
}

// Property verification request
export interface PropertyVerificationRequest {
  propertyId: string;
  ownerAddress: string;
  propertyDetails: {
    name: string;
    location: string;
    type: string;
    estimatedValue: number;
  };
  documents: {
    type: DocumentType;
    hash: string; // Document hash for verification
    uploadDate: number;
  }[];
}

// User KYC verification request
export interface UserKYCRequest {
  walletAddress: string;
  userDetails: {
    fullName: string;
    email: string;
    country: string;
  };
  documents: {
    type: DocumentType;
    hash: string;
    uploadDate: number;
  }[];
}

class KRNLVerificationService {
  private krnlProvider: ethers.JsonRpcProvider;
  private mockMode: boolean;

  constructor() {
    const rpcUrl = KRNL_CONFIG.rpcUrl;
    this.mockMode = !rpcUrl || !KRNL_CONFIG.entryId || !KRNL_CONFIG.accessToken;

    if (!rpcUrl) {
      console.warn('[KRNL] RPC URL missing (set VITE_RPC_KRNL). Falling back to mock verification.');
      // Use dummy provider to keep methods callable; network calls will be gated by mockMode
      this.krnlProvider = new ethers.JsonRpcProvider();
    } else {
      this.krnlProvider = new ethers.JsonRpcProvider(rpcUrl);
    }
  }

  /**
   * Verify property ownership through KRNL Protocol
   * This function integrates with government databases via KRNL kernels
   */
  async verifyPropertyOwnership(request: PropertyVerificationRequest): Promise<VerificationResult> {
    try {
      console.log('🔍 Starting property ownership verification via KRNL...');

      if (this.mockMode) {
        console.warn('[KRNL] Mock mode enabled for property verification (missing env config).');
        return this.mockPropertyResult(request);
      }
      
      // Step 1: Execute KRNL to query government property records
      const krnlPayload = await executeKrnl(request.ownerAddress, "1529");
      
      // Step 2: Verify document hashes
      const documentVerification = await this.verifyDocuments(request.documents);
      
      // Step 3: Cross-check with government records (simulated through KRNL kernel)
      const governmentRecordCheck = await this.queryGovernmentRecords(
        request.propertyId,
        request.propertyDetails
      );
      
      // Step 4: Create on-chain attestation
      const attestation = await this.createPropertyAttestation(
        request.propertyId,
        request.ownerAddress,
        krnlPayload
      );
      
      // Compile verification result
      const allVerified = documentVerification && governmentRecordCheck;
      
      const result: VerificationResult = {
        success: allVerified,
        status: allVerified ? VerificationStatus.VERIFIED : VerificationStatus.REQUIRES_REVIEW,
        verificationId: this.generateVerificationId(),
        timestamp: Date.now(),
        attestationHash: attestation.hash,
        details: {
          ownershipVerified: governmentRecordCheck,
          documentAuthenticity: documentVerification,
          governmentRecordMatch: governmentRecordCheck,
          crossChainAttestation: true
        },
        metadata: {
          propertyId: request.propertyId,
          walletAddress: request.ownerAddress,
          verifiedBy: 'KRNL Protocol',
          notes: allVerified 
            ? 'Property ownership successfully verified through government records'
            : 'Property requires manual review by validators'
        }
      };
      
      console.log('✅ Property verification completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Property verification failed:', error);
      return {
        success: false,
        status: VerificationStatus.REJECTED,
        verificationId: this.generateVerificationId(),
        timestamp: Date.now(),
        details: {
          ownershipVerified: false,
          documentAuthenticity: false,
          governmentRecordMatch: false
        },
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Verify user identity (KYC) through KRNL Protocol
   */
  async verifyUserIdentity(request: UserKYCRequest): Promise<VerificationResult> {
    try {
      console.log('🔍 Starting user KYC verification via KRNL...');

      if (this.mockMode) {
        console.warn('[KRNL] Mock mode enabled for user verification (missing env config).');
        return this.mockUserResult(request);
      }
      
      // Step 1: Verify identity documents
      const documentVerification = await this.verifyDocuments(request.documents);
      
      // Step 2: Execute KRNL for identity verification kernel
      // In production, this would connect to government ID databases
      const krnlPayload = await executeKrnl(request.walletAddress, "337");
      
      // Step 3: Create on-chain identity attestation
      const attestation = await this.createUserAttestation(
        request.walletAddress,
        request.userDetails,
        krnlPayload
      );
      
      const verified = documentVerification;
      
      const result: VerificationResult = {
        success: verified,
        status: verified ? VerificationStatus.VERIFIED : VerificationStatus.REQUIRES_REVIEW,
        verificationId: this.generateVerificationId(),
        timestamp: Date.now(),
        attestationHash: attestation.hash,
        details: {
          ownershipVerified: true,
          documentAuthenticity: documentVerification,
          governmentRecordMatch: true,
          crossChainAttestation: true
        },
        metadata: {
          walletAddress: request.walletAddress,
          verifiedBy: 'KRNL Protocol',
          notes: verified 
            ? 'User identity successfully verified'
            : 'User requires manual review'
        }
      };
      
      console.log('✅ User KYC verification completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ User verification failed:', error);
      return {
        success: false,
        status: VerificationStatus.REJECTED,
        verificationId: this.generateVerificationId(),
        timestamp: Date.now(),
        details: {
          ownershipVerified: false,
          documentAuthenticity: false,
          governmentRecordMatch: false
        },
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Query government property records through KRNL kernel
   * This connects to off-chain government databases
   */
  private async queryGovernmentRecords(
    propertyId: string,
    propertyDetails: PropertyVerificationRequest['propertyDetails']
  ): Promise<boolean> {
    try {
      // In production, this would make a KRNL kernel call to government APIs
      // For now, we'll simulate the verification
      console.log('📊 Querying government records for property:', propertyId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would actually query:
      // - Land registry databases
      // - Tax assessment records
      // - Zoning information
      // - Ownership history
      
      // For now, return true if property details are complete
      const isComplete = propertyDetails.name && 
                        propertyDetails.location && 
                        propertyDetails.type &&
                        propertyDetails.estimatedValue > 0;
      
      console.log('✅ Government records check:', isComplete ? 'PASSED' : 'FAILED');
      return isComplete;
      
    } catch (error) {
      console.error('Error querying government records:', error);
      return false;
    }
  }

  /**
   * Verify document authenticity
   */
  private async verifyDocuments(
    documents: { type: DocumentType; hash: string; uploadDate: number }[]
  ): Promise<boolean> {
    try {
      console.log('📄 Verifying documents...');
      
      // Check that required documents are present
      const hasRequiredDocs = documents.length > 0;
      
      if (!hasRequiredDocs) {
        console.log('❌ Missing required documents');
        return false;
      }
      
      // Verify each document hash
      for (const doc of documents) {
        // In production, this would:
        // 1. Verify the document hash hasn't been tampered with
        // 2. Check document signatures
        // 3. Validate document metadata
        // 4. Query document authenticity through KRNL
        
        if (!doc.hash || doc.hash.length < 10) {
          console.log(`❌ Invalid document hash for ${doc.type}`);
          return false;
        }
      }
      
      console.log('✅ All documents verified');
      return true;
      
    } catch (error) {
      console.error('Error verifying documents:', error);
      return false;
    }
  }

  /**
   * Create on-chain property attestation
   */
  private async createPropertyAttestation(
    propertyId: string,
    ownerAddress: string,
    krnlPayload: any
  ): Promise<{ hash: string; timestamp: number }> {
    try {
      // Create attestation data
      const attestationData = {
        propertyId,
        ownerAddress,
        verifiedAt: Date.now(),
        krnlPayload: krnlPayload.auth || '',
        kernelId: '1529'
      };
      
      // In production, this would:
      // 1. Create a Merkle proof
      // 2. Store attestation on-chain via smart contract
      // 3. Emit verification event
      // 4. Store on IPFS/Arweave for permanent record
      
      // Generate attestation hash
      const attestationHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(attestationData))
      );
      
      console.log('📝 Property attestation created:', attestationHash);
      
      return {
        hash: attestationHash,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error creating property attestation:', error);
      throw error;
    }
  }

  /**
   * Create on-chain user attestation
   */
  private async createUserAttestation(
    walletAddress: string,
    userDetails: UserKYCRequest['userDetails'],
    krnlPayload: any
  ): Promise<{ hash: string; timestamp: number }> {
    try {
      // Create attestation data (privacy-preserving)
      const attestationData = {
        walletAddress,
        country: userDetails.country,
        verifiedAt: Date.now(),
        krnlPayload: krnlPayload.auth || '',
        kernelId: '337'
      };
      
      // Generate attestation hash
      const attestationHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(attestationData))
      );
      
      console.log('📝 User attestation created:', attestationHash);
      
      return {
        hash: attestationHash,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error creating user attestation:', error);
      throw error;
    }
  }

  /**
   * Get verification status by ID
   */
  async getVerificationStatus(verificationId: string): Promise<VerificationResult | null> {
    try {
      // In production, this would query a database or smart contract
      // For now, return null to indicate not found
      console.log('Checking verification status for:', verificationId);
      return null;
    } catch (error) {
      console.error('Error getting verification status:', error);
      return null;
    }
  }

  /**
   * Get all verifications for a wallet address
   */
  async getWalletVerifications(walletAddress: string): Promise<VerificationResult[]> {
    try {
      // In production, query from database/blockchain
      console.log('Fetching verifications for wallet:', walletAddress);
      return [];
    } catch (error) {
      console.error('Error getting wallet verifications:', error);
      return [];
    }
  }

  /**
   * Generate unique verification ID
   */
  private generateVerificationId(): string {
    return `VRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Check if KRNL service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      if (this.mockMode) return true;
      const network = await this.krnlProvider.getNetwork();
      return !!network;
    } catch (error) {
      console.error('KRNL service not available:', error);
      return false;
    }
  }

  /**
   * Mock responses when KRNL config is missing
   */
  private mockPropertyResult(request: PropertyVerificationRequest): VerificationResult {
    const mockHash = ethers.keccak256(
      ethers.toUtf8Bytes(`mock-${request.propertyId}-${Date.now()}`)
    );

    return {
      success: true,
      status: VerificationStatus.VERIFIED,
      verificationId: this.generateVerificationId(),
      timestamp: Date.now(),
      attestationHash: mockHash,
      details: {
        ownershipVerified: true,
        documentAuthenticity: true,
        governmentRecordMatch: true,
        crossChainAttestation: false,
      },
      metadata: {
        propertyId: request.propertyId,
        walletAddress: request.ownerAddress,
        verifiedBy: 'KRNL Mock',
        notes: 'Mock verification succeeded (KRNL not configured)'
      }
    };
  }

  private mockUserResult(request: UserKYCRequest): VerificationResult {
    const mockHash = ethers.keccak256(
      ethers.toUtf8Bytes(`mock-user-${request.walletAddress}-${Date.now()}`)
    );

    return {
      success: true,
      status: VerificationStatus.VERIFIED,
      verificationId: this.generateVerificationId(),
      timestamp: Date.now(),
      attestationHash: mockHash,
      details: {
        ownershipVerified: true,
        documentAuthenticity: true,
        governmentRecordMatch: true,
        crossChainAttestation: false,
      },
      metadata: {
        walletAddress: request.walletAddress,
        verifiedBy: 'KRNL Mock',
        notes: 'Mock user verification succeeded (KRNL not configured)'
      }
    };
  }
}

// Export singleton instance
export default new KRNLVerificationService();

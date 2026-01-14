/**
 * User Onboarding Service
 * 
 * Handles user KYC/verification workflow:
 * 1. Identity document collection
 * 2. KRNL-based identity verification
 * 3. On-chain attestation
 * 4. User profile management
 * 5. Compliance tracking
 */

import KRNLVerificationService, {
  VerificationStatus,
  DocumentType,
  UserKYCRequest,
  VerificationResult
} from './KRNLVerificationService';
import { ethers } from 'ethers';

// User verification status
export enum UserVerificationStatus {
  UNVERIFIED = 'unverified',
  DOCUMENTS_SUBMITTED = 'documents_submitted',
  VERIFICATION_PENDING = 'verification_pending',
  VERIFICATION_IN_PROGRESS = 'verification_in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// KYC tier levels
export enum KYCTier {
  NONE = 0,
  BASIC = 1,      // Basic identity verification
  STANDARD = 2,   // + Address verification
  ENHANCED = 3    // + Source of funds, accredited investor status
}

// User onboarding data
export interface UserOnboarding {
  walletAddress: string;
  status: UserVerificationStatus;
  tier: KYCTier;
  createdAt: number;
  updatedAt: number;
  
  // Personal information (encrypted/hashed in production)
  personalInfo: {
    fullName?: string;
    email?: string;
    country?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  
  // Documents
  documents: {
    identityDocument?: {
      type: 'passport' | 'national_id' | 'drivers_license';
      hash: string;
      uploadedAt: number;
    };
    proofOfAddress?: {
      hash: string;
      uploadedAt: number;
    };
    additionalDocs?: {
      type: string;
      hash: string;
      uploadedAt: number;
    }[];
  };
  
  // Verification data
  verification?: {
    verificationId: string;
    status: VerificationStatus;
    result?: VerificationResult;
    submittedAt: number;
    completedAt?: number;
    expiresAt?: number; // KYC expiration (typically 1 year)
  };
  
  // Investment limits based on KYC tier
  investmentLimits: {
    maxInvestmentAmount: number;
    maxPropertiesOwned: number;
    canListProperties: boolean;
    canParticipateInGovernance: boolean;
  };
  
  // Compliance flags
  compliance: {
    isAccreditedInvestor: boolean;
    isPoliticallyExposed: boolean;
    sanctionScreeningPassed: boolean;
    amlCheckPassed: boolean;
  };
}

// KYC submission data
export interface KYCSubmission {
  walletAddress: string;
  personalInfo: UserOnboarding['personalInfo'];
  identityDocument: {
    file: File;
    type: 'passport' | 'national_id' | 'drivers_license';
  };
  proofOfAddress?: File;
  targetTier: KYCTier;
}

class UserOnboardingService {
  private readonly storageKey = 'equixtate_user_onboardings';
  
  /**
   * Initialize user onboarding
   */
  async createUserOnboarding(walletAddress: string): Promise<UserOnboarding> {
    try {
      console.log('👤 Creating user onboarding for:', walletAddress);
      
      // Check if user already exists
      const existing = await this.getUserOnboarding(walletAddress);
      if (existing) {
        console.log('User onboarding already exists');
        return existing;
      }
      
      // Create new onboarding record
      const onboarding: UserOnboarding = {
        walletAddress,
        status: UserVerificationStatus.UNVERIFIED,
        tier: KYCTier.NONE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personalInfo: {},
        documents: {},
        investmentLimits: this.getDefaultLimits(KYCTier.NONE),
        compliance: {
          isAccreditedInvestor: false,
          isPoliticallyExposed: false,
          sanctionScreeningPassed: false,
          amlCheckPassed: false
        }
      };
      
      await this.saveUserOnboarding(onboarding);
      
      console.log('✅ User onboarding created');
      return onboarding;
      
    } catch (error) {
      console.error('❌ Failed to create user onboarding:', error);
      throw new Error('Failed to create user onboarding');
    }
  }
  
  /**
   * Submit KYC documents for verification
   */
  async submitKYC(submission: KYCSubmission): Promise<VerificationResult> {
    try {
      console.log('📝 Submitting KYC for:', submission.walletAddress);
      
      // Get or create user onboarding
      let onboarding = await this.getUserOnboarding(submission.walletAddress);
      if (!onboarding) {
        onboarding = await this.createUserOnboarding(submission.walletAddress);
      }
      
      // Process documents
      const identityDoc = await this.processDocument(submission.identityDocument.file);
      const proofOfAddressDoc = submission.proofOfAddress 
        ? await this.processDocument(submission.proofOfAddress)
        : undefined;
      
      // Update onboarding with documents and personal info
      onboarding.personalInfo = submission.personalInfo;
      onboarding.documents = {
        identityDocument: {
          type: submission.identityDocument.type,
          hash: identityDoc.hash,
          uploadedAt: identityDoc.uploadedAt
        },
        ...(proofOfAddressDoc && {
          proofOfAddress: {
            hash: proofOfAddressDoc.hash,
            uploadedAt: proofOfAddressDoc.uploadedAt
          }
        })
      };
      onboarding.status = UserVerificationStatus.VERIFICATION_IN_PROGRESS;
      onboarding.updatedAt = Date.now();
      
      await this.saveUserOnboarding(onboarding);
      
      // Prepare KRNL verification request
      const kycRequest: UserKYCRequest = {
        walletAddress: submission.walletAddress,
        userDetails: {
          fullName: submission.personalInfo.fullName || '',
          email: submission.personalInfo.email || '',
          country: submission.personalInfo.country || ''
        },
        documents: [
          {
            type: DocumentType.IDENTITY_DOCUMENT,
            hash: identityDoc.hash,
            uploadDate: identityDoc.uploadedAt
          },
          ...(proofOfAddressDoc ? [{
            type: DocumentType.PROOF_OF_ADDRESS,
            hash: proofOfAddressDoc.hash,
            uploadDate: proofOfAddressDoc.uploadedAt
          }] : [])
        ]
      };
      
      // Execute KRNL verification
      const verificationResult = await KRNLVerificationService.verifyUserIdentity(
        kycRequest
      );
      
      // Update onboarding with verification result
      onboarding.verification = {
        verificationId: verificationResult.verificationId,
        status: verificationResult.status,
        result: verificationResult,
        submittedAt: Date.now(),
        completedAt: verificationResult.status !== VerificationStatus.IN_PROGRESS 
          ? Date.now() 
          : undefined,
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
      };
      
      // Update user status and tier based on verification
      if (verificationResult.status === VerificationStatus.VERIFIED) {
        onboarding.status = UserVerificationStatus.VERIFIED;
        onboarding.tier = submission.targetTier;
        onboarding.investmentLimits = this.getDefaultLimits(submission.targetTier);
        
        // Run compliance checks
        onboarding.compliance = await this.runComplianceChecks(onboarding);
      } else if (verificationResult.status === VerificationStatus.REJECTED) {
        onboarding.status = UserVerificationStatus.REJECTED;
      } else {
        onboarding.status = UserVerificationStatus.VERIFICATION_PENDING;
      }
      
      onboarding.updatedAt = Date.now();
      await this.saveUserOnboarding(onboarding);
      
      console.log('✅ KYC submitted:', verificationResult.verificationId);
      return verificationResult;
      
    } catch (error) {
      console.error('❌ KYC submission failed:', error);
      throw new Error('Failed to submit KYC');
    }
  }
  
  /**
   * Check if user is verified
   */
  async isUserVerified(walletAddress: string): Promise<boolean> {
    try {
      const onboarding = await this.getUserOnboarding(walletAddress);
      if (!onboarding) {
        return false;
      }
      
      // Check verification status and expiration
      const isVerified = onboarding.status === UserVerificationStatus.VERIFIED;
      const isNotExpired = onboarding.verification?.expiresAt 
        ? onboarding.verification.expiresAt > Date.now()
        : false;
      
      return isVerified && isNotExpired;
      
    } catch (error) {
      console.error('Error checking user verification:', error);
      return false;
    }
  }
  
  /**
   * Get user's KYC tier
   */
  async getUserTier(walletAddress: string): Promise<KYCTier> {
    try {
      const onboarding = await this.getUserOnboarding(walletAddress);
      return onboarding?.tier || KYCTier.NONE;
    } catch (error) {
      console.error('Error getting user tier:', error);
      return KYCTier.NONE;
    }
  }
  
  /**
   * Check if user can invest in a property
   */
  async canUserInvest(
    walletAddress: string,
    investmentAmount: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const onboarding = await this.getUserOnboarding(walletAddress);
      
      if (!onboarding) {
        return { allowed: false, reason: 'User not onboarded' };
      }
      
      if (!await this.isUserVerified(walletAddress)) {
        return { allowed: false, reason: 'KYC verification required' };
      }
      
      if (investmentAmount > onboarding.investmentLimits.maxInvestmentAmount) {
        return { 
          allowed: false, 
          reason: `Investment exceeds limit of $${onboarding.investmentLimits.maxInvestmentAmount}`
        };
      }
      
      if (!onboarding.compliance.amlCheckPassed) {
        return { allowed: false, reason: 'AML check required' };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking investment eligibility:', error);
      return { allowed: false, reason: 'Error checking eligibility' };
    }
  }
  
  /**
   * Check if user can list properties
   */
  async canUserListProperty(walletAddress: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const onboarding = await this.getUserOnboarding(walletAddress);
      
      if (!onboarding) {
        return { allowed: false, reason: 'User not onboarded' };
      }
      
      if (!await this.isUserVerified(walletAddress)) {
        return { allowed: false, reason: 'KYC verification required' };
      }
      
      if (!onboarding.investmentLimits.canListProperties) {
        return { 
          allowed: false, 
          reason: 'Upgrade to Enhanced KYC tier to list properties'
        };
      }
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking listing eligibility:', error);
      return { allowed: false, reason: 'Error checking eligibility' };
    }
  }
  
  /**
   * Get user onboarding data
   */
  async getUserOnboarding(walletAddress: string): Promise<UserOnboarding | null> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      
      const onboardings: UserOnboarding[] = JSON.parse(stored);
      return onboardings.find(
        o => o.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error getting user onboarding:', error);
      return null;
    }
  }
  
  /**
   * Private helper: Get all onboardings from storage
   */
  private async getAllUserOnboardings(): Promise<UserOnboarding[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting all user onboardings:', error);
      return [];
    }
  }
  
  /**
   * Process document (hash and metadata)
   */
  private async processDocument(file: File): Promise<{
    hash: string;
    uploadedAt: number;
  }> {
    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Calculate hash
      const hash = ethers.keccak256(uint8Array);
      
      return {
        hash,
        uploadedAt: Date.now()
      };
      
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
  
  /**
   * Run compliance checks
   */
  private async runComplianceChecks(
    onboarding: UserOnboarding
  ): Promise<UserOnboarding['compliance']> {
    try {
      // In production, this would:
      // 1. Check sanctions lists (OFAC, UN, EU, etc.)
      // 2. Run AML screening
      // 3. Check PEP (Politically Exposed Person) databases
      // 4. Verify accredited investor status
      
      // For now, return default passing values
      return {
        isAccreditedInvestor: onboarding.tier >= KYCTier.ENHANCED,
        isPoliticallyExposed: false,
        sanctionScreeningPassed: true,
        amlCheckPassed: true
      };
      
    } catch (error) {
      console.error('Error running compliance checks:', error);
      return {
        isAccreditedInvestor: false,
        isPoliticallyExposed: false,
        sanctionScreeningPassed: false,
        amlCheckPassed: false
      };
    }
  }
  
  /**
   * Get default investment limits for a KYC tier
   */
  private getDefaultLimits(tier: KYCTier): UserOnboarding['investmentLimits'] {
    switch (tier) {
      case KYCTier.BASIC:
        return {
          maxInvestmentAmount: 10000,
          maxPropertiesOwned: 5,
          canListProperties: false,
          canParticipateInGovernance: true
        };
      case KYCTier.STANDARD:
        return {
          maxInvestmentAmount: 50000,
          maxPropertiesOwned: 20,
          canListProperties: false,
          canParticipateInGovernance: true
        };
      case KYCTier.ENHANCED:
        return {
          maxInvestmentAmount: Infinity,
          maxPropertiesOwned: Infinity,
          canListProperties: true,
          canParticipateInGovernance: true
        };
      default:
        return {
          maxInvestmentAmount: 0,
          maxPropertiesOwned: 0,
          canListProperties: false,
          canParticipateInGovernance: false
        };
    }
  }
  
  /**
   * Save user onboarding to storage
   */
  private async saveUserOnboarding(onboarding: UserOnboarding): Promise<void> {
    try {
      const onboardings = await this.getAllUserOnboardings();
      const index = onboardings.findIndex(
        o => o.walletAddress.toLowerCase() === onboarding.walletAddress.toLowerCase()
      );
      
      if (index >= 0) {
        onboardings[index] = onboarding;
      } else {
        onboardings.push(onboarding);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(onboardings));
      
    } catch (error) {
      console.error('Error saving user onboarding:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new UserOnboardingService();

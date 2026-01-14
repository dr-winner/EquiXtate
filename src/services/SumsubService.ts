/**
 * Sumsub KYC/AML Verification Service
 * Handles integration with Sumsub Cockpit for document verification
 */

import { envConfig } from '@/utils/envConfig';

interface AccessTokenResponse {
  token: string;
  expiresAt: number;
}

interface ApplicantData {
  userId: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  levelName?: string; // e.g., 'basic-kyc', 'compliance-kyc'
}

interface VerificationResult {
  applicantId: string;
  userId: string;
  status: 'success' | 'failed' | 'pending';
  verificationStatus: string;
  reviewResult?: {
    reviewStatus: string; // 'APPROVED', 'REJECTED', 'PENDING'
    reasons?: string[];
  };
}

class SumsubService {
  private apiBaseUrl: string;

  constructor() {
    // Use backend proxy in browser to avoid CORS and keep secrets server-side
    this.apiBaseUrl = typeof window === 'undefined'
      ? (envConfig.sumsubApiUrl || 'https://api.sumsub.com')
      : '/api/sumsub';
  }

  /**
   * Generate an access token for WebSDK initialization
   * This should be called from your backend
   */
  async generateAccessToken(applicantData: ApplicantData): Promise<AccessTokenResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/access-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: applicantData.userId,
          email: applicantData.email,
          phone: applicantData.phone,
          levelName: applicantData.levelName || 'basic-kyc-level',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to generate token: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        token: data.token,
        expiresAt: Date.now() + (data.ttlInSecs || 600) * 1000,
      };
    } catch (error) {
      console.error('Error generating Sumsub access token:', error);
      throw error;
    }
  }

  /**
   * Get verification results for an applicant
   */
  async getApplicantData(userId: string): Promise<VerificationResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/verification-status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get applicant data: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        applicantId: data.id,
        userId: data.externalUserId,
        status: data.status === 'completed' ? 'success' : 'pending',
        verificationStatus: data.status,
        reviewResult: data.review,
      };
    } catch (error) {
      console.error('Error fetching applicant data:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature from Sumsub
   * Always verify incoming webhooks to ensure they're from Sumsub
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Create HMAC-SHA256 signature
      // This method is not used client-side; kept for server completeness
      const crypto = require('crypto');
      const secretKey = envConfig.sumsubSecretKey || '';
      const hash = crypto.createHmac('sha256', secretKey);
      hash.update(payload);
      const calculatedSignature = hash.digest('hex');

      return calculatedSignature === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Handle webhook callback from Sumsub
   * Called when verification is complete
   */
  async handleWebhookCallback(
    userId: string,
    verificationStatus: string,
    reviewResult?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Store verification result in your database
      // This is where you'd update user status in your backend
      console.log('Webhook callback received:', {
        userId,
        verificationStatus,
        reviewResult,
      });

      // Update your database here
      // await updateUserKYCStatus(userId, verificationStatus, reviewResult);
    } catch (error) {
      console.error('Error handling webhook callback:', error);
      throw error;
    }
  }

  /**
   * Check if a token is still valid
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt - 30000; // 30 second buffer
  }
}

export default new SumsubService();

/**
 * Sumsub API Routes
 * Backend endpoints for Sumsub integration
 */

import express, { Request, Response, Router } from 'express';
import { ethers } from 'ethers';
import SumsubService from '@/services/SumsubService';

const router = Router();

// KYC Verifier Contract ABI (minimal interface)
const KYC_VERIFIER_ABI = [
  'function setKYCStatus(address user, bool isVerified, uint8 tier, string memory sumsubApplicantId) external',
  'function revokeKYC(address user) external'
];

// Initialize blockchain connection for oracle transactions
const initializeKYCOracle = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.VITE_RPC_URL;
  const oracleKey = process.env.ORACLE_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const kycVerifierAddress = process.env.KYC_VERIFIER_CONTRACT || process.env.VITE_KYC_VERIFIER_CONTRACT;

  if (!rpcUrl || !oracleKey || !kycVerifierAddress) {
    console.warn('⚠️  KYC Oracle not configured. Set ORACLE_PRIVATE_KEY and KYC_VERIFIER_CONTRACT in .env');
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(oracleKey, provider);
    const kycVerifier = new ethers.Contract(kycVerifierAddress, KYC_VERIFIER_ABI, wallet);
    
    console.log('✅ KYC Oracle initialized:', {
      oracleAddress: wallet.address,
      contractAddress: kycVerifierAddress,
      network: rpcUrl.includes('sepolia') ? 'Sepolia' : 'Unknown'
    });
    
    return kycVerifier;
  } catch (error) {
    console.error('❌ Failed to initialize KYC Oracle:', error);
    return null;
  }
};

/**
 * POST /api/sumsub/access-token
 * Generate an access token for WebSDK
 */
router.post('/access-token', async (req: Request, res: Response) => {
  try {
    const { userId, email, phone, levelName } = req.body;

    // Validate required fields
    if (!userId || !email) {
      return res.status(400).json({
        error: 'Missing required fields: userId, email',
      });
    }

    // Generate access token
    const tokenData = await SumsubService.generateAccessToken({
      userId,
      email,
      phone,
      levelName,
    });

    res.json({
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
    });
  } catch (error) {
    console.error('Error generating Sumsub access token:', error);
    res.status(500).json({
      error: 'Failed to generate access token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/sumsub/webhook
 * Handle webhook callbacks from Sumsub
 * Writes KYC verification status to blockchain
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-sumsub-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!SumsubService.verifyWebhookSignature(payload, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({
        error: 'Invalid signature',
      });
    }

    const { 
      applicantId, 
      externalUserId, // Wallet address
      reviewStatus,
      reviewResult,
      type // Event type: applicantReviewed, applicantPending, etc.
    } = req.body;

    console.log('📥 Sumsub webhook received:', {
      type,
      applicantId,
      externalUserId,
      reviewStatus,
    });

    // Only process completed reviews
    if (type !== 'applicantReviewed' || reviewStatus !== 'completed') {
      console.log('⏭️  Skipping non-completed review');
      return res.json({ status: 'acknowledged' });
    }

    // Determine verification result
    const reviewAnswer = reviewResult?.reviewAnswer; // GREEN, RED, or RETRY
    const isApproved = reviewAnswer === 'GREEN';
    
    // Determine KYC tier based on verification level
    let tier = 0; // NONE
    if (isApproved) {
      const levelName = req.body.levelName || '';
      const checks = reviewResult?.checks || [];
      
      // Check verification components
      const hasIdentity = checks.some((c: any) => 
        c.checkType === 'IDENTITY' && c.answer === 'GREEN'
      );
      const hasAddress = checks.some((c: any) => 
        c.checkType === 'PROOF_OF_RESIDENCE' && c.answer === 'GREEN'
      );
      const hasSourceOfFunds = levelName.includes('enhanced') || 
                               levelName.includes('compliance');
      
      if (hasIdentity && hasAddress && hasSourceOfFunds) {
        tier = 3; // ENHANCED (can list properties)
      } else if (hasIdentity && hasAddress) {
        tier = 2; // STANDARD
      } else if (hasIdentity) {
        tier = 1; // BASIC
      }
    }

    console.log('📊 KYC Result:', {
      walletAddress: externalUserId,
      isApproved,
      tier,
      tierName: ['NONE', 'BASIC', 'STANDARD', 'ENHANCED'][tier],
    });

    // Write to blockchain
    const kycVerifier = initializeKYCOracle();
    
    if (kycVerifier && externalUserId) {
      try {
        // Validate wallet address format
        if (!ethers.isAddress(externalUserId)) {
          throw new Error(`Invalid wallet address: ${externalUserId}`);
        }

        console.log('⛓️  Writing KYC status to blockchain...');
        
        const tx = await kycVerifier.setKYCStatus(
          externalUserId,
          isApproved,
          tier,
          applicantId || ''
        );
        
        console.log('📝 Transaction submitted:', tx.hash);
        
        const receipt = await tx.wait();
        
        console.log('✅ KYC status written on-chain:', {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        });
      } catch (blockchainError) {
        console.error('❌ Failed to write KYC status to blockchain:', blockchainError);
        // Don't fail the webhook - log and continue
      }
    } else {
      console.warn('⚠️  KYC Oracle not configured - skipping blockchain write');
    }

    // Store in local service for fallback
    await SumsubService.handleWebhookCallback(
      externalUserId, 
      reviewStatus, 
      reviewResult
    );

    res.json({
      status: 'received',
      processed: true,
    });
  } catch (error) {
    console.error('Error handling Sumsub webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/sumsub/verification-status/:userId
 * Get verification status for a user
 */
router.get('/verification-status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId parameter',
      });
    }

    const verificationResult = await SumsubService.getApplicantData(userId);

    res.json(verificationResult);
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({
      error: 'Failed to fetch verification status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

/**
 * Backend Server for Equixtate
 * Handles Sumsub KYC API routes
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));
app.use(express.json());

// Sumsub configuration
const SUMSUB_APP_TOKEN = process.env.VITE_SUMSUB_APP_TOKEN || process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.VITE_SUMSUB_SECRET_KEY || process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = 'https://api.sumsub.com';
const SUMSUB_LEVEL_NAME = process.env.SUMSUB_LEVEL_NAME || 'basic-kyc-level';

// KYC Verifier Contract ABI
const KYC_VERIFIER_ABI = [
  'function setKYCStatus(address user, bool isVerified, uint8 tier, string memory sumsubApplicantId) external',
  'function revokeKYC(address user) external'
];

// PropertyRegistry Contract ABI (for oracle operations)
const PROPERTY_REGISTRY_ABI = [
  'function approveProperty(uint256 propertyId, string memory verificationId, address tokenAddress) external',
  'function rejectProperty(uint256 propertyId) external',
  'function properties(uint256) view returns (uint256 id, address owner, string name, string location, uint256 value, address tokenAddress, bool isActive, uint256 listedAt, bytes32 documentHash, bytes32 locationHash, string verificationId)',
  'function isPendingApproval(uint256 propertyId) view returns (bool)'
];

// Initialize KYC Oracle
let kycVerifier: ethers.Contract | null = null;
let propertyRegistry: ethers.Contract | null = null;
let oracleWallet: ethers.Wallet | null = null;

const initializeKYCOracle = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  const oracleKey = process.env.ORACLE_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const kycVerifierAddress = process.env.KYC_VERIFIER_CONTRACT || process.env.VITE_KYC_VERIFIER_CONTRACT;
  const propertyRegistryAddress = process.env.PROPERTY_REGISTRY_ADDRESS || process.env.VITE_PROPERTY_REGISTRY_ADDRESS;

  if (!oracleKey) {
    console.warn('⚠️  Oracle not configured. Set ORACLE_PRIVATE_KEY');
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    oracleWallet = new ethers.Wallet(oracleKey, provider);
    
    if (kycVerifierAddress) {
      kycVerifier = new ethers.Contract(kycVerifierAddress, KYC_VERIFIER_ABI, oracleWallet);
      console.log('✅ KYC Verifier Oracle initialized:', kycVerifierAddress);
    }
    
    if (propertyRegistryAddress) {
      propertyRegistry = new ethers.Contract(propertyRegistryAddress, PROPERTY_REGISTRY_ABI, oracleWallet);
      console.log('✅ Property Registry Oracle initialized:', propertyRegistryAddress);
    }
    
    console.log('✅ Oracle Wallet:', oracleWallet.address);
  } catch (error) {
    console.error('❌ Failed to initialize Oracle:', error);
  }
};

// Generate Sumsub signature
const generateSignature = (ts: number, method: string, path: string, body: string = ''): string => {
  const data = ts + method.toUpperCase() + path + body;
  return crypto.createHmac('sha256', SUMSUB_SECRET_KEY || '').update(data).digest('hex');
};

// Sumsub API request helper
const sumsubRequest = async (method: string, path: string, body?: object) => {
  const ts = Math.floor(Date.now() / 1000);
  const bodyStr = body ? JSON.stringify(body) : '';
  const signature = generateSignature(ts, method, path, bodyStr);

  const response = await fetch(`${SUMSUB_BASE_URL}${path}`, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-App-Token': SUMSUB_APP_TOKEN || '',
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': ts.toString()
    },
    body: bodyStr || undefined
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sumsub API error: ${response.status} - ${error}`);
  }

  return response.json();
};

/**
 * POST /api/sumsub/access-token
 * Generate access token for WebSDK
 */
app.post('/api/sumsub/access-token', async (req, res) => {
  try {
    // Accept both userId and externalUserId for flexibility
    const { userId, externalUserId, levelName } = req.body;
    const userIdentifier = externalUserId || userId;
    const level = levelName || SUMSUB_LEVEL_NAME;

    console.log('📥 Access token request:', { userId, externalUserId, levelName: level });

    if (!userIdentifier) {
      return res.status(400).json({ error: 'userId or externalUserId is required', message: 'userId or externalUserId is required' });
    }

    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      console.error('❌ Sumsub credentials missing');
      return res.status(500).json({ error: 'Sumsub credentials not configured', message: 'Sumsub credentials not configured' });
    }

    // Create or get applicant
    const ts = Math.floor(Date.now() / 1000);
    const createPath = `/resources/accessTokens?userId=${encodeURIComponent(userIdentifier)}&levelName=${encodeURIComponent(level)}`;
    const signature = generateSignature(ts, 'POST', createPath);

    console.log('🔑 Calling Sumsub API:', { path: createPath, ts, level });

    const response = await fetch(`${SUMSUB_BASE_URL}${createPath}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-App-Token': SUMSUB_APP_TOKEN,
        'X-App-Access-Sig': signature,
        'X-App-Access-Ts': ts.toString()
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Sumsub token error:', response.status, error);
      return res.status(response.status).json({ error: 'Failed to generate access token' });
    }

    const data = await response.json();
    res.json({ token: data.token, userId: data.userId });
  } catch (error) {
    console.error('Access token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/sumsub/webhook
 * Handle Sumsub webhooks and update on-chain KYC status
 */
app.post('/api/sumsub/webhook', async (req, res) => {
  try {
    const { type, applicantId, reviewResult, externalUserId } = req.body;

    console.log('📥 Sumsub webhook received:', { type, applicantId, externalUserId });

    // Verify webhook signature (in production)
    // const signature = req.headers['x-payload-digest'];

    if (type === 'applicantReviewed' && reviewResult) {
      const isApproved = reviewResult.reviewAnswer === 'GREEN';
      
      // Extract wallet address from externalUserId (format: wallet_0x...)
      const walletMatch = externalUserId?.match(/wallet_(0x[a-fA-F0-9]{40})/);
      const walletAddress = walletMatch ? walletMatch[1] : null;

      if (walletAddress && kycVerifier && oracleWallet) {
        try {
          if (isApproved) {
            // Map to KYC tier (1 = BASIC, 2 = STANDARD, 3 = ENHANCED)
            const tier = 2; // STANDARD tier for basic verification
            
            console.log(`✅ Approving KYC for ${walletAddress} (tier: ${tier})`);
            const tx = await kycVerifier.setKYCStatus(walletAddress, true, tier, applicantId);
            await tx.wait();
            console.log(`📝 KYC status written to blockchain: ${tx.hash}`);
          } else {
            console.log(`❌ KYC rejected for ${walletAddress}`);
            const tx = await kycVerifier.revokeKYC(walletAddress);
            await tx.wait();
            console.log(`📝 KYC revoked on blockchain: ${tx.hash}`);
          }
        } catch (blockchainError) {
          console.error('Blockchain update failed:', blockchainError);
        }
      } else {
        console.warn('Cannot update blockchain: missing wallet address or oracle not configured');
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/sumsub/status/:applicantId
 * Check applicant status
 */
app.get('/api/sumsub/status/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;
    const data = await sumsubRequest('GET', `/resources/applicants/${applicantId}/status`);
    res.json(data);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    kycOracle: !!kycVerifier,
    propertyOracle: !!propertyRegistry,
    sumsub: !!SUMSUB_APP_TOKEN
  });
});

// ============================================
// PROPERTY REGISTRY ORACLE ENDPOINTS
// ============================================

/**
 * POST /api/property/approve
 * Oracle approves a property after KRNL verification
 */
app.post('/api/property/approve', async (req, res) => {
  try {
    if (!propertyRegistry) {
      return res.status(503).json({ error: 'Property Registry Oracle not configured' });
    }

    const { propertyId, verificationId, tokenAddress } = req.body;

    if (!propertyId || !verificationId) {
      return res.status(400).json({ error: 'propertyId and verificationId are required' });
    }

    // Check if property is pending approval
    const isPending = await propertyRegistry.isPendingApproval(propertyId);
    if (!isPending) {
      return res.status(400).json({ error: 'Property is not pending approval' });
    }

    // Approve the property
    const tx = await propertyRegistry.approveProperty(
      propertyId,
      verificationId,
      tokenAddress || ethers.ZeroAddress
    );
    
    console.log(`📝 Property ${propertyId} approval tx:`, tx.hash);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      propertyId,
      verificationId
    });
  } catch (error: any) {
    console.error('Property approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve property',
      details: error.reason || error.message
    });
  }
});

/**
 * POST /api/property/reject
 * Oracle rejects a property
 */
app.post('/api/property/reject', async (req, res) => {
  try {
    if (!propertyRegistry) {
      return res.status(503).json({ error: 'Property Registry Oracle not configured' });
    }

    const { propertyId, reason } = req.body;

    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId is required' });
    }

    // Check if property is pending approval
    const isPending = await propertyRegistry.isPendingApproval(propertyId);
    if (!isPending) {
      return res.status(400).json({ error: 'Property is not pending approval' });
    }

    // Reject the property
    const tx = await propertyRegistry.rejectProperty(propertyId);
    
    console.log(`❌ Property ${propertyId} rejection tx:`, tx.hash);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      propertyId,
      reason: reason || 'Verification failed'
    });
  } catch (error: any) {
    console.error('Property rejection error:', error);
    res.status(500).json({ 
      error: 'Failed to reject property',
      details: error.reason || error.message
    });
  }
});

/**
 * GET /api/property/:propertyId
 * Get property details
 */
app.get('/api/property/:propertyId', async (req, res) => {
  try {
    if (!propertyRegistry) {
      return res.status(503).json({ error: 'Property Registry not configured' });
    }

    const { propertyId } = req.params;
    const property = await propertyRegistry.properties(propertyId);
    const isPending = await propertyRegistry.isPendingApproval(propertyId);

    res.json({
      id: property.id.toString(),
      owner: property.owner,
      name: property.name,
      location: property.location,
      value: property.value.toString(),
      tokenAddress: property.tokenAddress,
      isActive: property.isActive,
      listedAt: property.listedAt.toString(),
      documentHash: property.documentHash,
      locationHash: property.locationHash,
      verificationId: property.verificationId,
      isPendingApproval: isPending
    });
  } catch (error: any) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to get property details' });
  }
});

// Initialize and start server
initializeKYCOracle();

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`   - Sumsub API: ${SUMSUB_APP_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - KYC Oracle: ${kycVerifier ? '✅ Ready' : '❌ Not configured'}\n`);
});

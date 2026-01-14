/**
 * Sumsub API Routes
 * Backend endpoints for Sumsub integration
 */

import express, { Request, Response, Router } from 'express';
import SumsubService from '@/services/SumsubService';

const router = Router();

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
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-sumsub-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!SumsubService.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({
        error: 'Invalid signature',
      });
    }

    const { applicantId, userId, verificationStatus, reviewResult } = req.body;

    // Handle the webhook callback
    await SumsubService.handleWebhookCallback(userId, verificationStatus, reviewResult);

    // Update your database with verification status
    // Example: await updateUserVerificationStatus(userId, verificationStatus, reviewResult);

    res.json({
      status: 'received',
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

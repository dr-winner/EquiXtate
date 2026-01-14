# Sumsub Integration Setup Guide

## Overview

Sumsub is integrated into EquiXtate for KYC/AML verification. This guide walks through the setup and usage.

## Prerequisites

1. **Sumsub Account**: Sign up at https://cockpit.sumsub.com/
2. **API Credentials**: Get your App Token and Secret Key from Sumsub dashboard
3. **Environment Variables**: Add Sumsub credentials to your `.env` file

## Step 1: Create Sumsub Account

1. Go to https://cockpit.sumsub.com/
2. Sign up for a free trial (14 days, 50 free checks)
3. Go to **Settings > App Tokens** to create API credentials
4. Save your **App Token** and **Secret Key**

## Step 2: Install Dependencies

Install the Sumsub WebSDK package:

```bash
npm install @sumsub/websdk --legacy-peer-deps
```

Note: Use `--legacy-peer-deps` to avoid peer dependency conflicts with existing packages.

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Sumsub Configuration
VITE_SUMSUB_API_URL=https://api.sumsub.com
VITE_SUMSUB_APP_TOKEN=your_app_token_here
VITE_SUMSUB_SECRET_KEY=your_secret_key_here
VITE_SUMSUB_SANDBOX_MODE=true
```

For **Sandbox mode** (testing):
- Use your sandbox credentials from Sumsub
- Set `VITE_SUMSUB_SANDBOX_MODE=true`
- Use test documents from Sumsub test suite

For **Production mode**:
- Use your production credentials
- Set `VITE_SUMSUB_SANDBOX_MODE=false`
- Submit production approval request to Sumsub

## Step 4: API Endpoints

### Generate Access Token
```
POST /api/sumsub/access-token
Content-Type: application/json

{
  "userId": "user_123",
  "email": "user@example.com",
  "phone": "+1234567890",
  "levelName": "basic-kyc-level"
}

Response:
{
  "token": "eyJhbGc...",
  "expiresAt": 1705014000000
}
```

### Get Verification Status
```
GET /api/sumsub/verification-status/:userId

Response:
{
  "applicantId": "5f4e3d2c1b0a9876",
  "userId": "user_123",
  "status": "success",
  "verificationStatus": "completed",
  "reviewResult": {
    "reviewStatus": "APPROVED",
    "reasons": []
  }
}
```

### Webhook Endpoint
```
POST /api/sumsub/webhook
X-Sumsub-Signature: <hmac_signature>

Payload from Sumsub when verification completes
```

## Step 5: Frontend Integration

### Using SumsubWebSDK Component

```tsx
import SumsubWebSDK from '@/components/auth/SumsubWebSDK';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleVerificationComplete = (status, result) => {
    console.log('Verification complete:', status, result);
    // Update user status in your database
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Start KYC Verification
      </button>

      <SumsubWebSDK
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId="user_123"
        email="user@example.com"
        phone="+1234567890"
        levelName="basic-kyc-level"
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
}
```

## Step 6: Verification Levels

Define verification levels in Sumsub dashboard:

### Basic KYC
- ID verification
- Liveness & face match
- Reusable KYC

### Compliance KYC
- Basic KYC + AML screening
- Proof of address verification
- Ongoing AML monitoring

## Step 7: Handling Webhooks

Sumsub will send webhooks when verification completes. Set webhook URL in Sumsub settings:

```
https://your-domain.com/api/sumsub/webhook
```

Webhook payload:
```json
{
  "applicantId": "5f4e3d2c1b0a9876",
  "userId": "user_123",
  "verificationStatus": "completed",
  "reviewResult": {
    "reviewStatus": "APPROVED",
    "reasons": []
  }
}
```

## Step 8: Testing

### Test Documents
Sumsub provides test documents for sandbox mode:
- Use country code: DE (Germany)
- Use test IDs from Sumsub test suite
- Verification completes instantly in sandbox

### Test Flow
1. Generate access token with test userId
2. Launch SumsubWebSDK
3. Upload test document
4. Pass liveness check (or use test mode)
5. Receive instant verification result
6. Check webhook callback in Sumsub logs

## Step 9: Going to Production

1. Request production access in Sumsub dashboard
2. Submit your compliance documentation
3. Sumsub team reviews and approves (1-3 days)
4. Switch environment variables to production credentials
5. Update webhook URL to production domain
6. Run full QA testing

## Cost Estimation

- **Free trial**: 50 checks (14 days)
- **Basic plan**: $1.35/check, $149/mo minimum
- **Example**: 100 users @ $1.35 = $135/month (below $149 minimum)
- **You only pay for successful verifications** (incomplete = free)

## Troubleshooting

### "Failed to load Sumsub WebSDK"
- Check browser console for network errors
- Verify CDN access to `https://static.sumsub.com`
- Check Content Security Policy headers

### "Invalid signature" on webhook
- Verify Secret Key is correct
- Check webhook signature verification logic
- Ensure raw request body is used for signature

### "Token expired" during verification
- Token has 10-minute TTL
- SDK automatically refreshes token
- Check `getNewAccessToken` is implemented correctly

### "Verification status is pending"
- Sandbox: usually instant
- Production: manual review (1-24 hours)
- Check Sumsub dashboard for review status

## Security Best Practices

1. **Never expose Secret Key** to frontend
2. **Always verify webhook signatures**
3. **Use HTTPS** for webhook endpoint
4. **Store verification results** securely
5. **Implement rate limiting** on token endpoint
6. **Log all verification attempts** for audit trail
7. **Handle expired tokens** gracefully

## Reference

- **Sumsub Docs**: https://docs.sumsub.com/
- **Dashboard**: https://cockpit.sumsub.com/
- **API Reference**: https://docs.sumsub.com/reference/about-sumsub-api
- **WebSDK Guide**: https://docs.sumsub.com/docs/about-web-sdk

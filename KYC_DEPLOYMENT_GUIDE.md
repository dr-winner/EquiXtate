# KYC Integration Deployment Guide

## Prerequisites

Before deploying the KYC integration, ensure you have:

1. ✅ Foundry installed (`brew install foundry`)
2. ✅ A wallet with Sepolia ETH for deployment
3. ✅ Sumsub account with App Token and Secret Key
4. ✅ A separate wallet for the KYC oracle (backend)

---

## Step 1: Deploy KYCVerifier Contract

### Option A: Using Foundry

```bash
# Navigate to contracts directory
cd src/contracts

# Set your deployment wallet private key
export PRIVATE_KEY=0x_your_deployment_wallet_private_key

# Set the oracle address (separate wallet that will update KYC status)
export ORACLE_ADDRESS=0x_your_oracle_wallet_address

# Deploy to Sepolia
forge create KYCVerifier \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY \
  --constructor-args $ORACLE_ADDRESS \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Save the deployed contract address
export KYC_VERIFIER_ADDRESS=<deployed_address_from_output>
```

### Option B: Using Hardhat

```bash
# Create a deployment script
cat > scripts/deploy-kyc.ts << 'EOF'
import { ethers } from "hardhat";

async function main() {
  const oracleAddress = process.env.ORACLE_ADDRESS;
  
  console.log("Deploying KYCVerifier with oracle:", oracleAddress);
  
  const KYCVerifier = await ethers.getContractFactory("KYCVerifier");
  const kycVerifier = await KYCVerifier.deploy(oracleAddress);
  
  await kycVerifier.deployed();
  
  console.log("✅ KYCVerifier deployed to:", kycVerifier.address);
  console.log("📝 Add this to your .env:");
  console.log(`VITE_KYC_VERIFIER_CONTRACT=${kycVerifier.address}`);
  console.log(`KYC_VERIFIER_CONTRACT=${kycVerifier.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
EOF

# Run deployment
npx hardhat run scripts/deploy-kyc.ts --network sepolia
```

---

## Step 2: Update Environment Variables

### Frontend (.env)

```bash
# Add to your .env file:

# KYC Verifier Contract
VITE_KYC_VERIFIER_CONTRACT=0x_deployed_contract_address

# Keep existing Sumsub credentials
VITE_SUMSUB_APP_TOKEN=your_app_token
VITE_SUMSUB_SECRET_KEY=your_secret_key
VITE_SUMSUB_SANDBOX_MODE=true
```

### Backend (.env)

```bash
# Oracle configuration (backend only)
ORACLE_PRIVATE_KEY=0x_oracle_wallet_private_key
KYC_VERIFIER_CONTRACT=0x_deployed_contract_address
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Sumsub credentials
VITE_SUMSUB_APP_TOKEN=your_app_token
VITE_SUMSUB_SECRET_KEY=your_secret_key
```

---

## Step 3: Configure Sumsub Webhook

1. Go to [Sumsub Dashboard](https://cockpit.sumsub.com/)
2. Navigate to **Settings > Webhooks**
3. Add webhook URL: `https://your-backend-domain.com/api/sumsub/webhook`
4. Select events to receive:
   - ✅ Applicant Reviewed
   - ✅ Applicant Pending
   - ✅ Applicant Reset

---

## Step 4: Test the Integration

### 4.1 Test Oracle Connection

```bash
# Check oracle can connect to contract
cast call $KYC_VERIFIER_ADDRESS \
  "kycOracle()(address)" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Should return your oracle address
```

### 4.2 Test KYC Status Write

```bash
# Manually set KYC status (from oracle wallet)
cast send $KYC_VERIFIER_ADDRESS \
  "setKYCStatus(address,bool,uint8,string)" \
  $TEST_USER_ADDRESS \
  true \
  3 \
  "test_applicant_id" \
  --private-key $ORACLE_PRIVATE_KEY \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Verify status was set
cast call $KYC_VERIFIER_ADDRESS \
  "isKYCVerified(address)(bool)" \
  $TEST_USER_ADDRESS \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Should return: true
```

### 4.3 Test End-to-End Flow

```bash
# 1. Start dev server
npm run dev

# 2. Connect wallet
# 3. Click "Start KYC Verification"
# 4. Complete Sumsub verification (use test documents in sandbox mode)
# 5. Check webhook logs in terminal
# 6. Verify on-chain status in frontend
```

---

## Step 5: Deploy Property Contracts with KYC Gates

### Update PropertyToken Deployment

```bash
# Deploy PropertyToken with KYC requirement
forge create PropertyToken \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY \
  --constructor-args \
    "Property Name" \
    "PROP" \
    "Luxury Apartment" \
    "Miami, FL" \
    1000000 \
    $PROPERTY_MANAGER_ADDRESS \
    $KYC_VERIFIER_ADDRESS
```

### Deploy PropertyRegistry

```bash
forge create PropertyRegistry \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key $PRIVATE_KEY \
  --constructor-args $KYC_VERIFIER_ADDRESS
```

---

## Step 6: Verify Deployment

### Check Contract on Etherscan

```bash
# Verify contract source code
forge verify-contract \
  $KYC_VERIFIER_ADDRESS \
  KYCVerifier \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" $ORACLE_ADDRESS)

# Visit: https://sepolia.etherscan.io/address/$KYC_VERIFIER_ADDRESS
```

### Monitor Events

```bash
# Watch for KYC updates
cast logs \
  --from-block latest \
  --address $KYC_VERIFIER_ADDRESS \
  "KYCUpdated(address indexed,bool,uint8,uint256)" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

---

## Step 7: Production Checklist

Before going to production:

- [ ] Deploy to mainnet (or production L2)
- [ ] Use production Sumsub credentials
- [ ] Set `VITE_SUMSUB_SANDBOX_MODE=false`
- [ ] Update webhook URL to production backend
- [ ] Secure oracle private key (use AWS KMS, HashiCorp Vault, etc.)
- [ ] Set up monitoring for oracle wallet balance
- [ ] Set up alerts for failed KYC writes
- [ ] Document emergency procedures (oracle key compromise, etc.)
- [ ] Test property purchase flow with real KYC verification
- [ ] Verify expiration handling (1 year KYC validity)

---

## Troubleshooting

### Webhook Not Receiving Events

```bash
# Test webhook endpoint manually
curl -X POST https://your-backend/api/sumsub/webhook \
  -H "Content-Type: application/json" \
  -H "X-Sumsub-Signature: test" \
  -d '{
    "applicantId": "test",
    "externalUserId": "0x123",
    "reviewStatus": "completed",
    "type": "applicantReviewed",
    "reviewResult": {"reviewAnswer": "GREEN"}
  }'
```

### Oracle Transactions Failing

```bash
# Check oracle wallet balance
cast balance $ORACLE_ADDRESS --rpc-url $SEPOLIA_RPC_URL

# Check if oracle is set correctly
cast call $KYC_VERIFIER_ADDRESS "kycOracle()(address)" --rpc-url $SEPOLIA_RPC_URL

# Check gas price
cast gas-price --rpc-url $SEPOLIA_RPC_URL
```

### Frontend Not Reading KYC Status

```bash
# Check contract is configured
echo $VITE_KYC_VERIFIER_CONTRACT

# Verify contract has data
cast call $VITE_KYC_VERIFIER_CONTRACT \
  "getKYCRecord(address)" \
  $YOUR_WALLET_ADDRESS \
  --rpc-url $SEPOLIA_RPC_URL
```

---

## Security Recommendations

### Oracle Wallet Management

1. **Separate Wallet**: Never use deployment wallet as oracle
2. **Minimal Balance**: Only keep enough ETH for ~100 transactions
3. **Monitoring**: Alert when balance drops below threshold
4. **Rotation**: Rotate oracle wallet quarterly using `setOracle()`
5. **Backup**: Store oracle key in secure vault (never in Git)

### Access Control

```solidity
// Only oracle can update KYC
require(msg.sender == kycOracle, "Only oracle can update KYC");

// Owner can update oracle address if compromised
function setOracle(address newOracle) external onlyOwner {
    // ... update oracle
}
```

### Rate Limiting

Consider adding rate limiting to webhook endpoint:

```typescript
// In sumsub.ts
const rateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
});

router.post('/webhook', rateLimit, async (req, res) => {
  // ... webhook handler
});
```

---

## Cost Estimation

### Gas Costs (Sepolia/Mainnet)

| Operation | Gas Used | Cost (15 gwei) |
|-----------|----------|----------------|
| Deploy KYCVerifier | ~1,500,000 | ~$3-5 |
| setKYCStatus | ~50,000 | ~$1-2 |
| isKYCVerified (read) | 0 | Free |
| purchaseTokens (with KYC check) | +5,000 | +$0.10 |

### Monthly Operating Costs

- **Oracle Gas**: ~$50-100 (assuming 50 KYC updates/month)
- **RPC Calls**: Free (using public RPC)
- **Sumsub**: $0.50-2.00 per verification
- **Total**: ~$75-200/month for 50 users

---

## Support & Resources

- **Sumsub Docs**: https://docs.sumsub.com/
- **Foundry Docs**: https://book.getfoundry.sh/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Etherscan Sepolia**: https://sepolia.etherscan.io/

---

## Quick Commands Reference

```bash
# Check KYC status
cast call $CONTRACT "isKYCVerified(address)(bool)" $USER --rpc-url $RPC

# Get KYC tier
cast call $CONTRACT "getUserTier(address)(uint8)" $USER --rpc-url $RPC

# Check if can list properties
cast call $CONTRACT "canListProperties(address)(bool)" $USER --rpc-url $RPC

# Get full record
cast call $CONTRACT "getKYCRecord(address)" $USER --rpc-url $RPC

# Update oracle (owner only)
cast send $CONTRACT "setOracle(address)" $NEW_ORACLE --private-key $OWNER_KEY --rpc-url $RPC

# Revoke KYC (oracle only)
cast send $CONTRACT "revokeKYC(address)" $USER --private-key $ORACLE_KEY --rpc-url $RPC
```

---

**Ready to deploy!** 🚀

Follow the steps above in order, and you'll have a fully functional on-chain KYC system integrated with Sumsub verification.

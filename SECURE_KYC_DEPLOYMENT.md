# 🔐 Secure KYC Deployment - Step by Step

## ⚠️ SECURITY ALERT

Your PRIVATE_KEY is exposed in `.env` and shell history!

**IMMEDIATE ACTIONS:**
1. Move all funds OUT of that wallet immediately
2. Never use it again
3. Create a NEW wallet for deployment
4. Rotate all exposed keys:
   - Privy Secret Key
   - Sumsub App Token & Secret
   - Etherscan API Key

---

## Prerequisites

### 1. Create New Wallets

**Deployer Wallet** (for contract deployment):
- Go to: https://app.metamask.io/ or https://wallet.argent.xyz/
- Create a **new** wallet
- Fund it with Sepolia ETH (0.5-1 ETH is enough)
- Get from faucet: https://sepoliafaucet.com/

**Oracle Wallet** (separate, for KYC updates):
- Create another **new** wallet
- Fund with ~0.2 Sepolia ETH (only for gas)
- NEVER expose this key in code/logs

### 2. Get Sumsub Credentials

1. Visit: https://cockpit.sumsub.com/
2. Sign in or create account
3. Go to: **Settings → App Tokens**
4. Create new token
5. Save **App Token** and **Secret Key**

### 3. Get Etherscan API Key (optional but recommended)

1. Visit: https://etherscan.io/myapikey
2. Sign in or create account
3. Click **"Add Project"**
4. Name it: "EquiXtate KYC"
5. Copy the API key

---

## Deployment Steps

### Step 1: Prepare Local Configuration

```bash
# In project root:

# Copy template
cp .env.local.template .env.local

# Edit .env.local with your actual values
nano .env.local
```

**What to add to `.env.local`:**

```env
# NEW deployer wallet (from step above)
PRIVATE_KEY=0x<new_deployer_wallet_private_key>

# Etherscan (for contract verification)
ETHERSCAN_API_KEY=<your_etherscan_key_here>
```

> ⚠️ **Do NOT edit `.env`!** Use only `.env.local`

### Step 2: Verify `.gitignore` Protection

```bash
# Confirm .env.local is ignored:
git check-ignore .env.local
# Should output: .env.local
```

If NOT ignored, add manually:
```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Ensure .env.local is ignored"
```

### Step 3: Run Secure Deployment Script

```bash
# Make sure you're in project root
cd /Users/pro_coder/Desktop/projects/equixtate

# Run the secure deployment script
./deploy-kyc-secure.sh
```

**The script will:**
1. ✅ Check Foundry is installed
2. ✅ Ask for oracle wallet address (doesn't need private key)
3. ✅ Read PRIVATE_KEY safely from `.env.local` (not shell history)
4. ✅ Deploy KYCVerifier contract to Sepolia
5. ✅ Verify oracle is set correctly
6. ✅ Output deployment info to `.env.kyc` file

**Example output:**
```
✅ Contract deployed successfully!
Contract Address: 0x1234567890abcdef...

Oracle correctly set to: 0xabcdef...

Configuration saved to: .env.kyc
```

### Step 4: Add Contract Address to Frontend

Open `.env.local` and add:

```env
VITE_KYC_VERIFIER_CONTRACT=0x<address_from_deployment>
```

Restart dev server:
```bash
npm run dev
```

### Step 5: Configure Backend Oracle

Add to **backend `.env`** (if you have a separate backend):

```env
KYC_VERIFIER_CONTRACT=0x<address_from_deployment>
ORACLE_PRIVATE_KEY=0x<oracle_wallet_private_key>
ORACLE_ADDRESS=0x<oracle_wallet_address>
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

> ⚠️ Keep this file PRIVATE - never commit to Git

### Step 6: Configure Sumsub Webhook

1. Visit: https://cockpit.sumsub.com/
2. Go to: **Settings → Webhooks**
3. Click **"Add Webhook"**
4. Enter webhook URL:
   ```
   https://your-backend-domain.com/api/sumsub/webhook
   ```
5. Select events:
   - ☑️ Applicant Reviewed
   - ☑️ Applicant Pending
   - ☑️ Applicant Reset
6. Click **Save**

> For local testing, use ngrok: `ngrok http 3000` and use the ngrok URL

### Step 7: Test Oracle Transaction (Optional)

```bash
# Verify oracle wallet has ETH
cast balance 0x<oracle_address> \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Should show: 0.1-0.5 ETH

# Test setting KYC status (from oracle wallet)
cast send 0x<contract_address> \
  "setKYCStatus(address,bool,uint8,string)" \
  0x<test_user_wallet> \
  true \
  3 \
  "test_applicant_id" \
  --private-key $ORACLE_PRIVATE_KEY \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

### Step 8: Test End-to-End (Sumsub → On-Chain)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Connect wallet** in the app

3. **Click "Start KYC Verification"**

4. **Complete Sumsub** (use sandbox test docs: https://docs.sumsub.com/docs/test-environment)

5. **Check backend logs:**
   ```
   📥 Sumsub webhook received
   ⛓️  Writing KYC status to blockchain
   ✅ KYC status written on-chain
   ```

6. **Verify frontend** shows you as verified

7. **Check contract** (optional):
   ```bash
   cast call 0x<contract> "isKYCVerified(address)(bool)" \
     0x<your_wallet> \
     --rpc-url https://ethereum-sepolia-rpc.publicnode.com
   # Should return: true
   ```

---

## Verify on Etherscan

Once deployed:

1. Visit: https://sepolia.etherscan.io/
2. Search for your contract address: `0x...`
3. You should see:
   - ✅ Contract code
   - ✅ Verified source (if Etherscan key was used)
   - ✅ KYCUpdated events (after first KYC)

---

## Troubleshooting

### "Private key not found in .env.local"

```bash
# Make sure .env.local exists and has PRIVATE_KEY
ls -la .env.local
grep PRIVATE_KEY .env.local
```

### "Deployment failed: insufficient balance"

- Deployer wallet needs Sepolia ETH
- Get from: https://sepoliafaucet.com/

### "Oracle address mismatch"

- Double-check you entered the correct oracle wallet address
- Run deployment again with correct address

### "Webhook not receiving Sumsub events"

- Verify webhook URL is correct in Sumsub dashboard
- For local testing, use: `ngrok http 3000`
- Check backend logs for errors

---

## Key Security Best Practices

✅ **DO:**
- Use separate wallets for deployer and oracle
- Store keys in `.env.local` (gitignored)
- Rotate keys if exposed
- Keep oracle wallet minimal balance
- Use Etherscan to verify contracts
- Clear shell history: `history -c`

❌ **DON'T:**
- Commit `.env.local` to Git
- Share private keys in Slack/email
- Use same wallet for multiple roles
- Paste keys into browser console
- Leave keys in shell history

---

## Production Deployment

When ready for mainnet:

1. Create separate wallet on **mainnet** (not testnet)
2. Fund with real ETH (expensive!)
3. Update all RPC URLs to mainnet
4. Switch Sumsub from sandbox to production
5. Deploy contracts to mainnet
6. Update all `.env` files
7. Enable monitoring & alerts

---

## Support Resources

- **Foundry Docs**: https://book.getfoundry.sh/
- **Sumsub API**: https://docs.sumsub.com/reference/get-started-with-api
- **Etherscan**: https://sepolia.etherscan.io/ (Sepolia testnet)
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

**Ready? Run:** `./deploy-kyc-secure.sh`

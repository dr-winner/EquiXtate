# 🚀 KYC Deployment Quick Links & Commands

## Direct Links (Click to Open)

### Wallets & Faucets
- **Create/Manage Wallet**: https://app.metamask.io/
- **Alternative Wallet**: https://wallet.argent.xyz/
- **Get Sepolia ETH**: https://sepoliafaucet.com/

### Sumsub Dashboard
- **Main Dashboard**: https://cockpit.sumsub.com/
- **Get App Token**: https://cockpit.sumsub.com/ → Settings → App Tokens
- **Webhook Setup**: https://cockpit.sumsub.com/ → Settings → Webhooks
- **API Docs**: https://docs.sumsub.com/reference/get-started-with-api
- **Test Documents**: https://docs.sumsub.com/docs/test-environment

### Blockchain Explorers & APIs
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Get Etherscan Key**: https://etherscan.io/myapikey
- **Sepolia Network Details**: https://chainlist.org/chain/11155111

### Documentation
- **Foundry Book**: https://book.getfoundry.sh/
- **Cast Commands**: https://book.getfoundry.sh/reference/cast/
- **Forge Deploy**: https://book.getfoundry.sh/forge/deploying

---

## Quick Command Reference

### 1. Check Prerequisites
```bash
# Foundry installed?
forge --version

# Cast installed?
cast --version
```

### 2. Setup Local Config
```bash
# Copy template
cp .env.local.template .env.local

# Edit with your keys
nano .env.local
```

### 3. Deploy KYCVerifier
```bash
# Run secure deployment (from project root)
./deploy-kyc-secure.sh

# Follow the prompts
# - Enter oracle wallet address
# - Wait for deployment
# - Note the contract address
```

### 4. Verify Oracle (after deployment)
```bash
# Check oracle is set correctly
cast call 0x<contract_address> \
  "kycOracle()(address)" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

### 5. Test KYC Write (optional)
```bash
# Set KYC status as oracle
cast send 0x<contract_address> \
  "setKYCStatus(address,bool,uint8,string)" \
  0x<test_user_address> \
  true \
  3 \
  "test_id" \
  --private-key $ORACLE_PRIVATE_KEY \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com

# Verify it was set
cast call 0x<contract_address> \
  "isKYCVerified(address)(bool)" \
  0x<test_user_address> \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

### 6. Check Contract on Chain
```bash
# Visit (replace with your address):
https://sepolia.etherscan.io/address/0x<contract_address>
```

---

## Getting Credentials (Step by Step with Links)

### Get Sumsub App Token
1. Open: https://cockpit.sumsub.com/
2. Sign in or create account
3. Click **Settings** (left sidebar)
4. Click **App Tokens**
5. Click **"Create new"**
6. Copy **App Token** → paste to `.env.local`
7. Copy **Secret Key** → paste to `.env.local`

### Get Etherscan API Key
1. Open: https://etherscan.io/myapikey
2. Sign in or create account
3. Click **"+ Add Project"**
4. Name: `EquiXtate KYC`
5. Click **Create New API Key**
6. Copy key → paste to `.env.local`

### Create Wallets
1. **Deployer Wallet**:
   - Go: https://app.metamask.io/
   - Create account
   - Get address (0x...)
   - Fund with Sepolia ETH from: https://sepoliafaucet.com/
   - Export private key (Settings → Security & Privacy → Reveal Seed Phrase)

2. **Oracle Wallet**:
   - Go: https://app.metamask.io/
   - Create NEW account
   - Get address (0x...)
   - Fund with 0.2 Sepolia ETH from: https://sepoliafaucet.com/
   - Keep private key SECURE (for backend only)

---

## Files Created for You

| File | Purpose | Action |
|------|---------|--------|
| `deploy-kyc-secure.sh` | Secure deployment script | Run: `./deploy-kyc-secure.sh` |
| `.env.local.template` | Config template | Copy to `.env.local` and edit |
| `SECURE_KYC_DEPLOYMENT.md` | Full deployment guide | Read for detailed steps |
| `.env.kyc` | Generated after deploy | Check for contract address |

---

## Environment Variables Needed

### Frontend (`.env.local`)
```env
VITE_KYC_VERIFIER_CONTRACT=0x<address>
```

### Backend (`.env` - KEEP PRIVATE)
```env
KYC_VERIFIER_CONTRACT=0x<address>
ORACLE_PRIVATE_KEY=0x<key>
ORACLE_ADDRESS=0x<address>
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

---

## The Exact Flow

```
1. Create new wallets
   ↓
2. Fund with Sepolia ETH (https://sepoliafaucet.com/)
   ↓
3. Get Sumsub credentials (https://cockpit.sumsub.com/ → Settings)
   ↓
4. Get Etherscan key (https://etherscan.io/myapikey)
   ↓
5. Add to .env.local (using template)
   ↓
6. Run: ./deploy-kyc-secure.sh
   ↓
7. Wait for deployment ✅
   ↓
8. Add contract address to .env.local
   ↓
9. Restart: npm run dev
   ↓
10. Test: Go through KYC flow in frontend
```

---

## Verification Checklist

After deployment, verify:

- [ ] Wallet funded with Sepolia ETH (use: https://sepoliafaucet.com/)
- [ ] `.env.local` has PRIVATE_KEY from NEW wallet
- [ ] `.env.local` NOT committed to Git
- [ ] Contract deployed (address shows in terminal)
- [ ] Oracle address verified (cast call shows correct address)
- [ ] `VITE_KYC_VERIFIER_CONTRACT` added to `.env.local`
- [ ] Dev server restarted after adding contract address
- [ ] Sumsub webhook configured (https://cockpit.sumsub.com/ → Settings)
- [ ] Backend has `.env` with oracle key (NOT in Git)

---

## Emergency: Key Exposed?

If you expose a private key:

1. **Immediately transfer funds OUT** of that wallet
2. **Never use it again**
3. **Create new wallet** for next deployment
4. **Rotate all API keys**:
   - Privy Secret: https://dashboard.privy.io/
   - Sumsub Key: https://cockpit.sumsub.com/
   - Etherscan Key: https://etherscan.io/myapikey
5. **Clear shell history**: `history -c`

---

## Need Help?

- **Foundry Issues**: https://book.getfoundry.sh/
- **Sumsub API**: https://docs.sumsub.com/reference/get-started-with-api
- **Contract Verification**: https://sepolia.etherscan.io/

**Start here:** `./deploy-kyc-secure.sh` 🚀

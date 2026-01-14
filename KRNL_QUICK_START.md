# Quick Reference: KRNL Credential Setup

## TL;DR - What You Need

To use EquiXtate's KRNL verification system, you need **4 things** from KRNL:

| Item | What It Is | Where to Find |
|------|-----------|---------------|
| **Entry ID** | Your app identifier on KRNL | KRNL Dashboard → API Keys |
| **Access Token** | Authentication token | KRNL Dashboard → API Keys |
| **RPC URL** | Network endpoint | Always: `https://rpc.krnl.io` |
| **Contract Address** | Your smart contract | KRNL Dashboard or your deployment |

## How to Get Them (5 Minutes)

```bash
1. Go to https://app.krnl.io
2. Sign in with your wallet
3. Click "API Keys" or "Credentials"
4. Create new application:
   - Name: "EquiXtate"
   - Kernel ID: 1529
   - Network: Sonic Testnet
5. Copy the Entry ID and Access Token
6. Update .env file with values
```

## Update Your .env File

```bash
# Open .env and replace:
VITE_KRNL_ENTRY_ID=<your_entry_id_from_krnl>
VITE_KRNL_ACCESS_TOKEN=<your_access_token_from_krnl>
VITE_CONTRACT_ADDRESS=<your_contract_address>
```

## Test It Works

```bash
npm run dev
# Look for console messages:
# ✓ KRNL config check: hasRpcUrl: true, hasEntryId: true, hasAccessToken: true
```

## When You Deploy to Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   ```
   NEXT_PUBLIC_RPC_KRNL=https://rpc.krnl.io
   NEXT_PUBLIC_ENTRY_ID=<your_entry_id>
   NEXT_PUBLIC_ACCESS_TOKEN=<your_access_token>
   NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>
   ```
5. Redeploy

## FAQ

**Q: Where's my RPC URL?**  
A: It's always `https://rpc.krnl.io` - no need to change it.

**Q: Can I share my credentials?**  
A: No! Keep them in `.env` only. Never commit to git.

**Q: How long are credentials valid?**  
A: Check your KRNL Dashboard. Usually 1 year + auto-renewal.

**Q: What if credentials expire?**  
A: Generate new ones in KRNL Dashboard and update `.env`.

**Q: Does my smart contract need to be deployed?**  
A: Yes, you need a contract address. See your contracts/ folder.

## System Info

- **Kernel ID**: 1529 (property verification)
- **Smart Contract ID**: 7709
- **Network**: Sonic Testnet (configurable)
- **Your Implementation**: `src/krnl/1529/`

## Files Updated

- ✅ `.env` - Ready for your credentials
- ✅ `src/utils/envConfig.ts` - Validates credentials
- ✅ `src/krnl/1529/config.ts` - Uses your credentials
- ✅ `src/services/KRNLVerificationService.ts` - Executes verification

## Need Help?

1. **Full guide**: See `KRNL_SETUP.md`
2. **Code reference**: See `ONBOARDING_GUIDE.md`
3. **KRNL docs**: https://docs.krnl.io
4. **Issues**: Check browser console for error messages

---

**Status**: ✅ System ready - just need your KRNL credentials!

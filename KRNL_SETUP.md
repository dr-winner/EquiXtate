# KRNL Setup Guide for EquiXtate

## Your Project Configuration

Your EquiXtate project is already set up to use KRNL with:
- **Kernel ID**: `1529` (for property verification)
- **Smart Contract ID**: `7709`
- **RPC Endpoint**: `https://rpc.krnl.io`

## Step-by-Step: Getting KRNL Credentials

### Step 1: Access KRNL Dashboard
1. Visit: **https://app.krnl.io**
2. Sign in with your wallet (MetaMask, WalletConnect, etc.)
3. If no account, create one

### Step 2: Navigate to API/Credentials Section
In the dashboard, look for:
- **"API Keys"** 
- **"Credentials"**
- **"Applications"** or **"Integrations"**
- **"Kernels"** management area

### Step 3: Create/Register Your Application
1. Click **"+ Create New"** or **"Add Application"**
2. Fill in the details:
   - **App Name**: `EquiXtate Property Verification`
   - **Kernel ID**: `1529` (your property verification kernel)
   - **Use Case**: Real estate property ownership verification
   - **Network**: Sonic Testnet (or your target network)

### Step 4: Configure Your Kernel
You may need to configure what your kernel does:
- **Input**: Property ID, Owner Address, Documents
- **Output**: Ownership verification status, attestation hash
- **Government APIs**: Property records, title registries

### Step 5: Generate Credentials
After creating your application, KRNL will generate:

```
Entry ID:        abc123xyz-def456...
Access Token:    eyJhbGc...
RPC Endpoint:    https://rpc.krnl.io
Contract Address: 0x...
```

### Step 6: Update Your .env File

Copy the credentials to your `.env` file:

```dotenv
# From KRNL Dashboard
VITE_RPC_KRNL=https://rpc.krnl.io
VITE_KRNL_ENTRY_ID=<your_entry_id_from_step_5>
VITE_KRNL_ACCESS_TOKEN=<your_access_token_from_step_5>
VITE_KRNL_KERNEL_ID=1529
VITE_CONTRACT_ADDRESS=<your_contract_address>

# For Vercel/Production
NEXT_PUBLIC_RPC_KRNL=https://rpc.krnl.io
NEXT_PUBLIC_ENTRY_ID=<your_entry_id_from_step_5>
NEXT_PUBLIC_ACCESS_TOKEN=<your_access_token_from_step_5>
NEXT_PUBLIC_KERNEL_ID=1529
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>
```

### Step 7: Test Configuration
After updating `.env`:

```bash
# Stop dev server if running
npm run dev
# Check browser console for KRNL config validation messages
```

You should see in the console:
```
[envConfig] KRNL config check:
  hasRpcUrl: true ✓
  hasEntryId: true ✓
  hasAccessToken: true ✓
```

## Where to Get Each Credential

| Credential | Source | Location |
|-----------|--------|----------|
| **Entry ID** | KRNL Dashboard | API Keys / Credentials section |
| **Access Token** | KRNL Dashboard | API Keys / Credentials section |
| **RPC URL** | KRNL | Always `https://rpc.krnl.io` |
| **Kernel ID** | Your config | Already set to `1529` |
| **Contract Address** | Your smart contract | Deploy or use existing address |

## Important Notes

⚠️ **Never commit credentials to git!**
- `.env` file is already in `.gitignore`
- Keep secrets out of version control
- Use `.env.example` template only for documentation

✅ **Your code is ready to use these credentials**
- `src/krnl/1529/config.ts` imports them automatically
- `src/services/KRNLVerificationService.ts` uses them
- All services expect these environment variables

🔐 **For Production (Vercel, etc.)**
- Add variables as environment variables in Vercel dashboard
- Use `NEXT_PUBLIC_*` prefix for client-side variables
- Use regular names for server-side variables

## Troubleshooting

### "KRNL RPC URL not configured"
- Check `VITE_RPC_KRNL` is set in `.env`
- Restart dev server after updating `.env`

### "Entry ID or Access Token not found"
- Verify both variables exist in `.env`
- Copy exact values from KRNL Dashboard (no extra spaces)
- Check for typos in variable names

### KRNL Verification Fails
- Verify RPC endpoint is accessible
- Check credentials haven't expired
- Review KRNL Dashboard for any restrictions
- Check console for detailed error messages

## Next Steps

1. **Get your KRNL credentials** (steps 1-6 above)
2. **Update .env file** with your credentials
3. **Restart dev server** (`npm run dev`)
4. **Test submission** in the property upload modal
5. **Monitor console** for verification status

## Additional Resources

- **KRNL Official Site**: https://krnl.io
- **KRNL Documentation**: https://docs.krnl.io
- **Your Project Docs**: See `ONBOARDING_GUIDE.md`
- **Code Reference**: `src/krnl/1529/`

## Questions?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Review KRNL Dashboard for API restrictions
4. Contact KRNL support: support@krnl.io

---

**Ready?** Once you have your credentials from KRNL, update `.env` and you're good to go! 🚀

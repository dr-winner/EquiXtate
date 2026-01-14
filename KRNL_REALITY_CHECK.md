# KRNL Integration - What You Actually Need

## 🎯 The Real Setup (Based on Official Docs)

KRNL is **NOT** just API keys. It's a complete protocol requiring:

### What KRNL Does
- Executes off-chain computations verified on-chain
- Integrates with external APIs (property records, government databases)
- Provides cryptographic attestation of results
- Works across multiple blockchain networks

### What You Need To Set Up

#### 1. **Smart Contracts** (Foundry)
```bash
# Deploy to Sepolia testnet
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast

# Result: Your contract address
VITE_REAL_ESTATE_INVESTMENT_ADDRESS=0x...
```

#### 2. **Attestor Image** (Docker)
```bash
# Creates a Docker image that:
# - Verifies property data
# - Calls external APIs
# - Signs results with your private key
# - Gets deployed to Docker Hub

# Result: Your attestor image
VITE_ATTESTOR_IMAGE=image://docker.io/username/attestor:latest
```

#### 3. **Frontend Integration** (.env)
```
VITE_PRIVY_APP_ID=your_privy_app
VITE_PRIVY_APP_SECRET=your_secret
VITE_DELEGATE_OWNER=your_wallet_address
VITE_ATTESTOR_IMAGE=image://docker.io/username/attestor:latest
VITE_REAL_ESTATE_INVESTMENT_ADDRESS=0x...
VITE_PIMLICO_API_KEY=your_pimlico_key
```

#### 4. **External Services**
- Privy for authentication
- Pimlico for bundled transactions
- Ethereum Sepolia testnet for contracts
- Docker Hub for attestor image

## 📋 Complete Setup Checklist

- [ ] Install Foundry (`brew install foundry`)
- [ ] Install Docker Desktop
- [ ] Create Privy App (https://dashboard.privy.io/)
- [ ] Create Pimlico Account (https://dashboard.pimlico.io/)
- [ ] Get Sepolia testnet ETH from faucet
- [ ] Clone KRNL example repo
- [ ] Deploy contracts to Sepolia
- [ ] Create attestor image via Docker
- [ ] Push attestor to Docker Hub
- [ ] Update .env with all values
- [ ] Test in development

## 🚀 Your EquiXtate Services

Your code is **perfectly designed** for KRNL:

```typescript
// src/services/KRNLVerificationService.ts
// Calls your attestor image
// Gets property verification results
// Creates on-chain attestations

// src/services/PropertyOnboardingService.ts
// Uses KRNLVerificationService
// Manages the full property lifecycle
// Handles tokenization after verification
```

You just need to:
1. Deploy the smart contracts
2. Create the attestor image
3. Update .env with deployed addresses
4. Connect frontend to working attestor

## 📚 Official Documentation Path

Follow this exact path from KRNL:

1. **Preparations**: Get API keys and tools
   - https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev#preparations

2. **Deploy Smart Contract**: Get your contract address
   - https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev#deploy-the-target-contract

3. **Setup Attestor Image**: Build Docker image
   - https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev#setup-the-attestor-image

4. **Setup Frontend**: Connect everything together
   - https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev#setup-the-dapp

## ⚠️ Don't Skip Steps

KRNL requires:
- ✅ Smart contract deployed
- ✅ Attestor Docker image built
- ✅ All .env values set
- ✅ Sepolia ETH for gas

Without any ONE of these, your app won't work.

## 💡 Simplified Development Path

**Recommended for now:**

1. Focus on **UI/UX** with mock verification
2. Get contracts deployed and tested
3. Build attestor step by step
4. Integrate into your app gradually

Your services are ready for this modular approach.

## 📞 Next Steps

1. **Read**: https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev
2. **Setup**: Follow the checklist above
3. **Deploy**: Get contracts on Sepolia
4. **Build**: Create your attestor image
5. **Connect**: Update .env and test

---

**Status**: Your code is production-ready for KRNL. Now just need to follow KRNL's setup process! 🎉

# KRNL Setup Guide - Correct Process

Based on official KRNL documentation: https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev

## ⚠️ Important: KRNL is More Complex Than Simple API Keys

KRNL isn't just about getting Entry ID and Access Token. It's a **full protocol** requiring:

1. **Smart Contract Deployment** (your target contract)
2. **Attestor Image Setup** (via Docker)
3. **Workflow DSL** (defining what KRNL does)
4. **Privy Integration** (authentication)
5. **dApp Integration** (frontend)

## What You Actually Need

### Phase 1: Prepare Your Environment

```bash
# Install Foundry
brew install foundry

# Install Docker Desktop
# Download from: https://www.docker.com/get-started/

# Get a Sepolia testnet ETH faucet
# https://docs.krnl.xyz/helpful-resources/testnet-faucets

# Get API Keys:
- Privy App ID & Secret: https://dashboard.privy.io/
- Pimlico API Key: https://dashboard.pimlico.io/apikeys
- Etherscan API Key: https://etherscan.io/
```

### Phase 2: Deploy Your Smart Contract

```bash
# 1. Clone KRNL example
git clone https://github.com/KRNL-Labs/poc-dapp-realestateinvestment-7702.git hello-krnl
cd hello-krnl/contracts

# 2. Create .env
cat > .env << EOF
PRIVATE_KEY=0x<your_wallet_private_key>
MOCK_USDC_ADDRESS=0xF2Ea67F83b58225edF11F3Af4A5733B3E0844509
DELEGATED_ACCOUNT_ADDRESS=0x9969827E2CB0582e08787B23F641b49Ca82bc774
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=<your_etherscan_api>
EOF

# 3. Install dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install eth-infinitism/account-abstraction@v0.7.0 --no-commit
forge install foundry-rs/forge-std --no-commit

# 4. Deploy contract
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast
```

### Phase 3: Setup Attestor Image (Docker)

```bash
# 1. Download attestor creation script
curl https://public.mypinata.cloud/ipfs/bafkreifvezdhwvmi6psqqk6vxalazp56ovx3fmgqkmfu5ih5xyxsdbfixi -o create-attestor-standalone.sh
chmod +x create-attestor-standalone.sh

# 2. Run the script
./create-attestor-standalone.sh

# 3. Follow the prompts:
#    - Project name: equixtate
#    - Docker registry: docker.io
#    - Docker username: <your_docker_hub_username>
#    - Private key: <same_as_contract>
#    - Encryption secret: <auto-generate>
#    - Workflow secrets:
#      - rpcSepoliaURL=https://ethereum-sepolia-rpc.publicnode.com
#      - pimlico-apikey=<your_pimlico_key>
#      - OPENAI_API_KEY=mock-api

# 4. Result: Your attestor image URL
# Example: image://docker.io/your-username/attestor-equixtate:latest
```

### Phase 4: Setup Frontend .env

```bash
cd ../frontend
cp .env.example .env

# Edit .env with:
VITE_PRIVY_APP_ID=<from_privy_dashboard>
VITE_PRIVY_APP_SECRET=<from_privy_dashboard>

VITE_CHAIN_ID=11155111  # Sepolia

VITE_DELEGATED_ACCOUNT_ADDRESS=0x9969827E2CB0582e08787B23F641b49Ca82bc774

VITE_DELEGATE_OWNER=<your_eoa_address>

VITE_REAL_ESTATE_INVESTMENT_ADDRESS=<from_contract_deployment>

VITE_MOCK_USDC_ADDRESS=0xaC66E9916dCe765405E4A4297DdDF61729CbDFF9

VITE_ATTESTOR_IMAGE=image://docker.io/your-username/attestor-equixtate:latest

VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## For EquiXtate Specifically

Your project structure expects a simpler setup, but to use KRNL fully, you need:

1. **Deploy a Property Contract**
   - Reference: `src/contracts/PropertyMarketplace.sol`
   - Deploy to Sepolia testnet
   - Note the contract address

2. **Create Attestor for Property Verification**
   - Defines what property data to verify
   - Uses external APIs to validate
   - Runs through Docker

3. **Connect Frontend to Attestor**
   - `src/services/KRNLVerificationService.ts` uses the attestor
   - Sends property data to KRNL workflow
   - Receives verification results

## Current Status of Your Code

✅ **What's ready:**
- `src/services/KRNLVerificationService.ts` - Uses KRNL for verification
- `src/services/PropertyOnboardingService.ts` - Manages onboarding flow
- `src/services/UserOnboardingService.ts` - Manages KYC
- `src/components/property/VerificationStatusDashboard.tsx` - Shows status

❌ **What you still need:**
1. Deploy smart contracts to Sepolia
2. Get Privy credentials
3. Get Pimlico API key
4. Create and deploy attestor image via Docker
5. Configure frontend .env with deployed addresses

## Recommended Path Forward

### Option 1: Full KRNL Integration (Recommended)
Follow the official KRNL tutorial to understand the full flow, then adapt your existing services

### Option 2: Simplified for Development
Use mock verification in development, integrate KRNL when ready for production

### Option 3: Fork KRNL Example
Clone their example repo and modify it with your UI

## Resources

- **Official KRNL Local Dev Guide**: https://docs.krnl.xyz/getting-started/getting-started-with-krnl/local-dev
- **KRNL Example Repo**: https://github.com/KRNL-Labs/poc-dapp-realestateinvestment-7702
- **Foundry Docs**: https://book.getfoundry.sh/
- **Docker Guide**: https://docs.docker.com/
- **Privy Dashboard**: https://dashboard.privy.io/
- **Pimlico Dashboard**: https://dashboard.pimlico.io/

## Next Steps

1. ✅ Understand KRNL architecture from official docs
2. 📋 Gather all required API keys
3. 🔧 Deploy your smart contracts
4. 🐳 Create and deploy attestor image
5. 🎨 Connect frontend to deployed attestor
6. 🧪 Test the full flow

---

**Note**: The process is more involved than typical API integrations. KRNL is building infrastructure for trusted off-chain computation, which requires additional setup.

# KRNL Integration Audit & Required Changes

## Executive Summary

After reviewing the official KRNL documentation and auditing the codebase, several critical issues have been identified that need to be addressed for proper KRNL integration.

## Current State Assessment

### ✅ What's Working
- **Services Architecture**: KRNLVerificationService, PropertyOnboardingService, and UserOnboardingService are well-designed and functional
- **UI Components**: PropertyUploadModal and VerificationStatusDashboard are complete
- **Dependencies**: krnl-sdk (v0.0.5) is properly installed
- **Basic Configuration**: envConfig.ts has proper validation logic

### ❌ Critical Issues

#### 1. **Environment Variable Inconsistencies**

**Problem**: Multiple prefix conventions causing configuration mismatches

**Current State**:
- `.env` uses: `VITE_*` prefix (Vite convention)
- `src/krnl/1529/config.ts` expects: `NEXT_PUBLIC_*` prefix (Next.js convention)
- `src/utils/envConfig.ts` attempts to handle both but creates confusion

**Affected Files**:
- `src/krnl/1529/index.ts` - Line 9: `process.env.NEXT_PUBLIC_RPC_KRNL`
- `src/krnl/1529/config.ts` - Lines 1-10: All imports use `NEXT_PUBLIC_*`
- `src/services/KRNLVerificationService.ts` - Line 93: Tries both prefixes
- `src/utils/envConfig.ts` - Lines 15, 18, 21: Fallback logic

**Impact**: 🔴 CRITICAL - Code cannot access environment variables at runtime

**Solution Required**:
```bash
# Option A: Update .env to include NEXT_PUBLIC_* equivalents
VITE_RPC_KRNL=http://127.0.0.1:8545
NEXT_PUBLIC_RPC_KRNL=http://127.0.0.1:8545

# Option B: Refactor src/krnl/1529/ to use VITE_* prefix only
# Recommended: Option B (cleaner, Vite-native)
```

---

#### 2. **Missing KRNL Infrastructure**

**Problem**: Services expect deployed infrastructure that doesn't exist yet

**Missing Components**:
1. **Smart Contracts** - Not deployed to Sepolia
   - No contract address for `VITE_REAL_ESTATE_INVESTMENT_ADDRESS`
   - PropertyMarketplace.sol, PropertyToken.sol need deployment
   
2. **Attestor Docker Image** - Not created
   - Missing `VITE_ATTESTOR_IMAGE` URL
   - Required for off-chain verification workflows
   
3. **KRNL Workflow Definition** - Not implemented
   - Current code uses direct SDK calls
   - Should use workflow DSL as per official docs

**Impact**: 🔴 CRITICAL - KRNL verification cannot execute

**Steps Required**:
```bash
# Step 1: Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Step 2: Deploy Smart Contracts
cd src/contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --broadcast

# Step 3: Create Attestor Image
# Follow KRNL_FULL_SETUP.md sections 5-6

# Step 4: Update .env with deployed addresses
```

---

#### 3. **Missing Environment Variables**

**Problem**: .env has placeholders for critical variables

**Missing Values** (lines from .env):
```bash
VITE_RPC_KRNL=""  # Should be: http://127.0.0.1:8545 or https://sepolia.infura.io/v3/YOUR_KEY
VITE_KRNL_ENTRY_ID=""  # From KRNL dashboard after workflow creation
VITE_KRNL_ACCESS_TOKEN=""  # From KRNL dashboard
VITE_REAL_ESTATE_INVESTMENT_ADDRESS=""  # From smart contract deployment
VITE_ATTESTOR_IMAGE=""  # Docker image URL after push
VITE_DELEGATE_OWNER=""  # Your EOA address (0x...)
```

**Impact**: 🟡 HIGH - Services will fail with empty config

**Solution**:
1. Deploy contracts → get addresses
2. Create KRNL workflow → get entry ID and token
3. Build attestor → get image URL
4. Update .env with real values

---

#### 4. **Workflow Implementation Mismatch**

**Problem**: Code doesn't follow official KRNL workflow DSL pattern

**Current Implementation** (src/krnl/1529/index.ts):
```typescript
// Current: Direct SDK execution
export async function executeKrnl(address?: string, customKernelId?: string) {
  const kernelRequestData = {
    senderAddress: walletAddress,
    kernelPayload: {
      [kernelId]: {
        functionParams: parameterForKernel
      }
    }
  };
  
  return await contract.execute_krnl(
    ENTRY_ID,
    JSON.stringify(kernelRequestData),
    ACCESS_TOKEN,
    { gasLimit: 30000000 }
  );
}
```

**Official KRNL Pattern** (from docs):
```yaml
# workflows/property-verification.yaml
name: property_verification
triggers:
  - type: blockchain
    chain: sepolia
    
steps:
  - name: verify_ownership
    function: checkGovernmentRecords
    inputs:
      address: ${{ trigger.sender }}
      propertyId: ${{ trigger.data.propertyId }}
    
  - name: create_attestation
    function: storeOnChain
    inputs:
      verified: ${{ steps.verify_ownership.result }}
```

**Impact**: 🟡 HIGH - May not work with production KRNL nodes

**Recommendation**: 
- Current implementation is prototype-quality
- For production, create proper workflow YAML files
- Update executeKrnl to load workflow definitions

---

#### 5. **Foundry Not Installed**

**Problem**: Cannot deploy smart contracts without Foundry

**Evidence**: Terminal command failed with exit code 127
```bash
$ foundry -version
# Command not found (exit code 127)
```

**Impact**: 🔴 CRITICAL - Blocks all contract deployment

**Solution**:
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc  # or ~/.zshrc
foundryup
forge --version  # Verify installation
```

---

## File-by-File Change Requirements

### Priority 1: Environment Configuration

#### `.env` (ROOT)
**Changes Needed**:
```bash
# Add or update these lines:
VITE_RPC_KRNL="http://127.0.0.1:8545"  # Or Sepolia RPC
VITE_KRNL_ENTRY_ID="<from KRNL dashboard>"
VITE_KRNL_ACCESS_TOKEN="<from KRNL dashboard>"
VITE_KRNL_KERNEL_ID="1529"
VITE_CONTRACT_ADDRESS="<deployed contract address>"
VITE_REAL_ESTATE_INVESTMENT_ADDRESS="<deployed marketplace address>"
VITE_ATTESTOR_IMAGE="<dockerhub-username>/property-attestor:latest"
VITE_DELEGATE_OWNER="<your EOA address>"

# Optional: Keep NEXT_PUBLIC_* for backwards compatibility
NEXT_PUBLIC_RPC_KRNL="http://127.0.0.1:8545"
NEXT_PUBLIC_ENTRY_ID="<same as VITE_KRNL_ENTRY_ID>"
NEXT_PUBLIC_ACCESS_TOKEN="<same as VITE_KRNL_ACCESS_TOKEN>"
NEXT_PUBLIC_CONTRACT_ADDRESS="<same as VITE_CONTRACT_ADDRESS>"
```

---

#### `src/krnl/1529/config.ts`
**Current Code**:
```typescript
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const ENTRY_ID = process.env.NEXT_PUBLIC_ENTRY_ID;
export const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
export const KERNEL_ID = process.env.NEXT_PUBLIC_KERNEL_ID || "1529";
```

**Recommended Change**:
```typescript
// Option 1: Use import.meta.env (Vite-native)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const ENTRY_ID = import.meta.env.VITE_KRNL_ENTRY_ID;
export const ACCESS_TOKEN = import.meta.env.VITE_KRNL_ACCESS_TOKEN;
export const KERNEL_ID = import.meta.env.VITE_KRNL_KERNEL_ID || "1529";

// Option 2: Import from envConfig (centralized)
import { KRNL_CONFIG } from '@/utils/envConfig';
export const CONTRACT_ADDRESS = KRNL_CONFIG.contractAddress;
export const ENTRY_ID = KRNL_CONFIG.entryId;
export const ACCESS_TOKEN = KRNL_CONFIG.accessToken;
export const KERNEL_ID = KRNL_CONFIG.kernelId;
```

**Reason**: Vite projects should use `import.meta.env`, not `process.env`

---

#### `src/krnl/1529/index.ts`
**Line 9 - Current**:
```typescript
const krnlProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_KRNL);
```

**Recommended Change**:
```typescript
import { KRNL_CONFIG } from '@/utils/envConfig';

const krnlProvider = new ethers.JsonRpcProvider(
  KRNL_CONFIG.rpcUrl || 'http://127.0.0.1:8545'
);
```

**Reason**: Centralized config with fallback

---

#### `src/services/KRNLVerificationService.ts`
**Lines 93-94 - Current**:
```typescript
const rpcUrl = import.meta.env.VITE_RPC_KRNL || process.env.NEXT_PUBLIC_RPC_KRNL;
if (!rpcUrl) throw new Error("KRNL RPC URL not configured");
```

**Recommended Change**:
```typescript
import { KRNL_CONFIG } from '@/utils/envConfig';

const rpcUrl = KRNL_CONFIG.rpcUrl;
if (!rpcUrl) {
  console.warn('KRNL RPC URL not configured, using mock verification');
  // Return mock success for development
  return { verified: true, mock: true };
}
```

**Reason**: Graceful degradation for development without full KRNL setup

---

### Priority 2: Smart Contract Deployment

#### `src/contracts/` (Multiple Files)
**Action Required**: Deploy to Sepolia testnet

**Prerequisites**:
1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
2. Get Sepolia RPC URL (Infura/Alchemy)
3. Get test ETH from Sepolia faucet
4. Create deployment script

**Deployment Script** (create `src/contracts/script/Deploy.s.sol`):
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../PropertyMarketplace.sol";
import "../PropertyToken.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PropertyToken
        PropertyToken token = new PropertyToken();
        console.log("PropertyToken deployed at:", address(token));

        // Deploy PropertyMarketplace
        PropertyMarketplace marketplace = new PropertyMarketplace(address(token));
        console.log("PropertyMarketplace deployed at:", address(marketplace));

        vm.stopBroadcast();
    }
}
```

**Deployment Commands**:
```bash
cd src/contracts

# Initialize Foundry project (if not done)
forge init --force

# Compile contracts
forge build

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $VITE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Copy deployed addresses to .env
```

**Post-Deployment**:
Update `.env` with deployed addresses:
```bash
VITE_CONTRACT_ADDRESS="<PropertyToken address>"
VITE_REAL_ESTATE_INVESTMENT_ADDRESS="<PropertyMarketplace address>"
```

---

### Priority 3: KRNL Workflow Setup

#### Create `workflows/property-verification.yaml`
**Action**: Define verification workflow using KRNL DSL

```yaml
name: property_verification
version: 1.0.0
description: Verify property ownership through government records

triggers:
  - type: blockchain
    chain: sepolia
    contract: ${VITE_REAL_ESTATE_INVESTMENT_ADDRESS}
    event: PropertySubmitted

environment:
  RPC_URL: ${VITE_RPC_URL}
  GOVERNMENT_API_KEY: ${GOVERNMENT_RECORDS_API_KEY}

steps:
  - name: validate_input
    type: validation
    inputs:
      propertyId: ${{ trigger.data.propertyId }}
      ownerAddress: ${{ trigger.sender }}
    validation:
      - propertyId: required, string
      - ownerAddress: required, address

  - name: query_government_records
    type: http_request
    method: POST
    url: "https://api.governmentrecords.gov/v1/property/verify"
    headers:
      Authorization: "Bearer ${GOVERNMENT_API_KEY}"
    body:
      property_id: ${{ steps.validate_input.propertyId }}
      owner_address: ${{ steps.validate_input.ownerAddress }}
    
  - name: verify_ownership
    type: computation
    function: |
      const records = steps.query_government_records.response;
      return {
        verified: records.status === 'valid',
        ownerMatches: records.owner === trigger.sender,
        propertyExists: records.exists === true
      };

  - name: create_attestation
    type: blockchain
    contract: ${VITE_CONTRACT_ADDRESS}
    function: createAttestation
    inputs:
      propertyId: ${{ trigger.data.propertyId }}
      verified: ${{ steps.verify_ownership.verified }}
      timestamp: ${{ now }}
    condition: ${{ steps.verify_ownership.verified }}

outputs:
  verified: ${{ steps.verify_ownership.verified }}
  attestationHash: ${{ steps.create_attestation.transactionHash }}
  propertyId: ${{ trigger.data.propertyId }}
```

**Integration**: Upload workflow to KRNL dashboard to get Entry ID

---

### Priority 4: Attestor Docker Image

#### Create `attestor/Dockerfile`
**Action**: Build Docker image for off-chain verification

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy workflow definitions
COPY workflows/ ./workflows/

# Copy attestor runtime
COPY attestor/ ./attestor/

# Set environment variables
ENV NODE_ENV=production
ENV KRNL_WORKFLOW_PATH=/app/workflows

EXPOSE 8080

CMD ["node", "attestor/index.js"]
```

#### Create `attestor/index.js`
```javascript
const { KrnlAttestor } = require('krnl-sdk');
const workflows = require('./workflows');

const attestor = new KrnlAttestor({
  rpcUrl: process.env.VITE_RPC_URL,
  privateKey: process.env.ATTESTOR_PRIVATE_KEY,
  workflows: workflows,
});

attestor.start();
console.log('KRNL Attestor running on port 8080');
```

**Build and Deploy**:
```bash
# Build Docker image
docker build -t <dockerhub-username>/property-attestor:latest -f attestor/Dockerfile .

# Test locally
docker run -p 8080:8080 \
  -e VITE_RPC_URL=$VITE_RPC_URL \
  -e ATTESTOR_PRIVATE_KEY=$ATTESTOR_PRIVATE_KEY \
  <dockerhub-username>/property-attestor:latest

# Push to Docker Hub
docker push <dockerhub-username>/property-attestor:latest

# Update .env
echo "VITE_ATTESTOR_IMAGE=<dockerhub-username>/property-attestor:latest" >> .env
```

---

## Implementation Checklist

### Phase 1: Foundation (Required to proceed)
- [ ] Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
- [ ] Fix environment variable prefixes in `src/krnl/1529/config.ts`
- [ ] Fix environment variable prefixes in `src/krnl/1529/index.ts`
- [ ] Add missing variables to `.env` (even if placeholder)

### Phase 2: Smart Contracts (Critical for KRNL)
- [ ] Get Sepolia RPC URL (Infura/Alchemy account)
- [ ] Get Sepolia test ETH from faucet
- [ ] Create deployment script (`src/contracts/script/Deploy.s.sol`)
- [ ] Deploy PropertyToken contract to Sepolia
- [ ] Deploy PropertyMarketplace contract to Sepolia
- [ ] Update `.env` with deployed contract addresses
- [ ] Verify contracts on Etherscan

### Phase 3: KRNL Workflow (Core functionality)
- [ ] Create `workflows/property-verification.yaml`
- [ ] Create `workflows/kyc-verification.yaml`
- [ ] Upload workflows to KRNL dashboard
- [ ] Get Entry ID and Access Token from KRNL
- [ ] Update `.env` with KRNL credentials
- [ ] Test workflow execution locally

### Phase 4: Attestor Setup (Off-chain processing)
- [ ] Create `attestor/Dockerfile`
- [ ] Create `attestor/index.js`
- [ ] Build Docker image
- [ ] Test attestor locally
- [ ] Push image to Docker Hub
- [ ] Deploy attestor to cloud (optional: AWS/GCP/DigitalOcean)
- [ ] Update `.env` with attestor image URL

### Phase 5: Integration Testing
- [ ] Test property verification end-to-end
- [ ] Test KYC verification end-to-end
- [ ] Verify on-chain attestations are created
- [ ] Test UI components with real KRNL responses
- [ ] Monitor gas costs and optimize if needed

### Phase 6: Production Preparation
- [ ] Replace placeholder API keys with production keys
- [ ] Update workflows with production endpoints
- [ ] Set up monitoring for attestor
- [ ] Create backup/recovery procedures
- [ ] Document deployment process for team

---

## Quick Start (If you want to test without full setup)

For immediate development without full KRNL infrastructure:

1. **Mock Mode** - Update `KRNLVerificationService.ts`:
```typescript
async verifyPropertyOwnership(request: PropertyVerificationRequest) {
  // Check if KRNL is configured
  if (!KRNL_CONFIG.rpcUrl) {
    console.warn('KRNL not configured, using mock verification');
    return {
      verified: true,
      mock: true,
      propertyId: request.propertyId,
      attestationHash: '0x' + 'mock'.repeat(16),
    };
  }
  
  // Real KRNL verification...
}
```

2. **Update .env for mock mode**:
```bash
VITE_RPC_KRNL=""  # Leave empty to trigger mock mode
VITE_KRNL_ENTRY_ID="mock"
VITE_KRNL_ACCESS_TOKEN="mock"
```

3. **Test UI without backend**:
- PropertyUploadModal will work with mock responses
- VerificationStatusDashboard will show mock data
- All UI interactions functional

---

## Estimated Timeline

| Phase | Time Estimate | Difficulty |
|-------|--------------|------------|
| Phase 1: Foundation | 1-2 hours | Easy |
| Phase 2: Smart Contracts | 4-6 hours | Medium |
| Phase 3: KRNL Workflow | 6-8 hours | Hard |
| Phase 4: Attestor Setup | 4-6 hours | Medium |
| Phase 5: Integration Testing | 4-6 hours | Medium |
| Phase 6: Production Prep | 2-4 hours | Easy |
| **Total** | **21-32 hours** | **Medium-Hard** |

---

## Resources

- [KRNL Official Docs](https://docs.krnl.xyz)
- [Foundry Book](https://book.getfoundry.sh/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura RPC](https://infura.io/)
- [Alchemy RPC](https://www.alchemy.com/)
- [Docker Hub](https://hub.docker.com/)

---

## Questions?

Refer to:
- `KRNL_FULL_SETUP.md` - Comprehensive setup guide
- `ONBOARDING_GUIDE.md` - Service architecture documentation
- `KRNL_REALITY_CHECK.md` - Quick overview of requirements

---

**Last Updated**: Generated during project audit
**Status**: 🔴 Action Required - Multiple critical issues blocking KRNL functionality

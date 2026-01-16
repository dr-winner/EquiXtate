# KYC Integration Architecture: Sumsub → KRNL/Smart Contract

## Executive Summary

**Goal**: Use Sumsub for document/liveness verification, then pass yes/no result to KRNL attestor and/or smart contracts for on-chain verification gates.

**Flow**: User → Sumsub WebSDK (KYC/Liveness) → Backend Webhook → KRNL Attestation → Smart Contract Verification Mapping

---

## Current State Analysis

### ✅ What We Have

1. **Sumsub Integration (Frontend + Backend)**
   - `src/services/SumsubService.ts` - Token generation & status checking
   - `src/components/auth/SumsubWebSDK.tsx` - Modal component
   - `src/hooks/useSumsubKYC.ts` - React hook for KYC flow
   - `src/api/routes/sumsub.ts` - Backend endpoints (token, webhook, status)
   - Environment variables configured for Sumsub API

2. **KRNL Integration (Partial)**
   - `src/services/KRNLVerificationService.ts` - Property & user verification
   - `src/krnl/1529/` - KRNL kernel execution
   - KRNL config in `.env` (RPC, entry ID, access token, attestor image)
   - KRNL documentation in `KRNL_FULL_SETUP.md`

3. **Smart Contracts**
   - Property-related contracts (PropertyToken, PropertyManager, etc.)
   - ❌ **MISSING**: KYC verification mapping in contracts
   - ❌ **MISSING**: On-chain whitelist/verification status

4. **Frontend KYC UI**
   - `src/components/auth/KYCModal.tsx` - Custom KYC form
   - `src/hooks/useKYCStatus.ts` - Check verification status
   - `src/services/UserOnboardingService.ts` - Local storage KYC tracking
   - KYC gating in UserProfile and PropertyUpload flows

### ❌ What We're Missing

1. **No on-chain KYC verification mapping** (smart contract)
2. **No KRNL attestation of Sumsub results**
3. **Webhook handler doesn't write to blockchain**
4. **Frontend doesn't verify on-chain KYC status**
5. **Smart contracts don't enforce KYC requirements**

---

## Recommended Architecture

### Phase 1: Sumsub Verification (Current - Works)

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Opens KYC Modal
     ▼
┌────────────────┐
│ SumsubWebSDK   │ ← Loads Sumsub iFrame
└────┬───────────┘
     │ 2. Uploads ID, does liveness check
     ▼
┌──────────────────┐
│ Sumsub Platform  │ ← Processes verification
└────┬─────────────┘
     │ 3. Sends webhook on completion
     ▼
┌──────────────────────┐
│ Backend Webhook      │ ← Receives approval/rejection
│ /api/sumsub/webhook  │
└──────────────────────┘
```

**Status**: ✅ Implemented

### Phase 2: KRNL Attestation (NEW - Recommended)

After Sumsub approves/rejects, create a KRNL attestation:

```
┌──────────────────────┐
│ Backend Webhook      │
└────┬─────────────────┘
     │ 4. Parse Sumsub result
     ▼
┌────────────────────────────┐
│ KRNL Attestor              │
│ - Creates signed attestation│
│ - Records: walletAddress   │
│   + isKYCVerified (bool)   │
│   + tier (Basic/Enhanced)  │
│   + timestamp              │
│   + sumsubApplicantId      │
└────┬───────────────────────┘
     │ 5. Publishes attestation
     ▼
┌────────────────────────────┐
│ KRNL Network               │
│ Immutable verification log │
└────────────────────────────┘
```

**Benefit**: Off-chain verifiable proof that Sumsub verified this user

### Phase 3: Smart Contract Verification Gate (NEW - Critical)

Update smart contracts to enforce KYC:

```
┌────────────────────────────┐
│ KYC Verifier Contract      │
│                            │
│ mapping(address => bool)   │
│   isKYCVerified            │
│                            │
│ mapping(address => uint8)  │
│   kycTier                  │
│                            │
│ mapping(address => uint256)│
│   verificationExpiry       │
└────┬───────────────────────┘
     │ 6. Backend calls setKYCStatus()
     ▼
┌────────────────────────────┐
│ Property/Investment Txs    │
│ - Purchase tokens          │
│ - List property            │
│ - Governance voting        │
│ ALL require: isKYCVerified │
└────────────────────────────┘
```

---

## Implementation Plan

### Step 1: Create KYC Verifier Smart Contract

**File**: `src/contracts/KYCVerifier.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYCVerifier
 * @dev On-chain registry of KYC-verified addresses
 * Updated by backend oracle after Sumsub verification
 */
contract KYCVerifier is Ownable {
    
    enum KYCTier {
        NONE,      // Not verified
        BASIC,     // Basic identity check
        STANDARD,  // + Address verification
        ENHANCED   // + Source of funds (can list properties)
    }
    
    struct KYCRecord {
        bool isVerified;
        KYCTier tier;
        uint256 verifiedAt;
        uint256 expiresAt; // KYC expires after 1 year
        string sumsubApplicantId;
    }
    
    // Wallet address => KYC status
    mapping(address => KYCRecord) public kycRecords;
    
    // Backend oracle address that can update KYC status
    address public kycOracle;
    
    // Events
    event KYCUpdated(
        address indexed user,
        bool isVerified,
        KYCTier tier,
        uint256 expiresAt
    );
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    constructor(address _kycOracle) Ownable(msg.sender) {
        kycOracle = _kycOracle;
    }
    
    /**
     * @dev Update KYC status for a user (called by backend oracle)
     */
    function setKYCStatus(
        address user,
        bool isVerified,
        KYCTier tier,
        string memory sumsubApplicantId
    ) external {
        require(msg.sender == kycOracle, "Only oracle can update KYC");
        require(user != address(0), "Invalid address");
        
        uint256 expiresAt = isVerified 
            ? block.timestamp + 365 days 
            : 0;
        
        kycRecords[user] = KYCRecord({
            isVerified: isVerified,
            tier: tier,
            verifiedAt: block.timestamp,
            expiresAt: expiresAt,
            sumsubApplicantId: sumsubApplicantId
        });
        
        emit KYCUpdated(user, isVerified, tier, expiresAt);
    }
    
    /**
     * @dev Check if a user is KYC verified and not expired
     */
    function isKYCVerified(address user) public view returns (bool) {
        KYCRecord memory record = kycRecords[user];
        return record.isVerified && block.timestamp < record.expiresAt;
    }
    
    /**
     * @dev Get user's KYC tier
     */
    function getUserTier(address user) public view returns (KYCTier) {
        if (!isKYCVerified(user)) {
            return KYCTier.NONE;
        }
        return kycRecords[user].tier;
    }
    
    /**
     * @dev Check if user can list properties (requires ENHANCED tier)
     */
    function canListProperties(address user) public view returns (bool) {
        return isKYCVerified(user) && getUserTier(user) == KYCTier.ENHANCED;
    }
    
    /**
     * @dev Update the oracle address (only owner)
     */
    function setOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = kycOracle;
        kycOracle = newOracle;
        emit OracleUpdated(oldOracle, newOracle);
    }
}
```

### Step 2: Update Existing Contracts with KYC Gate

**Example: PropertyToken.sol**

```solidity
// Add at the top
import "./KYCVerifier.sol";

contract PropertyToken is ERC20, Ownable, ReentrancyGuard {
    KYCVerifier public kycVerifier;
    
    constructor(
        // ... existing params
        address _kycVerifier
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        kycVerifier = KYCVerifier(_kycVerifier);
        // ... existing code
    }
    
    function purchaseTokens(uint256 amount, uint256 usdcAmount) 
        external 
        nonReentrant 
    {
        // ✅ ADD KYC CHECK
        require(
            kycVerifier.isKYCVerified(msg.sender),
            "KYC verification required"
        );
        
        // ... existing purchase logic
    }
}
```

**Example: PropertyManager.sol (for listing)**

```solidity
function listProperty(...) external {
    // ✅ Require ENHANCED tier for property listing
    require(
        kycVerifier.canListProperties(msg.sender),
        "Enhanced KYC required to list properties"
    );
    
    // ... existing listing logic
}
```

### Step 3: Update Backend Webhook to Write On-Chain

**File**: `src/api/routes/sumsub.ts`

```typescript
import { ethers } from 'ethers';

// Add after webhook signature verification
router.post('/webhook', async (req, res) => {
  try {
    // 1. Verify webhook signature
    const signature = req.headers['x-payload-digest'];
    const isValid = SumsubService.verifyWebhookSignature(
      JSON.stringify(req.body),
      signature
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 2. Parse Sumsub result
    const { 
      applicantId, 
      externalUserId, // This is the wallet address
      reviewResult,
      reviewStatus 
    } = req.body;
    
    const isApproved = reviewStatus === 'completed' && 
                       reviewResult?.reviewAnswer === 'GREEN';
    
    // 3. Determine KYC tier based on checks performed
    let tier = 0; // NONE
    if (isApproved) {
      // Check which documents were verified
      const hasIdCheck = reviewResult?.checks?.some(
        c => c.checkType === 'IDENTITY'
      );
      const hasAddressCheck = reviewResult?.checks?.some(
        c => c.checkType === 'PROOF_OF_RESIDENCE'
      );
      
      if (hasIdCheck && hasAddressCheck) {
        tier = 3; // ENHANCED (can list properties)
      } else if (hasIdCheck) {
        tier = 1; // BASIC
      }
    }
    
    // 4. Write to blockchain (KYCVerifier contract)
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);
    
    const kycVerifierAddress = process.env.KYC_VERIFIER_CONTRACT;
    const kycVerifier = new ethers.Contract(
      kycVerifierAddress,
      [
        'function setKYCStatus(address user, bool isVerified, uint8 tier, string memory sumsubApplicantId) external'
      ],
      wallet
    );
    
    const tx = await kycVerifier.setKYCStatus(
      externalUserId, // wallet address
      isApproved,
      tier,
      applicantId
    );
    
    await tx.wait();
    
    console.log('✅ KYC status written on-chain:', {
      user: externalUserId,
      isApproved,
      tier,
      txHash: tx.hash
    });
    
    // 5. Optionally: Create KRNL attestation
    // await createKRNLAttestation(externalUserId, isApproved, tier);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

### Step 4: Update Frontend to Check On-Chain Status

**File**: `src/hooks/useKYCStatus.ts`

```typescript
import { useContractRead } from 'wagmi';
import { KYC_VERIFIER_ABI } from '@/contracts/abi/KYCVerifier';

export function useKYCStatus(walletAddress: string | undefined) {
  // Read from smart contract instead of local storage
  const { data: isVerified } = useContractRead({
    address: process.env.VITE_KYC_VERIFIER_CONTRACT,
    abi: KYC_VERIFIER_ABI,
    functionName: 'isKYCVerified',
    args: [walletAddress],
    enabled: !!walletAddress,
  });
  
  const { data: tierData } = useContractRead({
    address: process.env.VITE_KYC_VERIFIER_CONTRACT,
    abi: KYC_VERIFIER_ABI,
    functionName: 'getUserTier',
    args: [walletAddress],
    enabled: !!walletAddress,
  });
  
  return {
    isKYCVerified: isVerified ?? false,
    kycTier: tierData ?? 0,
    canListProperties: tierData === 3, // ENHANCED
    isLoading: false,
  };
}
```

### Step 5: KRNL Attestation (Optional But Recommended)

Create a KRNL workflow that attests to the KYC verification:

**File**: `src/services/KRNLKYCAttestation.ts`

```typescript
import { executeKrnl } from '@/krnl/1529';

interface KYCAttestationData {
  walletAddress: string;
  isVerified: boolean;
  tier: number;
  sumsubApplicantId: string;
  timestamp: number;
}

export async function createKYCAttestation(
  data: KYCAttestationData
): Promise<string> {
  // Execute KRNL kernel to create attestation
  const attestationPayload = await executeKrnl(
    data.walletAddress,
    "kyc-attestor" // Custom KRNL kernel ID
  );
  
  // Returns attestation hash that can be stored on-chain or in KRNL network
  return attestationPayload.attestationHash;
}
```

Then call this in the webhook:

```typescript
// In webhook handler, after blockchain write
const attestationHash = await createKYCAttestation({
  walletAddress: externalUserId,
  isVerified: isApproved,
  tier,
  sumsubApplicantId: applicantId,
  timestamp: Date.now(),
});

console.log('KRNL attestation created:', attestationHash);
```

---

## Environment Variables to Add

```env
# KYC Verifier Contract (after deployment)
VITE_KYC_VERIFIER_CONTRACT=0x...

# Backend oracle wallet (to update KYC status on-chain)
ORACLE_PRIVATE_KEY=0x...

# Sepolia RPC for backend transactions
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

---

## Deployment Steps

### 1. Deploy KYCVerifier Contract

```bash
# In contracts directory
forge create src/contracts/KYCVerifier.sol:KYCVerifier \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args $ORACLE_ADDRESS
```

### 2. Update Existing Contracts

Redeploy PropertyToken, PropertyManager with KYCVerifier address

### 3. Update Backend .env

Add `KYC_VERIFIER_CONTRACT` and `ORACLE_PRIVATE_KEY`

### 4. Test Webhook Flow

```bash
# Trigger test webhook
curl -X POST http://localhost:3000/api/sumsub/webhook \
  -H "Content-Type: application/json" \
  -H "X-Payload-Digest: test_signature" \
  -d '{
    "applicantId": "test123",
    "externalUserId": "0x123...",
    "reviewStatus": "completed",
    "reviewResult": { "reviewAnswer": "GREEN" }
  }'
```

### 5. Verify On-Chain

```bash
# Check KYC status on-chain
cast call $KYC_VERIFIER_CONTRACT \
  "isKYCVerified(address)(bool)" \
  $USER_ADDRESS \
  --rpc-url $SEPOLIA_RPC_URL
```

---

## Security Considerations

### 1. Oracle Security

- ✅ Only backend oracle can write KYC status
- ✅ Use separate wallet for oracle (not deployment wallet)
- ✅ Monitor oracle wallet balance
- ✅ Add rate limiting on webhook endpoint
- ✅ Implement replay attack protection (nonce)

### 2. Privacy

- ❌ **Don't store PII on-chain** (names, addresses, DOB)
- ✅ Store only: `isVerified`, `tier`, `applicantId` (hash)
- ✅ Keep detailed KYC data in Sumsub only
- ✅ KRNL attestations can be private (encrypted)

### 3. Expiration

- ✅ KYC expires after 1 year
- ✅ Frontend warns users 30 days before expiry
- ✅ Users must re-verify annually

### 4. Revocation

```solidity
function revokeKYC(address user) external {
    require(msg.sender == kycOracle, "Only oracle");
    kycRecords[user].isVerified = false;
    kycRecords[user].expiresAt = block.timestamp;
    emit KYCRevoked(user);
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('KYCVerifier', () => {
  it('should allow oracle to set KYC status');
  it('should prevent non-oracle from updating KYC');
  it('should correctly check expiration');
  it('should enforce tier requirements');
});
```

### Integration Tests

1. **Sumsub → Webhook → Blockchain**
   - Submit test KYC via Sumsub sandbox
   - Verify webhook received
   - Check on-chain status updated

2. **Smart Contract Gating**
   - Try to purchase tokens without KYC (should fail)
   - Complete KYC, retry purchase (should succeed)
   - Try to list property with BASIC tier (should fail)
   - Upgrade to ENHANCED, retry listing (should succeed)

---

## Migration Strategy

### If Users Already Have Local KYC

```typescript
// One-time migration script
async function migrateExistingKYC() {
  const users = await UserOnboardingService.getAllVerifiedUsers();
  
  for (const user of users) {
    // Write each verified user to blockchain
    await kycVerifier.setKYCStatus(
      user.walletAddress,
      true,
      user.tier,
      user.sumsubApplicantId || ''
    );
  }
}
```

---

## FAQ

**Q: Do I need KRNL for KYC?**  
A: No, KRNL is optional. The core flow is Sumsub → Backend → Smart Contract. KRNL adds an immutable audit trail.

**Q: Can I use a different KYC provider?**  
A: Yes! Just update the webhook handler. The smart contract doesn't care about the provider.

**Q: What if Sumsub goes down?**  
A: Users already verified remain verified (on-chain). New verifications wait until Sumsub is back.

**Q: How much does this cost in gas?**  
A: ~50,000 gas per KYC update (~$2-5 on Sepolia). Consider batching for mainnet.

**Q: Can users verify on mainnet and use on L2?**  
A: Yes! Use a bridge oracle to sync KYC status to L2 (Optimism, Arbitrum, etc.)

---

## Next Steps

1. ✅ Review this architecture with team
2. 🔧 Deploy KYCVerifier contract to Sepolia
3. 🔧 Update backend webhook to write on-chain
4. 🔧 Update frontend to read from contract
5. 🧪 Test full flow end-to-end
6. 📄 Update user-facing documentation
7. 🚀 Deploy to production

---

## Summary

**Simple Flow**:
```
User → Sumsub (KYC) → Webhook → Smart Contract → User can invest/list
```

**Key Components**:
1. Sumsub handles identity verification (already done ✅)
2. Backend webhook writes yes/no to smart contract (NEW 🔧)
3. Smart contracts enforce KYC requirements (NEW 🔧)
4. Frontend reads on-chain status (UPDATE 🔧)
5. KRNL creates attestation trail (OPTIONAL ⭐)

This gives you:
- ✅ Compliant KYC with reputable provider (Sumsub)
- ✅ Decentralized verification registry (blockchain)
- ✅ Smart contract enforcement (automatic gating)
- ✅ Immutable audit trail (KRNL)
- ✅ User privacy (no PII on-chain)

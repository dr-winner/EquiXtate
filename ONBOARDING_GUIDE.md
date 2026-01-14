# User and Property Onboarding with KRNL Protocol

## Overview

This document describes the comprehensive onboarding system for users and properties in EquiXtate, powered by KRNL Protocol for decentralized verification.

## Architecture

### Core Services

#### 1. KRNLVerificationService (`src/services/KRNLVerificationService.ts`)

The foundation of our verification system, integrating with KRNL Protocol to provide:

- **Property Ownership Verification**: Queries government databases through KRNL kernels
- **Document Authenticity**: Verifies document hashes and metadata
- **Cross-Chain Attestation**: Creates on-chain verification records
- **Identity Verification**: KYC/AML checks for users

**Key Features:**
```typescript
// Verify property ownership
const result = await KRNLVerificationService.verifyPropertyOwnership({
  propertyId: 'PROP-123',
  ownerAddress: '0x...',
  propertyDetails: { ... },
  documents: [ ... ]
});

// Verify user identity
const result = await KRNLVerificationService.verifyUserIdentity({
  walletAddress: '0x...',
  userDetails: { ... },
  documents: [ ... ]
});
```

**Verification Process:**
1. Execute KRNL kernel to query government records
2. Verify document hashes
3. Cross-check with government databases
4. Create on-chain attestation
5. Return verification result with attestation hash

#### 2. PropertyOnboardingService (`src/services/PropertyOnboardingService.ts`)

Manages the complete property onboarding workflow:

**Workflow Stages:**
1. **Draft** → Property details collected
2. **Documents Submitted** → Images, documents, deed uploaded
3. **Verification In Progress** → KRNL verification active
4. **Verification Complete** → Ownership verified
5. **Tokenization** → Smart contract deployment
6. **Listed** → Available on marketplace

**Key Functions:**
```typescript
// Create onboarding
const onboarding = await PropertyOnboardingService.createOnboarding({
  ownerAddress: '0x...',
  propertyData: { name, type, location, price, ... },
  images: [File...],
  documents: [File...],
  deedDocument: File
});

// Submit for verification
const verification = await PropertyOnboardingService.submitForVerification(
  onboarding.id
);

// Tokenize property
const result = await PropertyOnboardingService.tokenizeProperty(
  onboarding.id
);
```

**Data Storage:**
- Document hashes stored on-chain
- Metadata stored in localStorage (production: IPFS/Arweave)
- Verification records immutable on blockchain

#### 3. UserOnboardingService (`src/services/UserOnboardingService.ts`)

Handles user KYC verification and compliance:

**KYC Tiers:**
- **Tier 0 (None)**: No verification, cannot invest
- **Tier 1 (Basic)**: ID verification, max $10k investment
- **Tier 2 (Standard)**: + Address verification, max $50k investment
- **Tier 3 (Enhanced)**: + Source of funds, unlimited investment, can list properties

**Key Functions:**
```typescript
// Submit KYC
const result = await UserOnboardingService.submitKYC({
  walletAddress: '0x...',
  personalInfo: { fullName, email, country, ... },
  identityDocument: { file, type },
  proofOfAddress: File,
  targetTier: KYCTier.ENHANCED
});

// Check eligibility
const canInvest = await UserOnboardingService.canUserInvest(
  walletAddress,
  investmentAmount
);

const canList = await UserOnboardingService.canUserListProperty(
  walletAddress
);
```

**Compliance Checks:**
- AML screening
- Sanctions list checking
- PEP (Politically Exposed Person) verification
- Accredited investor status

### UI Components

#### PropertyUploadModal (`src/components/property/PropertyUploadModal.tsx`)

3-step wizard for property submission:

**Step 1: Property Details**
- Name, type, location, price
- Bedrooms, bathrooms, square footage
- Description and listing type

**Step 2: Media & Documentation**
- Property images (required)
- Supporting documents (optional)

**Step 3: Legal Verification**
- Property deed upload (required)
- KRNL verification explained
- Terms acceptance

**Integration:**
```typescript
// Check user can list
const canList = await UserOnboardingService.canUserListProperty(address);

// Create onboarding
const onboarding = await PropertyOnboardingService.createOnboarding(submission);

// KRNL verification
const verification = await PropertyOnboardingService.submitForVerification(
  onboarding.id
);

// Tokenization
const tokenization = await PropertyOnboardingService.tokenizeProperty(
  onboarding.id
);
```

#### VerificationStatusDashboard (`src/components/property/VerificationStatusDashboard.tsx`)

Real-time dashboard displaying:

**User Tab:**
- KYC status and tier
- Investment limits
- Compliance check results
- Verification details with attestation hash

**Properties Tab:**
- List of all submitted properties
- Verification status for each
- KRNL attestation details
- Tokenization information

**Features:**
- Live status updates
- Attestation hash display
- Progress tracking
- Admin notes

## KRNL Protocol Integration

### How It Works

1. **Kernel Execution**
   ```typescript
   const krnlPayload = await executeKrnl(walletAddress, "1529");
   ```
   - Executes KRNL kernel with user's wallet address
   - Queries government databases off-chain
   - Returns verified property data

2. **Government Records Query**
   - Connects to land registry databases
   - Verifies tax assessment records
   - Checks zoning information
   - Validates ownership history

3. **Document Verification**
   - Hashes documents using keccak256
   - Stores hashes on-chain
   - Verifies document hasn't been tampered with

4. **Attestation Creation**
   ```typescript
   const attestationHash = ethers.keccak256(
     ethers.toUtf8Bytes(JSON.stringify(attestationData))
   );
   ```
   - Creates cryptographic proof of verification
   - Stores on blockchain for immutability
   - Can be verified by anyone

5. **Cross-Chain Capability**
   - KRNL enables property data sharing across chains
   - Same property can exist on multiple networks
   - Kernel ID 1529 ensures consistent verification

## Environment Configuration

Required environment variables (see `.env.example`):

```bash
# KRNL Protocol
VITE_RPC_KRNL=https://rpc.krnl.io
VITE_KRNL_ENTRY_ID=your_entry_id
VITE_KRNL_ACCESS_TOKEN=your_token
VITE_KRNL_KERNEL_ID=1529
VITE_CONTRACT_ADDRESS=0x...

# Authentication
VITE_PRIVY_APP_ID=...
VITE_WALLETCONNECT_PROJECT_ID=...

# AI Advisor
VITE_GROQ_API_KEY=...
```

## Usage Examples

### User Onboarding Flow

```typescript
// 1. User connects wallet
const { address } = useWallet();

// 2. Create user onboarding
const onboarding = await UserOnboardingService.createUserOnboarding(address);

// 3. Submit KYC documents
const verification = await UserOnboardingService.submitKYC({
  walletAddress: address,
  personalInfo: {
    fullName: "John Doe",
    email: "john@example.com",
    country: "Ghana"
  },
  identityDocument: {
    file: passportFile,
    type: "passport"
  },
  proofOfAddress: utilityBillFile,
  targetTier: KYCTier.ENHANCED
});

// 4. Wait for verification
// User receives notification when complete

// 5. Check status
const isVerified = await UserOnboardingService.isUserVerified(address);
const tier = await UserOnboardingService.getUserTier(address);
```

### Property Listing Flow

```typescript
// 1. Check user can list
const canList = await UserOnboardingService.canUserListProperty(address);
if (!canList.allowed) {
  toast({ description: canList.reason });
  return;
}

// 2. Open property upload modal
<PropertyUploadModal isOpen={true} />

// 3. User fills 3-step form
// Property details → Media → Legal docs

// 4. Submit for verification
// Automatic KRNL verification triggered

// 5. Property verified and tokenized
// Listed on marketplace automatically
```

### Verification Status Tracking

```typescript
// Display dashboard
<VerificationStatusDashboard walletAddress={address} />

// Shows:
// - User KYC status
// - All property submissions
// - Verification progress
// - KRNL attestations
// - Tokenization details
```

## Security Considerations

1. **Document Privacy**
   - Actual documents never stored on-chain
   - Only cryptographic hashes stored
   - Documents stored on IPFS/Arweave (encrypted)

2. **Personal Information**
   - PII (Personally Identifiable Information) encrypted
   - Only essential data on-chain
   - Compliant with GDPR/privacy laws

3. **Verification Integrity**
   - KRNL attestations immutable
   - Cross-chain verification prevents fraud
   - Government database queries ensure authenticity

4. **Access Control**
   - Admin functions require authorization
   - User can only access their own data
   - Verification results publicly verifiable

## Future Enhancements

1. **Real-time Government API Integration**
   - Direct connection to land registries
   - Automated deed verification
   - Instant ownership confirmation

2. **Multi-jurisdiction Support**
   - Support for different countries
   - Localized verification flows
   - Compliance with local regulations

3. **Enhanced Attestations**
   - Verifiable Credentials (W3C standard)
   - Zero-knowledge proofs for privacy
   - Decentralized identifier (DID) integration

4. **Automated Compliance**
   - Continuous AML monitoring
   - Sanctions list auto-updates
   - Risk scoring algorithms

5. **Property Valuation**
   - KRNL integration for market data
   - Automated valuation models
   - Real-time price discovery

## Testing

### Test User Onboarding

```typescript
// Mock user
const testAddress = "0x1234...";
const submission = {
  walletAddress: testAddress,
  personalInfo: {
    fullName: "Test User",
    email: "test@example.com",
    country: "Ghana"
  },
  identityDocument: {
    file: mockPassportFile,
    type: "passport"
  },
  targetTier: KYCTier.BASIC
};

const result = await UserOnboardingService.submitKYC(submission);
console.log("Verification:", result);
```

### Test Property Onboarding

```typescript
// Mock property
const submission = {
  ownerAddress: testAddress,
  propertyData: {
    name: "Test Property",
    type: "apartment",
    location: "Accra, Ghana",
    price: 100000,
    listingType: "sale"
  },
  images: [mockImageFile],
  documents: [mockTaxFile],
  deedDocument: mockDeedFile
};

const onboarding = await PropertyOnboardingService.createOnboarding(submission);
const verification = await PropertyOnboardingService.submitForVerification(
  onboarding.id
);
console.log("Property Verification:", verification);
```

## Support

For questions or issues:
- Check the README.md
- Review KRNL Protocol docs
- Contact the development team
- Open an issue on GitHub

---

**Last Updated:** January 2026
**KRNL Kernel ID:** 1529
**Smart Contract ID:** 7709

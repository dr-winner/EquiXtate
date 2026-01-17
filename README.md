<div align="center">

# 🏠 EquiXtate

### Real-World Asset Tokenization Platform for Fractional Real Estate Ownership

[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity)](https://soliditylang.org/)
[![KRNL Protocol](https://img.shields.io/badge/KRNL-Protocol-purple)](https://krnl.io/)
[![Sumsub KYC](https://img.shields.io/badge/KYC-Sumsub-green)](https://sumsub.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Smart Contracts](#-smart-contracts)
- [KYC Integration](#-kyc-integration)
- [KRNL Protocol Integration](#-krnl-protocol-integration)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**EquiXtate** is a cutting-edge Real-World Asset (RWA) tokenization platform that democratizes real estate investment. By leveraging blockchain technology, we enable fractional ownership of premium properties, making real estate investment accessible to everyone.

### The Problem We Solve

Traditional real estate investment requires:
- Large capital (typically $50,000+)
- Complex legal processes
- Limited liquidity
- Geographic restrictions

### Our Solution

EquiXtate tokenizes real estate properties into ERC-20 tokens, allowing:
- **Fractional ownership** starting from as low as $100
- **Instant liquidity** through our marketplace
- **Global access** to premium properties
- **Transparent governance** for property decisions
- **Automated rental income** distribution

---

## ✨ Key Features

### 🏘️ Property Tokenization
Transform real estate into tradeable digital tokens. Each property is represented by a smart contract with verifiable ownership records.

### 🛒 Marketplace
Browse, filter, and invest in diverse properties:
- Luxury apartments
- Commercial buildings
- Vacation rentals
- Mixed-use developments

### 👤 User Dashboard
Personalized interface to:
- Track your portfolio
- View investment performance
- Claim rental yields
- Monitor property valuations

### 🗳️ Governance
Democratic decision-making for token holders:
- Vote on property management decisions
- Propose improvements
- Approve major repairs or sales

### 🤖 AI Investment Advisor
Powered by advanced AI to provide:
- Personalized investment recommendations
- Market trend analysis
- Risk assessment
- Portfolio optimization suggestions

### ✅ KYC/AML Compliance
Integrated identity verification powered by Sumsub:
- Document verification
- Liveness detection
- On-chain KYC status via KYCVerifier contract
- Regulatory compliance (SEC, MiCA ready)

### 🔐 Admin Panel
Comprehensive management tools:
- Property onboarding workflow
- User verification management
- Platform analytics
- Oracle management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Components    │  Hooks         │  Services      │  Pages           │
│  - Navbar      │  - useWallet   │  - Web3Service │  - Index         │
│  - PropertyCard│  - useSumsubKYC│  - SumsubService│ - PropertyPage  │
│  - AIAdvisor   │  - useContract │  - AdminService│  - UserProfile   │
│  - KYC Modal   │  - useKYCStatus│  - KRNLService │  - Governance    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Backend Server (Express.js)                      │
├─────────────────────────────────────────────────────────────────────┤
│  /api/sumsub/access-token     │  Sumsub WebSDK token generation     │
│  /api/sumsub/webhook          │  KYC status updates → Oracle        │
│  /api/kyc/oracle-update       │  On-chain KYC status updates        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer (Ethereum/Sepolia)               │
├─────────────────────────────────────────────────────────────────────┤
│  KYCVerifier        │  PropertyToken    │  PropertyMarketplace      │
│  - Oracle-controlled│  - ERC-20 tokens  │  - Buy/Sell properties    │
│  - On-chain KYC map │  - Fractional own │  - Rental distribution    │
│                     │                   │                           │
│  PropertyManager    │  Governance       │  KRNL Integration         │
│  - Property CRUD    │  - Voting system  │  - Cross-chain data       │
│  - Document hashes  │  - Proposals      │  - External attestations  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contracts

Our contracts are built with Solidity and deployed using Foundry.

### Core Contracts

| Contract | Description | Network |
|----------|-------------|---------|
| `KYCVerifier.sol` | On-chain KYC status mapping with oracle control | Sepolia |
| `PropertyToken.sol` | ERC-20 token representing property ownership | Sepolia |
| `PropertyMarketplace.sol` | Buy/sell marketplace for property tokens | Sepolia |
| `PropertyManager.sol` | Property lifecycle management | Sepolia |
| `BuyModule.sol` | Token purchase logic | Sepolia |
| `RentModule.sol` | Rental income distribution | Sepolia |
| `AuctionModule.sol` | Property auction functionality | Sepolia |
| `FractionalOwnershipModule.sol` | Fractional ownership tracking | Sepolia |

### Deployed Addresses (Sepolia Testnet)

```
KYCVerifier:         0x6eeA600d2AbC11D3fF82a6732b1042Eec52A111d
PropertyRegistry:    0xE11D19503029Ed7D059A0022288FB88d61C7c3b4
PropertyGovernance:  0xCd7b9006207F0DA7287f692A7250B64E1B3c8453
RentDistribution:    0xd1b544926e3e8761aD4c06605A7aA9689A169dF0
Oracle Wallet:       0xbBAc31249988fB9521dA2f6F1Cc518AC768615e9
```

All contracts are verified on [Sepolia Etherscan](https://sepolia.etherscan.io/).

### Building Contracts

```bash
cd src/contracts
forge build
forge test
```

---

## 🔐 KYC Integration

EquiXtate implements a robust KYC system combining **Sumsub** for identity verification with **on-chain verification** via smart contracts.

### How It Works

```
1. User initiates KYC → Sumsub WebSDK opens
2. User completes ID + Liveness check → Sumsub processes
3. Sumsub webhook → Backend receives status
4. Backend oracle → Updates KYCVerifier contract
5. Smart contracts → Check on-chain KYC status before transactions
```

### Sumsub Configuration

- **Level Name**: `id-and-liveness`
- **Mode**: Sandbox (development) / Production
- **Features**: Document verification, liveness detection, AML screening

### On-Chain KYC Contract

```solidity
interface IKYCVerifier {
    function isVerified(address user) external view returns (bool);
    function setVerificationStatus(address user, bool status) external; // Oracle only
    function oracle() external view returns (address);
}
```

---

## 🔗 KRNL Protocol Integration

EquiXtate leverages **KRNL Protocol** for cross-chain data access and external system integration.

### Why KRNL?

Real-world asset tokenization requires:
- Off-chain data (property valuations, ownership records)
- Government system integration (title registries, tax records)
- Cross-chain interoperability

### Our Implementation

**KERNEL ID**: `1529`  
**SMART CONTRACT ID**: `7709`

### Use Cases

1. **Cross-Chain Property Data**: Query property details from other EVM chains
2. **Government Registry Integration**: Verify property ownership against official records
3. **External Attestations**: Bridge governmental verification onto blockchain

### Future Plans

- Real-time property valuation feeds
- Automated title verification
- Cross-border property transactions
- Multi-chain property portfolio management

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Git
- Foundry (for smart contracts)

### Installation

```bash
# Clone the repository
git clone https://github.com/dr-winner/EquiXtate.git
cd equixtate

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your environment variables (see below)
```

### Running the Application

```bash
# Start development server (frontend + backend)
npm run dev

# Start backend server only
npm run server

# Build for production
npm run build
```

### Running Smart Contract Tests

```bash
cd src/contracts
forge test -vvv
```

---

## 🔧 Environment Variables

Create a `.env.local` file with the following:

```env
# ===========================================
# BLOCKCHAIN CONFIGURATION
# ===========================================
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_NETWORK=sepolia

# ===========================================
# WALLET & AUTH (Privy)
# ===========================================
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_APP_SECRET=your_privy_secret
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# ===========================================
# SUMSUB KYC (Required for KYC features)
# ===========================================
SUMSUB_APP_TOKEN=sbx:your_app_token
SUMSUB_SECRET_KEY=your_secret_key
VITE_SUMSUB_LEVEL_NAME=id-and-liveness

# ===========================================
# KYC VERIFIER CONTRACT
# ===========================================
VITE_KYC_VERIFIER_CONTRACT=0x6eeA600d2AbC11D3fF82a6732b1042Eec52A111d
ORACLE_PRIVATE_KEY=your_oracle_wallet_private_key
ORACLE_ADDRESS=0xbBAc31249988fB9521dA2f6F1Cc518AC768615e9

# ===========================================
# KRNL PROTOCOL
# ===========================================
VITE_KRNL_ACCESS_TOKEN=your_krnl_token
VITE_KRNL_ENTRY_ID=your_entry_id

# ===========================================
# AI ADVISOR (Groq)
# ===========================================
VITE_GROQ_API_KEY=your_groq_api_key
```

---

## 📁 Project Structure

```
equixtate/
├── public/                    # Static assets
│   └── images/               # Property images
├── src/
│   ├── api/
│   │   └── routes/
│   │       └── sumsub.ts     # Sumsub API endpoints
│   ├── components/
│   │   ├── auth/             # Authentication & KYC components
│   │   ├── home/             # Homepage sections
│   │   ├── marketplace/      # Marketplace components
│   │   ├── property/         # Property display components
│   │   ├── ui/               # Reusable UI components (shadcn)
│   │   ├── user-profile/     # User dashboard components
│   │   └── wallet/           # Wallet connection components
│   ├── contracts/            # Solidity smart contracts
│   │   ├── abi/              # Contract ABIs
│   │   ├── lib/              # Foundry dependencies
│   │   └── *.sol             # Contract source files
│   ├── data/
│   │   └── propertyData.ts   # Mock property data
│   ├── hooks/                # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useSumsubKYC.ts
│   │   ├── useKYCStatus.ts
│   │   └── useContract.ts
│   ├── krnl/
│   │   └── 1529/             # KRNL kernel configuration
│   ├── pages/                # Page components
│   │   ├── Index.tsx
│   │   ├── PropertyPage.tsx
│   │   ├── UserProfile.tsx
│   │   └── GovernancePage.tsx
│   ├── services/             # Business logic services
│   │   ├── Web3Service.ts
│   │   ├── SumsubService.ts
│   │   ├── AdminService.ts
│   │   └── KRNLVerificationService.ts
│   ├── types/                # TypeScript definitions
│   └── utils/                # Utility functions
├── server.ts                 # Express backend server
├── .env.example              # Environment template
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🛠️ Technologies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Framer Motion** - Animations
- **shadcn/ui** - Component library

### Backend
- **Express.js** - API server
- **Node.js** - Runtime

### Blockchain
- **Solidity** - Smart contracts
- **Foundry** - Development framework
- **ethers.js** - Ethereum interactions
- **Privy** - Wallet authentication
- **OpenZeppelin** - Contract standards

### Integrations
- **Sumsub** - KYC/AML verification
- **KRNL Protocol** - Cross-chain data
- **Groq** - AI advisor
- **Alchemy** - RPC provider

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by the EquiXtate Team**

[Website](https://equixtate.io) • [Documentation](https://docs.equixtate.io) • [Discord](https://discord.gg/equixtate)

</div>

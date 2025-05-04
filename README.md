# EquiXtate - Decentralized Real Estate Tokenization Platform

EquiXtate is a decentralized platform that enables the tokenization of real estate properties, allowing users to buy, sell, and trade property tokens on the blockchain. Currently deployed on the Sonic Blaze Testnet and integrated with KRNL Labs, it provides a secure and transparent way to invest in real estate through blockchain technology.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [KRNL Labs Integration](#krnl-labs-integration)
- [Smart Contracts](#smart-contracts)
- [Frontend Architecture](#frontend-architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Overview

EquiXtate revolutionizes real estate investment by leveraging blockchain technology to create a decentralized marketplace for property tokens. The platform allows property owners to tokenize their assets and investors to purchase fractional ownership through tokens. Currently deployed on the Sonic Blaze Testnet and integrated with KRNL Labs, it offers a robust testing environment for users to experience the platform's capabilities.

### Network Information
- **Network**: Sonic Blaze Testnet
- **Chain ID**: 13881
- **RPC URL**: https://rpc.sonic.blaze.network
- **Explorer**: https://explorer.sonic.blaze.network
- **Currency**: SONIC (Test Token)
- **KRNL Integration**: Enabled

### Key Benefits
- Fractional ownership of real estate properties
- Transparent and immutable property records
- Automated governance through smart contracts
- Secure token swaps and trading
- Decentralized decision-making

## KRNL Labs Integration

### What is KRNL Labs?
KRNL Labs is a decentralized infrastructure provider that offers:
- Cross-chain interoperability solutions
- Advanced smart contract development tools
- Security auditing services
- Developer tooling and SDKs
- Network monitoring and analytics

### Integration Features
1. **Cross-Chain Capabilities**
   - Seamless asset transfers between chains
   - Interoperable smart contracts
   - Unified token standards

2. **Enhanced Security**
   - KRNL's security auditing tools
   - Real-time monitoring
   - Automated vulnerability detection

3. **Developer Tools**
   - KRNL SDK integration
   - Testing frameworks
   - Deployment automation

4. **Analytics and Monitoring**
   - Transaction tracking
   - Performance metrics
   - Network health monitoring

### Technical Implementation
```typescript
// KRNL Integration
interface KRNLIntegration {
  initializeCrossChain(): Promise<void>;
  setupSecurityMonitoring(): Promise<void>;
  configureAnalytics(): Promise<void>;
  enableDeveloperTools(): Promise<void>;
}
```

## Features

### 1. Property Tokenization
- Create and manage property tokens
- Set token prices and supply
- Track ownership and transfers

### 2. Marketplace
- List properties for sale
- Purchase property tokens
- View property details and history

### 3. Governance
- Create and vote on proposals
- Participate in property management decisions
- Transparent voting system

### 4. Token Swapping
- Swap between different token types
- Liquidity provision
- Automated price discovery

## Technical Architecture

### Blockchain Layer
- **Network**: Sonic Blaze Testnet
- **Smart Contracts**: Written in Solidity
- **Web3 Integration**: ethers.js v6
- **KRNL Integration**: Full integration with KRNL Labs infrastructure
- **Contract Addresses**:
  - PropertyToken: `0x...`
  - Marketplace: `0x...`
  - Governance: `0x...`
  - SwapModule: `0x...`

### Frontend Layer
- **Framework**: React with TypeScript
- **State Management**: React Hooks
- **UI Components**: Custom components with Tailwind CSS
- **Web3 Integration**: Custom hooks for blockchain interaction

### Backend Services
- **Contract Service**: Manages smart contract interactions
- **Web3 Service**: Handles blockchain connectivity
- **Notification Service**: Toast notifications for user feedback

### AI Integration
EquiXtate incorporates an AI Advisor to provide intelligent guidance and insights throughout the real estate tokenization process:

#### 1. Investment Advisory
- **Personalized Recommendations**:
  - Property investment opportunities based on user preferences
  - Risk tolerance assessment
  - Portfolio diversification suggestions
  - Market entry/exit timing recommendations

#### 2. Transaction Guidance
- **Smart Contract Interaction**:
  - Step-by-step transaction assistance
  - Gas fee optimization recommendations
  - Contract interaction explanations
  - Error resolution guidance

#### 3. Market Insights
- **Real-time Analysis**:
  - Property market trends
  - Token price movements
  - Liquidity conditions
  - Trading volume analysis

#### 4. Risk Assessment
- **Investment Risk Analysis**:
  - Property valuation insights
  - Market volatility assessment
  - Regulatory compliance checks
  - Security risk evaluation

#### 5. Educational Support
- **Learning Resources**:
  - Tokenization process explanations
  - Market terminology definitions
  - Best practices guidance
  - Regulatory compliance information

#### Technical Implementation
```typescript
// AI Advisor Service
interface AIAdvisor {
  provideInvestmentAdvice(userPreferences: UserPreferences): Promise<InvestmentRecommendation>;
  guideTransaction(transactionType: TransactionType): Promise<TransactionGuidance>;
  analyzeMarketConditions(): Promise<MarketInsight>;
  assessRisk(propertyData: PropertyData): Promise<RiskAssessment>;
  provideEducationalContent(topic: string): Promise<EducationalContent>;
}
```

## Smart Contracts

### 1. PropertyToken.sol
```solidity
- Token creation and management
- Ownership tracking
- Transfer restrictions
```

### 2. Marketplace.sol
```solidity
- Property listing
- Token sales
- Price management
```

### 3. Governance.sol
```solidity
- Proposal creation
- Voting system
- Decision execution
```

### 4. SwapModule.sol
```solidity
- Token swapping
- Liquidity management
- Price calculation
```

## Frontend Architecture

### Core Components
1. **PropertyTokenInteraction**
   - Main interaction interface
   - Token purchase and management
   - Property listing

2. **Navbar**
   - Navigation
   - Wallet connection
   - Network status

3. **Footer**
   - Links and information
   - Social media integration

### Custom Hooks
1. **useWeb3**
   ```typescript
   - Wallet connection
   - Network management
   - Account tracking
   ```

2. **useContractInteractions**
   ```typescript
   - Contract function calls
   - Transaction management
   - Error handling
   ```

### Services
1. **ContractService**
   ```typescript
   - Contract initialization
   - Function abstraction
   - Error handling
   ```

2. **Web3Service**
   ```typescript
   - Provider management
   - Network switching
   - Account management
   ```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MetaMask wallet
- Sonic Blaze Testnet configuration
- KRNL Labs API key (for advanced features)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dr-winner/equixtate.git
   cd equixtate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   # Add KRNL_API_KEY=your_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Project Structure
```
equixtate/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Business logic services
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── contracts/         # Smart contracts
├── public/           # Static assets
└── tests/            # Test files
```

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Husky pre-commit hooks

### Development Workflow
1. Create feature branch
2. Implement changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

## Testing

### Smart Contract Tests
```bash
npm run test:contracts
```

### Frontend Tests
```bash
npm run test:frontend
```

### Integration Tests
```bash
npm run test:integration
```

## Deployment

### Current Deployment
EquiXtate is currently deployed on the Sonic Blaze Testnet with the following contract addresses:

```solidity
// Contract Addresses on Sonic Blaze Testnet
PropertyToken: 0x...
Marketplace: 0x...
Governance: 0x...
SwapModule: 0x...
```

### Smart Contracts
1. Compile contracts:
   ```bash
   npm run compile
   ```

2. Deploy to Sonic Blaze Testnet:
   ```bash
   npm run deploy:testnet
   ```

### Frontend
1. Build production version:
   ```bash
   npm run build
   ```

2. Deploy to hosting service:
   ```bash
   npm run deploy:frontend
   ```

## Security Considerations

### Smart Contract Security
- Access control
- Reentrancy protection
- Integer overflow checks
- Event emission
- Error handling

### Frontend Security
- Input validation
- XSS protection
- CSRF protection
- Secure Web3 integration

### Best Practices
- Regular security audits
- Dependency updates
- Code reviews
- Testing coverage

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# EquiXtate Smart Contracts

Solidity smart contracts for real estate tokenization on Sonic Labs blockchain.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
```bash
cp .env.example .env
```

Required variables:
- `SONIC_RPC_URL` - Sonic testnet RPC (default: https://rpc.testnet.soniclabs.com)
- `PRIVATE_KEY` - Your deployer wallet private key
- `SONIC_API_KEY` - For contract verification (optional)

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Deploy to Sonic Testnet
```bash
npm run deploy:sonic
```

### 5. Export ABIs
```bash
npm run export-abis
```

This copies ABIs to `../src/services/web3/abi/` for frontend use.

## 📦 Contracts

All contracts are in `../src/contracts/`:

1. **PropertyTokenERC1155** - Multi-token standard for all property types
2. **KYCRegistry** - KYC/AML verification and compliance
3. **PropertyOracle** - Chainlink integration and price updates
4. **AuctionHouse** - Time-bound bidding system
5. **RentalManager** - Lease management and rent distribution
6. **PropertyFactory** - Registry and orchestrator

## 🌐 Networks

### Sonic Testnet (Primary)
- Chain ID: 64165
- RPC: https://rpc.testnet.soniclabs.com
- Explorer: https://testnet.sonicscan.org/
- Faucet: https://faucet.soniclabs.com/

### Sonic Mainnet
- Chain ID: 146
- RPC: https://rpc.soniclabs.com
- Explorer: https://sonicscan.org/

### Future Expansion
- Sepolia (Ethereum testnet)
- Polygon Amoy

## 📜 Available Scripts

```bash
npm run compile          # Compile all contracts
npm run clean            # Clean artifacts and cache
npm run test             # Run tests
npm run deploy:local     # Deploy to local Hardhat network
npm run deploy:sonic     # Deploy to Sonic testnet
npm run deploy:sonic:mainnet  # Deploy to Sonic mainnet
npm run verify:sonic     # Verify contract on Sonic explorer
npm run export-abis      # Export ABIs to frontend
```

## 📖 Documentation

See [SONIC_DEPLOYMENT.md](./SONIC_DEPLOYMENT.md) for complete deployment guide.

See [../BLOCKCHAIN_IMPLEMENTATION.md](../BLOCKCHAIN_IMPLEMENTATION.md) for implementation details.

## 🔒 Security

- Never commit `.env` file
- Use hardware wallet for mainnet deployments
- Set up multi-sig for admin roles
- Complete security audit before mainnet launch

## 🛠️ Development

### Project Structure
```
blockchain/
├── hardhat.config.ts    # Hardhat configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript config
├── .env.example         # Environment template
├── scripts/
│   ├── deploy.ts        # Main deployment script
│   └── export-abis.ts   # ABI extraction
└── tasks/               # Custom Hardhat tasks
```

### Contract Source Location
Contracts are in `../src/contracts/` (shared with frontend for easier development).

## 📞 Support

- **Sonic Labs Docs**: https://docs.soniclabs.com/
- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com/

# Sonic Labs Deployment Guide

## Overview
EquiXtate is primarily deploying on **Sonic Labs** blockchain for its fast transaction speeds and low costs, making it ideal for real estate tokenization with frequent transactions.

## Why Sonic Labs?
- **Fast finality**: Sub-second transaction confirmation
- **Low gas fees**: Cost-effective for frequent property token transactions
- **EVM compatible**: Seamless Solidity smart contract deployment
- **Growing ecosystem**: Strong DeFi infrastructure and partner integrations

## Network Information

### Sonic Testnet (Development)
- **Chain ID**: 64165
- **RPC URL**: https://rpc.testnet.soniclabs.com
- **Explorer**: https://testnet.sonicscan.org/
- **Native Token**: S (test tokens available from faucet)
- **Faucet**: https://faucet.soniclabs.com/

### Sonic Mainnet (Production)
- **Chain ID**: 146
- **RPC URL**: https://rpc.soniclabs.com
- **Explorer**: https://sonicscan.org/
- **Native Token**: S

## Setup Instructions

### 1. Install Dependencies
```bash
cd blockchain
npm install
```

### 2. Configure Environment
Create a `.env` file in the `blockchain/` directory:

```env
# Sonic Labs RPC endpoints
SONIC_RPC_URL=https://rpc.testnet.soniclabs.com
SONIC_MAINNET_RPC_URL=https://rpc.soniclabs.com

# Your deployment wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Sonic block explorer API key (for contract verification)
SONIC_API_KEY=your_sonic_api_key

# USDC contract address on Sonic (testnet/mainnet)
USDC_ADDRESS_TESTNET=0x...
USDC_ADDRESS_MAINNET=0x...
```

### 3. Get Test Tokens
1. Visit [Sonic Faucet](https://faucet.soniclabs.com/)
2. Enter your wallet address
3. Request test S tokens for gas fees
4. Get test USDC from Sonic testnet faucet (if available) or bridge from another network

### 4. Compile Contracts
```bash
npm run compile
```

This compiles all 6 contracts:
- `PropertyTokenERC1155`
- `KYCRegistry`
- `PropertyOracle`
- `AuctionHouse`
- `RentalManager`
- `PropertyFactory`

### 5. Deploy to Sonic Testnet
```bash
npm run deploy:sonic
```

Expected output:
```
Starting deployment...
Deployer: 0x...
KYCRegistry: 0x...
PropertyOracle: 0x...
PropertyTokenERC1155: 0x...
AuctionHouse: 0x...
RentalManager: 0x...
PropertyFactory: 0x...
Modules set on PropertyFactory
```

**Save these contract addresses!** You'll need them for frontend integration.

### 6. Verify Contracts (Optional but Recommended)
```bash
npm run verify:sonic -- <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Example:
```bash
npm run verify:sonic -- 0x1234... "0xYourAdminAddress"
```

### 7. Export ABIs to Frontend
```bash
npm run export-abis
```

This creates JSON files in `../src/services/web3/abi/` for frontend integration.

## Post-Deployment Configuration

### Update Frontend Constants
Edit `src/services/web3/constants.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  sonicTestnet: {
    propertyToken: '0x...', // From deployment output
    kycRegistry: '0x...',
    oracle: '0x...',
    auctionHouse: '0x...',
    rentalManager: '0x...',
    propertyFactory: '0x...',
    usdc: '0x...' // Sonic testnet USDC
  },
  sonicMainnet: {
    // Add after mainnet deployment
  }
};
```

### Configure Module Connections
After deployment, the contracts need to be wired together. The deployment script automatically calls `PropertyFactory.setModules()`, but you may need to:

1. **Set USDC token address** in PropertyTokenERC1155:
   ```solidity
   propertyToken.setUSDCToken(usdcAddress)
   ```

2. **Set KYC registry** in other contracts:
   ```solidity
   auctionHouse.setKYCRegistry(kycRegistryAddress)
   rentalManager.setKYCRegistry(kycRegistryAddress)
   ```

3. **Grant roles** as needed:
   ```solidity
   propertyToken.grantRole(PROPERTY_MANAGER_ROLE, managerAddress)
   oracle.grantRole(ORACLE_ROLE, oracleAddress)
   ```

## Testing on Sonic Testnet

### 1. Add Sonic Testnet to MetaMask
- Network Name: Sonic Testnet
- RPC URL: https://rpc.testnet.soniclabs.com
- Chain ID: 64165
- Currency Symbol: S
- Block Explorer: https://testnet.sonicscan.org/

### 2. Test Contract Interactions
```bash
# Run local tests first
npm run test

# Deploy to testnet
npm run deploy:sonic

# Verify contracts work on explorer
# Visit https://testnet.sonicscan.org/address/<YOUR_CONTRACT>
```

### 3. Test Frontend Integration
```bash
# In root directory
npm run dev

# Connect wallet to Sonic Testnet
# Try purchasing property tokens
# Verify transactions on sonicscan.org
```

## Mainnet Deployment Checklist

Before deploying to Sonic mainnet:

- [ ] All contracts fully tested on testnet
- [ ] Security audit completed
- [ ] Frontend tested with testnet contracts
- [ ] Multi-sig wallet set up for admin role
- [ ] Timelock contract configured (optional)
- [ ] Emergency pause procedures documented
- [ ] Sufficient S tokens for deployment gas
- [ ] Mainnet USDC contract address confirmed
- [ ] Chainlink price feeds configured (if using)
- [ ] KYC provider integration tested
- [ ] Backup deployment wallet secured

### Deploy to Mainnet
```bash
# Double-check .env has mainnet RPC and sufficient funds
npm run deploy:sonic:mainnet

# Verify all contracts
npm run verify:sonic -- <ADDRESS> <ARGS>

# Update frontend to use mainnet addresses
# Set VITE_NETWORK=sonicMainnet in .env
```

## Multi-Chain Expansion (Future)

When ready to expand beyond Sonic:

1. Deploy contracts to target chains (Sepolia, Polygon, etc.)
2. Use Chainlink CCIP or LayerZero for cross-chain messaging
3. Update frontend to support multi-chain wallet switching
4. Configure separate contract addresses per chain in `constants.ts`

## Troubleshooting

### "Insufficient funds" error
- Get more test S tokens from faucet
- Check wallet balance: `cast balance <ADDRESS> --rpc-url $SONIC_RPC_URL`

### "Nonce too high" error
- Reset MetaMask account (Settings → Advanced → Reset Account)
- Or manually set nonce in deployment script

### "Contract verification failed"
- Ensure constructor arguments match exactly
- Check that source code hasn't changed since deployment
- Verify API key is correct for Sonic explorer

### "Cannot connect to RPC"
- Check `SONIC_RPC_URL` in `.env`
- Try alternative RPC: https://rpc2.testnet.soniclabs.com
- Check internet connection and firewall settings

## Support Resources

- **Sonic Labs Docs**: https://docs.soniclabs.com/
- **Discord**: https://discord.gg/soniclabs
- **GitHub**: https://github.com/soniclabs
- **Explorer**: https://testnet.sonicscan.org/

## Next Steps

After successful deployment:

1. ✅ Update `.github/copilot-instructions.md` with Sonic details
2. ✅ Configure frontend Web3Service for Sonic network
3. ✅ Add Sonic network selector to UI
4. ✅ Test full user flow (KYC → Purchase → Rental Income)
5. ✅ Set up monitoring and alerts for contract events

# EquiXtate Smart Contract Deployments

## Sonic Testnet (Chain ID: 64165)

**Deployment Date:** November 19, 2025  
**Deployer Address:** `0x136Fa7a9F36186d3b94f726028390d17B1774cc8`  
**Pattern:** UUPS Upgradeable Proxies

### Contract Addresses (Proxies)

| Contract | Proxy Address | Implementation Address |
|----------|---------------|------------------------|
| **KYCRegistry** | [`0xE5386Ee767d33Bd760b0Bc27228aE7b32434d28c`](https://testnet.soniclabs.com/address/0xE5386Ee767d33Bd760b0Bc27228aE7b32434d28c) | `0xd639D2766E99b7776F1Ee88eE0D119035c8F22B8` |
| **PropertyOracle** | [`0xb6Cd0223C0506464f2ED89829A828de717E44a28`](https://testnet.soniclabs.com/address/0xb6Cd0223C0506464f2ED89829A828de717E44a28) | `0x2CBC49C1Aa5937b4Ed177770C9484eefDa875A1c` |
| **PropertyTokenERC1155** | [`0xf7b2710619d18c8dE370D4951B8f683Dcfa185D6`](https://testnet.soniclabs.com/address/0xf7b2710619d18c8dE370D4951B8f683Dcfa185D6) | `0x851305cA9feBA76391518971279C03ad5a91F297` |
| **AuctionHouse** | [`0x7C2B1Ae9A296697b8900fFe14092930E0faa0654`](https://testnet.soniclabs.com/address/0x7C2B1Ae9A296697b8900fFe14092930E0faa0654) | `0xED1f7871180780277e5e918dBa29363C363aF132` |
| **RentalManager** | [`0xD8A3D36Bb0214c9e87A8fc20B019D8c5f58DC2c6`](https://testnet.soniclabs.com/address/0xD8A3D36Bb0214c9e87A8fc20B019D8c5f58DC2c6) | `0xEcA80a9D4E800cc5E1F2f98988b948054C8F7945` |
| **PropertyFactory** | [`0x3FC244D95bCbC6eBceE6FA19c0E0b708cB1f89dc`](https://testnet.soniclabs.com/address/0x3FC244D95bCbC6eBceE6FA19c0E0b708cB1f89dc) | `0xE46A982a1c2eE1eEeD87673eD0AA4699dBae41e1` |

### Network Information

- **RPC URL:** `https://rpc.testnet.soniclabs.com`
- **Chain ID:** 64165
- **Block Explorer:** https://testnet.soniclabs.com
- **Native Token:** S (Sonic)
- **Test Faucet:** https://testnet.soniclabs.com/faucet

### Contract Interactions

All contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern:
- **User interactions** should target the **Proxy addresses** (these remain constant)
- **Implementation addresses** can change during upgrades
- **Admin role** required for upgrades via `upgradeTo()` or `upgradeToAndCall()`

### Module Configuration

The PropertyFactory has been initialized with the following module addresses:
```javascript
{
  token: "0xf7b2710619d18c8dE370D4951B8f683Dcfa185D6",
  kycRegistry: "0xE5386Ee767d33Bd760b0Bc27228aE7b32434d28c",
  oracle: "0xb6Cd0223C0506464f2ED89829A828de717E44a28",
  auction: "0x7C2B1Ae9A296697b8900fFe14092930E0faa0654",
  rental: "0xD8A3D36Bb0214c9e87A8fc20B019D8c5f58DC2c6"
}
```

### Frontend Integration

The contract addresses are configured in:
- **Constants:** `src/services/web3/constants.ts`
- **ABIs:** `src/services/web3/abi/*.json`
- **Contract Service:** `src/services/web3/ContractService.ts`
- **Network Config:** `src/config/rainbowkit.ts`

### Upgrade Instructions

To upgrade a contract:

1. **Deploy new implementation:**
   ```bash
   cd blockchain
   npx hardhat run scripts/upgrade-[contract-name].ts --network sonicTestnet
   ```

2. **Verify the upgrade:**
   ```bash
   npx hardhat verify --network sonicTestnet <NEW_IMPLEMENTATION_ADDRESS>
   ```

3. **The proxy automatically points to the new implementation**

### Security Notes

⚠️ **Admin Role Holders:**
- Deployer: `0x136Fa7a9F36186d3b94f726028390d17B1774cc8`

⚠️ **Before Mainnet:**
- [ ] Transfer admin roles to multi-sig wallet (Gnosis Safe)
- [ ] Implement timelock for upgrades (48-72 hours)
- [ ] Complete security audit of upgrade mechanism
- [ ] Test upgrade flow on testnet
- [ ] Document emergency procedures

### Deployment Scripts

- **Initial deployment:** `scripts/deploy-upgradeable.ts`
- **Export ABIs:** `scripts/export-abis.ts`
- **Upgrade template:** `scripts/upgrade-template.ts` (to be created)

---

## Mainnet Deployment

🚫 **Not yet deployed to mainnet**

Before mainnet deployment:
1. Complete security audit
2. Set up multi-sig governance
3. Implement upgrade timelock
4. Establish emergency pause procedures
5. Prepare incident response plan

---

**Last Updated:** November 19, 2025  
**Maintained By:** EquiXtate Development Team

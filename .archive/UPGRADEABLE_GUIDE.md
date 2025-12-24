# EquiXtate Smart Contracts - Upgradeable Implementation Guide

**Date:** November 19, 2025  
**Status:** ✅ All contracts converted to UUPS upgradeable pattern

---

## Overview

All EquiXtate smart contracts have been converted to **UUPS (Universal Upgradeable Proxy Standard)** upgradeable contracts. This allows for bug fixes and feature upgrades without requiring user migration.

---

## What Changed?

### Architecture Transformation

**Before (Immutable):**
```
User → Contract (Immutable Logic)
```

**After (Upgradeable):**
```
User → Proxy Contract (ERC1967) → Implementation Contract (Logic)
              ↓
        Storage remains in Proxy
```

### Key Changes Per Contract

| Contract | Changes Made |
|----------|--------------|
| **PropertyTokenERC1155** | Imports, inheritance, constructor → initializer, _authorizeUpgrade |
| **AuctionHouse** | Imports, inheritance, constructor → initializer, _authorizeUpgrade |
| **RentalManager** | Imports, inheritance, constructor → initializer, _authorizeUpgrade |
| **PropertyFactory** | Imports, inheritance, constructor → initializer, _authorizeUpgrade |
| **KYCRegistry** | Imports, inheritance, constructor → initializer, _authorizeUpgrade |
| **PropertyOracle** | Imports, inheritance, constructor → initializer, _authorizeUpgrade |

---

## Technical Implementation Details

### 1. Import Changes

**Before:**
```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
```

**After:**
```solidity
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
```

### 2. Contract Inheritance

**Before:**
```solidity
contract PropertyTokenERC1155 is ERC1155, AccessControl, ReentrancyGuard, Pausable {
```

**After:**
```solidity
contract PropertyTokenERC1155 is 
    Initializable,
    ERC1155Upgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable
{
```

### 3. Constructor → Initializer

**Before:**
```solidity
constructor(
    address _usdcToken,
    address _kycRegistry,
    address _feeRecipient
) ERC1155("https://api.equixtate.com/metadata/{id}.json") {
    require(_usdcToken != address(0), "Invalid USDC address");
    // ... initialization code
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
}
```

**After:**
```solidity
/// @custom:oz-upgrades-unsafe-allow constructor
constructor() {
    _disableInitializers();
}

function initialize(
    address _usdcToken,
    address _kycRegistry,
    address _feeRecipient
) public initializer {
    require(_usdcToken != address(0), "Invalid USDC address");
    
    __ERC1155_init("https://api.equixtate.com/metadata/{id}.json");
    __AccessControl_init();
    __ReentrancyGuard_init();
    __Pausable_init();
    __UUPSUpgradeable_init();
    
    // ... initialization code
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
}
```

### 4. Authorization Function

**All contracts now include:**
```solidity
/**
 * @dev Authorize upgrade (UUPS)
 * @param newImplementation Address of new implementation
 */
function _authorizeUpgrade(address newImplementation) 
    internal 
    override 
    onlyRole(ADMIN_ROLE) 
{}
```

This ensures only admins can upgrade contracts.

---

## Deployment

### Installation

```bash
cd blockchain
npm install
```

This will install:
- `@openzeppelin/contracts-upgradeable@4.9.6`
- `@openzeppelin/hardhat-upgrades@2.4.0`

### Compilation

```bash
npm run compile
```

Expected output: All contracts compile successfully with no errors.

### Deployment Script

**New script:** `scripts/deploy-upgradeable.ts`

Deploy to Sonic testnet:
```bash
npm run deploy:sonic:upgradeable
```

### Deployment Process

The script:
1. Deploys implementation contracts
2. Deploys ERC1967 proxy contracts
3. Calls `initialize()` on each proxy
4. Configures PropertyFactory modules
5. Returns both proxy and implementation addresses

**Example Output:**
```
Deploying upgradeable EquiXtate contracts to Sonic...
Deploying KYCRegistry (upgradeable)...
KYCRegistry (proxy) deployed to: 0x1234...
KYCRegistry implementation: 0x5678...

... (all other contracts)

All contracts deployed as UUPS proxies!
```

---

## Upgrading Contracts

### Prerequisites

1. Admin role on the contract
2. New implementation contract deployed
3. Hardhat upgrades plugin configured

### Upgrade Process

#### Option 1: Using Hardhat Plugin (Recommended)

```typescript
import { ethers, upgrades } from "hardhat";

async function upgradeContract() {
  const proxyAddress = "0x1234..."; // Existing proxy address
  
  const NewImplementation = await ethers.getContractFactory("PropertyTokenERC1155V2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, NewImplementation);
  
  console.log("Contract upgraded to:", await upgraded.getAddress());
}
```

#### Option 2: Manual Upgrade

```typescript
import { ethers } from "hardhat";

async function manualUpgrade() {
  const proxyAddress = "0x1234...";
  
  // Deploy new implementation
  const NewImplementation = await ethers.getContractFactory("PropertyTokenERC1155V2");
  const newImpl = await NewImplementation.deploy();
  await newImpl.waitForDeployment();
  
  // Call upgradeTo on proxy
  const proxy = await ethers.getContractAt("PropertyTokenERC1155", proxyAddress);
  const tx = await proxy.upgradeTo(await newImpl.getAddress());
  await tx.wait();
  
  console.log("Upgraded to new implementation:", await newImpl.getAddress());
}
```

### Verification After Upgrade

```typescript
import { ethers, upgrades } from "hardhat";

const proxyAddress = "0x1234...";

// Get current implementation address
const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
console.log("Current implementation:", implAddress);

// Verify proxy is still functional
const contract = await ethers.getContractAt("PropertyTokenERC1155", proxyAddress);
const balance = await contract.balanceOf(userAddress, tokenId);
console.log("Balance:", balance);
```

---

## Storage Layout

### Critical Rules

⚠️ **Storage layout MUST be preserved across upgrades!**

**✅ Safe Operations:**
- Add new state variables at the end
- Add new functions
- Modify existing function logic
- Add new events

**❌ Unsafe Operations:**
- Reorder state variables
- Change variable types
- Delete state variables
- Change inheritance order

### Example - Safe Upgrade

**V1 (Original):**
```solidity
contract PropertyTokenERC1155 is ... {
    IERC20 public usdcToken;
    address public kycRegistry;
    uint256 public platformFee;
    // ... existing variables
}
```

**V2 (Safe Upgrade):**
```solidity
contract PropertyTokenERC1155V2 is ... {
    IERC20 public usdcToken;        // ✅ Same position
    address public kycRegistry;     // ✅ Same position
    uint256 public platformFee;     // ✅ Same position
    // ... existing variables
    
    uint256 public newFeature;      // ✅ Added at end
}
```

### Storage Validation

Run validation before upgrading:
```bash
npx hardhat verify-proxy-upgrade <PROXY_ADDRESS> <NEW_IMPL_NAME>
```

---

## Security Considerations

### 1. Initializer Protection

All contracts use `_disableInitializers()` in constructor to prevent implementation contracts from being initialized:

```solidity
/// @custom:oz-upgrades-unsafe-allow constructor
constructor() {
    _disableInitializers();
}
```

### 2. Authorization

Only `ADMIN_ROLE` can upgrade contracts:
```solidity
function _authorizeUpgrade(address newImplementation) 
    internal 
    override 
    onlyRole(ADMIN_ROLE) 
{}
```

### 3. Initialization Guard

Initializers can only be called once:
```solidity
function initialize(...) public initializer {
    // This can only be called once
}
```

### 4. Proxy Admin Control

**For mainnet:**
- Transfer admin role to multi-sig wallet
- Implement timelock for upgrades
- Require community governance vote

---

## Testing Upgrades

### Test Upgrade Locally

```typescript
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

describe("PropertyTokenERC1155 Upgrade", function() {
  it("Should preserve state after upgrade", async function() {
    // Deploy V1
    const V1 = await ethers.getContractFactory("PropertyTokenERC1155");
    const proxy = await upgrades.deployProxy(V1, [usdc, kyc, feeRecipient], { kind: "uups" });
    
    // Set some state
    await proxy.listProperty(...);
    const tokenIdBefore = await proxy.nextPropertyId();
    
    // Upgrade to V2
    const V2 = await ethers.getContractFactory("PropertyTokenERC1155V2");
    const upgraded = await upgrades.upgradeProxy(await proxy.getAddress(), V2);
    
    // Verify state preserved
    const tokenIdAfter = await upgraded.nextPropertyId();
    expect(tokenIdAfter).to.equal(tokenIdBefore);
    
    // Test new functionality
    await upgraded.newV2Function();
  });
});
```

---

## Benefits of Upgradeable Contracts

### ✅ Advantages

1. **Bug Fixes** - Patch vulnerabilities without migration
2. **Feature Upgrades** - Add functionality incrementally
3. **Gas Optimization** - Improve efficiency over time
4. **User Experience** - No token migration required
5. **Continuous Improvement** - Iterate based on feedback

### ⚠️ Risks

1. **Centralization** - Admin can change logic
2. **Complexity** - More attack surface
3. **Storage Collisions** - If not careful with layout
4. **Testing Burden** - Must test upgrade paths

### 🎯 Mitigation Strategy

1. **Multi-sig governance** for upgrade authority
2. **Timelock delays** before upgrades take effect
3. **Transparent announcements** of planned upgrades
4. **Community audits** of new implementations
5. **Emergency pause** capability for critical issues

---

## Upgrade Checklist

Before deploying an upgrade:

- [ ] Storage layout validated (no collisions)
- [ ] All tests passing on new implementation
- [ ] Gas usage analyzed and optimized
- [ ] Security audit completed (for major changes)
- [ ] Multi-sig approval obtained
- [ ] Community announcement published
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Upgrade tested on testnet
- [ ] Documentation updated

---

## Contract Addresses

### Testnet (Sonic)

After deployment, update with actual addresses:

| Contract | Proxy Address | Implementation |
|----------|---------------|----------------|
| KYCRegistry | TBD | TBD |
| PropertyOracle | TBD | TBD |
| PropertyTokenERC1155 | TBD | TBD |
| AuctionHouse | TBD | TBD |
| RentalManager | TBD | TBD |
| PropertyFactory | TBD | TBD |

**Users and frontend should ONLY interact with proxy addresses.**

---

## Emergency Procedures

### If Upgrade Fails

1. **Don't panic** - Old implementation still works
2. **Pause contracts** if vulnerability detected
3. **Deploy fixed version** of new implementation
4. **Test thoroughly** before second upgrade attempt
5. **Communicate** with users about status

### If Proxy Corrupted

UUPS proxies are self-contained. If proxy is corrupted:
1. Deploy new proxy + implementation
2. Migrate user data via script
3. Deprecate old proxy
4. Update frontend to new addresses

---

## Resources

- **OpenZeppelin Upgrades:** https://docs.openzeppelin.com/upgrades-plugins/
- **UUPS Pattern:** https://eips.ethereum.org/EIPS/eip-1822
- **Storage Slots:** https://docs.openzeppelin.com/contracts/4.x/upgradeable
- **Testing Upgrades:** https://docs.openzeppelin.com/upgrades-plugins/1.x/api-hardhat-upgrades

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Compile contracts: `npm run compile`
3. ⏳ Deploy to testnet: `npm run deploy:sonic:upgradeable`
4. ⏳ Test upgrade process on testnet
5. ⏳ Document deployment addresses
6. ⏳ Plan governance structure for mainnet
7. ⏳ Security audit of upgrade mechanism

---

**Upgrade Capability Status:** ✅ ENABLED  
**Recommended for:** Mainnet deployment with governance  
**Maintainer:** EquiXtate Development Team

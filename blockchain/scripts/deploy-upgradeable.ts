import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying upgradeable EquiXtate contracts to Sonic...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // USDC address on Sonic testnet (using USDC testnet address)
  const USDC_ADDRESS = "0x0BA304580ee7c9a980CF72e55f5Ed2E9fd30Bc51";
  const FEE_RECIPIENT = deployer.address;

  // Deploy KYCRegistry (upgradeable)
  console.log("\nDeploying KYCRegistry (upgradeable)...");
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await upgrades.deployProxy(
    KYCRegistry,
    [], // initialize() has no parameters
    { kind: "uups" }
  );
  await kycRegistry.waitForDeployment();
  const kycRegistryAddress = await kycRegistry.getAddress();
  console.log("KYCRegistry (proxy) deployed to:", kycRegistryAddress);
  console.log("KYCRegistry implementation:", await upgrades.erc1967.getImplementationAddress(kycRegistryAddress));

  // Deploy PropertyOracle (upgradeable)
  console.log("\nDeploying PropertyOracle (upgradeable)...");
  const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
  const propertyOracle = await upgrades.deployProxy(
    PropertyOracle,
    [ethers.ZeroAddress], // _usdcPriceFeed (set to zero for now)
    { kind: "uups" }
  );
  await propertyOracle.waitForDeployment();
  const propertyOracleAddress = await propertyOracle.getAddress();
  console.log("PropertyOracle (proxy) deployed to:", propertyOracleAddress);
  console.log("PropertyOracle implementation:", await upgrades.erc1967.getImplementationAddress(propertyOracleAddress));

  // Deploy PropertyTokenERC1155 (upgradeable)
  console.log("\nDeploying PropertyTokenERC1155 (upgradeable)...");
  const PropertyTokenERC1155 = await ethers.getContractFactory("PropertyTokenERC1155");
  const propertyToken = await upgrades.deployProxy(
    PropertyTokenERC1155,
    [USDC_ADDRESS, kycRegistryAddress, FEE_RECIPIENT],
    { kind: "uups" }
  );
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("PropertyTokenERC1155 (proxy) deployed to:", propertyTokenAddress);
  console.log("PropertyTokenERC1155 implementation:", await upgrades.erc1967.getImplementationAddress(propertyTokenAddress));

  // Deploy AuctionHouse (upgradeable)
  console.log("\nDeploying AuctionHouse (upgradeable)...");
  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = await upgrades.deployProxy(
    AuctionHouse,
    [propertyTokenAddress, USDC_ADDRESS, kycRegistryAddress, FEE_RECIPIENT],
    { kind: "uups" }
  );
  await auctionHouse.waitForDeployment();
  const auctionHouseAddress = await auctionHouse.getAddress();
  console.log("AuctionHouse (proxy) deployed to:", auctionHouseAddress);
  console.log("AuctionHouse implementation:", await upgrades.erc1967.getImplementationAddress(auctionHouseAddress));

  // Deploy RentalManager (upgradeable)
  console.log("\nDeploying RentalManager (upgradeable)...");
  const RentalManager = await ethers.getContractFactory("RentalManager");
  const rentalManager = await upgrades.deployProxy(
    RentalManager,
    [propertyTokenAddress, USDC_ADDRESS, kycRegistryAddress, FEE_RECIPIENT],
    { kind: "uups" }
  );
  await rentalManager.waitForDeployment();
  const rentalManagerAddress = await rentalManager.getAddress();
  console.log("RentalManager (proxy) deployed to:", rentalManagerAddress);
  console.log("RentalManager implementation:", await upgrades.erc1967.getImplementationAddress(rentalManagerAddress));

  // Deploy PropertyFactory (upgradeable)
  console.log("\nDeploying PropertyFactory (upgradeable)...");
  const PropertyFactory = await ethers.getContractFactory("PropertyFactory");
  const propertyFactory = await upgrades.deployProxy(
    PropertyFactory,
    [deployer.address], // admin address
    { kind: "uups" }
  );
  await propertyFactory.waitForDeployment();
  const propertyFactoryAddress = await propertyFactory.getAddress();
  console.log("PropertyFactory (proxy) deployed to:", propertyFactoryAddress);
  console.log("PropertyFactory implementation:", await upgrades.erc1967.getImplementationAddress(propertyFactoryAddress));

  // Set modules in PropertyFactory
  console.log("\nSetting modules in PropertyFactory...");
  const setModulesTx = await propertyFactory.setModules({
    token: propertyTokenAddress,
    kycRegistry: kycRegistryAddress,
    oracle: propertyOracleAddress,
    auction: auctionHouseAddress,
    rental: rentalManagerAddress,
  });
  await setModulesTx.wait();
  console.log("Modules set successfully");

  // Summary
  console.log("\n========================================");
  console.log("Deployment Summary (Upgradeable)");
  console.log("========================================");
  console.log("KYCRegistry (Proxy):", kycRegistryAddress);
  console.log("PropertyOracle (Proxy):", propertyOracleAddress);
  console.log("PropertyTokenERC1155 (Proxy):", propertyTokenAddress);
  console.log("AuctionHouse (Proxy):", auctionHouseAddress);
  console.log("RentalManager (Proxy):", rentalManagerAddress);
  console.log("PropertyFactory (Proxy):", propertyFactoryAddress);
  console.log("\nAll contracts deployed as UUPS proxies!");
  console.log("Implementation addresses are stored on-chain.");
  console.log("\nTo upgrade a contract:");
  console.log("1. Deploy new implementation");
  console.log("2. Call upgradeTo() or upgradeToAndCall() on the proxy");
  console.log("3. Admin role required for upgrades");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PropertyToken
  console.log("Deploying PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(
    "EquiXtate Property Token",
    "EPT",
    "Sample Property",
    "123 Main St",
    ethers.parseEther("1000000"), // 1M USD property value
    deployer.address
  );
  await propertyToken.waitForDeployment();
  console.log("PropertyToken deployed to:", await propertyToken.getAddress());

  // Deploy Marketplace
  console.log("Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("PropertyMarketplace");
  const marketplace = await Marketplace.deploy(await propertyToken.getAddress());
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Deploy Governance
  console.log("Deploying Governance...");
  const Governance = await ethers.getContractFactory("PropertyGovernance");
  const governance = await Governance.deploy(await propertyToken.getAddress());
  await governance.waitForDeployment();
  console.log("Governance deployed to:", await governance.getAddress());

  // Deploy SwapModule
  console.log("Deploying SwapModule...");
  const SwapModule = await ethers.getContractFactory("SwapModule");
  const swapModule = await SwapModule.deploy(
    process.env.VITE_SONIC_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
    await propertyToken.getAddress()
  );
  await swapModule.waitForDeployment();
  console.log("SwapModule deployed to:", await swapModule.getAddress());

  // Save deployment info
  const deploymentInfo = {
    PropertyToken: await propertyToken.getAddress(),
    Marketplace: await marketplace.getAddress(),
    Governance: await governance.getAddress(),
    SwapModule: await swapModule.getAddress(),
    network: "Sonic Labs Testnet",
    chainId: process.env.VITE_SONIC_LABS_CHAIN_ID || "148",
    deployer: deployer.address
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment complete! Addresses saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
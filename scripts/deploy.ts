import { ethers } from 'ethers';
import { SONIC_LABS_CONFIG } from '../src/services/web3/constants';

async function main() {
  // Connect to Sonic Labs Testnet
  const provider = new ethers.JsonRpcProvider(SONIC_LABS_CONFIG.RPC_URL);
  
  // Get deployer wallet (you'll need to set this up with your private key)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Please set DEPLOYER_PRIVATE_KEY in your environment variables");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying contracts with address:", wallet.address);

  // Deploy PropertyToken contract
  console.log("Deploying PropertyToken contract...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy();
  await propertyToken.waitForDeployment();
  console.log("PropertyToken deployed to:", await propertyToken.getAddress());

  // Deploy Marketplace contract
  console.log("Deploying Marketplace contract...");
  const Marketplace = await ethers.getContractFactory("PropertyMarketplace");
  const marketplace = await Marketplace.deploy(await propertyToken.getAddress());
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Deploy Governance contract
  console.log("Deploying Governance contract...");
  const Governance = await ethers.getContractFactory("PropertyGovernance");
  const governance = await Governance.deploy(await propertyToken.getAddress());
  await governance.waitForDeployment();
  console.log("Governance deployed to:", await governance.getAddress());

  // Deploy SwapModule contract
  console.log("Deploying SwapModule contract...");
  const SwapModule = await ethers.getContractFactory("SwapModule");
  const swapModule = await SwapModule.deploy(
    SONIC_LABS_CONFIG.SONIC_TOKEN_ADDRESS, // You'll need to get this from Sonic Labs
    await propertyToken.getAddress()
  );
  await swapModule.waitForDeployment();
  console.log("SwapModule deployed to:", await swapModule.getAddress());

  // Save deployment addresses to a file
  const deploymentInfo = {
    PropertyToken: await propertyToken.getAddress(),
    Marketplace: await marketplace.getAddress(),
    Governance: await governance.getAddress(),
    SwapModule: await swapModule.getAddress(),
    network: "Sonic Labs Testnet",
    chainId: SONIC_LABS_CONFIG.CHAIN_ID,
    deployer: wallet.address
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment complete! Addresses saved to deployment-info.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
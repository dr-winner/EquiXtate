import { ethers, run } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy KYCRegistry (no constructor args)
  const KYC = await ethers.getContractFactory("KYCRegistry");
  const kyc = await KYC.deploy();
  await kyc.waitForDeployment();
  console.log("KYCRegistry:", await kyc.getAddress());

  // Deploy PropertyOracle (requires _usdcPriceFeed address, can be zero for now)
  const Oracle = await ethers.getContractFactory("PropertyOracle");
  const oracle = await Oracle.deploy(ethers.ZeroAddress); // Zero address for now
  await oracle.waitForDeployment();
  console.log("PropertyOracle:", await oracle.getAddress());

  // Deploy PropertyTokenERC1155 (requires _usdcToken, _kycRegistry, _feeRecipient)
  // Sonic testnet USDC address
  const usdcAddress = "0x0BA304580ee7c9a980CF72e55f5Ed2E9fd30Bc51";
  const Token = await ethers.getContractFactory("PropertyTokenERC1155");
  const token = await Token.deploy(
    usdcAddress, // Sonic testnet USDC
    await kyc.getAddress(),
    deployer.address // feeRecipient
  );
  await token.waitForDeployment();
  console.log("PropertyTokenERC1155:", await token.getAddress());

  // Deploy AuctionHouse (requires _propertyToken, _usdcToken, _kycRegistry, _feeRecipient)
  const Auction = await ethers.getContractFactory("AuctionHouse");
  const auction = await Auction.deploy(
    await token.getAddress(),
    usdcAddress, // Sonic testnet USDC
    await kyc.getAddress(),
    deployer.address // feeRecipient
  );
  await auction.waitForDeployment();
  console.log("AuctionHouse:", await auction.getAddress());

  // Deploy RentalManager (requires _propertyToken, _usdcToken, _kycRegistry, _feeRecipient)
  const Rental = await ethers.getContractFactory("RentalManager");
  const rental = await Rental.deploy(
    await token.getAddress(),
    usdcAddress, // Sonic testnet USDC
    await kyc.getAddress(),
    deployer.address // feeRecipient
  );
  await rental.waitForDeployment();
  console.log("RentalManager:", await rental.getAddress());

  // Deploy PropertyFactory (requires admin address)
  const Factory = await ethers.getContractFactory("PropertyFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  console.log("PropertyFactory:", await factory.getAddress());

  console.log("\n✅ All contracts deployed successfully!");
  console.log("Deployment addresses:");
  console.log("- KYCRegistry:", await kyc.getAddress());
  console.log("- PropertyOracle:", await oracle.getAddress());
  console.log("- PropertyTokenERC1155:", await token.getAddress());
  console.log("- AuctionHouse:", await auction.getAddress());
  console.log("- RentalManager:", await rental.getAddress());
  console.log("- PropertyFactory:", await factory.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

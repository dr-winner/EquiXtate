require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sonicLabsTestnet: {
      url: process.env.VITE_SONIC_LABS_RPC_URL || "https://rpc.blaze.soniclabs.com",
      chainId: Number(process.env.VITE_SONIC_LABS_CHAIN_ID) || 57054,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
}; 
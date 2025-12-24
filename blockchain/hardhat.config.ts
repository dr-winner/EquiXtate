import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";

dotenv.config();

const {
  SONIC_RPC_URL,
  SONIC_MAINNET_RPC_URL,
  SEPOLIA_RPC_URL,
  POLYGON_AMOY_RPC_URL,
  PRIVATE_KEY,
  SONIC_API_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY
} = process.env as Record<string, string>;

// Dynamically build networks to avoid undefined configs
const networks: Record<string, any> = { hardhat: {} };
if (PRIVATE_KEY && SONIC_RPC_URL) {
  networks.sonicTestnet = {
    url: SONIC_RPC_URL,
    accounts: [PRIVATE_KEY],
    chainId: 14601, // Sonic S testnet chain ID
    gasPrice: "auto",
    allowUnlimitedContractSize: true,
    timeout: 60000
  };
}
if (PRIVATE_KEY && SONIC_MAINNET_RPC_URL) {
  networks.sonicMainnet = {
    url: SONIC_MAINNET_RPC_URL,
    accounts: [PRIVATE_KEY],
    chainId: 146,
    gasPrice: "auto",
    allowUnlimitedContractSize: true,
    timeout: 60000
  };
}
if (PRIVATE_KEY && SEPOLIA_RPC_URL) {
  networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: [PRIVATE_KEY]
  };
}
if (PRIVATE_KEY && POLYGON_AMOY_RPC_URL) {
  networks.polygonAmoy = {
    url: POLYGON_AMOY_RPC_URL,
    accounts: [PRIVATE_KEY]
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks,
  etherscan: {
    apiKey: {
      sonicTestnet: SONIC_API_KEY || "",
      sonicMainnet: SONIC_API_KEY || "",
      sepolia: ETHERSCAN_API_KEY || "",
      polygonAmoy: POLYGONSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "sonicTestnet",
        chainId: 14601,
        urls: {
          apiURL: "https://api.testnet.soniclabs.com/api",
          browserURL: "https://testnet.sonicscan.org/"
        }
      },
      {
        network: "sonicMainnet",
        chainId: 146,
        urls: {
          apiURL: "https://api.soniclabs.com/api",
          browserURL: "https://sonicscan.org/"
        }
      },
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/"
        }
      }
    ]
  }
};

export default config;

import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const RPC_URL = process.env.FHENIX_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL || "";
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {}
  }
};

if (RPC_URL) {
  config.networks!.fhenix = {
    url: RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
  };
}

if (SEPOLIA_RPC_URL) {
  config.networks!.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

if (ARBITRUM_SEPOLIA_RPC_URL) {
  config.networks!.arbitrumSepolia = {
    url: ARBITRUM_SEPOLIA_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

if (BASE_SEPOLIA_RPC_URL) {
  config.networks!.baseSepolia = {
    url: BASE_SEPOLIA_RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

export default config;

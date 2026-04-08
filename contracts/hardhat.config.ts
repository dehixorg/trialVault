import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const RPC_URL = process.env.FHENIX_RPC_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    sources: ".",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {},
    fhenix: RPC_URL
      ? {
          url: RPC_URL,
          accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
        }
      : {}
  }
};

export default config;

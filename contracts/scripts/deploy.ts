import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment of TrialVault on Fhenix network...");

  // Get the ContractFactory
  const TrialVaultFactory = await ethers.getContractFactory("TrialVault");
  
  // Deploy the contract
  console.log("Deploying TrialVault...");
  const trialVault = await TrialVaultFactory.deploy();

  // Wait for deployment to finish
  await trialVault.waitForDeployment();
  const address = await trialVault.getAddress();

  console.log(`✅ TrialVault deployed successfully to: ${address}`);
  console.log("Save this address and update your frontend environment variables.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

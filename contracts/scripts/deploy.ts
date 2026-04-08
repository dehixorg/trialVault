import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const TrialVault = await ethers.getContractFactory("TrialVaultMVP");
  const contract = await TrialVault.deploy(deployer.address);
  await contract.waitForDeployment();

  console.log("TrialVaultMVP deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

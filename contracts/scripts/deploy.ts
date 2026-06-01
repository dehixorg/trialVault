import fs from "node:fs";
import path from "node:path";
import hre from "hardhat";

const { ethers, network } = hre;

type DeploymentRecord = {
  network: string;
  chainId: string;
  deployer: string;
  deployedAt: string;
  contracts: Record<string, {
    address: string;
    transactionHash: string | null;
  }>;
};

async function deployContract(name: string) {
  const Factory = await ethers.getContractFactory(name);
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const deploymentTransaction = contract.deploymentTransaction();
  const address = await contract.getAddress();

  console.log(`${name} deployed to ${address}`);
  if (deploymentTransaction?.hash) {
    console.log(`${name} tx ${deploymentTransaction.hash}`);
  }

  return {
    address,
    transactionHash: deploymentTransaction?.hash ?? null,
  };
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log(`Deploying TrialVault contracts`);
  console.log(`Network: ${network.name} (${chainId.toString()})`);
  console.log(`Deployer: ${deployer.address}`);

  const contracts = {
    PatientVault: await deployContract("PatientVault"),
    TrialVault: await deployContract("TrialVault"),
    ClinicalTrialVault: await deployContract("ClinicalTrialVault"),
  };

  const record: DeploymentRecord = {
    network: network.name,
    chainId: chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts,
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`);

  console.log(`Deployment manifest written to ${outPath}`);
  console.log("Update frontend env vars with:");
  console.log(`VITE_PATIENT_VAULT_ADDRESS=${contracts.PatientVault.address}`);
  console.log(`VITE_TRIAL_VAULT_ADDRESS=${contracts.TrialVault.address}`);
  console.log(`VITE_CLINICAL_TRIAL_VAULT_ADDRESS=${contracts.ClinicalTrialVault.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

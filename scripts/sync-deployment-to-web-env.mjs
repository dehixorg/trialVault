import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const network = process.argv[2];

if (!network) {
  console.error("Usage: node scripts/sync-deployment-to-web-env.mjs <network>");
  process.exit(1);
}

const root = process.cwd();
const deploymentPath = path.join(root, "contracts", "deployments", `${network}.json`);
const webEnvPath = path.join(root, "web", ".env.production.local");

const deployment = JSON.parse(await readFile(deploymentPath, "utf8"));
const contracts = deployment.contracts;

const contents = [
  `VITE_PATIENT_VAULT_ADDRESS=${contracts.PatientVault.address}`,
  `VITE_TRIAL_VAULT_ADDRESS=${contracts.TrialVault.address}`,
  `VITE_CLINICAL_TRIAL_VAULT_ADDRESS=${contracts.ClinicalTrialVault.address}`,
  "",
].join("\n");

await writeFile(webEnvPath, contents);

console.log(`Updated ${webEnvPath} from ${deploymentPath}`);

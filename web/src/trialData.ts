import demoAggregate from './data/demoAggregate.json';
import { contractConfig } from './contracts';

export const trialStatus = {
  id: "TV-204",
  phase: "Phase II",
  network: "Base Sepolia",
  contractAddress: contractConfig.clinicalTrialVault.address,
  encryptedRecords: demoAggregate.cohortSize,
  enrolledPatients: demoAggregate.cohortSize,
  protocolHash: "0x6f7a...b913",
  datasetHash: "0x91c4...a220",
  accessLogRoot: "0x44fa...19be",
  computationReceipt: demoAggregate.encryptedComputationReceipt,
};

export const auditEvents = [
  {
    time: "2026-05-24 09:12 UTC",
    actor: "Principal Investigator",
    action: "Trial protocol committed",
    tx: "0x2c8a...4410",
    privacy: "No PII disclosed",
  },
  {
    time: "2026-05-26 14:08 UTC",
    actor: "Patient wallet",
    action: "Encrypted baseline vitals enrolled",
    tx: "0x817d...3c91",
    privacy: "Ciphertext only",
  },
  {
    time: "2026-05-29 18:30 UTC",
    actor: "Researcher",
    action: "Aggregate response computed",
    tx: "0x7f83...d906",
    privacy: "Aggregate only",
  },
  {
    time: "2026-06-01 10:15 UTC",
    actor: "Sponsor",
    action: "FDA evidence package generated",
    tx: "0x91c4...a220",
    privacy: "Commitments and receipts",
  },
];

export const evidencePackage = {
  trialId: trialStatus.id,
  phase: trialStatus.phase,
  network: trialStatus.network,
  contractAddress: trialStatus.contractAddress,
  protocolHash: trialStatus.protocolHash,
  encryptedDatasetHash: trialStatus.datasetHash,
  accessLogRoot: trialStatus.accessLogRoot,
  computationReceipt: trialStatus.computationReceipt,
  enrolledPatients: trialStatus.enrolledPatients,
  aggregateStats: demoAggregate,
  piiDisclosed: false,
  controls: [
    "Patient-level medical values remain encrypted",
    "Researcher output is aggregate-only",
    "Patient access grants expire",
    "Regulator audit package uses commitments and receipts",
  ],
};

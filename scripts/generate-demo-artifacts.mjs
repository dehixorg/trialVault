import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const OUT_DIR = new URL("../artifacts/demo/", import.meta.url);

const hash = (value) =>
  "0x" + createHash("sha256").update(JSON.stringify(value)).digest("hex");

const severityLabels = ["none", "mild", "moderate", "severe"];

const patients = Array.from({ length: 50 }, (_, index) => {
  const patientId = index + 1;
  const age = 32 + ((index * 7) % 37);
  const systolicBp = 112 + ((index * 5) % 34);
  const heartRate = 62 + ((index * 3) % 28);
  const doseMg = index % 3 === 0 ? 250 : index % 3 === 1 ? 500 : 750;
  const responseIndicator = index % 5 !== 0 ? 1 : 0;
  const adverseEventSeverity = index % 17 === 0 ? 3 : index % 6 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
  const compliancePercentage = 76 + ((index * 4) % 23);
  const consentHash = hash({ patientId, consentVersion: "TV-204-v1" });

  return {
    patientId,
    walletAlias: `patient-${String(patientId).padStart(3, "0")}`,
    consentHash,
    ciphertextCommitments: {
      age: hash({ patientId, field: "age", value: age }),
      systolicBp: hash({ patientId, field: "systolicBp", value: systolicBp }),
      heartRate: hash({ patientId, field: "heartRate", value: heartRate }),
      doseMg: hash({ patientId, field: "doseMg", value: doseMg }),
      responseIndicator: hash({ patientId, field: "responseIndicator", value: responseIndicator }),
      adverseEventSeverity: hash({ patientId, field: "adverseEventSeverity", value: adverseEventSeverity }),
      compliancePercentage: hash({ patientId, field: "compliancePercentage", value: compliancePercentage }),
    },
    demoPlaintextForLocalStatsOnly: {
      age,
      systolicBp,
      heartRate,
      doseMg,
      responseIndicator,
      adverseEventSeverity,
      adverseEventLabel: severityLabels[adverseEventSeverity],
      compliancePercentage,
    },
  };
});

const responseCount = patients.reduce((sum, patient) => sum + patient.demoPlaintextForLocalStatsOnly.responseIndicator, 0);
const severityTotal = patients.reduce((sum, patient) => sum + patient.demoPlaintextForLocalStatsOnly.adverseEventSeverity, 0);
const complianceTotal = patients.reduce((sum, patient) => sum + patient.demoPlaintextForLocalStatsOnly.compliancePercentage, 0);

const aggregate = {
  trialId: "TV-204",
  cohortSize: patients.length,
  responseRatePercentage: Math.round((responseCount / patients.length) * 100),
  averageAdverseEventSeverity: Number((severityTotal / patients.length).toFixed(2)),
  averageCompliancePercentage: Number((complianceTotal / patients.length).toFixed(2)),
  encryptedComputationReceipt: hash({ responseCount, severityTotal, complianceTotal, cohortSize: patients.length }),
  piiDisclosed: false,
};

const evidencePackage = {
  generatedAt: new Date().toISOString(),
  trialId: "TV-204",
  trialName: "Cardiovascular Dose Response Study",
  networkStatus: "local demo artifact - pending CoFHE testnet deployment",
  protocolHash: hash({ protocol: "TV-204 cardiovascular protocol v1" }),
  encryptedDatasetRoot: hash(patients.map((patient) => patient.ciphertextCommitments)),
  accessLogRoot: hash([
    "patient-consent",
    "aggregate-researcher-access",
    "sponsor-submission-generation",
    "regulator-audit-session",
  ]),
  aggregate,
  controls: {
    patientLevelValuesEncrypted: true,
    researcherOutputAggregateOnly: true,
    fdaAuditNoPii: true,
    deploymentPending: true,
  },
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(new URL("synthetic-cohort.json", OUT_DIR), JSON.stringify(patients, null, 2));
await writeFile(new URL("aggregate-stats.json", OUT_DIR), JSON.stringify(aggregate, null, 2));
await writeFile(new URL("fda-evidence-package.json", OUT_DIR), JSON.stringify(evidencePackage, null, 2));

console.log("Generated demo artifacts:");
console.log("- artifacts/demo/synthetic-cohort.json");
console.log("- artifacts/demo/aggregate-stats.json");
console.log("- artifacts/demo/fda-evidence-package.json");


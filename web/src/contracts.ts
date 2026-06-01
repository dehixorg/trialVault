export const contractConfig = {
  patientVault: {
    name: "PatientVault",
    address: import.meta.env.VITE_PATIENT_VAULT_ADDRESS || "pending deployment",
    requiredEvents: [
      "DataRegistered",
      "LicensingTermsUpdated",
      "AccessRevoked",
    ],
  },
  trialVault: {
    name: "TrialVault",
    address: import.meta.env.VITE_TRIAL_VAULT_ADDRESS || "pending deployment",
    requiredEvents: [
      "DataRegistered",
      "TrialCreated",
      "LicenseRequested",
      "LicenseGranted",
      "HospitalTrialDeployed",
      "EncryptedCohortSubmitted",
      "ResultCommitted",
      "ResultsPublished",
      "SafetyAlert",
    ],
  },
  clinicalTrialVault: {
    name: "ClinicalTrialVault",
    address: import.meta.env.VITE_CLINICAL_TRIAL_VAULT_ADDRESS || "pending deployment",
    requiredEvents: [
      "TrialCreated",
      "PatientEnrolled",
      "OutcomeRecorded",
      "AggregateComputed",
      "AccessGranted",
      "TrialLockedForSubmission",
      "RegulatoryAuditInitiated",
    ],
  },
};

export const allContracts = [
  contractConfig.patientVault,
  contractConfig.trialVault,
  contractConfig.clinicalTrialVault,
];


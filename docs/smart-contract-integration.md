# Smart Contract Integration

## Contracts Deployed By `contracts/scripts/deploy.ts`

- `PatientVault`
- `TrialVault`
- `ClinicalTrialVault`

The deploy script writes a manifest to:

```text
contracts/deployments/<network>.json
```

## Frontend Environment Variables

After deployment, copy addresses into Vercel:

```bash
VITE_PATIENT_VAULT_ADDRESS=0x...
VITE_TRIAL_VAULT_ADDRESS=0x...
VITE_CLINICAL_TRIAL_VAULT_ADDRESS=0x...
```

The frontend reads these through `web/src/contracts.ts`.

You can also generate a local frontend env file from a deployment manifest:

```bash
node scripts/sync-deployment-to-web-env.mjs baseSepolia
```

This creates `web/.env.production.local`, which is intentionally ignored by git.

## Required Event Coverage

### PatientVault

- `DataRegistered`
- `LicensingTermsUpdated`
- `AccessRevoked`

### TrialVault

- `DataRegistered`
- `TrialCreated`
- `LicenseRequested`
- `LicenseGranted`
- `HospitalTrialDeployed`
- `EncryptedCohortSubmitted`
- `ResultCommitted`
- `ResultsPublished`
- `SafetyAlert`

### ClinicalTrialVault

- `TrialCreated`
- `PatientEnrolled`
- `OutcomeRecorded`
- `AggregateComputed`
- `AccessGranted`
- `TrialLockedForSubmission`
- `RegulatoryAuditInitiated`

## Deployment Commands

Use exactly one target network:

```bash
cd contracts
npm run deploy:base-sepolia
```

or:

```bash
cd contracts
npm run deploy:arbitrum-sepolia
```

or:

```bash
cd contracts
npm run deploy:sepolia
```

## Required Secrets

Set in `contracts/.env`:

```bash
DEPLOYER_PRIVATE_KEY=...
BASE_SEPOLIA_RPC_URL=...
```

Do not commit `contracts/.env`.

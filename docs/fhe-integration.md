# FHE Integration

TrialVault uses Fhenix-style encrypted Solidity types to model confidential patient values.

## Current Contract Surface

The Solidity prototype stores:

- `euint8 encryptedDiagnosisCode`
- `euint32 encryptedAge`
- `euint32 encryptedLabValue1`
- `euint32 encryptedLabValue2`
- encrypted adverse-event severity totals

It demonstrates:

- encrypted comparison with `FHE.gte`, `FHE.lte`, and `FHE.eq`
- encrypted boolean composition with `FHE.and`
- encrypted aggregation with `FHE.add`
- conditional encrypted counting with `FHE.select`
- permissioned decryption with `Permissioned`

## Clinical Trial Roadmap

The next production contract should rename the domain objects from generic trial matching to clinical-trial records:

- `ClinicalTrial`
- `PatientRecord`
- `AccessGrant`
- `TrialStatistics`
- `FDASubmissionPackage`

The core FHE computations should cover:

- response rate
- average compliance
- adverse-event severity threshold checks
- cohort eligibility counts
- site-level encrypted rollups

## Demo Strategy

The frontend simulates encryption and computation receipts for judge-facing clarity. The Solidity contract compiles with Fhenix types and shows the actual operations that the product depends on.


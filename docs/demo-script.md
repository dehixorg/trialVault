# Demo Script

Target length: 90-120 seconds.

## 1. Patient Enrollment

Open the Patient Portal. Connect the wallet, enter baseline vitals, and click **Encrypt & Enroll**.

Narration: TrialVault encrypts sensitive patient fields before submission. In this local demo, the app shows a ciphertext commitment and the generated synthetic evidence package proves the same privacy boundary.

## 2. Research Analytics

Open Research Analytics and run FHE analytics.

Narration: Researchers compute response rate, adverse-event severity, and compliance over encrypted records. They receive aggregate statistics only.

## 3. Pharma Submission

Open Pharma Submission and generate the FDA package.

Narration: Sponsors get protocol hash, dataset commitment, access log root, computation receipt, and local evidence export. The deployment step will replace local hashes with live transaction hashes.

## 4. FDA Audit

Open FDA Audit and start an audit.

Narration: Regulators verify all commitments, audit events, and aggregate receipts. Patient names and raw vitals remain hidden.

## Closing

TrialVault makes clinical trials privacy-native from day one: encrypted state, selective disclosure, and verifiable regulated workflows.

## Local Artifacts To Mention

- `artifacts/demo/synthetic-cohort.json`
- `artifacts/demo/aggregate-stats.json`
- `artifacts/demo/fda-evidence-package.json`

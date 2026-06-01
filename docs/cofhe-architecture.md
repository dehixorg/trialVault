# CoFHE Architecture For TrialVault

TrialVault uses CoFHE for encrypted computation on clinical trial records.

## Data Flow

1. Patient encrypts baseline values in the browser.
2. Contract stores ciphertext handles and consent hashes.
3. Investigator records encrypted outcomes.
4. Contract computes aggregate response, severity, and compliance totals.
5. Researcher receives only aggregate outputs.
6. Sponsor locks the dataset for submission.
7. Regulator verifies commitments, audit events, and computation receipts.

## Encrypted Fields

- age
- systolic blood pressure
- heart rate
- dose
- response indicator
- adverse event severity
- compliance percentage

## Plain Metadata

- trial ID
- protocol hash
- consent hash
- timestamps
- actor addresses
- receipt hashes

## Production Controls

- enforce minimum cohort sizes before aggregate release
- avoid plaintext patient identifiers
- expire access grants
- expose sealed patient self-results
- include tx hashes in the submission package


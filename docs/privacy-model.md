# Privacy Model

## Actors

- **Patient:** owns trial participation records and approves disclosure.
- **Researcher:** receives aggregate statistics and computation receipts.
- **Pharma sponsor:** prepares submission packages and integrity proofs.
- **Regulator:** verifies records, audit trails, and electronic evidence.
- **Adversary:** may attempt database breach, unauthorized access, data tampering, or re-identification.

## Protected Data

TrialVault treats the following as sensitive:

- Medical history and diagnoses
- Baseline vitals
- Treatment dose
- Response indicators
- Adverse event severity
- Compliance percentage
- Consent documents
- Patient identifiers

## Design

- Patient-level medical values are represented as encrypted integer types where the FHE runtime supports computation.
- Plaintext metadata is minimized to trial IDs, timestamps, roles, hashes, and operational state.
- Aggregate outputs are released only after role checks and should include cohort-size thresholds in production to reduce re-identification risk.
- Access grants expire and are logged as on-chain evidence.

## Non-Goals In Prototype

- Certification as a HIPAA-compliant production system
- Direct FDA portal integration
- Production key management
- Formal privacy budget or differential privacy enforcement


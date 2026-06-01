# Grant Readiness

## Current Status

TrialVault is now a strong local prototype and reviewer-ready project narrative. It is not yet a complete ecosystem startup because live CoFHE deployment and live user traction are intentionally pending.

## Completed In Repo

- Clinical-trial-specific Solidity contract surface
- Local Hardhat tests for lifecycle, audit, access, and ABI readiness
- Patient, researcher, pharma, and FDA demo flows
- Synthetic 50-patient cohort generator
- FDA evidence package export
- Privacy model, threat model, compliance matrix, CoFHE architecture, demo script, deployment plan

## Remaining Before Strong Grant Submission

- Deploy `ClinicalTrialVault` to a supported CoFHE testnet
- Replace local artifact hashes with live tx hashes
- Wire real `@cofhe/sdk` browser encryption against the deployed contract
- Publish demo video
- Get external feedback from at least 3 clinical/research/compliance users

## Remaining Before Startup-Grade Pilot

- EHR/FHIR import mock
- Result-integrity Merkle proof module
- Adverse-event threshold module
- Cost and gas analysis for 50, 500, and 5,000 patients
- Patient key recovery design
- Security review
- One pilot LOI or advisor memo


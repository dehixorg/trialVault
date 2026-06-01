# Regulatory Framework

TrialVault is built as a regulatory evidence layer for clinical trials. It is not a certified compliance product yet, but it maps its architecture to controls that sponsors and research organizations already need.

## HIPAA-Oriented Controls

- Encryption of protected health information
- Role-based access grants
- Expiring access permissions
- Immutable access events
- Patient consent evidence
- Minimum necessary disclosure through aggregate analytics

## FDA 21 CFR Part 11-Oriented Controls

- Electronic record integrity through blockchain commitments
- Computer-generated audit trail for create, update, access, and submission events
- Cryptographic signatures for submissions and access approvals
- Record retention through durable hashes and event logs
- Verification package for sponsor and regulator review

## Submission Package Evidence

A regulator-facing package should include:

- trial ID and protocol hash
- patient record commitment root
- encrypted dataset hash
- aggregate statistics receipt
- access-log digest
- sponsor signature
- investigator signature
- timestamped contract events


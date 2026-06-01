# Threat Model

## Threats

- **Database breach:** attacker steals centralized patient rows.
- **Unauthorized researcher access:** researcher attempts to view individual patient data beyond approved scope.
- **Sponsor manipulation:** sponsor edits or omits unfavorable trial results before submission.
- **Audit trail tampering:** operator modifies logs after a dispute.
- **Re-identification:** aggregate results leak identity when cohort size is too small.
- **Consent abuse:** data is used after consent expires or beyond approved purpose.

## Mitigations

- Store sensitive medical values encrypted.
- Commit records and updates to immutable on-chain events.
- Use role-based and patient-granted access controls.
- Release aggregate statistics instead of individual rows for researcher workflows.
- Keep access grants timestamped and expiring.
- Require cohort-size thresholds and statistical disclosure controls before production deployment.

## Residual Risks

- FHE does not solve bad input data; clinical source verification is still required.
- On-chain metadata can leak operational patterns if not minimized.
- Production deployments need formal key management, monitoring, legal review, and independent security audit.


# TrialVault Contracts (MVP)

This folder contains the first-pass smart contract scaffold used by the TrialVault MVP.
It is intentionally minimal so the team can wire in Fhenix FHE types, CoFHE SDK flows,
NFT ownership, and tokenized royalty logic later.

## Included Contract

- `TrialVault.sol`: Patient registry, cohort requests, licensing, result commitments,
  and adverse event signaling.

## Local Setup

```bash
cd /Users/arpitchauhan/Desktop/akindo/trialVault/contracts
npm install
npm run compile
```

Create a `.env` file (see `.env.example`) before deploying to a live network.

```bash
npm run deploy:local
```

## Next Steps

- Replace `bytes32` placeholders with Fhenix encrypted types.
- Add ERC-721 patient ownership tokens and ERC-20 royalty distribution.
- Integrate signature-based consent revocation.
- Add verifiable Merkle proof validation for result integrity.
- Connect to off-chain FHE compute workers and on-chain proof verification.

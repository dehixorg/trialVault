# TrialVault MVP

This repo contains a deployable MVP front-end plus a smart contract scaffold for the
TrialVault privacy-first clinical trials platform.

## Frontend

- App: `/Users/arpitchauhan/Desktop/akindo/trialVault/web`
- Tech: Vite + React + TypeScript

Run locally:

```bash
cd /Users/arpitchauhan/Desktop/akindo/trialVault/web
npm install
npm run dev
```

Build for deployment:

```bash
npm run build
```

## Demo Mode

Add `?demo=1` to the URL or click “Enable Demo Mode” in the UI to launch the guided tour and screenshot tools.

## Backend API

- API: `/Users/arpitchauhan/Desktop/akindo/trialVault/backend`
- Purpose: log encrypted cohort requests during the MVP demo

Run locally:

```bash
cd /Users/arpitchauhan/Desktop/akindo/trialVault/backend
npm install
npm run dev
```

## Smart Contract (Scaffold)

- Contract: `/Users/arpitchauhan/Desktop/akindo/trialVault/contracts/TrialVault.sol`
- Notes: `/Users/arpitchauhan/Desktop/akindo/trialVault/contracts/README.md`

The contract is a placeholder for the FHE-native logic and will be wired into Fhenix
once the compute layer is ready.

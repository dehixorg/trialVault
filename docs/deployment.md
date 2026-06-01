# Deployment Plan

## Supported Networks

Current Fhenix CoFHE docs list these supported testnets for development:

- Ethereum Sepolia
- Arbitrum Sepolia
- Base Sepolia

Avoid relying on deprecated Helium-era assumptions.

## Environment

```bash
DEPLOYER_PRIVATE_KEY=...
FHENIX_RPC_URL=...
VITE_CLINICAL_TRIAL_VAULT_ADDRESS=...
VITE_PATIENT_VAULT_ADDRESS=...
VITE_TRIAL_VAULT_ADDRESS=...
```

## Frontend: Vercel

The root `vercel.json` is configured to build the Vite app in `web/`.

Vercel settings:

- Framework preset: Vite
- Install command: `cd web && npm ci`
- Build command: `cd web && npm run build`
- Output directory: `web/dist`

Environment variables:

```bash
VITE_API_URL=https://YOUR_RENDER_SERVICE.onrender.com
VITE_PATIENT_VAULT_ADDRESS=pending deployment
VITE_TRIAL_VAULT_ADDRESS=pending deployment
VITE_CLINICAL_TRIAL_VAULT_ADDRESS=pending deployment
```

SPA routing is handled by the rewrite in `vercel.json`.

## Backend: Render

The root `render.yaml` configures the API service.

Render settings:

- Root directory: `backend`
- Runtime: Node
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/health`

Environment variables:

```bash
NODE_VERSION=22
NODE_ENV=production
CLIENT_ORIGIN=https://YOUR_VERCEL_APP.vercel.app
MONGO_URI=mongodb+srv://...
```

Use MongoDB Atlas for `MONGO_URI`. The API starts without Mongo for health checks, but database-backed routes return `503` until Mongo is configured.

## Local Verification

```bash
cd contracts
npm run compile
npm run test
```

```bash
cd web
npx tsc --noEmit
npm run build
```

## Local Artifact Generation

```bash
node scripts/generate-demo-artifacts.mjs
```

This is not a deployment substitute. It gives reviewers a deterministic synthetic cohort and FDA evidence package before live testnet transactions are available.

## Testnet Deliverables

After deployment, update:

- contract address
- `contracts/deployments/<network>.json`
- deployment transaction
- sample patient enrollment transaction
- aggregate computation transaction
- audit initiation transaction
- explorer links

## Migration To Current CoFHE

The repo currently compiles against the installed Fhenix contract package. For final judging, migrate to the current CoFHE starter stack:

- `@cofhe/sdk`
- CoFHE Solidity contracts / `FHE.sol`
- CoFHE Hardhat plugin
- supported Sepolia testnet

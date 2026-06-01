# TrialVault API

Express API for TrialVault demo data, encrypted cohort requests, patient records, trial metadata, and licensing records.

## Local Run

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API listens on port `5175` by default.

## Endpoints

- `GET /health` — quick health check
- `GET /` — service metadata
- `POST /cohort-requests` — log encrypted cohort requests
- `GET /cohort-requests?limit=10` — read back recent requests
- `POST /api/patients`
- `GET /api/patients/:wallet`
- `POST /api/trials`
- `GET /api/trials`
- `POST /api/licenses`
- `GET /api/licenses/:wallet`

## Render Deployment

This repository includes a root `render.yaml`.

Required Render environment variables:

- `MONGO_URI` — MongoDB Atlas connection string
- `CLIENT_ORIGIN` — deployed frontend URL, for example `https://trialvault.vercel.app`

Render settings:

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/health`

If `MONGO_URI` is missing, `/health` still returns `ok`, but database-backed routes return `503` with a clear setup message.

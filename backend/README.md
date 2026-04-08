# TrialVault API (MVP)

This minimal API logs encrypted cohort requests for demo and submission purposes.

## Run

```bash
cd /Users/arpitchauhan/Desktop/akindo/trialVault/backend
npm install
npm run dev
```

The API listens on port `5175` by default.

## Endpoints

- `GET /health` — quick health check
- `POST /cohort-requests` — log encrypted cohort requests
- `GET /cohort-requests?limit=10` — read back recent requests

## Data Storage

Requests are stored as JSON lines in:
`/Users/arpitchauhan/Desktop/akindo/trialVault/backend/data/requests.jsonl`

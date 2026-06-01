# Vercel + Render Checklist

## Backend On Render

1. Create a MongoDB Atlas database.
2. Create a Render Web Service from this repository.
3. Use the root `render.yaml`, or manually set:
   - Root directory: `backend`
   - Build command: `npm ci`
   - Start command: `npm start`
   - Health check path: `/health`
4. Set environment variables:
   - `NODE_VERSION=22`
   - `NODE_ENV=production`
   - `MONGO_URI=<MongoDB Atlas URI>`
   - `CLIENT_ORIGIN=<Vercel frontend URL>`
5. Confirm:
   - `https://YOUR_RENDER_SERVICE.onrender.com/health`
   - `https://YOUR_RENDER_SERVICE.onrender.com/`

## Frontend On Vercel

1. Import this repository into Vercel.
2. Keep the project root at the repository root so `vercel.json` is used.
3. Set environment variables:
   - `VITE_API_URL=https://YOUR_RENDER_SERVICE.onrender.com`
   - `VITE_PATIENT_VAULT_ADDRESS=pending deployment`
   - `VITE_TRIAL_VAULT_ADDRESS=pending deployment`
   - `VITE_CLINICAL_TRIAL_VAULT_ADDRESS=pending deployment`
4. Deploy.
5. Confirm SPA routes load directly:
   - `/`
   - `/researcher`
   - `/pharma`
   - `/regulator`

## After Deployment

Update:

- `web/.env.example`
- `README.md`
- demo video description
- `docs/deployment.md`

with the final Render and Vercel URLs.

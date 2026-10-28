# Deployment

## Status

- **Frontend**: ✅ Live at **https://rbhambhu01.github.io/clean-and-care/**
  Deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main` that touches `frontend/`.
- **Backend**: ⬜ Not deployed yet. This is the one step I can't do for you — it requires your own account on a hosting provider, which I can't create on your behalf.

Right now the live site loads, but the pricing table, services, testimonials, and the contact/pickup forms are empty/non-functional because there's no backend for the frontend to call. The steps below connect them.

## Deploy the backend to Render (free tier)

Render was chosen because it has a genuinely free tier for small Node apps and reads deployment config straight from the repo.

1. Go to https://dashboard.render.com, sign in (or create an account) with GitHub.
2. Click **New** → **Blueprint**, and pick the `clean-and-care` repo. Render will detect `render.yaml` at the repo root and propose one service: `clean-and-care-api`.
3. Before deploying, it'll ask you to fill in two values it marked `sync: false`:
   - `ADMIN_PASSWORD` — pick a real password (not the placeholder in `.env.example`).
   - `CLIENT_ORIGIN` — set to `https://rbhambhu01.github.io` (no trailing slash, no path — just the origin).
4. Click **Apply**. Render will build and start the service. First build takes a few minutes.
5. Once live, copy the service's URL — it'll look like `https://clean-and-care-api.onrender.com`.

**Note on the free tier**: Render's free web services spin down after 15 minutes of inactivity and take ~30–60 seconds to wake back up on the next request. The first pricing/contact-form load after idle time will feel slow — that's Render waking up, not a bug. If that's not acceptable, Render's cheapest paid tier removes the sleep behavior.

**Note on the database**: this project uses a JSON file as its database (`backend/data/db.json`), which only persists on Render because `render.yaml` mounts a small persistent disk at that path. Without that disk, every redeploy would wipe submitted contact/pickup leads.

## Connect the frontend to it

1. In the GitHub repo: **Settings → Secrets and variables → Actions → Variables** tab → **New repository variable**.
2. Name: `VITE_API_URL`. Value: your Render URL + `/api`, e.g. `https://clean-and-care-api.onrender.com/api`.
3. Re-run the deploy workflow so the frontend rebuilds with that value baked in: **Actions** tab → **Deploy frontend to GitHub Pages** → **Run workflow** (or just push any small change to `frontend/`).

After that finishes, reload https://rbhambhu01.github.io/clean-and-care/ — pricing, services, testimonials, and the contact/pickup forms should all work against the live backend.

## Local development (unchanged)

Local dev still works exactly as before — see the root `README.md`. The Vite dev server proxies `/api` to `http://localhost:4000`, so none of the above affects local work.

## Custom domain (optional)

If you want this on `thecleanncare.in` (or a new domain) instead of the `github.io` subpath:
- GitHub Pages supports custom domains for free (**Settings → Pages → Custom domain**), but you'd also need to update `vite.config.js`'s `base` back to `"/"` and drop the `basename` logic in `main.jsx`, since a custom domain serves from the root, not `/clean-and-care/`.
- You'd point the domain's DNS at GitHub Pages per [GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
- Update `CLIENT_ORIGIN` on Render to the new domain once that's live.

Ask if you want me to make that switch — it's a few small config changes, not a rebuild.

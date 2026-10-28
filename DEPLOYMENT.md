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

**Note on the database — read this before you rely on the admin dashboard**: this project uses a JSON file as its database (`backend/data/db.json`). Render's **free** tier doesn't support persistent disks at all (the Blueprint fails if you try), so on the free plan the filesystem is ephemeral: every deploy runs `npm run seed` fresh and wipes anything written since. Services, pricing, and testimonials are unaffected — they come from the seed script every time anyway. But **contact form submissions and pickup requests will not reliably survive** — a customer could submit the form, and that lead could vanish on the next deploy or container restart, with no error shown to you or them.

If you expect real customers to use the contact/pickup forms, pick one before going live:
- **Accept it for now.** Fine if you're just testing or don't expect submissions yet; upgrade later.
- **Upgrade the Render service to a paid plan** (smallest paid tier) and add a disk back — then leads persist normally. Costs money but is a one-line config change back to what `render.yaml` had before.
- **Have the forms email you instead of / as well as storing locally** — e.g. wire `backend/routes/contact.js` to send via a transactional email API (Resend, SendGrid, etc.) on each submission, so you get the lead even if storage resets. I can build this if you want it — it's the more robust fix and still free.
- **Move to a real external database** (e.g. a free-tier hosted Postgres/SQLite service) instead of the local JSON file — bigger change, most "proper" long-term fix.

Tell me which you'd rather do and I'll implement it; I didn't want to just pick one for you since it trades off cost vs. effort vs. reliability.

## Connect the frontend to it

1. In the GitHub repo: **Settings → Secrets and variables → Actions → Variables** tab → **New repository variable**.
2. Name: `VITE_API_URL`. Value: your Render URL + `/api`, e.g. `https://clean-and-care-api.onrender.com/api`.
3. Re-run the deploy workflow so the frontend rebuilds with that value baked in: **Actions** tab → **Deploy frontend to GitHub Pages** → **Run workflow** (or just push any small change to `frontend/`).

After that finishes, reload https://rbhambhu01.github.io/clean-and-care/ — pricing, services, testimonials, and the contact/pickup forms should all work against the live backend.

## Offer banner image (admin upload)

The admin dashboard (`/admin`) has an "Offer Banner" section where you can upload a promotional image that appears on the homepage, right below the hero section. Uploads go to Cloudinary's free tier rather than our own server storage, specifically so the image survives Render's redeploys (unlike contact/pickup leads — see above).

**One-time setup:**

1. Create a free account at https://cloudinary.com/users/register/free (I can't do this step — it's a new third-party account). The free tier (25GB storage/bandwidth) is far more than this needs.
2. After signing up, your **Dashboard** page shows three values right at the top: **Cloud name**, **API Key**, **API Secret**. You'll need all three.
3. **On Render**: go to your `clean-and-care-api` service → **Environment** tab → add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   Render redeploys automatically when you save new env vars.
4. **On GitHub**: same place as `VITE_API_URL` earlier (**Settings → Secrets and variables → Actions → Variables**) → add a new repository variable:
   - Name: `VITE_CLOUDINARY_CLOUD_NAME`
   - Value: just the cloud name from step 2 (this one isn't secret — it's part of the public image URL, so it's safe as a plain variable, not a secret).
5. Re-run the **Deploy frontend to GitHub Pages** workflow (same as before) so the frontend picks it up.

After that, go to `/admin`, log in, and the "Offer Banner" section will let you upload/replace/remove the image — it shows up on the homepage within seconds (Cloudinary invalidates its CDN cache on each upload).

**Until you do this setup**: the admin dashboard will show "Image hosting not configured" instead of erroring, and the homepage just won't show an offer banner at all — nothing breaks, it's just inactive.

## Local development (unchanged)

Local dev still works exactly as before — see the root `README.md`. The Vite dev server proxies `/api` to `http://localhost:4000`, so none of the above affects local work.

## Custom domain (optional)

If you want this on `thecleanncare.in` (or a new domain) instead of the `github.io` subpath:
- GitHub Pages supports custom domains for free (**Settings → Pages → Custom domain**), but you'd also need to update `vite.config.js`'s `base` back to `"/"` and drop the `basename` logic in `main.jsx`, since a custom domain serves from the root, not `/clean-and-care/`.
- You'd point the domain's DNS at GitHub Pages per [GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
- Update `CLIENT_ORIGIN` on Render to the new domain once that's live.

Ask if you want me to make that switch — it's a few small config changes, not a rebuild.

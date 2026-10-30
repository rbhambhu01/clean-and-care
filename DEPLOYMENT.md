# Deployment

## Status

- **Frontend**: ✅ Live at **https://rbhambhu01.github.io/clean-and-care/**
  Deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main` that touches `frontend/`.
- **Backend**: Firebase (Firestore + Authentication), free Spark plan. ✅ Live — no separate server to deploy or keep running.
- **Offer banner image upload**: Cloudinary, free tier. ⬜ Needs one quick setup step below before it's active (everything else works without it).

The site is now fully static (GitHub Pages) + direct-from-browser calls to Firebase and Cloudinary — there's no Express/Node server in the request path for the live site anymore. The `backend/` folder and `render.yaml` are kept in the repo for reference but are no longer part of the deployed architecture; see "What changed" below if you're wondering why.

## What changed (and why)

This started as GitHub Pages (frontend) + a custom Express API on Render. That had two real problems for a small business site on a free budget:
1. Render's free tier has no persistent disk, so the database reset on every deploy — contact-form and pickup leads could silently vanish.
2. It needed a server running at all, with the usual free-tier cold-start delay.

Firebase's free tier solves both: Firestore (database) and Authentication (admin login) are called directly from the browser with no server of our own, and the data persists properly — no ephemeral filesystem involved. Cloudinary's free tier still handles the offer-banner image (same as before), just via an unsigned upload preset now instead of going through a backend to keep the API secret hidden — Firebase doesn't have Render's billing requirement for things like this, so this piece got simpler.

**Security model**: without a server, authorization lives entirely in Firestore Security Rules (`firestore.rules`) rather than in server-side code. Public content (services, pricing, testimonials, blog) is read-only to everyone; the `leads` collection (contact/pickup/cart submissions) is write-only to the public and read-only to the authenticated admin — so a visitor can submit a lead but can never read anyone else's.

## Firebase project

Project ID: `clean-and-care-laundry`. Console: https://console.firebase.google.com/project/clean-and-care-laundry/overview

Already set up and live:
- Firestore database (`nam5` region), seeded with the site's real content via `scripts/seed-firestore.mjs`.
- Firestore Security Rules (`firestore.rules`) and the composite index it needs (`firestore.indexes.json`), both deployed.
- Authentication, Email/Password provider enabled, one admin user created (`rbhambhu01@gmail.com`).

If you ever need to redeploy rules or indexes after editing them locally:
```bash
firebase deploy --only firestore:rules,firestore:indexes --project clean-and-care-laundry
```

### Re-seeding content

If you edit the pricing/services/testimonials/company data in `scripts/seed-firestore.mjs` and want to push it to Firestore again:
```bash
cd scripts
npm install   # first time only
node seed-firestore.mjs
```
Needs `scripts/.env` with the Firebase config and `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (see `scripts/.env.example`) — that file is gitignored since it holds a real password.

## Offer banner image (Cloudinary — one remaining setup step)

The admin dashboard's "Offer Banner" upload won't work until this is done; everything else on the site works without it.

1. Create a free account at https://cloudinary.com/users/register/free (I can't do this step — new third-party account).
2. In the Cloudinary console: **Settings → Upload → Upload presets → Add upload preset**.
   - Set **Signing Mode** to **Unsigned**.
   - Set **Folder** to `clean-care` (optional but tidy).
   - Save, and note the preset's name.
3. Note your **Cloud name** too — shown at the top of the Cloudinary dashboard.
4. On GitHub: **Settings → Secrets and variables → Actions → Variables**, add two repository variables:
   - `VITE_CLOUDINARY_CLOUD_NAME` — your cloud name.
   - `VITE_CLOUDINARY_UPLOAD_PRESET` — the preset name from step 2.
5. Re-run the **Deploy frontend to GitHub Pages** workflow (**Actions** tab → select it → **Run workflow**), or push any change under `frontend/`.

**Note on this approach**: since there's no backend to keep Cloudinary's API secret hidden, image upload uses an *unsigned* preset instead — gated by the preset's own restrictions (image-only, folder-scoped) rather than real server-side authorization. In practice this is fine for a single promotional banner image: the upload UI itself is behind Firebase Auth login, so a random visitor won't find the preset name easily, and worst case if someone did abuse it, it only affects that one banner image, which you can just re-upload. If you'd rather have this fully locked down, that needs a server-side signing step (e.g. a Firebase Cloud Function) — which in turn needs Firebase's paid Blaze plan, the thing we specifically avoided. Worth it only if this ever feels like a real risk for your site.

## Local development

```bash
cd frontend
cp .env.example .env.local   # fill in the same Firebase + Cloudinary values as the GitHub variables above
npm install
npm run dev
```
No backend process to start separately anymore — the dev server talks straight to Firebase/Cloudinary, same as production.

## Custom domain (optional)

If you want this on `thecleanncare.in` (or a new domain) instead of the `github.io` subpath:
- GitHub Pages supports custom domains for free (**Settings → Pages → Custom domain**), but you'd also need to update `vite.config.js`'s `base` back to `"/"` and drop the `basename` logic in `main.jsx`, since a custom domain serves from the root, not `/clean-and-care/`.
- You'd point the domain's DNS at GitHub Pages per [GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

Ask if you want me to make that switch — it's a few small config changes, not a rebuild.

## The old backend/Render setup (deprecated)

`backend/` and `render.yaml` still exist in the repo but are no longer deployed or required. If you want them fully removed rather than just unused, say so and I'll clean them up — I left them in place for now rather than deleting working code you might still want as reference.

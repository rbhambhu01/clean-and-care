# Clean & Care — Website

A full-stack recreation of the Clean & Care laundry/dry-cleaning marketing
site: same navigation, sections, service list, full pricing table,
testimonials, contact/pickup forms, a shopping cart with WhatsApp checkout,
and an admin dashboard. Visual design (lime-green `#B0CB1F` accent, black
header/footer, cream section backgrounds, serif headings over sans body text,
pill buttons, circular icon badges) matches the original; photography was
**not** copied — an original hand-drawn SVG illustration and real brand
assets (logo, icons) stand in for the original's proprietary stock photos.

## Stack

Fully static — hosted on **GitHub Pages**, no server of our own:

- **frontend/** — React 18, Vite, Tailwind CSS, React Router, lucide-react icons.
- **Firebase** (free Spark plan) — Firestore (database: company info, services,
  pricing, testimonials, blog, leads) and Authentication (admin login), both
  called directly from the browser.
- **Cloudinary** (free tier) — offer-banner image upload, via an unsigned
  upload preset (no backend needed to keep a secret hidden).

See `DEPLOYMENT.md` for the full story on why it's built this way and the
one-time Firebase/Cloudinary setup. A `backend/` Express project and
`render.yaml` also exist in the repo as the previous architecture's
leftovers — no longer deployed, kept for reference only.

## Project layout

```
frontend/
  src/
    pages/              # Home, About, Services, Pricing, Cart, Contact, Admin
    components/          # Navbar, Footer, ServiceCard, OfferBanner, etc.
    context/               # CompanyContext, CartContext (localStorage-backed)
    lib/
      firebase.js            # Firebase app/auth/db init
      cloudinary.js            # unsigned offer-image upload
      whatsapp.js                # wa.me click-to-chat message builders
    api.js                        # Firestore reads/writes (replaces a REST API)

firestore.rules             # security model — public read on catalog data,
                              # write-only-by-public on leads, admin-only writes
firestore.indexes.json       # composite index the admin dashboard's queries need
scripts/
  seed-firestore.mjs          # one-time/re-runnable content seed script
```

## Local development

```bash
cd frontend
cp .env.example .env.local   # fill in Firebase + Cloudinary config (see DEPLOYMENT.md)
npm install
npm run dev                  # http://localhost:5173
```

No backend process to start — the dev server talks straight to Firebase and
Cloudinary, same as production.

## What's included

- **Public pages**: Home, About Us, Services, Pricing (full item-level price
  table: Men's/Women's/Kids/Home DC & Steam Iron pricing, by-weight laundry,
  shoe spa, add-ons — each with an "Add to Cart" button), Contact Us.
- **Cart**: client-side cart (persisted to `localStorage`), checkout collects
  name/phone/address, then opens a pre-filled WhatsApp chat with the itemized
  order and also saves it to Firestore for the admin dashboard.
- **Contact & pickup forms**: same WhatsApp-first pattern — opens a pre-filled
  chat to the business number, and quietly saves to Firestore too.
- **Admin dashboard** (`/admin`): Firebase Auth login (email/password), view
  cart orders / pickup requests / contact messages, and upload/remove the
  homepage offer-banner image.

## Firestore data model

| Collection          | Shape                                              | Read       | Write        |
|----------------------|-----------------------------------------------------|------------|--------------|
| `company/main`        | single doc — name, about, address, phones, etc.       | public     | admin only   |
| `services/{slug}`      | one doc per service                                     | public     | admin only   |
| `pricingCategories/{i}` | one doc per pricing table (category + items array)        | public     | admin only   |
| `pricingExtras/main`     | add-ons / by-weight / shoes-spa tables                       | public     | admin only   |
| `testimonials/{id}`       | one doc per testimonial                                        | public     | admin only   |
| `blog/{id}`                 | one doc per post                                                  | public     | admin only   |
| `settings/offerBanner`        | `{ visible: boolean }` — gates the homepage offer banner             | public     | admin only   |
| `leads/{id}`                     | contact / pickup / cart submissions, `type` field distinguishes them   | admin only | public create only |

## Notes for going live

- Swap the original SVG hero illustration (`frontend/src/components/HeroIllustration.jsx`)
  for real product photography once you have your own.
- Update `scripts/seed-firestore.mjs` if company/pricing/services content
  changes, then re-run it (see `DEPLOYMENT.md`) to push the update to Firestore.
- Finish the Cloudinary unsigned-preset setup (`DEPLOYMENT.md`) to activate
  the offer-banner upload feature — everything else works without it.

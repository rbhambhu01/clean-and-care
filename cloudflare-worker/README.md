# WhatsApp Inbox — Webhook Receiver

Receives incoming WhatsApp messages sent to **8160677875** (via Meta's
WhatsApp Business Cloud API) and writes them into Firestore, where they
show up in the admin dashboard's "WhatsApp Inbox" section.

This piece exists because GitHub Pages (where the main site lives) can't
receive webhooks — it only serves static files. This Worker is the one
small server in an otherwise backend-free project, and it does nothing
except relay WhatsApp messages into Firestore.

Everything below this line needs to be done once, by whoever owns the
business's Meta and Google accounts — none of it can be done on your
behalf, since it involves your phone number, business identity, and
account logins.

## 1. Meta: create the WhatsApp Business app

1. Go to [developers.facebook.com](https://developers.facebook.com) and log
   in with a Facebook account (create one for the business if you don't
   want to use a personal one).
2. **My Apps → Create App → "Other" → "Business"**. Name it something like
   "Clean & Care WhatsApp".
3. In the app dashboard, find **WhatsApp** in the product list and click
   **Set up**.
4. Under **WhatsApp → API Setup**, you'll see a test number by default.
   Click **Add phone number** and add `8160677875`. Meta sends an OTP to
   that phone to verify it — you'll need the phone in hand.
5. Under **App Settings → Basic**, copy the **App Secret** (click "Show").
   Save it somewhere safe — this is `META_APP_SECRET` below.
6. Under **WhatsApp → API Setup**, note the **Phone number ID** (not the
   phone number itself — a separate numeric ID Meta assigns).
7. Generate a permanent access token: **Business Settings → Users → System
   Users → Add** → create a system user → assign it to the app with
   `whatsapp_business_messaging` permission → **Generate token** (choose
   "Never expire" if offered). Save this token — you won't be able to see
   it again. (You don't need to give it to me or put it in this Worker;
   it's only needed if you later want the dashboard to *send* replies, not
   just read incoming messages.)
8. Submit for **Business Verification** under Meta Business Settings if
   prompted — required to move off the 24-hour test-token restriction.
   This is free but Meta's review can take a few days.

## 2. Google Cloud: create a service account

This gives the Worker permission to write to Firestore.

1. Go to the [Google Cloud Console](https://console.cloud.google.com),
   select the `clean-and-care-laundry` project (same one Firebase uses).
2. **IAM & Admin → Service Accounts → Create Service Account**. Name it
   e.g. `whatsapp-webhook-writer`.
3. Grant it the role **Cloud Datastore User** (this covers Firestore).
4. Open the new service account → **Keys** tab → **Add Key → Create new
   key → JSON**. This downloads a `.json` file — keep it private, never
   commit it to git.
5. Open that JSON file. You need two fields from it:
   - `client_email` → this is `GCP_CLIENT_EMAIL`
   - `private_key` → this is `GCP_PRIVATE_KEY` (the whole string,
     including `-----BEGIN PRIVATE KEY-----` and the `\n` sequences)

## 3. Cloudflare: deploy the Worker

1. Create a free account at [cloudflare.com](https://cloudflare.com) if you
   don't have one — no credit card required for the free tier.
2. From this `cloudflare-worker/` directory:
   ```bash
   npm install
   npx wrangler login
   ```
   This opens a browser to authorize Wrangler (Cloudflare's CLI) against
   your account.
3. Set the secrets (you'll be prompted to paste each value):
   ```bash
   npx wrangler secret put WHATSAPP_VERIFY_TOKEN
   npx wrangler secret put META_APP_SECRET
   npx wrangler secret put GCP_CLIENT_EMAIL
   npx wrangler secret put GCP_PRIVATE_KEY
   npx wrangler secret put FIREBASE_PROJECT_ID
   ```
   - `WHATSAPP_VERIFY_TOKEN` — make up any random string yourself (e.g. a
     long password); you'll enter the same string in Meta's webhook setup
     in step 4.
   - `FIREBASE_PROJECT_ID` — `clean-and-care-laundry`
   - The rest come from steps 1 and 2 above.
4. Deploy:
   ```bash
   npm run deploy
   ```
   Wrangler prints a URL like
   `https://clean-care-whatsapp-webhook.<your-subdomain>.workers.dev` —
   that's your webhook URL, save it for the next step.

## 4. Meta: register the webhook

1. Back in the Meta App Dashboard: **WhatsApp → Configuration**.
2. **Callback URL**: `https://clean-care-whatsapp-webhook.<your-subdomain>.workers.dev/webhook`
3. **Verify token**: the exact same string you set as `WHATSAPP_VERIFY_TOKEN`
   in step 3.
4. Click **Verify and save** — Meta calls your Worker's GET endpoint to
   confirm it's live; if this fails, double check the verify token matches
   exactly and the Worker deployed successfully.
5. Under **Webhook fields**, subscribe to **messages**.

## 5. Test it

Send a WhatsApp message from your own phone to `+91 81606 77875`. It
should appear in the site's `/admin` dashboard under "WhatsApp Inbox"
within a few seconds. If it doesn't show up:
- Check the Worker's logs: `npx wrangler tail` while you send a test
  message, to see any errors live.
- Double-check all five secrets are set correctly (`npx wrangler secret list`
  shows names but not values — if one's wrong, just `put` it again).

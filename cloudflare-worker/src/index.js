// Receives WhatsApp Cloud API webhook events (number 8160677875) and writes
// incoming messages into the Clean & Care Firestore database, so they show
// up in the admin dashboard's WhatsApp Inbox.
//
// Two things happen here, matching what Meta's webhook contract requires:
//   - GET  /webhook  — the one-time verification handshake Meta performs
//                       when you register the webhook URL.
//   - POST /webhook  — the actual event delivery, sent every time a
//                       customer messages the business number.
//
// Firestore access: this Worker is a server, not the website's browser
// client, so it doesn't go through Firestore's client SDK or get subject to
// firestore.rules in the normal sense — those rules only police the client
// SDK. Instead it authenticates as a Google Cloud service account (a
// project-level identity with its own IAM permissions) and talks to
// Firestore's REST API directly. That's the standard, supported way for a
// backend to write to Firestore; it is not a rules bypass or a bug.

const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/webhook") {
      return new Response("Not found", { status: 404 });
    }

    if (request.method === "GET") {
      return handleVerification(url, env);
    }

    if (request.method === "POST") {
      return handleIncoming(request, env);
    }

    return new Response("Method not allowed", { status: 405 });
  },
};

function handleVerification(url, env) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Verification failed", { status: 403 });
}

async function handleIncoming(request, env) {
  const rawBody = await request.text();

  // Meta signs every POST with the app secret; reject anything that isn't
  // genuinely from Meta before doing any work with it.
  const signature = request.headers.get("X-Hub-Signature-256") || "";
  const valid = await verifySignature(rawBody, signature, env.META_APP_SECRET);
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const messages = extractMessages(payload);
  if (messages.length > 0) {
    const token = await getAccessToken(env);
    await Promise.all(messages.map((m) => writeMessage(m, env, token)));
  }

  // Meta just needs a fast 200 — it retries on anything else.
  return new Response("OK", { status: 200 });
}

function extractMessages(payload) {
  const out = [];
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contacts = value.contacts || [];
      for (const msg of value.messages || []) {
        const contact = contacts.find((c) => c.wa_id === msg.from);
        out.push({
          id: msg.id,
          from: msg.from,
          name: contact?.profile?.name || "",
          text: extractText(msg),
          timestamp: Number(msg.timestamp) * 1000,
        });
      }
    }
  }
  return out;
}

function extractText(msg) {
  if (msg.type === "text") return msg.text?.body || "";
  if (msg.type === "button") return msg.button?.text || "";
  if (msg.type === "interactive") {
    return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || "";
  }
  return `[${msg.type} message]`;
}

async function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader.startsWith("sha256=")) return false;
  const expectedHex = signatureHeader.slice("sha256=".length);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const actualHex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (actualHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actualHex.length; i++) diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}

// --- Firestore access, authenticated as a Google service account ---

function base64url(bytes) {
  let str = typeof bytes === "string" ? btoa(bytes) : btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(env) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: env.GCP_CLIENT_EMAIL,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const key = await importPrivateKey(env.GCP_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function importPrivateKey(pem) {
  const pemBody = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(pemBody);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function writeMessage(message, env, accessToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/whatsappMessages`;

  const body = {
    fields: {
      from: { stringValue: message.from },
      name: { stringValue: message.name },
      text: { stringValue: message.text },
      messageId: { stringValue: message.id },
      read: { booleanValue: false },
      createdAt: { timestampValue: new Date(message.timestamp).toISOString() },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Firestore write failed: ${res.status} ${detail}`);
  }
}

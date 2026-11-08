// Quick local sanity check for the crypto logic in index.js — not a real
// test suite, just a way to catch obvious bugs before deploying to
// Cloudflare where iteration is slower. Run with: node src/test-local.mjs
import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./index.js", import.meta.url), "utf8");
// Pull out the functions we want to test without needing the Workers runtime
// (strip the `export default {...}` block — new Function() can't parse ESM).
const withoutExport = src.replace(/^export default \{[\s\S]*?\n\};\n/m, "");
const fn = new Function(`${withoutExport}\nreturn { verifySignature, base64url };`);
const { verifySignature, base64url } = fn();

const body = JSON.stringify({ hello: "world" });
const secret = "test-secret";
const expectedSig = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

const okResult = await verifySignature(body, expectedSig, secret);
const badResult = await verifySignature(body, "sha256=deadbeef", secret);
const tamperedBody = await verifySignature(body + "x", expectedSig, secret);

console.log("valid signature accepted:", okResult === true ? "PASS" : "FAIL");
console.log("invalid signature rejected:", badResult === false ? "PASS" : "FAIL");
console.log("tampered body rejected:", tamperedBody === false ? "PASS" : "FAIL");

// base64url round-trip sanity (no padding, URL-safe chars)
const encoded = base64url(JSON.stringify({ a: 1 }));
console.log("base64url has no padding:", !encoded.includes("=") ? "PASS" : "FAIL");
console.log("base64url has no +/ chars:", !/[+/]/.test(encoded) ? "PASS" : "FAIL");

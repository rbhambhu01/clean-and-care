import { mkdirSync } from "fs";
import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "db.json");

// git doesn't track empty directories, so on a fresh clone (e.g. Render's
// build) "data/" may not exist yet — lowdb errors (ENOENT) trying to write
// into a missing directory, so ensure it's there first.
mkdirSync(dataDir, { recursive: true });

const defaultData = {
  company: {},
  services: [],
  pricing: [],
  testimonials: [],
  blog: [],
  contactMessages: [],
  pickupRequests: [],
  admin: [],
};

export const db = await JSONFilePreset(dbFile, defaultData);

export async function nextId(collectionName) {
  const items = db.data[collectionName];
  const max = items.reduce((m, it) => (it.id > m ? it.id : m), 0);
  return max + 1;
}

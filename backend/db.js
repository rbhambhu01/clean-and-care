import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, "data", "db.json");

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

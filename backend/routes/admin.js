import { Router } from "express";
import { db, nextId } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// ---- Leads (contact messages & pickup requests) ----
router.get("/leads/contact", (req, res) => {
  res.json([...db.data.contactMessages].reverse());
});

router.get("/leads/pickup", (req, res) => {
  res.json([...db.data.pickupRequests].reverse());
});

router.patch("/leads/pickup/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = db.data.pickupRequests.find((p) => p.id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  const { status } = req.body || {};
  if (status) item.status = status;
  await db.write();
  res.json(item);
});

// ---- Services CRUD ----
router.post("/services", async (req, res) => {
  const { slug, title, icon, category, description } = req.body || {};
  if (!slug || !title) return res.status(400).json({ error: "slug and title are required" });
  const entry = { id: await nextId("services"), slug, title, icon: icon || "sparkles", category: category || "fabric", description: description || "" };
  db.data.services.push(entry);
  await db.write();
  res.status(201).json(entry);
});

router.put("/services/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = db.data.services.find((s) => s.id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  Object.assign(item, req.body || {}, { id });
  await db.write();
  res.json(item);
});

router.delete("/services/:id", async (req, res) => {
  const id = Number(req.params.id);
  const before = db.data.services.length;
  db.data.services = db.data.services.filter((s) => s.id !== id);
  if (db.data.services.length === before) return res.status(404).json({ error: "Not found" });
  await db.write();
  res.status(204).end();
});

// ---- Testimonials CRUD ----
router.post("/testimonials", async (req, res) => {
  const { name, rating, text } = req.body || {};
  if (!name || !text) return res.status(400).json({ error: "name and text are required" });
  const entry = { id: await nextId("testimonials"), name, rating: rating || 5, text };
  db.data.testimonials.push(entry);
  await db.write();
  res.status(201).json(entry);
});

router.put("/testimonials/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = db.data.testimonials.find((t) => t.id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  Object.assign(item, req.body || {}, { id });
  await db.write();
  res.json(item);
});

router.delete("/testimonials/:id", async (req, res) => {
  const id = Number(req.params.id);
  const before = db.data.testimonials.length;
  db.data.testimonials = db.data.testimonials.filter((t) => t.id !== id);
  if (db.data.testimonials.length === before) return res.status(404).json({ error: "Not found" });
  await db.write();
  res.status(204).end();
});

// ---- Blog CRUD ----
router.post("/blog", async (req, res) => {
  const { title, author, date, excerpt } = req.body || {};
  if (!title) return res.status(400).json({ error: "title is required" });
  const entry = { id: await nextId("blog"), title, author: author || "CleanAndCare", date: date || new Date().toISOString().slice(0, 10), excerpt: excerpt || "" };
  db.data.blog.push(entry);
  await db.write();
  res.status(201).json(entry);
});

router.put("/blog/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = db.data.blog.find((b) => b.id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  Object.assign(item, req.body || {}, { id });
  await db.write();
  res.json(item);
});

router.delete("/blog/:id", async (req, res) => {
  const id = Number(req.params.id);
  const before = db.data.blog.length;
  db.data.blog = db.data.blog.filter((b) => b.id !== id);
  if (db.data.blog.length === before) return res.status(404).json({ error: "Not found" });
  await db.write();
  res.status(204).end();
});

export default router;

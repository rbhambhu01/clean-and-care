import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/company", (req, res) => {
  res.json(db.data.company);
});

router.get("/services", (req, res) => {
  const { category } = req.query;
  let items = db.data.services;
  if (category) items = items.filter((s) => s.category === category);
  res.json(items);
});

router.get("/services/:slug", (req, res) => {
  const item = db.data.services.find((s) => s.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: "Service not found" });
  res.json(item);
});

router.get("/pricing", (req, res) => {
  res.json({
    categories: db.data.pricing,
    extras: db.data.pricingExtras || {},
  });
});

router.get("/testimonials", (req, res) => {
  res.json(db.data.testimonials);
});

router.get("/blog", (req, res) => {
  res.json(db.data.blog);
});

router.get("/blog/:id", (req, res) => {
  const post = db.data.blog.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

export default router;

import { Router } from "express";
import { db, nextId } from "../db.js";

const router = Router();

function isValidPhone(phone) {
  return typeof phone === "string" && /^[0-9+\-\s()]{7,15}$/.test(phone.trim());
}

router.post("/contact", async (req, res) => {
  const { name, phone, email, message } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: "A valid phone number is required" });
  }

  const entry = {
    id: await nextId("contactMessages"),
    name: name.trim(),
    phone: phone.trim(),
    email: (email || "").trim(),
    message: (message || "").trim(),
    createdAt: new Date().toISOString(),
  };

  db.data.contactMessages.push(entry);
  await db.write();

  res.status(201).json({ message: "Thanks! We'll get back to you shortly.", entry });
});

router.post("/schedule-pickup", async (req, res) => {
  const { name, phone, address, service, preferredDate } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: "A valid phone number is required" });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: "Pickup address is required" });
  }

  const entry = {
    id: await nextId("pickupRequests"),
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    service: (service || "General Laundry").trim(),
    preferredDate: preferredDate || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.data.pickupRequests.push(entry);
  await db.write();

  res.status(201).json({ message: "Pickup scheduled! Our team will confirm shortly.", entry });
});

export default router;

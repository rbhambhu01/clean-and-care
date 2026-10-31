import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./lib/firebase.js";

const DEFAULT_DISCOUNT = { active: false, percent: 0, label: "" };

async function getOrdered(collectionName) {
  const q = query(collection(db, collectionName), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const api = {
  async getCompany() {
    const snap = await getDoc(doc(db, "company", "main"));
    return snap.exists() ? snap.data() : null;
  },

  getServices: () => getOrdered("services"),

  async getPricing() {
    const [categories, extrasSnap] = await Promise.all([
      getOrdered("pricingCategories"),
      getDoc(doc(db, "pricingExtras", "main")),
    ]);
    return {
      categories,
      extras: extrasSnap.exists() ? extrasSnap.data() : {},
    };
  },

  getTestimonials: () => getOrdered("testimonials"),
  getBlog: () => getOrdered("blog"),

  async getDiscount() {
    const snap = await getDoc(doc(db, "settings", "discount"));
    return snap.exists() ? { ...DEFAULT_DISCOUNT, ...snap.data() } : DEFAULT_DISCOUNT;
  },

  // Admin-only (Firestore rules require an authenticated user for these).
  async updateDiscount(payload) {
    await setDoc(doc(db, "settings", "discount"), payload);
  },

  async updatePricingCategoryItems(id, items) {
    await updateDoc(doc(db, "pricingCategories", id), { items });
  },

  async updatePricingExtrasGroup(key, rows) {
    await updateDoc(doc(db, "pricingExtras", "main"), { [key]: rows });
  },

  async sendContact(payload) {
    await addDoc(collection(db, "leads"), {
      type: "contact",
      ...payload,
      status: "new",
      createdAt: serverTimestamp(),
    });
    return { message: "Thanks! We'll get back to you shortly." };
  },

  async schedulePickup(payload) {
    await addDoc(collection(db, "leads"), {
      type: "pickup",
      ...payload,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { message: "Pickup scheduled! Our team will confirm shortly." };
  },

  async submitCartOrder(payload) {
    await addDoc(collection(db, "leads"), {
      type: "cart",
      ...payload,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { message: "Order received! Confirm it on WhatsApp to finish." };
  },

  async submitServiceBooking(payload) {
    await addDoc(collection(db, "leads"), {
      type: "service",
      ...payload,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return { message: "Booking request sent! Confirm it on WhatsApp to finish." };
  },

  // Admin-only (Firestore rules require an authenticated user for these).
  async getLeadsByType(type) {
    const q = query(collection(db, "leads"), where("type", "==", type), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async updateLeadStatus(id, status) {
    await updateDoc(doc(db, "leads", id), { status });
  },

  async submitFeedback(payload) {
    await addDoc(collection(db, "feedback"), { ...payload, createdAt: serverTimestamp() });
  },

  // Admin-only (Firestore rules require an authenticated user for this).
  async getFeedback() {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};

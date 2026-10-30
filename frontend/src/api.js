import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./lib/firebase.js";

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
};

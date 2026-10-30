import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { sendCartOrderViaWhatsApp } from "../lib/whatsapp.js";

const inputClass =
  "w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-lime-dark focus:ring-2 focus:ring-lime/30";

export default function Cart() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [status, setStatus] = useState(null);

  function checkout(e) {
    e.preventDefault();
    const payload = { ...form, items, total };
    sendCartOrderViaWhatsApp(payload);
    api.submitCartOrder(payload).catch(() => {});
    setStatus({ success: "Opening WhatsApp — confirm your order there to finish." });
    clearCart();
    setForm({ name: "", phone: "", address: "" });
  }

  if (items.length === 0 && !status) {
    return (
      <div className="container-x py-20 text-center">
        <p className="eyebrow">Your Cart</p>
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Your cart is empty</h1>
        <p className="mt-4 text-ink/60">Browse our pricing and add items to get started.</p>
        <Link to="/pricing" className="btn-pill-lime mt-8 inline-flex">
          View Pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-16">
      <p className="eyebrow">Your Cart</p>
      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Review &amp; Checkout</h1>

      {status?.success ? (
        <div className="mt-10 rounded-2xl border border-ink/10 p-8 text-center">
          <p className="text-lime-dark">{status.success}</p>
          <Link to="/pricing" className="btn-pill-outline mt-6 inline-flex">
            Continue Browsing
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((l) => (
              <div
                key={l.key}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{l.item}</p>
                  <p className="text-xs uppercase tracking-wide text-ink/50">
                    {l.service === "dc" ? "Dry Clean" : "Steam Iron"} &middot; ₹{l.price} each
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <button
                    onClick={() => updateQty(l.key, l.qty - 1)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-ink/15 hover:bg-cream"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 flex-shrink-0 text-center text-sm">{l.qty}</span>
                  <button
                    onClick={() => updateQty(l.key, l.qty + 1)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-ink/15 hover:bg-cream"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <p className="w-16 flex-shrink-0 text-right text-sm font-medium">₹{l.price * l.qty}</p>
                  <button
                    onClick={() => removeItem(l.key)}
                    className="flex-shrink-0 text-ink/40 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-2xl bg-cream p-4">
              <p className="font-semibold text-ink">Total</p>
              <p className="font-serif text-xl font-semibold text-ink">₹{total}</p>
            </div>
          </div>

          <form onSubmit={checkout} className="space-y-4 rounded-2xl border border-ink/10 p-6">
            <h3 className="font-serif text-xl font-semibold text-ink">Your Details</h3>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/80">Name</span>
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/80">Phone</span>
              <input
                required
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/80">Pickup Address</span>
              <input
                required
                className={inputClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>
            <button type="submit" className="btn-pill-lime w-full justify-center">
              Checkout via WhatsApp
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { cloudinaryConfigured, offerImageSrcUrl, uploadOfferImage } from "../lib/cloudinary.js";
import { auth, db } from "../lib/firebase.js";

const STATUS_OPTIONS = ["new", "pending", "in-progress", "completed", "cancelled"];

const STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  "in-progress": "bg-purple-100 text-purple-800",
  completed: "bg-lime/30 text-ink",
  cancelled: "bg-red-100 text-red-800",
};

function StatusSelect({ status, onChange }) {
  return (
    <select
      value={status || "pending"}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-pill border-0 px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_COLORS[status] || "bg-cream text-ink"
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export default function Admin() {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [cartOrders, setCartOrders] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [offerFile, setOfferFile] = useState(null);
  const [offerStatus, setOfferStatus] = useState(null);
  const [offerVisible, setOfferVisible] = useState(false);
  const [offerImageFailed, setOfferImageFailed] = useState(false);
  const [offerVersion, setOfferVersion] = useState(0);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  async function login(e) {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
    } catch (err) {
      setError(err.message.replace(/^Firebase:\s*/, ""));
    }
  }

  function logout() {
    signOut(auth);
  }

  async function uploadOffer(e) {
    e.preventDefault();
    if (!offerFile) return;
    setOfferStatus({ loading: true });
    try {
      await uploadOfferImage(offerFile);
      await setDoc(doc(db, "settings", "offerBanner"), { visible: true });
      setOfferStatus({ success: "Offer image updated — it's now live on the homepage." });
      setOfferFile(null);
      setOfferImageFailed(false);
      setOfferVisible(true);
      setOfferVersion((v) => v + 1);
    } catch (err) {
      setOfferStatus({ error: err.message });
    }
  }

  async function removeOffer() {
    setOfferStatus({ loading: true });
    try {
      await setDoc(doc(db, "settings", "offerBanner"), { visible: false });
      setOfferStatus({ success: "Offer image removed from the homepage." });
      setOfferVisible(false);
    } catch (err) {
      setOfferStatus({ error: err.message });
    }
  }

  // Optimistically update local state, then persist — keeps the dropdown snappy.
  function makeStatusHandler(setList) {
    return async (id, status) => {
      setList((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      try {
        await api.updateLeadStatus(id, status);
      } catch {
        // Revert on failure by refetching isn't critical here — rare, and
        // the admin can just retry the dropdown if it doesn't stick.
      }
    };
  }
  const updateContactStatus = makeStatusHandler(setContacts);
  const updatePickupStatus = makeStatusHandler(setPickups);
  const updateCartStatus = makeStatusHandler(setCartOrders);
  const updateBookingStatus = makeStatusHandler(setBookings);

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, "settings", "offerBanner")).then((snap) => {
      setOfferVisible(snap.exists() && snap.data().visible === true);
    });

    api.getLeadsByType("contact").then(setContacts);
    api.getLeadsByType("pickup").then(setPickups);
    api.getLeadsByType("cart").then(setCartOrders);
    api.getLeadsByType("service").then(setBookings);
  }, [user]);

  if (user === undefined) {
    return <div className="container-x py-16 text-center text-ink/50">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl border border-ink/10 p-8">
          <h1 className="font-serif text-2xl font-semibold text-ink">Admin Login</h1>
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" className="btn-pill-lime w-full justify-center">Log In</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    );
  }

  const offerUrl = offerImageSrcUrl();

  return (
    <div className="container-x py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">Admin Dashboard</h1>
        <button onClick={logout} className="btn-pill-outline !py-2 !text-xs">Log Out</button>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Offer Banner</h2>
        <p className="mb-4 text-sm text-ink/60">
          Upload an image to show as a promotional banner on the homepage, right below the hero section.
        </p>
        <div className="flex flex-col gap-6 rounded-2xl border border-ink/10 p-6 sm:flex-row sm:items-start">
          <div className="flex h-40 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream sm:w-64">
            {offerUrl && offerVisible && !offerImageFailed ? (
              <img
                key={offerVersion}
                src={`${offerUrl}?v=${offerVersion}`}
                alt="Current offer"
                className="h-full w-full object-cover"
                onError={() => setOfferImageFailed(true)}
                onLoad={() => setOfferImageFailed(false)}
              />
            ) : (
              <p className="px-4 text-center text-xs text-ink/40">
                {!cloudinaryConfigured()
                  ? "Image hosting not configured (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET missing)"
                  : "No offer image set"}
              </p>
            )}
          </div>

          <form onSubmit={uploadOffer} className="flex-1 space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-pill file:border-0 file:bg-cream file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-lime/30"
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-pill-lime !py-2 !text-xs" disabled={!offerFile}>
                Upload
              </button>
              <button
                type="button"
                onClick={removeOffer}
                className="btn-pill-outline !py-2 !text-xs"
                disabled={!offerVisible}
              >
                Remove Current Offer
              </button>
            </div>
            {offerStatus?.success && <p className="text-sm text-lime-dark">{offerStatus.success}</p>}
            {offerStatus?.error && <p className="text-sm text-red-600">{offerStatus.error}</p>}
          </form>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Service Bookings</h2>
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-ink/5">
                  <td className="px-4 py-2.5 font-medium">{b.serviceName}</td>
                  <td className="px-4 py-2.5">{b.name}</td>
                  <td className="px-4 py-2.5">{b.phone}</td>
                  <td className="px-4 py-2.5">{b.address}</td>
                  <td className="px-4 py-2.5">{b.message}</td>
                  <td className="px-4 py-2.5">
                    <StatusSelect status={b.status} onChange={(s) => updateBookingStatus(b.id, s)} />
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td className="px-4 py-4 text-ink/50" colSpan={6}>No service bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Cart Orders</h2>
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {cartOrders.map((o) => (
                <tr key={o.id} className="border-t border-ink/5">
                  <td className="px-4 py-2.5">{o.name}</td>
                  <td className="px-4 py-2.5">{o.phone}</td>
                  <td className="px-4 py-2.5">
                    {(o.items || []).map((it) => `${it.item} x${it.qty}`).join(", ")}
                  </td>
                  <td className="px-4 py-2.5">₹{o.total}</td>
                  <td className="px-4 py-2.5">
                    <StatusSelect status={o.status} onChange={(s) => updateCartStatus(o.id, s)} />
                  </td>
                </tr>
              ))}
              {cartOrders.length === 0 && (
                <tr><td className="px-4 py-4 text-ink/50" colSpan={5}>No cart orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Pickup Requests</h2>
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((p) => (
                <tr key={p.id} className="border-t border-ink/5">
                  <td className="px-4 py-2.5">{p.name}</td>
                  <td className="px-4 py-2.5">{p.phone}</td>
                  <td className="px-4 py-2.5">{p.address}</td>
                  <td className="px-4 py-2.5">{p.service}</td>
                  <td className="px-4 py-2.5">
                    <StatusSelect status={p.status} onChange={(s) => updatePickupStatus(p.id, s)} />
                  </td>
                </tr>
              ))}
              {pickups.length === 0 && (
                <tr><td className="px-4 py-4 text-ink/50" colSpan={5}>No pickup requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Contact Messages</h2>
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="px-4 py-2.5">{c.name}</td>
                  <td className="px-4 py-2.5">{c.phone}</td>
                  <td className="px-4 py-2.5">{c.email}</td>
                  <td className="px-4 py-2.5">{c.message}</td>
                  <td className="px-4 py-2.5">
                    <StatusSelect status={c.status} onChange={(s) => updateContactStatus(c.id, s)} />
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td className="px-4 py-4 text-ink/50" colSpan={5}>No messages yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

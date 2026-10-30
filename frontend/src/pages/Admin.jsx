import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { MessageCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { cloudinaryConfigured, offerImageSrcUrl, uploadOfferImage } from "../lib/cloudinary.js";
import { auth, db } from "../lib/firebase.js";
import { leadServiceLabel, sendLeadUpdateViaWhatsApp } from "../lib/whatsapp.js";

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

function NotifyButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Notify customer via WhatsApp"
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366]/25"
    >
      <MessageCircle className="h-4 w-4" />
    </button>
  );
}

function FeedbackStars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-ink/20"}`} />
      ))}
    </div>
  );
}

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Admin() {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [cartOrders, setCartOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [offerFile, setOfferFile] = useState(null);
  const [offerStatus, setOfferStatus] = useState(null);
  const [offerVisible, setOfferVisible] = useState(false);
  const [offerImageFailed, setOfferImageFailed] = useState(false);
  const [offerVersion, setOfferVersion] = useState(0);
  const [offerProgress, setOfferProgress] = useState(0);

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
    setOfferProgress(0);
    try {
      await uploadOfferImage(offerFile, setOfferProgress);
      await setDoc(doc(db, "settings", "offerBanner"), { visible: true });
      setOfferStatus({ success: "Offer image updated — it's now live on the homepage." });
      setOfferFile(null);
      setOfferImageFailed(false);
      setOfferVisible(true);
      setOfferVersion((v) => v + 1);
    } catch (err) {
      setOfferStatus({ error: err.message });
    } finally {
      setOfferProgress(0);
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

  function notifyCustomer(type, lead) {
    const label = leadServiceLabel(type, lead);
    const feedbackUrl = `${window.location.origin}${import.meta.env.BASE_URL}feedback?lead=${lead.id}&service=${encodeURIComponent(label)}`;
    sendLeadUpdateViaWhatsApp({ type, lead, feedbackUrl });
  }

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, "settings", "offerBanner")).then((snap) => {
      setOfferVisible(snap.exists() && snap.data().visible === true);
    });

    api.getLeadsByType("contact").then(setContacts);
    api.getLeadsByType("pickup").then(setPickups);
    api.getLeadsByType("cart").then(setCartOrders);
    api.getLeadsByType("service").then(setBookings);
    api.getFeedback().then(setFeedback);
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
            {offerStatus?.loading && (
              <div>
                <div className="h-2 w-full overflow-hidden rounded-pill bg-cream">
                  <div
                    className="h-full rounded-pill bg-lime transition-all"
                    style={{ width: `${offerProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink/50">Uploading… {offerProgress}%</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-pill-lime !py-2 !text-xs"
                disabled={!offerFile || offerStatus?.loading}
              >
                {offerStatus?.loading ? "Uploading…" : "Upload"}
              </button>
              <button
                type="button"
                onClick={removeOffer}
                className="btn-pill-outline !py-2 !text-xs"
                disabled={!offerVisible || offerStatus?.loading}
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

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{b.serviceName}</p>
                <div className="flex items-center gap-2">
                  <StatusSelect status={b.status} onChange={(s) => updateBookingStatus(b.id, s)} />
                  <NotifyButton onClick={() => notifyCustomer("service", b)} />
                </div>
              </div>
              <p className="mt-2 text-sm text-ink/70">{b.name} &middot; {b.phone}</p>
              <p className="text-sm text-ink/60">{b.address}</p>
              {b.locationUrl && (
                <a
                  href={b.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-semibold text-lime-dark hover:underline"
                >
                  View pinned location &rarr;
                </a>
              )}
              {b.message && <p className="mt-1 text-xs text-ink/50">{b.message}</p>}
            </div>
          ))}
          {bookings.length === 0 && <p className="text-sm text-ink/50">No service bookings yet.</p>}
        </div>

        {/* Tablet/desktop: table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
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
                  <td className="px-4 py-2.5">
                    {b.address}
                    {b.locationUrl && (
                      <a
                        href={b.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs font-semibold text-lime-dark hover:underline"
                      >
                        View on map &rarr;
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{b.message}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <StatusSelect status={b.status} onChange={(s) => updateBookingStatus(b.id, s)} />
                      <NotifyButton onClick={() => notifyCustomer("service", b)} />
                    </div>
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

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {cartOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{o.name}</p>
                <div className="flex items-center gap-2">
                  <StatusSelect status={o.status} onChange={(s) => updateCartStatus(o.id, s)} />
                  <NotifyButton onClick={() => notifyCustomer("cart", o)} />
                </div>
              </div>
              <p className="mt-1 text-sm text-ink/60">{o.phone}</p>
              <p className="mt-2 text-sm text-ink/70">
                {(o.items || []).map((it) => `${it.item} x${it.qty}`).join(", ")}
              </p>
              <p className="mt-1 font-semibold text-ink">&#8377;{o.total}</p>
            </div>
          ))}
          {cartOrders.length === 0 && <p className="text-sm text-ink/50">No cart orders yet.</p>}
        </div>

        {/* Tablet/desktop: table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
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
                    <div className="flex items-center gap-2">
                      <StatusSelect status={o.status} onChange={(s) => updateCartStatus(o.id, s)} />
                      <NotifyButton onClick={() => notifyCustomer("cart", o)} />
                    </div>
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

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {pickups.map((p) => (
            <div key={p.id} className="rounded-xl border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{p.name}</p>
                <div className="flex items-center gap-2">
                  <StatusSelect status={p.status} onChange={(s) => updatePickupStatus(p.id, s)} />
                  <NotifyButton onClick={() => notifyCustomer("pickup", p)} />
                </div>
              </div>
              <p className="mt-1 text-sm text-ink/60">{p.phone}</p>
              <p className="text-sm text-ink/70">{p.address}</p>
              <p className="mt-1 text-xs text-ink/50">{p.service}</p>
            </div>
          ))}
          {pickups.length === 0 && <p className="text-sm text-ink/50">No pickup requests yet.</p>}
        </div>

        {/* Tablet/desktop: table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
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
                    <div className="flex items-center gap-2">
                      <StatusSelect status={p.status} onChange={(s) => updatePickupStatus(p.id, s)} />
                      <NotifyButton onClick={() => notifyCustomer("pickup", p)} />
                    </div>
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

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-xl border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{c.name}</p>
                <div className="flex items-center gap-2">
                  <StatusSelect status={c.status} onChange={(s) => updateContactStatus(c.id, s)} />
                  <NotifyButton onClick={() => notifyCustomer("contact", c)} />
                </div>
              </div>
              <p className="mt-1 text-sm text-ink/60">
                {c.phone}
                {c.email ? ` · ${c.email}` : ""}
              </p>
              {c.message && <p className="mt-1 text-sm text-ink/70">{c.message}</p>}
            </div>
          ))}
          {contacts.length === 0 && <p className="text-sm text-ink/50">No messages yet.</p>}
        </div>

        {/* Tablet/desktop: table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
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
                    <div className="flex items-center gap-2">
                      <StatusSelect status={c.status} onChange={(s) => updateContactStatus(c.id, s)} />
                      <NotifyButton onClick={() => notifyCustomer("contact", c)} />
                    </div>
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

      <section className="mt-12">
        <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Customer Feedback</h2>

        {/* Mobile: stacked cards */}
        <div className="space-y-3 sm:hidden">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-xl border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{f.service || "Service"}</p>
                <FeedbackStars rating={f.rating} />
              </div>
              <p className="mt-1 text-xs text-ink/50">{formatDate(f.createdAt)}</p>
              {f.comment && <p className="mt-2 text-sm text-ink/70">{f.comment}</p>}
            </div>
          ))}
          {feedback.length === 0 && <p className="text-sm text-ink/50">No feedback submitted yet.</p>}
        </div>

        {/* Tablet/desktop: table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id} className="border-t border-ink/5">
                  <td className="px-4 py-2.5 font-medium">{f.service || "Service"}</td>
                  <td className="px-4 py-2.5"><FeedbackStars rating={f.rating} /></td>
                  <td className="px-4 py-2.5">{f.comment}</td>
                  <td className="px-4 py-2.5 text-ink/60">{formatDate(f.createdAt)}</td>
                </tr>
              ))}
              {feedback.length === 0 && (
                <tr><td className="px-4 py-4 text-ink/50" colSpan={4}>No feedback submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

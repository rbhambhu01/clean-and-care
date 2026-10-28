import { useEffect, useState } from "react";
import { api } from "../api.js";
import { offerImageUrl } from "../lib/offerImage.js";

const TOKEN_KEY = "cc_admin_token";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState([]);
  const [pickups, setPickups] = useState([]);

  const [offerFile, setOfferFile] = useState(null);
  const [offerStatus, setOfferStatus] = useState(null);
  const [offerImageFailed, setOfferImageFailed] = useState(false);
  const [offerVersion, setOfferVersion] = useState(0);

  async function login(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.adminLogin(form);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  }

  async function uploadOffer(e) {
    e.preventDefault();
    if (!offerFile) return;
    setOfferStatus({ loading: true });
    try {
      const body = new FormData();
      body.append("image", offerFile);
      const res = await fetch("/api/admin/offer-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setOfferStatus({ success: "Offer image updated — it's now live on the homepage." });
      setOfferFile(null);
      setOfferImageFailed(false);
      setOfferVersion((v) => v + 1);
    } catch (err) {
      setOfferStatus({ error: err.message });
    }
  }

  async function removeOffer() {
    setOfferStatus({ loading: true });
    try {
      const res = await fetch("/api/admin/offer-image", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Remove failed");
      }
      setOfferStatus({ success: "Offer image removed from the homepage." });
      setOfferImageFailed(true);
      setOfferVersion((v) => v + 1);
    } catch (err) {
      setOfferStatus({ error: err.message });
    }
  }

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch("/api/admin/leads/contact", { headers }).then((r) => r.json()).then(setContacts);
    fetch("/api/admin/leads/pickup", { headers }).then((r) => r.json()).then(setPickups);
  }, [token]);

  if (!token) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl border border-ink/10 p-8">
          <h1 className="font-serif text-2xl font-semibold text-ink">Admin Login</h1>
          <input
            placeholder="Username"
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
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
            {offerImageUrl && !offerImageFailed ? (
              <img
                key={offerVersion}
                src={`${offerImageUrl}?v=${offerVersion}`}
                alt="Current offer"
                className="h-full w-full object-cover"
                onError={() => setOfferImageFailed(true)}
                onLoad={() => setOfferImageFailed(false)}
              />
            ) : (
              <p className="px-4 text-center text-xs text-ink/40">
                {offerImageUrl ? "No offer image set" : "Image hosting not configured (VITE_CLOUDINARY_CLOUD_NAME missing)"}
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
                disabled={!offerImageUrl || offerImageFailed}
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
                  <td className="px-4 py-2.5">{p.status}</td>
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
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="px-4 py-2.5">{c.name}</td>
                  <td className="px-4 py-2.5">{c.phone}</td>
                  <td className="px-4 py-2.5">{c.email}</td>
                  <td className="px-4 py-2.5">{c.message}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td className="px-4 py-4 text-ink/50" colSpan={4}>No messages yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

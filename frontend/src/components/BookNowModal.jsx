import { CheckCircle2, MapPin, X } from "lucide-react";
import { useState } from "react";
import { api } from "../api.js";
import { sendServiceBookingViaWhatsApp } from "../lib/whatsapp.js";

const inputClass =
  "w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-lime-dark focus:ring-2 focus:ring-lime/30";

export default function BookNowModal({ service, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", message: "" });
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState(null); // { lat, lng, url } | null
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location sharing.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied — you can still type your address above."
            : "Couldn't get your location — you can still type your address above."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function submit(e) {
    e.preventDefault();
    const payload = {
      serviceName: service.title,
      ...form,
      ...(location ? { locationUrl: location.url, lat: location.lat, lng: location.lng } : {}),
    };
    sendServiceBookingViaWhatsApp(payload);
    api.submitServiceBooking(payload).catch(() => {});
    setStatus({ success: "Opening WhatsApp — just hit send there to confirm your booking." });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Book Now</p>
            <h3 className="font-serif text-xl font-semibold text-ink">{service.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-cream hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status?.success ? (
          <div className="py-4 text-center">
            <p className="text-sm text-lime-dark">{status.success}</p>
            <button onClick={onClose} className="btn-pill-outline mt-6 !py-2 !text-xs">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
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
              <span className="mb-1.5 block text-sm font-medium text-ink/80">Address / Location</span>
              <input
                required
                className={inputClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>

            <div>
              <button
                type="button"
                onClick={captureLocation}
                disabled={locating}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-lime-dark hover:underline disabled:opacity-50"
              >
                {location ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                {locating
                  ? "Getting your location…"
                  : location
                    ? "Location added — tap to refresh"
                    : "Share my current location (optional)"}
              </button>
              {location && (
                <p className="mt-1 text-xs text-ink/50">
                  Pinned at {location.lat.toFixed(5)}, {location.lng.toFixed(5)} — we&rsquo;ll use this to find you faster.
                </p>
              )}
              {locationError && <p className="mt-1 text-xs text-red-600">{locationError}</p>}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink/80">Message (optional)</span>
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Anything we should know?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            <button type="submit" className="btn-pill-lime w-full justify-center">
              Send via WhatsApp
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

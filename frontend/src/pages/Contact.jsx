import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { api } from "../api.js";
import { useCompany } from "../context/CompanyContext.jsx";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/80">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-lime-dark focus:ring-2 focus:ring-lime/30";

export default function Contact() {
  const { company } = useCompany();

  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState(null);

  const [pickupForm, setPickupForm] = useState({ name: "", phone: "", address: "", service: "", preferredDate: "" });
  const [pickupStatus, setPickupStatus] = useState(null);

  async function submitContact(e) {
    e.preventDefault();
    setContactStatus({ loading: true });
    try {
      const res = await api.sendContact(contactForm);
      setContactStatus({ success: res.message });
      setContactForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      setContactStatus({ error: err.message });
    }
  }

  async function submitPickup(e) {
    e.preventDefault();
    setPickupStatus({ loading: true });
    try {
      const res = await api.schedulePickup(pickupForm);
      setPickupStatus({ success: res.message });
      setPickupForm({ name: "", phone: "", address: "", service: "", preferredDate: "" });
    } catch (err) {
      setPickupStatus({ error: err.message });
    }
  }

  return (
    <div>
      <section className="bg-cream py-16 text-center">
        <div className="container-x">
          <p className="eyebrow">Contact Us</p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">We&rsquo;d Love to Hear From You</h1>
        </div>
      </section>

      <section className="container-x grid grid-cols-1 gap-12 py-16 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 flex-shrink-0 text-lime-dark" />
            <p className="text-sm text-ink/70">
              {company?.address?.line1}
              <br />
              {company?.address?.line2}
            </p>
          </div>
          <div className="flex gap-3">
            <Phone className="h-5 w-5 flex-shrink-0 text-lime-dark" />
            <p className="text-sm text-ink/70">{company?.phones?.join(" | ")}</p>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 flex-shrink-0 text-lime-dark" />
            <p className="text-sm text-ink/70">{company?.email}</p>
          </div>
        </div>

        <form onSubmit={submitContact} className="space-y-4 rounded-2xl border border-ink/10 p-6 lg:col-span-1">
          <h3 className="font-serif text-xl font-semibold text-ink">Send a Message</h3>
          <Field label="Name">
            <input
              required
              className={inputClass}
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              required
              className={inputClass}
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
            />
          </Field>
          <Field label="Email (optional)">
            <input
              type="email"
              className={inputClass}
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            />
          </Field>
          <Field label="Message">
            <textarea
              rows={4}
              className={inputClass}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            />
          </Field>
          <button type="submit" className="btn-pill-lime w-full justify-center" disabled={contactStatus?.loading}>
            {contactStatus?.loading ? "Sending..." : "Send Message"}
          </button>
          {contactStatus?.success && <p className="text-sm text-lime-dark">{contactStatus.success}</p>}
          {contactStatus?.error && <p className="text-sm text-red-600">{contactStatus.error}</p>}
        </form>

        <form onSubmit={submitPickup} className="space-y-4 rounded-2xl bg-ink p-6 text-white lg:col-span-1">
          <h3 className="font-serif text-xl font-semibold">Schedule a Pickup</h3>
          <Field label="Name">
            <input
              required
              className={`${inputClass} border-white/20 bg-white/5 text-white placeholder:text-white/40`}
              value={pickupForm.name}
              onChange={(e) => setPickupForm({ ...pickupForm, name: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              required
              className={`${inputClass} border-white/20 bg-white/5 text-white placeholder:text-white/40`}
              value={pickupForm.phone}
              onChange={(e) => setPickupForm({ ...pickupForm, phone: e.target.value })}
            />
          </Field>
          <Field label="Pickup Address">
            <input
              required
              className={`${inputClass} border-white/20 bg-white/5 text-white placeholder:text-white/40`}
              value={pickupForm.address}
              onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
            />
          </Field>
          <Field label="Service">
            <input
              placeholder="e.g. Dry Cleaning, Wash & Fold"
              className={`${inputClass} border-white/20 bg-white/5 text-white placeholder:text-white/40`}
              value={pickupForm.service}
              onChange={(e) => setPickupForm({ ...pickupForm, service: e.target.value })}
            />
          </Field>
          <Field label="Preferred Date">
            <input
              type="date"
              className={`${inputClass} border-white/20 bg-white/5 text-white [color-scheme:dark]`}
              value={pickupForm.preferredDate}
              onChange={(e) => setPickupForm({ ...pickupForm, preferredDate: e.target.value })}
            />
          </Field>
          <button type="submit" className="btn-pill-lime w-full justify-center" disabled={pickupStatus?.loading}>
            {pickupStatus?.loading ? "Scheduling..." : "Schedule Pickup"}
          </button>
          {pickupStatus?.success && <p className="text-sm text-lime">{pickupStatus.success}</p>}
          {pickupStatus?.error && <p className="text-sm text-red-400">{pickupStatus.error}</p>}
        </form>
      </section>
    </div>
  );
}

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import BookNowModal from "../components/BookNowModal.jsx";
import IconBadge from "../components/IconBadge.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

const CATEGORIES = [
  { key: "cleaning", label: "Cleaning", icon: "sparkles", blurb: "Bags, shoes, toys and everyday item cleaning" },
  { key: "sanitization", label: "Sanitization", icon: "spray", blurb: "Professional sanitizing for a hygienic home" },
  { key: "ironing", label: "Ironing", icon: "iron", blurb: "Crisp, press-perfect clothes and linens" },
  { key: "furniture", label: "Furniture", icon: "sofa", blurb: "Carpets, curtains and upholstery deep cleaning" },
  { key: "dryclean", label: "Dryclean", icon: "shirt", blurb: "Dry cleaning, wet cleaning and laundry by kg" },
  { key: "home-services", label: "Home Services", icon: "home", blurb: "On-site cleaning for your home and car" },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [bookingService, setBookingService] = useState(null);
  const [params, setParams] = useSearchParams();
  const activeKey = params.get("category");
  const activeCategory = CATEGORIES.find((c) => c.key === activeKey) || null;

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

  function openCategory(key) {
    setParams({ category: key });
  }

  function backToCategories() {
    setParams({});
  }

  const categoryServices = activeCategory
    ? services.filter((s) => s.category === activeCategory.key)
    : [];

  return (
    <div>
      <section className="bg-cream py-16 text-center">
        <div className="container-x">
          <p className="eyebrow">Services</p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">Everything Your Fabrics Need</h1>
          <p className="mx-auto mt-5 max-w-2xl text-ink/70">
            From everyday laundry to delicate dry cleaning, we cover it all with doorstep pickup
            &amp; drop and a 2-hour express option.
          </p>
        </div>
      </section>

      {!activeCategory ? (
        <section className="py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Browse by" title="Category" />
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => openCategory(c.key)}
                  className="flex items-center gap-4 rounded-2xl border border-ink/10 p-6 text-left transition-shadow hover:shadow-lg"
                >
                  <IconBadge icon={c.icon} size="lg" />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-ink">{c.label}</h3>
                    <p className="mt-1 text-sm text-ink/60">{c.blurb}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container-x">
            <button
              onClick={backToCategories}
              className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-lime-dark hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </button>
            <SectionHeading eyebrow="Services" title={activeCategory.label} />
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {categoryServices.map((s) => (
                <div key={s.id} className="flex flex-col gap-4 rounded-2xl border border-ink/10 p-6 sm:flex-row">
                  <IconBadge icon={s.icon} slug={s.slug} />
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-serif text-lg font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-ink/60">{s.description}</p>
                    <button
                      onClick={() => setBookingService(s)}
                      className="btn-pill-outline mt-4 self-start !py-1.5 !text-xs"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
              {categoryServices.length === 0 && (
                <p className="text-sm text-ink/50">No services in this category yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-4 pb-16">
        <div className="container-x flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-white lg:flex-row">
          <div>
            <p className="eyebrow !text-lime">2 hr Service Available</p>
            <h3 className="text-3xl font-semibold">Ready when you need it most</h3>
          </div>
          <Link to="/contact" className="btn-pill-lime whitespace-nowrap">Schedule Pickup</Link>
        </div>
      </section>

      {bookingService && (
        <BookNowModal service={bookingService} onClose={() => setBookingService(null)} />
      )}
    </div>
  );
}

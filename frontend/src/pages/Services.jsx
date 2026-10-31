import { Armchair, ArrowLeft, Flame, Home as HomeIcon, Shirt, Sparkles, SprayCan } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import BookNowModal from "../components/BookNowModal.jsx";
import IconBadge from "../components/IconBadge.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

// Evenly spread around the hue wheel so all six read as distinct at a
// glance; all "-600" (Flame/amber bumped a step for the same contrast
// level) so white text stays reliably readable on every tile.
const CATEGORIES = [
  { key: "cleaning", label: "Cleaning", Icon: Sparkles, blurb: "Bags, shoes, toys and everyday items", bg: "bg-sky-600" },
  { key: "sanitization", label: "Sanitization", Icon: SprayCan, blurb: "A hygienic, sanitized home", bg: "bg-emerald-600" },
  { key: "ironing", label: "Ironing", Icon: Flame, blurb: "Crisp, press-perfect clothes", bg: "bg-amber-600" },
  { key: "furniture", label: "Furniture", Icon: Armchair, blurb: "Carpets, curtains and upholstery", bg: "bg-rose-600" },
  { key: "dryclean", label: "Dryclean", Icon: Shirt, blurb: "Dry cleaning, wet cleaning, laundry by kg", bg: "bg-indigo-600" },
  { key: "home-services", label: "Home Services", Icon: HomeIcon, blurb: "On-site cleaning for home and car", bg: "bg-fuchsia-600" },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState(null);
  const [params, setParams] = useSearchParams();
  const activeKey = params.get("category");
  const activeCategory = CATEGORIES.find((c) => c.key === activeKey) || null;

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {}).finally(() => setLoading(false));
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
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {CATEGORIES.map(({ key, label, Icon, blurb, bg }) => (
                <button
                  key={key}
                  onClick={() => openCategory(key)}
                  className={`group relative flex min-h-[172px] flex-col justify-between gap-5 overflow-hidden rounded-3xl p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:min-h-[200px] sm:gap-6 sm:p-7 ${bg}`}
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={1.75} />
                  </div>
                  <div className="relative">
                    <h3 className="font-serif text-lg font-semibold text-white sm:text-xl">{label}</h3>
                    <p className="mt-1 text-xs text-white/85 sm:text-sm">{blurb}</p>
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
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {categoryServices.map((s) => (
                <div
                  key={s.id}
                  className={`group relative flex min-h-[220px] flex-col justify-between gap-5 overflow-hidden rounded-3xl p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:min-h-[240px] sm:gap-6 sm:p-7 ${activeCategory.bg}`}
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
                  <IconBadge icon={s.icon} slug={s.slug} />
                  <div className="relative flex flex-1 flex-col">
                    <h3 className="font-serif text-lg font-semibold text-white sm:text-xl">{s.title}</h3>
                    <p className="mt-1 flex-1 text-xs text-white/85 sm:text-sm">{s.description}</p>
                    <button
                      onClick={() => setBookingService(s)}
                      className="relative mt-4 self-start rounded-pill bg-white px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-white/90"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
              {categoryServices.length === 0 && (
                <p className="col-span-2 text-sm text-ink/50 lg:col-span-3">
                  {loading ? "Loading services…" : "No services in this category yet."}
                </p>
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

import { Armchair, ArrowLeft, Flame, Home as HomeIcon, Shirt, Sparkles, SprayCan } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import BookNowModal from "../components/BookNowModal.jsx";
import IconBadge from "../components/IconBadge.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { img } from "../lib/assets.js";

// Evenly spread around the hue wheel so all six read as distinct at a
// glance. Each tile shows a real photo (categories/<photo>.jpg) under a
// gradient in the same hue as `bg`, so white text stays reliably readable
// while the color identity from the old icon tiles carries over.
const CATEGORIES = [
  { key: "cleaning", label: "Cleaning", Icon: Sparkles, blurb: "Bags, shoes, toys and everyday items", bg: "bg-sky-600", photo: "cleaning", overlay: "from-sky-950/90 via-sky-900/40" },
  { key: "sanitization", label: "Sanitization", Icon: SprayCan, blurb: "A hygienic, sanitized home", bg: "bg-emerald-600", photo: "sanitization", overlay: "from-emerald-950/90 via-emerald-900/40" },
  { key: "ironing", label: "Ironing", Icon: Flame, blurb: "Crisp, press-perfect clothes", bg: "bg-amber-600", photo: "ironing", overlay: "from-amber-950/90 via-amber-900/40" },
  { key: "furniture", label: "Furniture", Icon: Armchair, blurb: "Carpets, curtains and upholstery", bg: "bg-rose-600", photo: "furniture", overlay: "from-rose-950/90 via-rose-900/40" },
  { key: "dryclean", label: "Dryclean", Icon: Shirt, blurb: "Dry cleaning, wet cleaning, laundry by kg", bg: "bg-indigo-600", photo: "dryclean", overlay: "from-indigo-950/90 via-indigo-900/40" },
  { key: "home-services", label: "Home Services", Icon: HomeIcon, blurb: "On-site cleaning for home and car", bg: "bg-fuchsia-600", photo: "home-services", overlay: "from-fuchsia-950/90 via-fuchsia-900/40" },
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
      {!activeCategory ? (
        <section className="py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Browse by" title="Category" />
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {CATEGORIES.map(({ key, label, Icon, blurb, photo, overlay }) => (
                <button
                  key={key}
                  onClick={() => openCategory(key)}
                  className="group relative flex min-h-[172px] flex-col justify-end overflow-hidden rounded-3xl p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:min-h-[200px] sm:p-7"
                >
                  <img
                    src={img(`categories/${photo}.jpg`)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${overlay} to-transparent`} />
                  <Icon className="relative mb-2 h-6 w-6 text-white" strokeWidth={1.75} />
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

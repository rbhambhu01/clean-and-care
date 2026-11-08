import { ArrowLeft, Baby, Footprints, Home as HomeIcon, Percent, Plus, Scale, Shirt, Sparkles, SprayCan } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import SectionHeading from "../components/SectionHeading.jsx";
import { useCart } from "../context/CartContext.jsx";
import { img } from "../lib/assets.js";

function PriceTable({ title, items }) {
  const { addItem } = useCart();

  return (
    <div>
      {title && <h3 className="mb-4 font-serif text-2xl font-semibold text-ink">{title}</h3>}

      {/* Mobile: stacked cards — no horizontal scrolling needed */}
      <div className="space-y-3 sm:hidden">
        {items.map((row) => (
          <div key={row.item} className="rounded-xl border border-ink/10 p-4">
            <p className="font-medium text-ink">{row.item}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {row.dc != null && (
                <button
                  onClick={() => addItem({ item: row.item, service: "dc", price: row.dc })}
                  className="flex items-center gap-1.5 rounded-pill border border-ink/15 px-3 py-1.5 text-xs hover:bg-lime/20"
                >
                  Dry Clean &#8377;{row.dc}
                  <Plus className="h-3 w-3" />
                </button>
              )}
              {row.si != null && (
                <button
                  onClick={() => addItem({ item: row.item, service: "si", price: row.si })}
                  className="flex items-center gap-1.5 rounded-pill border border-ink/15 px-3 py-1.5 text-xs hover:bg-lime/20"
                >
                  Steam Iron &#8377;{row.si}
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tablet/desktop: full table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-cream">
            <tr>
              <th className="px-5 py-3 font-semibold text-ink">Item</th>
              <th className="px-5 py-3 font-semibold text-ink">Dry Clean (&#8377;)</th>
              <th className="px-5 py-3 font-semibold text-ink">Steam Iron (&#8377;)</th>
              <th className="px-5 py-3 font-semibold text-ink">Add to Cart</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={row.item} className={i % 2 ? "bg-cream-light/60" : "bg-white"}>
                <td className="px-5 py-2.5 text-ink/80">{row.item}</td>
                <td className="px-5 py-2.5 text-ink/80">{row.dc ?? "—"}</td>
                <td className="px-5 py-2.5 text-ink/80">{row.si ?? "—"}</td>
                <td className="px-5 py-2.5">
                  <div className="flex gap-2">
                    {row.dc != null && (
                      <button
                        onClick={() => addItem({ item: row.item, service: "dc", price: row.dc })}
                        className="flex items-center gap-1 rounded-pill border border-ink/15 px-2.5 py-1 text-xs hover:bg-lime/20"
                        title="Add Dry Clean to cart"
                      >
                        <Plus className="h-3 w-3" /> DC
                      </button>
                    )}
                    {row.si != null && (
                      <button
                        onClick={() => addItem({ item: row.item, service: "si", price: row.si })}
                        className="flex items-center gap-1 rounded-pill border border-ink/15 px-2.5 py-1 text-xs hover:bg-lime/20"
                        title="Add Steam Iron to cart"
                      >
                        <Plus className="h-3 w-3" /> SI
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimpleTable({ title, rows, labelKey, valueKey }) {
  const { addItem } = useCart();

  return (
    <div>
      {title && <h3 className="mb-4 font-serif text-2xl font-semibold text-ink">{title}</h3>}

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => {
          const priceValue = Number.parseInt(row[valueKey], 10);
          const canAdd = !Number.isNaN(priceValue);
          return (
            <div
              key={row[labelKey]}
              className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 p-4"
            >
              <div>
                <p className="font-medium text-ink">{row[labelKey]}</p>
                <p className="text-xs text-ink/60">&#8377;{row[valueKey]}</p>
              </div>
              {canAdd && (
                <button
                  onClick={() => addItem({ item: row[labelKey], service: "dc", price: priceValue })}
                  className="flex flex-shrink-0 items-center gap-1 rounded-pill border border-ink/15 px-3 py-1.5 text-xs hover:bg-lime/20"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet/desktop: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 sm:block">
        <table className="w-full min-w-[360px] text-left text-sm">
          <tbody>
            {rows.map((row, i) => {
              const priceValue = Number.parseInt(row[valueKey], 10);
              const canAdd = !Number.isNaN(priceValue);
              return (
                <tr key={row[labelKey]} className={i % 2 ? "bg-cream-light/60" : "bg-white"}>
                  <td className="px-5 py-2.5 text-ink/80">{row[labelKey]}</td>
                  <td className="px-5 py-2.5 font-medium text-ink">&#8377;{row[valueKey]}</td>
                  <td className="px-5 py-2.5">
                    {canAdd && (
                      <button
                        onClick={() => addItem({ item: row[labelKey], service: "dc", price: priceValue })}
                        className="flex items-center gap-1 rounded-pill border border-ink/15 px-2.5 py-1 text-xs hover:bg-lime/20"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Styles for the 4 Firestore-driven pricingCategories docs, matched by
// position (their order is stable — set by the seed script / admin editor,
// never reordered in the UI). Each has a real photo under a same-hue
// gradient, same pattern as the Services category grid.
const CATEGORY_STYLES = [
  { Icon: Shirt, bg: "bg-sky-600", photo: "mens", overlay: "from-sky-950/90 via-sky-900/40" },
  { Icon: Sparkles, bg: "bg-rose-600", photo: "womens", overlay: "from-rose-950/90 via-rose-900/40" },
  { Icon: HomeIcon, bg: "bg-amber-600", photo: "pricing-home", overlay: "from-amber-950/90 via-amber-900/40" },
  { Icon: Baby, bg: "bg-violet-600", photo: "kids", overlay: "from-violet-950/90 via-violet-900/40" },
];

const EXTRAS_META = [
  { key: "byWeight", label: "By Weight Services", Icon: Scale, bg: "bg-emerald-600", photo: "by-weight", overlay: "from-emerald-950/90 via-emerald-900/40" },
  { key: "shoesSpa", label: "Shoes Spa", Icon: Footprints, bg: "bg-teal-600", photo: "shoes-spa", overlay: "from-teal-950/90 via-teal-900/40" },
  { key: "addOns", label: "Laundry Add-Ons", Icon: SprayCan, bg: "bg-fuchsia-600", photo: "add-ons", overlay: "from-fuchsia-950/90 via-fuchsia-900/40" },
];

export default function Pricing() {
  const [data, setData] = useState({ categories: [], extras: {} });
  const [discount, setDiscount] = useState(null);
  const [params, setParams] = useSearchParams();
  const activeKey = params.get("category");

  useEffect(() => {
    api.getPricing().then(setData).catch(() => {});
    api.getDiscount().then(setDiscount).catch(() => {});
  }, []);

  const { categories, extras } = data;

  const tiles = [
    ...categories.map((c, i) => ({
      key: c.id,
      label: c.category,
      blurb: "Dry Clean & Steam Iron rates",
      type: "table",
      items: c.items,
      ...(CATEGORY_STYLES[i % CATEGORY_STYLES.length]),
    })),
    ...EXTRAS_META.filter((m) => extras?.[m.key]?.length).map((m) => ({
      key: m.key,
      label: m.label,
      blurb: `${extras[m.key].length} services`,
      type: "simple",
      rows: extras[m.key],
      Icon: m.Icon,
      bg: m.bg,
      photo: m.photo,
      overlay: m.overlay,
    })),
  ];

  const activeTile = tiles.find((t) => t.key === activeKey) || null;

  function openCategory(key) {
    setParams({ category: key });
  }

  function backToCategories() {
    setParams({});
  }

  const discountActive = Boolean(discount?.active && discount.percent > 0);

  return (
    <div>
      {discountActive && (
        <section className="bg-ink py-4 text-center text-white">
          <div className="container-x flex items-center justify-center gap-2 text-sm font-medium">
            <Percent className="h-4 w-4 text-lime" />
            <span>
              Today's offer: <span className="text-lime">{discount.percent}% off</span>
              {discount.label ? ` — ${discount.label}` : ""} — applied automatically at checkout
            </span>
          </div>
        </section>
      )}

      {!activeTile ? (
        <section className="py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Browse by" title="Category" />
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {tiles.map(({ key, label, blurb, Icon, photo, overlay }) => (
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
            <SectionHeading eyebrow="Pricing" title={activeTile.label} />
            <div className="mt-10">
              {activeTile.type === "table" ? (
                <PriceTable items={activeTile.items} />
              ) : (
                <SimpleTable rows={activeTile.rows} labelKey="service" valueKey="price" />
              )}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="container-x flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-white lg:flex-row">
          <div>
            <p className="eyebrow !text-lime">
              {discountActive ? `${discount.percent}% off — ${discount.label || "today only"}` : "Flat rates, no surprises"}
            </p>
            <h3 className="text-3xl font-semibold">Ready to get started?</h3>
          </div>
          <Link to="/contact" className="btn-pill-lime whitespace-nowrap">Schedule Pickup</Link>
        </div>
      </section>
    </div>
  );
}

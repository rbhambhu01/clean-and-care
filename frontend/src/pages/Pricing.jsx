import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useCompany } from "../context/CompanyContext.jsx";

function PriceTable({ title, items }) {
  const { addItem } = useCart();

  return (
    <div className="mb-12">
      <h3 className="mb-4 font-serif text-2xl font-semibold text-ink">{title}</h3>

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
    <div className="mb-12">
      <h3 className="mb-4 font-serif text-2xl font-semibold text-ink">{title}</h3>

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

export default function Pricing() {
  const { company } = useCompany();
  const [data, setData] = useState({ categories: [], extras: {} });

  useEffect(() => {
    api.getPricing().then(setData).catch(() => {});
  }, []);

  const { categories, extras } = data;

  return (
    <div>
      <section className="bg-cream py-16 text-center">
        <div className="container-x">
          <p className="eyebrow">Pricing</p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">Transparent, Fair Pricing</h1>
          <p className="mx-auto mt-5 max-w-2xl text-ink/70">
            Flat 10% off on your first order. Express service available for a nominal additional fee.
            Add items to your cart and checkout via WhatsApp.
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        {categories.map((c) => (
          <PriceTable key={c.id} title={c.category} items={c.items} />
        ))}

        {extras?.byWeight && (
          <SimpleTable title="By Weight Services" rows={extras.byWeight} labelKey="service" valueKey="price" />
        )}
        {extras?.shoesSpa && (
          <SimpleTable title="Shoes Spa" rows={extras.shoesSpa} labelKey="service" valueKey="price" />
        )}
        {extras?.addOns && (
          <SimpleTable title="Laundry Add-Ons" rows={extras.addOns} labelKey="service" valueKey="price" />
        )}
      </section>

      <section className="pb-16">
        <div className="container-x flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-white lg:flex-row">
          <div>
            <p className="eyebrow !text-lime">{company?.offer || "Flat 10% Off on your first order"}</p>
            <h3 className="text-3xl font-semibold">Ready to get started?</h3>
          </div>
          <Link to="/contact" className="btn-pill-lime whitespace-nowrap">Schedule Pickup</Link>
        </div>
      </section>
    </div>
  );
}

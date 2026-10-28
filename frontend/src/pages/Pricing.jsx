import { useEffect, useState } from "react";
import { api } from "../api.js";

function PriceTable({ title, items }) {
  return (
    <div className="mb-12">
      <h3 className="mb-4 font-serif text-2xl font-semibold text-ink">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-cream">
            <tr>
              <th className="px-5 py-3 font-semibold text-ink">Item</th>
              <th className="px-5 py-3 font-semibold text-ink">Dry Clean (&#8377;)</th>
              <th className="px-5 py-3 font-semibold text-ink">Steam Iron (&#8377;)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={row.item} className={i % 2 ? "bg-cream-light/60" : "bg-white"}>
                <td className="px-5 py-2.5 text-ink/80">{row.item}</td>
                <td className="px-5 py-2.5 text-ink/80">{row.dc ?? "—"}</td>
                <td className="px-5 py-2.5 text-ink/80">{row.si ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SimpleTable({ title, rows, labelKey, valueKey }) {
  return (
    <div className="mb-12">
      <h3 className="mb-4 font-serif text-2xl font-semibold text-ink">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full min-w-[320px] text-left text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row[labelKey]} className={i % 2 ? "bg-cream-light/60" : "bg-white"}>
                <td className="px-5 py-2.5 text-ink/80">{row[labelKey]}</td>
                <td className="px-5 py-2.5 font-medium text-ink">&#8377;{row[valueKey]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Pricing() {
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
    </div>
  );
}

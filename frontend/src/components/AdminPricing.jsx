import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";

const EXTRAS_LABELS = {
  byWeight: "By Weight Services",
  shoesSpa: "Shoes Spa",
  addOns: "Laundry Add-Ons",
};

function CategoryEditor({ category, onSave }) {
  const [items, setItems] = useState(category.items);
  const [status, setStatus] = useState(null);

  function updateField(idx, field, value) {
    setItems((prev) => prev.map((it, i) => (i !== idx ? it : { ...it, [field]: value === "" ? null : Number(value) })));
  }

  async function save() {
    setStatus({ loading: true });
    try {
      await onSave(items);
      setStatus({ success: "Saved." });
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  return (
    <div className="border-t border-ink/10 p-4">
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={it.item} className="flex flex-wrap items-center gap-3 text-sm">
            <span className="min-w-0 flex-1">{it.item}</span>
            <label className="flex items-center gap-1.5 text-xs text-ink/50">
              DC
              <input
                type="number"
                className="w-20 rounded-lg border border-ink/15 px-2 py-1 text-ink"
                value={it.dc ?? ""}
                onChange={(e) => updateField(idx, "dc", e.target.value)}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-ink/50">
              SI
              <input
                type="number"
                className="w-20 rounded-lg border border-ink/15 px-2 py-1 text-ink"
                value={it.si ?? ""}
                onChange={(e) => updateField(idx, "si", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={status?.loading} className="btn-pill-lime !py-1.5 !text-xs">
          {status?.loading ? "Saving…" : "Save Changes"}
        </button>
        {status?.success && <p className="text-xs text-lime-dark">{status.success}</p>}
        {status?.error && <p className="text-xs text-red-600">{status.error}</p>}
      </div>
    </div>
  );
}

function ExtrasEditor({ rows, onSave }) {
  const [localRows, setLocalRows] = useState(rows);
  const [status, setStatus] = useState(null);

  function updateField(idx, field, value) {
    setLocalRows((prev) => prev.map((r, i) => (i !== idx ? r : { ...r, [field]: value })));
  }

  async function save() {
    setStatus({ loading: true });
    try {
      await onSave(localRows);
      setStatus({ success: "Saved." });
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  return (
    <div className="border-t border-ink/10 p-4">
      <div className="space-y-2">
        {localRows.map((row, idx) => (
          <div key={row.service} className="flex items-center gap-3 text-sm">
            <span className="min-w-0 flex-1">{row.service}</span>
            <label className="flex items-center gap-1.5 text-xs text-ink/50">
              Price
              <input
                className="w-28 rounded-lg border border-ink/15 px-2 py-1 text-ink"
                value={row.price}
                onChange={(e) => updateField(idx, "price", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={status?.loading} className="btn-pill-lime !py-1.5 !text-xs">
          {status?.loading ? "Saving…" : "Save Changes"}
        </button>
        {status?.success && <p className="text-xs text-lime-dark">{status.success}</p>}
        {status?.error && <p className="text-xs text-red-600">{status.error}</p>}
      </div>
    </div>
  );
}

export default function AdminPricing() {
  const [categories, setCategories] = useState([]);
  const [extras, setExtras] = useState({});
  const [discount, setDiscount] = useState({ active: false, percent: 0, label: "" });
  const [discountStatus, setDiscountStatus] = useState(null);
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    api.getPricing().then(({ categories, extras }) => {
      setCategories(categories);
      setExtras(extras);
    });
    api.getDiscount().then(setDiscount);
  }, []);

  async function saveDiscount() {
    setDiscountStatus({ loading: true });
    try {
      await api.updateDiscount(discount);
      setDiscountStatus({ success: "Discount updated." });
    } catch (err) {
      setDiscountStatus({ error: err.message });
    }
  }

  const extrasKeys = Object.keys(EXTRAS_LABELS).filter((k) => extras?.[k]?.length);

  return (
    <section className="mb-12">
      <h2 className="mb-4 font-serif text-xl font-semibold text-ink">Pricing &amp; Discount</h2>

      <div className="mb-6 rounded-2xl border border-ink/10 p-5">
        <h3 className="mb-3 font-semibold text-ink">Today's Discount</h3>
        <p className="mb-4 text-sm text-ink/60">
          Shown on the Pricing page and applied automatically to the cart total at checkout.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={discount.active}
              onChange={(e) => setDiscount({ ...discount, active: e.target.checked })}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            % Off
            <input
              type="number"
              min="0"
              max="100"
              className="w-20 rounded-lg border border-ink/15 px-2 py-1.5"
              value={discount.percent}
              onChange={(e) => setDiscount({ ...discount, percent: Number(e.target.value) })}
            />
          </label>
          <label className="flex min-w-[200px] flex-1 items-center gap-2 text-sm">
            Label
            <input
              className="flex-1 rounded-lg border border-ink/15 px-2 py-1.5"
              placeholder="e.g. First order special"
              value={discount.label}
              onChange={(e) => setDiscount({ ...discount, label: e.target.value })}
            />
          </label>
          <button onClick={saveDiscount} disabled={discountStatus?.loading} className="btn-pill-lime !py-1.5 !text-xs">
            {discountStatus?.loading ? "Saving…" : "Save"}
          </button>
        </div>
        {discountStatus?.success && <p className="mt-2 text-xs text-lime-dark">{discountStatus.success}</p>}
        {discountStatus?.error && <p className="mt-2 text-xs text-red-600">{discountStatus.error}</p>}
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-ink/10">
            <button
              onClick={() => setOpenKey(openKey === cat.id ? null : cat.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-semibold text-ink">{cat.category}</span>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-ink/50 transition-transform ${openKey === cat.id ? "rotate-180" : ""}`} />
            </button>
            {openKey === cat.id && (
              <CategoryEditor
                category={cat}
                onSave={async (items) => {
                  await api.updatePricingCategoryItems(cat.id, items);
                  setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, items } : c)));
                }}
              />
            )}
          </div>
        ))}

        {extrasKeys.map((key) => (
          <div key={key} className="rounded-2xl border border-ink/10">
            <button
              onClick={() => setOpenKey(openKey === key ? null : key)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-semibold text-ink">{EXTRAS_LABELS[key]}</span>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-ink/50 transition-transform ${openKey === key ? "rotate-180" : ""}`} />
            </button>
            {openKey === key && (
              <ExtrasEditor
                rows={extras[key]}
                onSave={async (rows) => {
                  await api.updatePricingExtrasGroup(key, rows);
                  setExtras((prev) => ({ ...prev, [key]: rows }));
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

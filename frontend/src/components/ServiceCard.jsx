import IconBadge from "./IconBadge.jsx";

export default function ServiceCard({ service, onBookNow }) {
  return (
    <div className="flex flex-col items-center rounded-2xl p-6 text-center transition-transform hover:-translate-y-1">
      <IconBadge icon={service.icon} slug={service.slug} />
      <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{service.title}</h3>
      {service.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{service.description}</p>
      )}
      <button
        onClick={() => onBookNow(service)}
        className="mt-4 rounded-pill border border-ink/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink hover:bg-lime hover:border-lime"
      >
        Book Now
      </button>
    </div>
  );
}

import IconBadge from "./IconBadge.jsx";

export default function ServiceCard({ service }) {
  return (
    <div className="flex flex-col items-center rounded-2xl p-6 text-center transition-transform hover:-translate-y-1">
      <IconBadge icon={service.icon} slug={service.slug} />
      <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{service.title}</h3>
      {service.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{service.description}</p>
      )}
    </div>
  );
}

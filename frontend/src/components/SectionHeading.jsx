export default function SectionHeading({ eyebrow, title, align = "center", light = false }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      {eyebrow && (
        <p className={`eyebrow ${light ? "!text-lime" : ""}`}>{eyebrow}</p>
      )}
      <h2 className={`text-3xl font-semibold sm:text-4xl ${light ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
    </div>
  );
}

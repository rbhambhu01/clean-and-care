import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import IconBadge from "../components/IconBadge.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
  }, []);

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

      <section className="py-16">
        <div className="container-x grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="flex gap-4 rounded-2xl border border-ink/10 p-6">
              <IconBadge icon={s.icon} slug={s.slug} />
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-4 pb-16">
        <div className="container-x flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink px-8 py-10 text-white lg:flex-row">
          <div>
            <p className="eyebrow !text-lime">2 hr Service Available</p>
            <h3 className="text-3xl font-semibold">Ready when you need it most</h3>
          </div>
          <Link to="/contact" className="btn-pill-lime whitespace-nowrap">Schedule Pickup</Link>
        </div>
      </section>
    </div>
  );
}

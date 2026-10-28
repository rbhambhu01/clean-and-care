import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading.jsx";
import { useCompany } from "../context/CompanyContext.jsx";
import { img } from "../lib/assets.js";

export default function About() {
  const { company } = useCompany();

  return (
    <div>
      <section className="bg-cream py-16">
        <div className="container-x grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">About Us</p>
            <h1 className="text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
              Founded by an IITian, built on trust
            </h1>
            <p className="mt-5 max-w-xl text-ink/70">{company?.about?.body}</p>
          </div>
          <img
            src={img("brand-photo-laundry.png")}
            alt="Clean & Care freshly cleaned laundry"
            className="mx-auto w-full max-w-sm"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Why We Are?</p>
            <h2 className="text-3xl font-semibold text-ink">
              {company?.about?.whyWeAre?.heading}
            </h2>
            <p className="mt-5 text-ink/70">{company?.about?.whyWeAre?.body}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {(company?.about?.highlights || []).map((h) => (
              <div key={h.title} className="rounded-2xl bg-cream-light p-5">
                <p className="font-serif text-lg font-semibold text-ink">{h.title}</p>
                <p className="mt-1 text-sm text-ink/60">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="container-x text-center">
          <SectionHeading
            eyebrow="Our Address"
            title={`Visit us at our ${company?.address?.city || "Ahmedabad"} store`}
            light
          />
          <p className="mx-auto mt-6 max-w-md text-white/75">
            {company?.address?.line1}
            <br />
            {company?.address?.line2}
          </p>
          <Link to="/contact" className="btn-pill-lime mt-8 inline-flex">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { img } from "../lib/assets.js";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="container-x flex h-20 items-center justify-between">
        <NavLink to="/" className="flex items-center" onClick={() => setOpen(false)}>
          <img src={img("logo.png")} alt="Clean & Care" className="h-11 w-auto" />
        </NavLink>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium uppercase tracking-wide transition-colors hover:text-lime ${
                  isActive ? "text-lime" : "text-white/85"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/contact" className="btn-pill-lime hidden lg:inline-flex">
          Schedule Pickup
        </NavLink>

        <button
          className="text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-2 py-2.5 text-sm font-medium uppercase tracking-wide ${
                    isActive ? "bg-white/5 text-lime" : "text-white/85"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/contact" className="btn-pill-lime mt-2 justify-center">
              Schedule Pickup
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

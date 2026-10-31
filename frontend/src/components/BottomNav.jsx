import { Home, LayoutGrid, Percent, Tag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, match: (loc) => loc.pathname === "/" && loc.hash !== "#offer" },
  { to: "/services", label: "Services", icon: LayoutGrid, match: (loc) => loc.pathname === "/services" },
  { to: "/pricing", label: "Pricing", icon: Tag, match: (loc) => loc.pathname === "/pricing" },
  { to: "/#offer", label: "Offers", icon: Percent, match: (loc) => loc.pathname === "/" && loc.hash === "#offer" },
];

// Mobile-only bottom tab bar (sm:hidden mirrors the mobile-card breakpoint
// used elsewhere — Pricing/Admin tables switch at the same point).
export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-ink/10 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map(({ to, label, icon: Icon, match }) => {
        const active = match(location);
        return (
          <Link
            key={label}
            to={to}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-lime-dark" : "text-ink/50"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

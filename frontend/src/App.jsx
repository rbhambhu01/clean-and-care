import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import BottomNav from "./components/BottomNav.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { CompanyProvider } from "./context/CompanyContext.jsx";
import About from "./pages/About.jsx";
import Admin from "./pages/Admin.jsx";
import Cart from "./pages/Cart.jsx";
import Contact from "./pages/Contact.jsx";
import Feedback from "./pages/Feedback.jsx";
import Home from "./pages/Home.jsx";
import Pricing from "./pages/Pricing.jsx";
import Services from "./pages/Services.jsx";

// On a plain route change, jump to top. On a route change that carries a
// hash (e.g. the bottom nav's Offers tab, "/#offer"), scroll that section
// into view instead — plain browser hash-scroll doesn't fire on client-side
// SPA navigation, only on a full page load.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <CompanyProvider>
      <CartProvider>
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        {/* Clearance for the fixed bottom nav so it doesn't cover footer content.
            Matches BottomNav's own height (~56px content + the iOS home-indicator
            safe area), not a flat value — notched iPhones need more than 64px. */}
        <div className="lg:hidden" style={{ height: "calc(3.5rem + env(safe-area-inset-bottom))" }} />
        <BottomNav />
      </CartProvider>
    </CompanyProvider>
  );
}

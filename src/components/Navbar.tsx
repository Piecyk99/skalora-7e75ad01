import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_LINKS: [string, string][] = [
  ["Rozwiązania", "solutions"],
  ["Awatar AI", "ai-avatar"],
  ["Dla kogo", "for-whom"],
  ["FAQ", "faq"],
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      <nav
        data-testid="navbar"
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#030305]/90 backdrop-blur-xl border-b border-white/5 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div
            data-testid="navbar-logo"
            onClick={() => scrollTo("hero")}
            className="font-outfit font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 cursor-pointer select-none"
          >
            SKALORA
          </div>

          <div className="hidden md:flex items-center gap-8">
            {/* Product switcher */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <span className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-md font-medium font-manrope">
                Agencja
              </span>
              <Link
                to="/skalora-crm"
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors font-manrope"
              >
                CRM
              </Link>
            </div>
            {NAV_LINKS.map(([label, id]) => (
              <button
                key={id}
                data-testid={`nav-link-${id}`}
                onClick={() => scrollTo(id)}
                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-manrope font-medium"
              >
                {label}
              </button>
            ))}
            <button
              data-testid="nav-cta-button"
              onClick={() => scrollTo("contact")}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-manrope font-semibold px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_35px_rgba(138,43,226,0.45)] hover:scale-105 transition-all duration-300"
            >
              Umów konsultację
            </button>
          </div>

          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden text-white p-2 hover:text-cyan-400 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div
            data-testid="mobile-menu"
            className="md:hidden bg-[#0A0A10]/98 backdrop-blur-xl border-b border-white/5 px-6 py-6 flex flex-col gap-3"
          >
            {NAV_LINKS.map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-left text-zinc-300 font-manrope font-medium py-3 border-b border-white/5 hover:text-white transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("contact")}
              className="mt-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-semibold py-3.5 rounded-full text-center"
            >
              Umów konsultację
            </button>
          </div>
        )}
      </nav>

      <div className="mobile-sticky-cta md:hidden">
        <button
          data-testid="mobile-sticky-cta"
          onClick={() => scrollTo("contact")}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-manrope font-semibold py-4 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.3)] text-sm"
        >
          Umów konsultację — bezpłatnie
        </button>
      </div>
    </>
  );
}

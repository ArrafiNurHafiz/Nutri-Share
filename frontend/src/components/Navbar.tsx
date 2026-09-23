import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useHideOnScroll } from "../lib/useHideOnScroll";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/#ecosystem", label: "Ecosystem" },
  { path: "/#catalog", label: "Surplus Catalog" },
  { path: "/#protocol", label: "TOPSIS Protocol" },
  { path: "/#impact", label: "Public Impact" },
  { path: "/support", label: "Support & FAQ" },
];

export function Navbar({ onLoginClick }: { onLoginClick?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navVisible } = useHideOnScroll();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    setMobileOpen(false);

    if (path === "/") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    if (path.startsWith("/#")) {
      const targetId = path.substring(2);
      if (location.pathname !== "/") {
        navigate("/" + "#" + targetId);
        return;
      }

      const el = document.getElementById(targetId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      return;
    }

    navigate(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        } bg-white/90 backdrop-blur-xl border-b border-emerald-100 shadow-xs`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-18 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo with Original Logo Image */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare Logo"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-emerald-950 leading-tight">
                NutriShare
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">
                Nutrition-Based Food Rescue
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-emerald-50/80 p-1.5 rounded-full border border-emerald-200/60">
            {NAV_ITEMS.map((item) => {
              const isSupport = item.path === "/support";
              if (isSupport) {
                return (
                  <Link
                    key={item.path}
                    to="/support"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      location.pathname === "/support"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-emerald-900/80 hover:text-emerald-950 hover:bg-white/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.path);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    item.path === "/" && location.pathname === "/"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-emerald-900/80 hover:text-emerald-950 hover:bg-white/80"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <Link
              to="/register/donor"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-100"
            >
              <span>Join as Donor</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-emerald-900 hover:bg-emerald-50 transition-colors"
              aria-label="Open Navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-2xl border-b border-emerald-100 p-6 shadow-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1.5 mb-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path.startsWith("/#") ? "/" : item.path}
                  onClick={(e) => {
                    if (item.path.startsWith("/#") || item.path === "/") {
                      e.preventDefault();
                      handleNav(item.path);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-900 hover:bg-emerald-50 hover:text-emerald-950 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLoginClick?.();
                }}
                className="w-full py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-900 font-semibold text-xs text-center shadow-xs"
              >
                Sign In
              </button>
              <Link
                to="/register/donor"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs"
              >
                Join as Donor
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { useHideOnScroll } from "../lib/useHideOnScroll";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "#tentang", label: "About" },
  { path: "#cara-kerja", label: "How It Works" },
  { path: "#dampak", label: "Impact" },
  { path: "#pahlawan", label: "Heroes" },
];

export function Navbar({ onLoginClick }: { onLoginClick?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navVisible, isScrolled } = useHideOnScroll();
  const location = useLocation();

  const handleNav = (path: string) => {
    if (path === "/") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "/";
      }
      return;
    }

    if (path.startsWith("#")) {
      if (location.pathname !== "/") {
        window.location.href = "/" + path;
        return;
      }
      
      const targetId = path.substring(1);
      const el = document.getElementById(targetId);
      
      if (el) {
        // Offset for fixed navbar
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      return;
    }
    
    window.location.href = path;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        } ${isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={108}
              height={72}
              className="h-[72px] w-auto"
            />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-600 hover:text-primary-orange"
                    : "text-white/80 hover:text-primary-orange-light"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-3">
              <button
                onClick={onLoginClick}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                  isScrolled
                    ? "text-brand-dark border border-gray-200 hover:border-primary-orange hover:text-primary-orange"
                    : "text-white border border-white/40 hover:border-white hover:text-white"
                }`}
              >
                <LogIn size={15} /> Sign In
              </button>
              <Link
                to="/register/donor"
                className="px-4 py-2 text-sm font-medium bg-primary-orange text-white rounded-full hover:bg-primary-orange-dark transition-all shadow-sm"
              >
                Food Donation
              </Link>
            </div>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? "text-brand-dark" : "text-white"
            }`}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="flex items-center gap-2">
                  <img
                    src="/images/logoterbaru.webp"
                    alt="NutriShare"
                    width={108}
                    height={72}
                    className="h-[72px] w-auto"
                  />
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-[var(--text-secondary)]"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      handleNav(item.path);
                    }}
                    className="py-3 px-2 rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onLoginClick?.();
                    }}
                    className="text-center py-3 border border-[var(--border-primary)] rounded-full font-medium flex items-center justify-center gap-2 text-[var(--text-primary)]"
                  >
                    <LogIn size={16} /> Sign In
                  </button>
                  <Link
                    to="/register/donor"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-3 bg-primary-orange text-white rounded-full font-medium"
                  >
                    Donate Food
                  </Link>
                  <Link
                    to="/register/recipient"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-3 bg-[var(--bg-primary)] text-primary-orange border border-primary-orange rounded-full font-medium"
                  >
                    Register as Recipient
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

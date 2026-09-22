import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useHideOnScroll } from "../lib/useHideOnScroll";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/#tentang", label: "About" },
  { path: "/#cara-kerja", label: "How It Works" },
  { path: "/#dampak", label: "Impact" },
  { path: "/#pahlawan", label: "Partners" },
  { path: "/support", label: "Contact" },
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

    if (path.includes("#")) {
      const hash = path.substring(path.indexOf("#"));
      if (location.pathname !== "/") {
        window.location.href = "/" + hash;
        return;
      }

      const targetId = hash.substring(1);
      const el = document.getElementById(targetId);

      if (el) {
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
        } ${
          isScrolled
            ? "bg-[#061F16]/95 backdrop-blur-md shadow-md py-3.5"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo matching layout */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-7">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className="text-xs lg:text-[13px] font-medium text-white/90 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5 ml-2">
              <button
                type="button"
                onClick={onLoginClick}
                className="px-4 py-1.5 text-xs font-semibold rounded-full text-white bg-black/30 hover:bg-black/50 border border-white/20 transition-all cursor-pointer"
              >
                Sign In
              </button>

              <Link
                to="/register/donor"
                className="px-4 py-1.5 text-xs font-semibold bg-[#10B981] hover:bg-[#059669] text-white rounded-full transition-all shadow-sm"
              >
                Food Donation
              </Link>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#061F16] shadow-2xl p-6 flex flex-col justify-between text-white border-l border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <img
                    src="/images/logoterbaru.webp"
                    alt="NutriShare"
                    className="h-8 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-white/70 hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        handleNav(item.path);
                      }}
                      className="py-2.5 px-3 rounded-xl font-medium text-sm text-white/85 hover:bg-white/10 transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLoginClick?.();
                  }}
                  className="w-full py-2.5 bg-black/40 border border-white/20 rounded-xl font-semibold text-xs text-white flex items-center justify-center hover:bg-black/60"
                >
                  Sign In
                </button>
                <Link
                  to="/register/donor"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-semibold text-xs flex items-center justify-center shadow-sm"
                >
                  Food Donation
                </Link>
                <Link
                  to="/register/recipient"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 bg-white/10 text-[#34D399] border border-white/20 rounded-xl font-semibold text-xs flex items-center justify-center"
                >
                  Register as Recipient
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

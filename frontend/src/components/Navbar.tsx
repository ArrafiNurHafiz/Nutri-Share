import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { useHideOnScroll } from "../lib/useHideOnScroll";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/#tentang", label: "About" },
  { path: "/#cara-kerja", label: "How It Works" },
  { path: "/#dampak", label: "Impact" },
  { path: "/#pahlawan", label: "Heroes" },
  { path: "/map", label: "Peta Sebaran" },
  { path: "/support", label: "Bantuan" },
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
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E2E8F0] py-3"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={120}
              height={44}
              className="h-9 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                className={`text-xs lg:text-sm font-semibold transition-colors ${
                  isScrolled
                    ? "text-[#475569] hover:text-[#2D7A4F]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLoginClick}
                className={`px-4 py-2 text-xs lg:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  isScrolled
                    ? "text-[#0F172A] border border-[#CBD5E1] hover:bg-[#F8FAFC]"
                    : "text-white border border-white/40 hover:bg-white/10"
                }`}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>

              <Link
                to="/register/donor"
                className="px-5 py-2 text-xs lg:text-sm font-bold bg-[#10B981] hover:bg-[#059669] text-white rounded-full transition-all shadow-sm shadow-[#10B981]/20 btn-hover-effect"
              >
                Food Donation
              </Link>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer ${
              isScrolled ? "text-[#0F172A] hover:bg-[#F1F5F9]" : "text-white hover:bg-white/10"
            }`}
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
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#F1F5F9]">
                  <img
                    src="/images/logoterbaru.webp"
                    alt="NutriShare"
                    className="h-8 w-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileOpen(false);
                        handleNav(item.path);
                      }}
                      className="py-2.5 px-3 rounded-xl font-bold text-sm text-[#334155] hover:bg-[#F1F5F9] transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-[#F1F5F9] space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLoginClick?.();
                  }}
                  className="w-full py-2.5 border border-[#CBD5E1] rounded-xl font-bold text-xs text-[#0F172A] flex items-center justify-center gap-1.5 hover:bg-[#F8FAFC]"
                >
                  <LogIn size={15} /> Sign In
                </button>
                <Link
                  to="/register/donor"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs flex items-center justify-center shadow-sm"
                >
                  Food Donation
                </Link>
                <Link
                  to="/register/recipient"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-xl font-bold text-xs flex items-center justify-center"
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

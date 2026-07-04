import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, Moon, Sun } from "lucide-react";
import { useHideOnScroll } from "../lib/useHideOnScroll";
import { useTheme } from "../lib/useTheme";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { path: "/", label: "Beranda" },
  { path: "/tentang", label: "Tentang" },
  { path: "/cara-kerja", label: "Cara Kerja" },
  { path: "/dampak", label: "Dampak" },
  { path: "/pahlawan", label: "Pahlawan" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navVisible, isScrolled } = useHideOnScroll();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
        navVisible ? "translate-y-0" : "-translate-y-full"
      } ${isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-[#2D7A4F] flex items-center gap-2">
            <Heart className="fill-current text-[#52C77F]" /> NUTRI-SHARE
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-[#2D7A4F] font-semibold border-b-2 border-[#2D7A4F]"
                    : "text-gray-600 hover:text-[#2D7A4F]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={toggle} className="p-2 text-gray-500 hover:text-[#2D7A4F] transition-colors" title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex gap-3 ml-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:border-[#2D7A4F] hover:text-[#2D7A4F] transition-all">
                Masuk
              </Link>
              <Link to="/register/donor" className="px-4 py-2 text-sm font-medium bg-[#2D7A4F] text-white rounded-full hover:bg-opacity-90 transition-all shadow-sm">
                Donasi Pangan
              </Link>
            </div>
          </div>

          {/* Mobile button */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600">
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
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-[#2D7A4F] flex items-center gap-2">
                  <Heart className="fill-current text-[#52C77F]" size={20} /> NUTRI-SHARE
                </span>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`py-3 px-2 rounded-lg font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-[#2D7A4F] font-bold bg-[#E8F5E9]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 flex items-center justify-between px-2">
                  <button onClick={toggle} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2D7A4F] transition-colors">
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center py-3 border border-gray-300 rounded-full font-medium">
                    Masuk
                  </Link>
                  <Link to="/register/donor" onClick={() => setMobileOpen(false)} className="text-center py-3 bg-[#2D7A4F] text-white rounded-full font-medium">
                    Donasi Pangan
                  </Link>
                  <Link to="/register/recipient" onClick={() => setMobileOpen(false)} className="text-center py-3 bg-white text-[#2D7A4F] border border-[#2D7A4F] rounded-full font-medium">
                    Daftar Penerima
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

import { Link, useLocation } from "react-router-dom";
import type { MouseEvent } from "react";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/#ecosystem", label: "Three-Pillar Ecosystem" },
  { to: "/#catalog", label: "Surplus Food Catalog" },
  { to: "/#protocol", label: "TOPSIS Workflow" },
  { to: "/#impact", label: "Public Impact" },
  { to: "/support", label: "Help & Support" },
];

const JOIN_LINKS = [
  { to: "/register/donor", label: "Register as Donor" },
  { to: "/register/recipient", label: "Register as Recipient" },
  { to: "/login", label: "Sign In" },
  { to: "/map", label: "Interactive GIS Map" },
];

export function Footer() {
  const location = useLocation();

  const handleAnchor = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      const hash = href.substring(href.indexOf("#"));
      if (location.pathname !== "/") {
        window.location.href = "/" + hash;
        return;
      }
      e.preventDefault();
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-emerald-950 text-white overflow-hidden border-t border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-emerald-800/80">

          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/images/logoterbaru.webp"
                alt="NutriShare Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                NutriShare
              </span>
            </Link>

            <p className="text-sm text-emerald-200/80 leading-relaxed max-w-sm font-normal">
              Integrated surplus food rescue platform powered by <strong>Hybrid Shannon Entropy - TOPSIS</strong> for fair, fast, and transparent nutrient distribution across D.I. Yogyakarta.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Page Directory
            </h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  {link.to.includes("#") ? (
                    <a
                      href={link.to}
                      onClick={(e) => handleAnchor(e, link.to)}
                      className="text-emerald-200/70 hover:text-white transition-colors block"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-emerald-200/70 hover:text-white transition-colors block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Access Portals */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Access Portals
            </h4>
            <ul className="space-y-2 text-sm">
              {JOIN_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-emerald-200/70 hover:text-white transition-colors block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-4">
          <div>
            &copy; {new Date().getFullYear()} NutriShare Initiative. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Zero Food Waste Initiative</span>
            <span>&bull;</span>
            <span className="text-[#e1fcad] font-medium">D.I. Yogyakarta Pilot</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

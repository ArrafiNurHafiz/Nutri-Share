import { Link, useLocation } from "react-router-dom";
import type { MouseEvent, SyntheticEvent } from "react";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { TuguJogjaIllustration } from "./sections/EcoVisuals";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/#tentang", label: "About" },
  { to: "/#cara-kerja", label: "How It Works" },
  { to: "/#dampak", label: "Impact" },
  { to: "/#pahlawan", label: "Partners" },
  { to: "/support", label: "Contact" },
];

const JOIN_LINKS = [
  { to: "/register/donor", label: "Register as Donor" },
  { to: "/register/recipient", label: "Register as Recipient" },
  { to: "/login", label: "Sign In" },
];

export function Footer() {
  const location = useLocation();

  const handleAnchor = (e: MouseEvent, href: string) => {
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
    <footer className="relative bg-[#061F16] text-white/80 overflow-hidden border-t border-[#093527]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-white/10 items-start">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-3.5">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/images/logoterbaru.webp"
                alt="NutriShare"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Food surplus distribution platform powered by <strong>Entropy-TOPSIS</strong> for fair and targeted allocation.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={13} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={13} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={13} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  {link.to.includes("#") ? (
                    <a
                      href={link.to}
                      onClick={(e: MouseEvent) => handleAnchor(e, link.to)}
                      className="text-white/70 hover:text-[#34D399] transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-white/70 hover:text-[#34D399] transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Join CTA Links */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Join
            </h4>
            <ul className="space-y-2 text-xs">
              {JOIN_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-[#34D399] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tugu Jogja Vector Artwork */}
          <div className="lg:col-span-3 flex items-center justify-end">
            <div className="space-y-1 text-right">
              <p className="text-[11px] font-semibold text-white/90 inline-flex items-center gap-1">
                <span className="text-[#34D399]">🌱</span> Let's Build
              </p>
              <p className="text-[11px] font-normal text-white/60">
                a Zero Food Waste Future
              </p>
              <TuguJogjaIllustration className="ml-auto opacity-90 mt-1" />
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/50">
          <p>&copy; 2026 NutriShare. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/support" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/support" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link, useLocation } from "react-router-dom";
import type { MouseEvent } from "react";
import { LeafDeco, TuguJogjaIllustration } from "./sections/EcoVisuals";
import { Instagram, Linkedin, Youtube, Heart, MapPin } from "lucide-react";

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
    <footer className="relative bg-[#062319] text-white/80 overflow-hidden border-t border-[#0A3828]">
      {/* Ambient background Leaf Deco */}
      <LeafDeco className="absolute bottom-0 right-0 w-80 h-80 opacity-5 text-[#34D399]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10 items-start">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/images/logoterbaru.webp"
                alt="NutriShare"
                width={120}
                height={44}
                className="h-9 w-auto bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/20"
              />
              <span className="text-xl font-extrabold tracking-tight font-heading text-white">
                NutriShare
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              Food surplus distribution platform powered by <strong>Hybrid Entropy-TOPSIS</strong> for fair and targeted nutrition allocation in Yogyakarta.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#10B981] text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#34D399] font-heading">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  {link.to.includes("#") ? (
                    <a
                      href={link.to}
                      onClick={(e) => handleAnchor(e, link.to)}
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
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#34D399] font-heading">
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

          {/* Tugu Jogja Eco Badge Illustration */}
          <div className="lg:col-span-3 bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
            <TuguJogjaIllustration className="shrink-0" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-wider block">
                Let's Build
              </span>
              <p className="text-xs font-bold text-white leading-snug">
                a Zero Food Waste Future in DIY
              </p>
              <p className="text-[10px] text-white/50">
                Pangan Bergizi untuk Generasi Indonesia Emas.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} NutriShare. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/support" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/support" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

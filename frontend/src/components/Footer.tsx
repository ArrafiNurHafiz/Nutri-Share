import { Link, useLocation } from "react-router-dom";
import type { MouseEvent } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "#tentang", label: "About" },
  { to: "#cara-kerja", label: "How It Works" },
  { to: "#dampak", label: "Impact" },
  { to: "#pahlawan", label: "Heroes" },
];

const JOIN_LINKS = [
  { to: "/register/donor", label: "Register Donor" },
  { to: "/register/recipient", label: "Register Recipient" },
  { to: "/login", label: "Sign In" },
];

export function Footer() {
  const location = useLocation();

  const handleAnchor = (e: MouseEvent, href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        window.location.href = href;
        return;
      }
      e.preventDefault();
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#161d1f] text-white/80">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={108}
              height={72}
              className="h-[72px] w-auto"
            />
          </div>
          <p className="text-sm leading-relaxed max-w-sm text-white/70">
            Food surplus distribution platform powered by Hybrid Entropy-TOPSIS
            for fair and targeted allocation.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                {link.to.startsWith("#") ? (
                  <a
                    href={link.to}
                    onClick={(e) => handleAnchor(e, link.to)}
                    className="hover:text-primary-orange transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="hover:text-primary-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Join</h4>
          <ul className="space-y-2 text-sm">
            {JOIN_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="hover:text-primary-orange transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-4 text-sm text-white/50">
        &copy; {new Date().getFullYear()} NUTRI-SHARE.
      </div>
    </footer>
  );
}

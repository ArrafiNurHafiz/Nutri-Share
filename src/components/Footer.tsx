import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang" },
  { to: "/cara-kerja", label: "Cara Kerja" },
  { to: "/dampak", label: "Dampak" },
  { to: "/pahlawan", label: "Pahlawan" },
];

const JOIN_LINKS = [
  { to: "/register/donor", label: "Daftar Donor" },
  { to: "/register/recipient", label: "Daftar Penerima" },
  { to: "/login", label: "Masuk" },
];

export function Footer() {
  return (
    <footer className="bg-[#1a5a3e] text-white/80">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 mb-4">
            <Heart className="fill-current text-[#52C77F]" /> NUTRI-SHARE
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Platform distribusi surplus pangan berbasis Hybrid Entropy-TOPSIS untuk alokasi yang adil dan tepat sasaran.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Navigasi</h4>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-[#52C77F] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Bergabung</h4>
          <ul className="space-y-2 text-sm">
            {JOIN_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-[#52C77F] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 max-w-7xl mx-auto px-6 py-4 text-sm text-white/50">
        © {new Date().getFullYear()} NUTRI-SHARE.
      </div>
    </footer>
  );
}

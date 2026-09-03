import {
  Heart,
  HandHeart,
  PackageSearch,
  Truck,
  BarChart3,
  Search,
  Settings,
  LifeBuoy,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: HandHeart },
  { key: "donations", label: "Donations", icon: PackageSearch },
  { key: "recipients", label: "Recipients", icon: Heart },
  { key: "logistics", label: "Logistics", icon: Truck },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function DonorSidebar({ activeTab, setActiveTab, mobileOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-brand-dark flex flex-col py-6 px-4 z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-10 px-2">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={108}
              height={72}
              className="h-[72px] w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-white">NutriShare</h1>
              <p className="text-[10px] text-brand-light uppercase tracking-wider font-semibold">
                Donor Portal
              </p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white p-1">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary-orange/20 text-primary-orange"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="pt-6 border-t border-white/10">
          <button className="w-full bg-primary-orange/20 hover:bg-primary-orange/30 text-primary-orange py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm">
            <Search size={18} /> Browse Map
          </button>
          <div className="mt-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-white/50 hover:text-white/80 transition-colors text-sm rounded-lg">
              <Settings size={16} /> Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-white/50 hover:text-white/80 transition-colors text-sm rounded-lg">
              <LifeBuoy size={16} /> Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "motion/react"
import { SEO } from "../components/SEO";
import { Heart, ArrowRight, Menu, X, Award, Star, Trophy, Medal, TrendingUp, Users, ShoppingBag, Hotel, Search, Quote, Filter } from "lucide-react";
import { api } from "../lib/api";
import hotelLogo from "../assets/images/hotel_logo_1781548674916.webp";
import restaurantLogo from "../assets/images/restaurant_logo_1781548689113.webp";
import cafeLogo from "../assets/images/cafe_logo_1781548701950.webp";

function AnimatedCounter({ target, suffix = "", className = "" }: { target: number; suffix?: string; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !done.current) {
        done.current = true;
        const duration = 1500, steps = 60, increment = target / steps;
        let current = 0;
        const timer = setInterval(() => { current += increment; if (current >= target) { setCount(target); clearInterval(timer); } else setCount(Math.floor(current)); }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <div ref={ref} className={`text-5xl font-bold mb-2 font-mono drop-shadow-md ${className}`}>{count}{suffix}</div>;
}

export default function Heroes() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  
  useEffect(() => {
    api.fetchJSON("/api/public/top-donors").then(data => { setTopDonors(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const getLogo = (type: string, logoUrl?: string) => {
    if (logoUrl) return logoUrl;
    const logos: Record<string, string> = { hotel: hotelLogo, restoran: restaurantLogo, kafe: cafeLogo };
    return logos[type] || "";
  };

  const filtered = filter === "all" ? topDonors : topDonors.filter(d => d.type === filter);
  const NavLink = ({ to, children }: { to: string; children: ReactNode }) => (<Link to={to} className="text-sm font-medium text-gray-600 hover:text-[#2D7A4F] transition-colors">{children}</Link>);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2C2C] font-sans">
      <Navbar />
      <SEO title="Heroes" />
      <SEO title="Heroes" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-[#1e293b] dark:via-[#0f172a] dark:to-[#1e293b]" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#F5A623]/20 px-4 py-2 rounded-full text-sm font-bold text-[#F5A623] mb-6 shadow-sm"><Award size={16} /> Setiap Donor Adalah Pahlawan</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Pahlawan <span className="text-[#F5A623]">Pangan</span></h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Apresiasi untuk para pahlawan pangan — hotel, restoran, dan kafe yang telah berkontribusi aktif mendistribusikan surplus pangan bergizi kepada mereka yang membutuhkan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      {!loading && topDonors.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 mt-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Donasi", value: topDonors.reduce((a: number, d: any) => a + (d.total_donations || 0), 0), icon: TrendingUp, color: "text-[#2D7A4F]", bg: "bg-[#E8F5E9]" },
              { label: "Donor Aktif", value: topDonors.length, icon: Users, color: "text-[#1565C0]", bg: "bg-[#E3F2FD]" },
              { label: "Rating Rata-rata", value: topDonors.filter(d => d.review_count > 0).length ? (topDonors.reduce((a: number, d: any) => a + parseFloat(d.rating || "0"), 0) / topDonors.filter(d => d.review_count > 0).length).toFixed(1) : "—", icon: Star, color: "text-[#F5A623]", bg: "bg-[#FFF8E1]" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 text-center min-h-[120px] flex flex-col items-center justify-center"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}><item.icon size={20} className={item.color} /></div>
                <div className={`text-xl md:text-2xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Filter */}
      {!loading && topDonors.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            {[["all", "Semua"], ["hotel", "Hotel"], ["restoran", "Restoran"], ["kafe", "Kafe"]].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === key ? "bg-[#F5A623] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-[#F5A623]"}`}
              >{label}</button>
            ))}
          </div>
        </section>
      )}

      {/* Donors Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-2xl skeleton-shimmer border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">Belum Ada Data</h3>
            <p className="text-sm text-gray-400 mt-2">Belum ada donor yang terdaftar atau mendonasikan pangan.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {filtered.map((donor, idx) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  key={idx} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm relative overflow-hidden card-hover group w-full sm:w-[300px]"
                >
                {/* Rank badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                  idx === 0 ? "bg-gradient-to-r from-[#F5A623] to-[#F9A825]" :
                  idx === 1 ? "bg-gradient-to-r from-[#90A4AE] to-[#B0BEC5]" :
                  idx === 2 ? "bg-gradient-to-r from-[#A1887F] to-[#BCAAA4]" : "bg-gray-400"
                }`}>
                  {idx === 0 ? <Trophy size={12} /> : idx === 1 ? <Medal size={12} /> : idx === 2 ? <Award size={12} /> : null}
                  Rank #{idx + 1}
                </div>

                {/* Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#F7F4EE] to-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-[#2D7A4F] mb-4 shadow-sm overflow-hidden border-2 border-gray-100 group-hover:border-[#F5A623] transition-all duration-300">
                  {getLogo(donor.type, donor.logo_url) ? (
                    <img src={getLogo(donor.type, donor.logo_url)} alt={donor.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <Hotel size={28} className="text-gray-400" />
                  )}
                </div>

                {/* Name & type */}
                <h3 className="font-bold text-lg mb-0.5 group-hover:text-[#2D7A4F] transition-colors">{donor.business_name}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-1">
                  {donor.type === "hotel" ? <Hotel size={12} /> : donor.type === "restoran" ? <ShoppingBag size={12} /> : <Search size={12} />}
                  {donor.type}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="bg-[#E8F5E9] rounded-xl py-2 px-4 inline-block font-mono font-bold text-[#2D7A4F] text-lg">
                    {donor.total_donations}
                  </div>
                  <span className="text-xs text-gray-400">donasi</span>
                </div>

                {/* Rating */}
                {donor.review_count > 0 ? (
                  <div className="flex items-center justify-center gap-1 text-[#F5A623] text-sm font-bold bg-[#FFF8E1] px-3 py-1.5 rounded-full border border-[#FFECB3] w-fit mx-auto">
                    <Star size={14} fill="currentColor" /> {donor.rating}
                    <span className="text-gray-400 font-normal">({donor.review_count} ulasan)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Star size={14} /> Belum ada ulasan
                  </div>
                )}
              </motion.div>
            ))}
            </div>
          </>
        )}
      </section>

      {/* Join CTA */}
      <section className="bg-gradient-to-r from-[#F5A623] to-[#F9A825] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Trophy size={48} className="text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ingin Jadi Pahlawan Pangan?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">Daftarkan bisnis Anda sekarang dan mulai berkontribusi. Setiap donasi Anda akan menginspirasi yang lain!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/donor" className="px-6 py-3 bg-white text-[#F5A623] rounded-full font-bold hover:bg-gray-100 transition-all shadow-md flex items-center gap-2 justify-center">Daftar Donor <ArrowRight size={18} /></Link>
              <Link to="/register/recipient" className="px-6 py-3 bg-transparent text-white border-2 border-white/50 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2 justify-center">Daftar Penerima</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

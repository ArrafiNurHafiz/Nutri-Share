import { Link } from "react-router-dom";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import { Heart, ArrowRight, Menu, X, TrendingUp, Users, Leaf, Award, Globe, BarChart3, Target, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
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
  return <div ref={ref} className="text-5xl font-bold mb-2 font-mono drop-shadow-md">{count}{suffix}</div>;
}

export default function Impact() {
  const NavLink = ({ to, children }: { to: string; children: ReactNode }) => (<Link to={to} className="text-sm font-medium text-gray-600 hover:text-[#2D7A4F] transition-colors">{children}</Link>);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2C2C] font-sans">
      <Navbar />
      <SEO title="Impact" />
      <SEO title="Impact" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D7A4F]/10 via-transparent to-[#1565C0]/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Dampak <span className="text-[#2D7A4F]">Nyata</span></h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Bersama kita mewujudkan perubahan nyata — mengurangi food waste, meningkatkan gizi masyarakat, dan mendukung pencapaian Sustainable Development Goals.</p>
          </motion.div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { target: 1200, suffix: "+", label: "Kg Food Waste Terselamatkan", icon: Leaf },
            { target: 850, suffix: "", label: "Anak & Lansia Terbantu", icon: Users },
            { target: 45, suffix: "+", label: "Mitra HoReKa", icon: Award },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 card-hover"
            >
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon size={32} className="text-[#2D7A4F]" />
              </div>
              <AnimatedCounter target={item.target} suffix={item.suffix} />
              <div className="text-gray-500 font-medium">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Masalah vs Solusi</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Bagaimana NUTRI-SHARE menjawab tantangan food waste dan malnutrisi.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-[#E53935] flex items-center gap-2"><span className="w-3 h-3 bg-[#E53935] rounded-full" /> Tantangan</h3>
            {[
              "FLW Indonesia mencapai 23-48 juta ton/tahun — kerugian Rp213-551 triliun",
              "Hidden hunger: kekurangan protein dan mikronutrien pada kelompok rentan",
              "Distribusi bantuan tidak merata — first-come-first-served tidak tepat sasaran",
              "Sektor HoReKa di DIY menyumbang pangan berlebih signifikan",
              "Belum ada sistem yang mengintegrasikan standar AKG dalam distribusi"
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.05 }}
                className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-gray-700 flex items-start gap-3"
              >
                <span className="w-5 h-5 bg-[#E53935] text-white text-[10px] rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold">{i+1}</span>
                {t}
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-[#2D7A4F] flex items-center gap-2"><span className="w-3 h-3 bg-[#2D7A4F] rounded-full" /> Solusi NUTRI-SHARE</h3>
            {[
              "Platform digital yang menghubungkan surplus pangan dengan penerima terverifikasi",
              "Hybrid Entropy-TOPSIS untuk alokasi berbasis kebutuhan gizi, bukan kecepatan",
              "Standar AKG (Permenkes No. 28/2019) sebagai parameter utama distribusi",
              "Verifikasi admin 100% untuk memastikan tepat sasaran",
              "Live tracking pengiriman dan sistem review untuk transparansi penuh"
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.05 }}
                className="bg-green-50 border border-green-100 p-4 rounded-xl text-sm text-gray-700 flex items-start gap-3"
              >
                <CheckCircle size={18} className="text-[#2D7A4F] shrink-0 mt-0.5" />
                {s}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Visual */}
      <div className="max-w-5xl mx-auto px-6 -mb-8">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img src="/images/healthy-food.jpg" alt="SDGs Impact" className="w-full h-48 object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        </div>
      </div>
    
      {/* SDGs */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-sm font-bold text-[#1565C0] uppercase tracking-wider">Dampak Global</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Kontribusi pada SDGs</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">NUTRI-SHARE berkontribusi langsung pada pencapaian Tujuan Pembangunan Berkelanjutan.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { sdg: "SDG 2", title: "Zero Hunger", desc: "Menghilangkan kelaparan dengan menyalurkan pangan bergizi ke kelompok rentan yang membutuhkan. Setiap donasi dihitung kandungan gizinya untuk memenuhi standar AKG.", color: "bg-[#D4A843]", items: ["Menurunkan prevalensi kekurangan gizi", "Memenuhi kebutuhan gizi harian penerima", "Distribusi tepat sasaran berdasarkan urgensi"] },
              { sdg: "SDG 12", title: "Responsible Consumption & Production", desc: "Mengurangi food waste melalui distribusi surplus pangan dari sektor HoReKa. Mendukung ekonomi sirkular dan pola konsumsi berkelanjutan.", color: "bg-[#C6972F]", items: ["Mengurangi limbah pangan hingga 45+ ton", "Mendorong pola konsumsi bertanggung jawab", "Menghubungkan surplus dengan kebutuhan"] },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
                className="bg-[#F7F4EE] rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>{item.sdg}</div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {item.items.map((li, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-center gap-2"><CheckCircle size={14} className="text-[#2D7A4F]" />{li}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Dampak untuk Semua Pihak</h2>
          <p className="text-gray-500 max-w-lg mx-auto">NUTRI-SHARE memberikan manfaat bagi setiap aktor dalam ekosistem distribusi pangan.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Award, title: "Untuk Donor (HoReKa)", color: "text-[#2D7A4F]", bg: "bg-[#E8F5E9]", items: ["Kurangi biaya pembuangan food waste", "Tingkatkan citra kepedulian sosial", "Dapatkan rating dan ulasan positif", "Kontribusi nyata ke SDGs"] },
            { icon: Users, title: "Untuk Penerima (Panti)", color: "text-[#1565C0]", bg: "bg-[#E3F2FD]", items: ["Akses pangan bergizi gratis", "Prioritas berdasarkan urgensi kebutuhan", "Pemantauan asupan gizi harian (AKG)", "Proses klaim yang transparan"] },
            { icon: Globe, title: "Untuk Masyarakat", color: "text-[#F5A623]", bg: "bg-[#FFF8E1]", items: ["Pengurangan limbah pangan nasional", "Peningkatan kesehatan masyarakat", "Efisiensi distribusi bantuan sosial", "Ekonomi sirkular yang berkelanjutan"] },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
            >
              <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-4`}><item.icon size={28} className={item.color} /></div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <ul className="space-y-2">
                {item.items.map((li, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle size={14} className={`${item.color} shrink-0 mt-0.5`} /> {li}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2D7A4F] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Jadi Bagian dari Perubahan</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">Setiap donasi berarti. Setiap porsi makanan yang tersalurkan adalah langkah menuju Indonesia yang lebih sehat dan berkelanjutan.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/donor" className="px-6 py-3 bg-white text-[#2D7A4F] rounded-full font-bold hover:bg-gray-100 transition-all shadow-md flex items-center gap-2 justify-center">Mulai Donasi <ArrowRight size={18} /></Link>
              <Link to="/register/recipient" className="px-6 py-3 bg-transparent text-white border-2 border-white/50 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2 justify-center">Daftar Penerima</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

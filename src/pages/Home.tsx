import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Shield, ArrowRight, Award, Star, Upload, Truck, BarChart3, GraduationCap } from "lucide-react";
import { api } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";

import heroImg from "../assets/images/hero_food_donation_1781547580796.webp";
import hotelLogo from "../assets/images/hotel_logo_1781548674916.webp";
import restaurantLogo from "../assets/images/restaurant_logo_1781548689113.webp";
import cafeLogo from "../assets/images/cafe_logo_1781548701950.webp";
import impactImg from "../assets/images/impact_image_1781550893332.webp";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-5xl font-bold mb-2 font-mono drop-shadow-md">
      {count}{suffix}
    </div>
  );
}

export default function Home() {
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.fetchJSON("/api/public/top-donors").then(setTopDonors).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2C2C] font-sans">
      <Navbar />
      <SEO title="Beranda" />
      <SEO title="Beranda" />

      {/* Hero */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D7A4F]/5 via-transparent to-[#1565C0]/5" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Makanan Bergizi Sampai ke <span className="text-[#2D7A4F]">Yang Paling Membutuhkan</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              Platform distribusi pangan surplus HoReKa berbasis <strong>Hybrid Entropy-TOPSIS</strong> untuk menentukan panti asuhan dan entitas sosial prioritas berdasarkan kebutuhan Gizi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register/donor" className="px-6 py-3 font-medium bg-gradient-to-r from-[#2D7A4F] to-[#52C77F] text-white rounded-full hover:shadow-lg hover:shadow-[#2D7A4F]/30 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all shadow-md">
                Daftar sebagai Donor <ArrowRight size={18} />
              </Link>
              <Link to="/register/recipient" className="px-6 py-3 font-medium bg-white text-[#2D7A4F] border border-[#2D7A4F] rounded-full hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all">
                Daftar sebagai Penerima
              </Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="absolute inset-0 bg-[#2D7A4F] blur-3xl opacity-20 transform scale-90 translate-y-8 rounded-full"></div>
            <img src={heroImg} alt="Distribusi Makanan Sehat" className="relative rounded-[2.5rem] shadow-xl border-4 border-white object-cover w-full aspect-square md:aspect-[4/3] transform transition hover:scale-[1.02] duration-500" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
      </section>

      {/* Tentang / Fitur */}
      <section id="tentang" className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
          <div className="w-16 h-16 shrink-0 bg-[#E8F5E9] text-[#2D7A4F] rounded-2xl flex items-center justify-center">
            <Search size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Smart Allocation</h3>
            <p className="text-gray-500">Bukan siapa cepat dia dapat. Algoritma kami secara cerdas mendistribusikan donasi dengan menghitung jarak, kandungan gizi, dan urgency masing-masing penerima secara real-time.</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
          <div className="w-16 h-16 shrink-0 bg-[#E3F2FD] text-[#1565C0] rounded-2xl flex items-center justify-center">
            <Shield size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Terverifikasi 100%</h3>
            <p className="text-gray-500">Semua entitas sosial diverifikasi secara manual oleh admin kami untuk memastikan distribusi tepat sasaran tanpa penyalahgunaan wewenang.</p>
          </div>
        </motion.div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-sm font-bold text-[#1565C0] uppercase tracking-wider">Cara Kerja</span>
          <h2 className="text-3xl font-bold mt-2 mb-3">Bagaimana Cara Kerjanya?</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Tiga langkah mudah untuk menyalurkan surplus pangan ke yang membutuhkan.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-[#E8F5E9] -z-0" />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="text-center relative z-10">
            <div className="w-16 h-16 bg-[#2D7A4F] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative">
              <Upload size={28} />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#F5A623] text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Donor Publikasi</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Hotel, restoran, atau kafe mendaftarkan surplus pangan bergizi lengkap dengan informasi kandungan gizi dan lokasi.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.15 }} className="text-center relative z-10">
            <div className="w-16 h-16 bg-[#1565C0] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative">
              <BarChart3 size={28} />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#F5A623] text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">TOPSIS Alokasi</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Hybrid Entropy-TOPSIS menghitung prioritas penerima berdasarkan urgensi, jarak, kebutuhan gizi, dan riwayat donasi.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.3 }} className="text-center relative z-10">
            <div className="w-16 h-16 bg-[#F5A623] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative">
              <Truck size={28} />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#F5A623] text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Kurir Antar & Verifikasi</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Donasi diantarkan ke lembaga penerima dengan live tracking. Kedua pihak konfirmasi serah terima untuk transparansi penuh.</p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
          <Link to="/cara-kerja" className="inline-flex items-center gap-2 text-sm font-bold text-[#2D7A4F] hover:underline">Pelajari Selengkapnya <ArrowRight size={16} /></Link>
        </motion.div>
      </section>

      {/* Impact Stats */}
      <motion.section id="dampak" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative py-24 mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <img src={impactImg} alt="Community Impact" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-[#2D7A4F]/80 mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center text-white mb-10">
            <span className="text-sm font-bold text-white/60 uppercase tracking-wider">Dampak</span>
            <h2 className="text-3xl font-bold mt-2 mb-2">Dampak Nyata</h2>
            <p className="text-white/70">Bersama kita sudah mencapai</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <AnimatedCounter target={1200} suffix="+" />
              <div className="text-white/80 font-medium">Kg Food Waste Terselamatkan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <AnimatedCounter target={850} />
              <div className="text-white/80 font-medium">Anak & Lansia Terbantu</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <AnimatedCounter target={45} />
              <div className="text-white/80 font-medium">Mitra HoReKa</div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/dampak" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors">Lihat Dampak Lengkap <ArrowRight size={16} /></Link>
          </div>
        </div>
      </motion.section>

      {/* Top Donors */}
      {topDonors.length > 0 && (
        <section id="pahlawan" className="bg-white pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <span className="text-sm font-bold text-[#F5A623] uppercase tracking-wider">Apresiasi</span>
              <h2 className="text-3xl font-bold mt-2 mb-4 flex items-center justify-center gap-3"><Award className="text-[#F5A623]" size={36} /> Pahlawan Pangan Bulan Ini</h2>
              <p className="text-gray-500">Apresiasi untuk donor yang paling aktif mendistribusikan surplus pangan bergizi.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topDonors.map((donor, idx) => (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: idx * 0.1 }} key={idx} className="bg-[#F7F4EE] rounded-2xl p-6 text-center border shadow-sm relative overflow-hidden transform transition hover:-translate-y-1 hover:shadow-md">
                  {idx === 0 && <div className="absolute top-0 right-0 bg-[#F5A623] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Rank #1</div>}
                  <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-[#2D7A4F] mb-4 shadow-sm overflow-hidden">
                    <img
                      src={
                        donor.type === 'hotel' ? hotelLogo :
                        donor.type === 'restoran' ? restaurantLogo :
                        donor.type === 'kafe' ? cafeLogo :
                        donor.logo_url || 'https://via.placeholder.com/64'
                      }
                      alt={donor.business_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{donor.business_name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">{donor.type}</p>
                  <div className="bg-white rounded-xl py-2 px-4 inline-block font-mono font-bold text-[#2D7A4F]">
                    {donor.total_donations} Donasi
                  </div>
                  {donor.review_count > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-[#F5A623] text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {donor.rating} ({donor.review_count})
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

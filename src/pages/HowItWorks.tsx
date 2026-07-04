import { Link } from "react-router-dom";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import { Heart, Upload, BarChart3, Truck, ArrowRight, Menu, X, CheckCircle, Search, Shield, ClipboardList, UserCheck, MapPin } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function HowItWorks() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ to, children }: { to: string; children: ReactNode }) => (
    <Link to={to} className="text-sm font-medium text-gray-600 hover:text-[#2D7A4F] transition-colors">{children}</Link>
  );

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2C2C] font-sans">
      <Navbar />
      <SEO title="Cara Kerja" description="Tiga langkah mudah untuk menyalurkan surplus pangan ke yang membutuhkan" />

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-[#F0FDF4]/80 dark:bg-[#0f172a] dark:border-b dark:border-[#1e293b]">
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Bagaimana <span className="text-[#2D7A4F]">Cara Kerjanya?</span></h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Tiga langkah mudah untuk menyalurkan surplus pangan ke yang membutuhkan — dari publikasi donasi hingga serah terima dengan transparansi penuh.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The 3 Steps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="space-y-16">
          {[
            {
              step: 1, title: "Donor Publikasi Surplus Pangan",
              icon: Upload, color: "bg-[#2D7A4F]", light: "bg-[#E8F5E9] dark:bg-[#0d2818]", textColor: "text-[#2D7A4F]",
              img: "donor",
              desc: "Hotel, restoran, atau kafe mendaftarkan surplus pangan bergizi lengkap dengan informasi kandungan gizi dan lokasi.",
              details: [
                "Donor login ke dashboard dan mengisi form donasi",
                "Informasi yang dicatat: nama makanan, jumlah porsi, protein, kalori, zat besi, vitamin C",
                "Donor memilih lokasi pickup di peta interaktif",
                "Sistem mencatat batas waktu layak konsumsi makanan",
                "Donasi langsung dipublikasikan dan masuk ke sistem antrian TOPSIS"
              ]
            },
            {
              step: 2, title: "Hybrid Entropy-TOPSIS Alokasi Cerdas",
              icon: BarChart3, color: "bg-[#1565C0]", light: "bg-[#E3F2FD] dark:bg-[#0a1628]", textColor: "text-[#1565C0]",
              img: "topsis",
              desc: "Sistem secara otomatis menghitung peringkat penerima berdasarkan 5 kriteria prioritas menggunakan algoritma Hybrid Entropy-TOPSIS.",
              details: [
                "Shannon Entropy menghitung bobot kriteria secara objektif",
                "TOPSIS menentukan peringkat berdasarkan jarak solusi ideal",
                "5 kriteria: Densitas Nutrisi, Urgensi Kesehatan, Kelayakan Pangan, Jangkauan Lokasi, Riwayat Bantuan",
                "Peringkat #1 mendapatkan prioritas untuk melakukan klaim",
                "Admin dapat melihat dan memverifikasi hasil perhitungan secara transparan"
              ]
            },
            {
              step: 3, title: "Kurir Antar & Verifikasi Serah Terima",
              icon: Truck, color: "bg-[#F5A623]", light: "bg-[#FFF8E1] dark:bg-[#1a1408]", textColor: "text-[#F5A623]",
              img: "delivery",
              desc: "Donasi diantarkan ke lembaga penerima dengan live tracking. Kedua pihak konfirmasi serah terima untuk transparansi penuh.",
              details: [
                "Admin menyetujui klaim dari penerima prioritas #1",
                "Status donasi berubah menjadi 'claimed' dan kurir dijadwalkan",
                "Penerima bisa melacak posisi kurir secara live di peta",
                "Donor mengkonfirmasi kedatangan kurir di tempat pickup",
                "Serah terima dikonfirmasi oleh donor — donasi selesai"
              ]
            }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="grid md:grid-cols-5 gap-8 items-center"
            >
              <div className={`md:col-span-2 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <div className={`${item.light} rounded-2xl p-8 text-center border`}>
                  <div className={`w-24 h-24 ${item.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative`}>
                    <item.icon size={40} />
                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-white dark:bg-[#2D7A4F] text-gray-800 dark:text-white text-sm rounded-full flex items-center justify-center font-bold shadow border dark:border-[#52C77F]">#{item.step}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${item.textColor}`}>{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                </div>
              </div>
              <div className={`md:col-span-3 space-y-3 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                {item.details.map((d, j) => (
                  <motion.div key={j} initial={{ opacity: 0, x: i % 2 === 1 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: j * 0.08 }}
                    className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-gray-100 dark:border-[#334155] shadow-sm flex items-start gap-3 card-hover"
                  >
                    <CheckCircle size={18} className={`mt-0.5 shrink-0 ${item.textColor}`} />
                    <p className="text-sm text-gray-700">{d}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flowchart Summary */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Alur Sistem Lengkap</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Dari hulu ke hilir — bagaimana NUTRI-SHARE menghubungkan semua pihak.</p>
          </motion.div>
          <div className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-gray-100 max-w-md mx-auto">
            <img src="/images/process-analytics.jpg" alt="System Flow" className="w-full h-40 object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative">
            {/* Flow line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2D7A4F] via-[#1565C0] to-[#F5A623] -translate-x-1/2" />
            {[
              { side: "left", icon: UserCheck, title: "Registrasi & Verifikasi", desc: "Donor (HoReKa) dan penerima (panti) mendaftar. Admin memverifikasi data untuk memastikan legitimasi.", color: "text-[#2D7A4F]", border: "border-[#2D7A4F]" },
              { side: "right", icon: Upload, title: "Publikasi Donasi", desc: "Donor mengisi data surplus pangan termasuk kandungan gizi, porsi, dan lokasi pickup.", color: "text-[#2D7A4F]", border: "border-[#2D7A4F]" },
              { side: "left", icon: BarChart3, title: "TOPSIS Calculation", desc: "Sistem menghitung bobot Entropy dan skor TOPSIS untuk menentukan peringkat penerima.", color: "text-[#1565C0]", border: "border-[#1565C0]" },
              { side: "right", icon: Shield, title: "Klaim & Verifikasi Admin", desc: "Penerima peringkat #1 klaim donasi. Admin menyetujui klaim untuk memulai pengiriman.", color: "text-[#1565C0]", border: "border-[#1565C0]" },
              { side: "left", icon: Truck, title: "Pengiriman & Live Tracking", desc: "Kurir dijadwalkan. Penerima dan donor bisa lacak posisi kurir secara real-time.", color: "text-[#F5A623]", border: "border-[#F5A623]" },
              { side: "right", icon: CheckCircle, title: "Serah Terima & Review", desc: "Donor konfirmasi selesai. Penerima bisa memberi rating dan ulasan untuk donor.", color: "text-[#F5A623]", border: "border-[#F5A623]" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: item.side === "left" ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
                className={`flex md:w-1/2 ${item.side === "left" ? "md:pr-12 md:mr-auto" : "md:pl-12 md:ml-auto"} mb-8 relative`}
              >
                <div className={`bg-white dark:bg-[#1e293b] p-5 rounded-2xl shadow-sm border-l-4 ${item.border} w-full`}>
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon size={20} className={item.color} />
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2D7A4F] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Siap Bergabung?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">Daftarkan diri Anda sekarang dan mulai berkontribusi dalam mengurangi food waste.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/donor" className="px-6 py-3 bg-white text-[#2D7A4F] rounded-full font-bold hover:bg-gray-100 transition-all shadow-md flex items-center gap-2 justify-center">Daftar Donor <ArrowRight size={18} /></Link>
              <Link to="/register/recipient" className="px-6 py-3 bg-transparent text-white border-2 border-white/50 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2 justify-center">Daftar Penerima</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

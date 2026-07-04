import { Link } from "react-router-dom";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import {
  Heart, BookOpen, Target, Lightbulb, Users, MapPin, Award,
  GraduationCap, BarChart3, TrendingUp, Earth, CheckCircle, ArrowRight
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
export default function About() {

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2C2C] font-sans">
      <Navbar />
      <SEO title="About" />
      <SEO title="About" />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D7A4F]/10 via-transparent to-[#1565C0]/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Tentang <span className="text-[#2D7A4F]">NUTRI-SHARE</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Platform distribusi surplus pangan berbasis kebutuhan gizi yang lahir dari keprihatinan
              terhadap paradoks food waste dan kelaparan di Indonesia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Latar Belakang — The Problem */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}>
            <span className="text-sm font-bold text-[#E53935] uppercase tracking-wider">Latar Belakang</span>
            <h2 className="text-3xl font-bold mt-2 mb-6">Paradoks Pangan Indonesia</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Indonesia menghadapi paradoks serius: di tengah melimpahnya pangan yang terbuang,
                masih banyak masyarakat yang mengalami kekurangan gizi. <strong>Food Loss and Waste</strong> (FLW)
                mencapai <strong>23–48 juta ton per tahun</strong> dengan kerugian hingga Rp213–Rp551 triliun
                (BAPPENAS 2021).
              </p>
              <p>
                Di Daerah Istimewa Yogyakarta, sektor jasa boga sebagai penggerak pariwisata justru
                menjadi salah satu penyumbang utama pangan berlebih. Ironisnya, kelompok rentan seperti
                rumah singgah pasien dan lembaga kesejahteraan masih mengalami <em>hidden hunger</em> —
                kekurangan protein dan mikronutrien akibat distribusi bantuan yang tidak merata.
              </p>
              <p>
                Kondisi ini bertentangan dengan komitmen global <strong>Sustainable Development Goals</strong> (SDGs),
                khususnya <strong>SDG 2 (Zero Hunger)</strong> dan <strong>SDG 12 (Responsible Consumption and Production)</strong>.
              </p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} className="space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src="/images/teamwork.jpg" alt="Food Waste Impact" className="w-full h-48 object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-[#E53935]">23-48</div>
                <div className="text-sm text-gray-500 mt-1">Juta Ton FLW/tahun</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-bold text-[#E53935]">Rp213-551</div>
                <div className="text-sm text-gray-500 mt-1">Triliun Kerugian</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solusi — The Solution */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-sm font-bold text-[#2D7A4F] uppercase tracking-wider">Solusi</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">NUTRI-SHARE Menjawab Tantangan</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Berbeda dari platform yang ada, NUTRI-SHARE mengintegrasikan standar Angka Kecukupan Gizi (AKG)
              dalam setiap keputusan distribusi, memastikan makanan bernutrisi tinggi sampai ke yang paling membutuhkan.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="text-[#2D7A4F]" size={28} />,
                bg: "bg-[#E8F5E9]",
                title: "Presisi Gizi",
                desc: "Distribusi berdasarkan standar AKG Permenkes No. 28 Tahun 2019, bukan sekadar siapa cepat dia dapat."
              },
              {
                icon: <BarChart3 className="text-[#1565C0]" size={28} />,
                bg: "bg-[#E3F2FD]",
                title: "Hybrid Entropy-TOPSIS",
                desc: "Sistem pendukung keputusan yang objektif, transparan, dan explainable — tanpa black box."
              },
              {
                icon: <Earth className="text-[#F5A623]" size={28} />,
                bg: "bg-[#FFF8E1]",
                title: "SDGs Impact",
                desc: "Mendukung SDG 2 (Zero Hunger) dan SDG 12 (Responsible Consumption & Production)."
              }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-white"
              >
                <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teknologi — Hybrid Entropy-TOPSIS */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-sm font-bold text-[#1565C0] uppercase tracking-wider">Algoritma</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Hybrid Entropy-TOPSIS</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Kombinasi dua metode MCDM (Multi-Criteria Decision Making) untuk menentukan prioritas distribusi
            secara objektif, adil, dan transparan.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#E8F5E9] rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-[#2D7A4F]" />
              </div>
              <h3 className="text-xl font-bold">Shannon Entropy</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Menentukan bobot kriteria secara objektif berdasarkan tingkat variasi data.
              Semakin besar variasi nilai pada suatu kriteria, semakin tinggi bobotnya —
              menghilangkan subjektivitas pakar yang sering ditemukan pada metode seperti AHP.
            </p>
            <p className="text-xs text-gray-400 italic">"Entropy-weight menghilangkan subjektivitas dalam pembobotan kriteria"</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#E3F2FD] rounded-xl flex items-center justify-center">
                <Award size={20} className="text-[#1565C0]" />
              </div>
              <h3 className="text-xl font-bold">TOPSIS</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Mencari alternatif dengan jarak terpendek dari solusi ideal positif dan jarak terjauh
              dari solusi ideal negatif. Akurasi 73% — lebih unggul dibanding AHP (45%) dalam studi komparatif.
            </p>
            <p className="text-xs text-gray-400 italic">"TOPSIS lebih konsisten dalam menangani kriteria yang saling bertentangan"</p>
          </motion.div>
        </div>

        {/* 5 Kriteria */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}>
          <h3 className="text-2xl font-bold text-center mb-8">5 Kriteria Prioritas Distribusi</h3>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { code: "C1", label: "Densitas Nutrisi", param: "Kandungan Protein & Energi", type: "Benefit", color: "text-[#2D7A4F]", border: "border-[#2D7A4F]", bg: "bg-[#E8F5E9]" },
              { code: "C2", label: "Urgensi Kesehatan", param: "Skor Kerentanan 1-5", type: "Benefit", color: "text-[#E53935]", border: "border-[#E53935]", bg: "bg-red-50" },
              { code: "C3", label: "Kelayakan Pangan", param: "Sisa Waktu Layak (Jam)", type: "Benefit", color: "text-[#F5A623]", border: "border-[#F5A623]", bg: "bg-[#FFF8E1]" },
              { code: "C4", label: "Jangkauan Lokasi", param: "Jarak Geografis (Km)", type: "Cost", color: "text-[#1565C0]", border: "border-[#1565C0]", bg: "bg-[#E3F2FD]" },
              { code: "C5", label: "Riwayat Bantuan", param: "Interval Donasi Terakhir", type: "Cost", color: "text-gray-600", border: "border-gray-400", bg: "bg-gray-50" },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`bg-white p-5 rounded-xl border-l-4 ${c.border} shadow-sm`}
              >
                <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center text-xs font-bold ${c.color} mb-3`}>{c.code}</div>
                <h4 className="font-bold text-sm mb-1">{c.label}</h4>
                <p className="text-[10px] text-gray-500">{c.param}</p>
                <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${c.bg} ${c.color}`}>{c.type}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* SDGs Alignment */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="text-sm font-bold text-[#1565C0] uppercase tracking-wider">Dampak Global</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Selaras dengan SDGs</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            NUTRI-SHARE berkontribusi langsung pada pencapaian Tujuan Pembangunan Berkelanjutan.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              sdg: "SDG 2",
              title: "Zero Hunger",
              desc: "Menghilangkan kelaparan dengan menyalurkan pangan bergizi ke kelompok rentan yang membutuhkan.",
              color: "bg-[#D4A843]",
            },
            {
              sdg: "SDG 12",
              title: "Responsible Consumption & Production",
              desc: "Mengurangi food waste melalui distribusi surplus pangan dari sektor HoReKa.",
              color: "bg-[#C6972F]",
            }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-5"
            >
              <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {item.sdg}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2D7A4F] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Bergabung dalam Gerakan Ini</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Jadi bagian dari solusi. Daftarkan bisnis atau lembaga Anda dan bersama kita
              wujudkan distribusi pangan yang cerdas, adil, dan berkelanjutan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/donor" className="px-6 py-3 bg-white text-[#2D7A4F] rounded-full font-bold hover:bg-gray-100 transition-all shadow-md flex items-center gap-2 justify-center">
                Daftar sebagai Donor <ArrowRight size={18} />
              </Link>
              <Link to="/register/recipient" className="px-6 py-3 bg-transparent text-white border-2 border-white/50 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
                Daftar sebagai Penerima
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

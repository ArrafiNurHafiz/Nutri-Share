import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Headphones,
  Check,
  MessageCircle,
} from "lucide-react";
import { SEO } from "../components/SEO";
import toast from "react-hot-toast";

interface FAQItem {
  q: string;
  a: string;
  category: "umum" | "donatur" | "penerima" | "keamanan";
}

const FAQS: FAQItem[] = [
  {
    category: "umum",
    q: "Apa itu NutriShare dan bagaimana cara kerjanya?",
    a: "NutriShare adalah platform jembatan pangan yang menghubungkan hotel, restoran, katering, dan supermarket yang memiliki surplus makanan layak konsumsi dengan panti asuhan, yayasan sosial, dan panti lansia terverifikasi di Yogyakarta menggunakan sistem perankingan prioritas cerdas (TOPSIS).",
  },
  {
    category: "umum",
    q: "Apakah layanan NutriShare dipungut biaya?",
    a: "Tidak sama sekali. Layanan NutriShare 100% gratis baik bagi pihak donatur maupun penerima manfaat. Misi kami adalah mencegah food waste dan mengatasi kerentanan pangan di masyarakat.",
  },
  {
    category: "donatur",
    q: "Bagaimana cara hotel atau resto menyalurkan donasi makanan?",
    a: "Daftar sebagai Donatur melalui menu registrasi, lengkapi profil usaha Anda. Setelah diverifikasi admin, Anda dapat langsung membuat postingan donasi surplus makanan dengan detail porsi, batas waktu konsumsi, dan foto makanan melalui Dashboard Donatur.",
  },
  {
    category: "keamanan",
    q: "Bagaimana NutriShare menjamin higienitas dan keamanan pangan?",
    a: "Setiap donasi wajib mematuhi standar SOP keamanan pangan NutriShare: makanan belum tersentuh konsumen (clean surplus), dikemas rapat dan bersih, disimpan dalam suhu aman, serta mencantumkan estimasi waktu aman konsumsi (best before pickup).",
  },
  {
    category: "penerima",
    q: "Bagaimana proses verifikasi bagi panti asuhan atau yayasan?",
    a: "Pihak pengurus panti/yayasan mendaftar sebagai Penerima dengan melampirkan dokumen legalitas (SK Kemenkumham/Dinsos atau surat izin operasional). Tim verifikator NutriShare akan memvalidasi data dalam 1x24 jam.",
  },
  {
    category: "donatur",
    q: "Siapa yang mengurus penjemputan dan pengantaran donasi?",
    a: "Donasi dapat diambil langsung oleh perwakilan panti asuhan yang berhasil mengklaim, atau diantarkan melalui bantuan jejaring relawan armada NutriShare untuk donasi porsi besar atau kondisi darurat.",
  },
];

export function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<"semua" | "umum" | "donatur" | "penerima" | "keamanan">("semua");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", subject: "Pertanyaan Umum" });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredFaqs = faqCategory === "semua" ? FAQS : FAQS.filter((f) => f.category === faqCategory);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Pesan bantuan berhasil dikirim! Tim kami akan menghubungi Anda segera.");
      setForm({ name: "", email: "", phone: "", message: "", subject: "Pertanyaan Umum" });
    }, 800);
  };

  const handleCopyWa = () => {
    navigator.clipboard.writeText("081234567890");
    setCopied(true);
    toast.success("Nomor WhatsApp berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] bg-emerald-grid font-sans text-emerald-950 flex flex-col">
      <SEO title="Pusat Bantuan & Kontak | NutriShare" description="Layanan pengaduan, panduan sistem, dan pusat bantuan NutriShare DIY." />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-emerald-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors">
            <ArrowLeft size={16} /> <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-heading font-extrabold text-base text-emerald-950">
              Help Center &amp; Support
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-[#e1fcad] text-xs font-bold border border-emerald-400/30">
            <Headphones size={13} />
            <span>Layanan Pengaduan &amp; Panduan Komunitas</span>
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Ada yang Bisa Kami Bantu?
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Temukan jawaban atas pertanyaan umum terkait sistem distribusi pangan, verifikasi panti, atau hubungi tim teknis kami.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 space-y-12 flex-1">

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900">WhatsApp Hotline</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Respon cepat koordinasi distribusi pangan dan logistik darurat.</p>
            <button
              onClick={handleCopyWa}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Phone size={14} />}
              <span>+62 812-3456-7890</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Email Resmi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Untuk kemitraan formal perhotelan, CSR perusahaan, dan dinas sosial.</p>
            <a href="mailto:support@nutrishare.org" className="mt-2 inline-block text-xs font-bold text-emerald-700 hover:underline">
              support@nutrishare.org
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Jam Operasional</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Senin - Minggu (07.00 - 22.00 WIB) Siaga pemantauan surplus sarapan &amp; makan malam.</p>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              Siaga 7 Hari / Minggu
            </span>
          </div>
        </div>

        {/* FAQs & Message Form Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left FAQ Accordion */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Pertanyaan Populer</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-emerald-950">
                Frequently Asked Questions
              </h2>
            </div>

            {/* Filter Categories */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-emerald-100 shadow-xs text-xs">
              {(["semua", "umum", "donatur", "penerima", "keamanan"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFaqCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-all cursor-pointer ${
                    faqCategory === cat ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-900 hover:bg-emerald-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl bg-white border border-emerald-100 overflow-hidden shadow-xs transition-all">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-emerald-700" : "text-slate-400"}`} />
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-emerald-50 bg-[#f4fbf7]/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Message Form */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-emerald-200/90 p-8 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Kirim Pesan Bantuan</span>
              <h3 className="font-heading font-extrabold text-xl text-emerald-950 mt-1">Formulir Kontak Tim</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1">Nama Lengkap</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama pengurus / PIC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-950 block mb-1">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1">Topik Bantuan</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                >
                  <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                  <option value="Verifikasi Akun">Kendala Verifikasi Akun</option>
                  <option value="Teknis TOPSIS">Penjelasan Algoritma TOPSIS</option>
                  <option value="Kerjasama Donatur">Kerjasama Mitra Donatur</option>
                  <option value="Kendala Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1">Pesan</label>
                <textarea
                  required
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tuliskan kendala atau pertanyaan Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/30 outline-none"
                />
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={13} />
                <span>{submitting ? "Mengirim..." : "Kirim Pertanyaan"}</span>
              </button>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
export default Support;

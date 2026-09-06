import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  ExternalLink,
  Copy,
  Check,
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
  {
    category: "keamanan",
    q: "Apa yang harus dilakukan jika makanan tidak layak saat diterima?",
    a: "Penerima berhak menolak atau mencatat kondisi tersebut saat konfirmasi penjemputan, serta dapat segera melaporkannya melalui form bantuan ini atau WhatsApp siaga kami untuk investigasi cepat.",
  },
];

export function Support() {
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("donor");
  const [category, setCategory] = useState("distribusi");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    id: string;
    date: string;
  } | null>(null);

  // FAQ states
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [faqCategory, setFaqCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !subject.trim() || !message.trim()) {
      toast.error("Mohon lengkapi semua kolom yang wajib diisi");
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable ticket creation
    setTimeout(() => {
      const generatedId = `NST-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketResult({
        id: generatedId,
        date: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      });
      setIsSubmitting(false);
      toast.success("Tiket bantuan berhasil dikirimkan!");
    }, 600);
  };

  const handleCopyTicket = () => {
    if (ticketResult) {
      navigator.clipboard.writeText(ticketResult.id);
      setCopiedId(true);
      toast.success("Nomor tiket disalin!");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const filteredFaqs = FAQS.filter(
    (item) => faqCategory === "all" || item.category === faqCategory
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans flex flex-col selection:bg-[#2D7A4F] selection:text-white">
      <SEO
        title="Pusat Bantuan & Dukungan Siaga | NutriShare"
        description="Hubungi tim NutriShare melalui WhatsApp siaga, email resmi, atau buat tiket bantuan teknis dan operasional pangan di Yogyakarta."
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              aria-label="Kembali"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <div className="h-4 w-px bg-stone-200 hidden sm:block" />
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/images/logoterbaru.webp"
                alt="NutriShare Logo"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#2D7A4F] border border-emerald-200/60 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Layanan Siaga Aktif
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D7A4F]/10 text-[#2D7A4F] text-xs font-bold tracking-wide uppercase">
            <Headphones size={14} /> Pusat Dukungan Pengguna
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-stone-900">
            Ada yang bisa kami bantu?
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Tim operasional dan relawan NutriShare siap membantu Anda terkait
            proses donasi, verifikasi akun lembaga, koordinasi penjemputan, maupun kendala teknis aplikasi.
          </p>
        </section>

        {/* Quick Contact Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* WhatsApp */}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20NutriShare%2C%20saya%20butuh%20bantuan%20terkait%20platform%20NutriShare."
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">WhatsApp Siaga</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Respon instan untuk kendala penjemputan darurat & makanan siap antar.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Chat CS Siaga</span>
              <ExternalLink size={13} />
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:support@nutrishare.web.id?subject=Bantuan%20Platform%20NutriShare"
            className="group p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-[#2D7A4F]/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-[#2D7A4F] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Email Resmi</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Kemitraan hotel/resto, legalitas yayasan, dan inquiry kerjasama.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#2D7A4F]">
              <span className="truncate">support@nutrishare.web.id</span>
              <ExternalLink size={13} />
            </div>
          </a>

          {/* Hotline Operasional */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4893B] flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Hotline Call Center</h3>
                <p className="text-xs text-stone-500 mt-1">
                  (0274) 555-6887
                </p>
                <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                  <Clock size={12} /> 08.00 - 22.00 WIB
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-stone-600">
              Wilayah D.I. Yogyakarta
            </div>
          </div>

          {/* Pos Relawan DIY */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Posko Relawan & Logistik</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Jl. Kaliurang KM 5, Caturtunggal, Depok, Sleman, DIY.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-semibold text-stone-600 flex items-center gap-1">
              <ShieldCheck size={13} className="text-blue-600" /> Hub Distribusi Pangan
            </div>
          </div>
        </section>

        {/* Interactive Form and Quick Info */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ticket Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-[#2D7A4F]/10 text-[#2D7A4F] flex items-center justify-center">
                <Send size={18} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Kirim Tiket Pengaduan & Bantuan
                </h2>
                <p className="text-xs text-stone-500">
                  Laporan Anda akan ditangani langsung oleh tim kami dengan estimasi &lt; 24 jam.
                </p>
              </div>
            </div>

            {ticketResult ? (
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-emerald-900">
                    Tiket Berhasil Terkirim!
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Nomor referensi tiket pengaduan Anda:
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-emerald-300 font-mono text-sm font-bold text-emerald-800 shadow-xs">
                  <span>{ticketResult.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="p-1 hover:bg-emerald-50 rounded text-emerald-600 transition-colors"
                    title="Salin Nomor Tiket"
                  >
                    {copiedId ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Informasi ini telah dicatat pada sistem pada {ticketResult.date}. Anda juga dapat meneruskan nomor tiket ini ke WhatsApp admin untuk percepatan eskalasi.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                      `Halo NutriShare, saya telah membuat tiket bantuan dengan nomor: ${ticketResult.id} terkait: "${subject}". Mohon bantuannya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageCircle size={15} /> Teruskan ke WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketResult(null);
                      setSubject("");
                      setMessage("");
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
                  >
                    Buat Tiket Baru
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Kontak WhatsApp / Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="0812xxxx atau email@domain.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Peran Anda
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30"
                    >
                      <option value="donor">Donatur (Hotel/Resto/Kafe)</option>
                      <option value="recipient">Penerima (Panti/Yayasan)</option>
                      <option value="volunteer">Relawan Logistik</option>
                      <option value="public">Masyarakat Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Kategori Masalah
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30"
                    >
                      <option value="distribusi">Distribusi & Penjemputan</option>
                      <option value="verifikasi">Verifikasi Akun / Legalitas</option>
                      <option value="kualitas">Kualitas & Keamanan Pangan</option>
                      <option value="teknis">Aplikasi & Peta Lokasi</option>
                      <option value="kemitraan">Kemitraan Skala Besar</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Tingkat Urgensi
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setUrgency("normal")}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          urgency === "normal"
                            ? "bg-[#2D7A4F] text-white border-[#2D7A4F]"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrgency("urgent")}
                        className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all ${
                          urgency === "urgent"
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        Darurat ⚡
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Judul / Ringkasan Kendala <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Butuh bantuan penjemputan 40 porsi makanan siap saji malam ini"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Penjelasan Lengkap / Kronologi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jelaskan secara rinci lokasi, jumlah porsi, atau kendala yang dialami..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#2D7A4F] hover:bg-[#246340] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Memproses Tiket...</span>
                  ) : (
                    <>
                      <Send size={15} /> Kirim Tiket Dukungan
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Side Info & Tips */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#2D7A4F] text-white rounded-2xl p-6 shadow-sm space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold">
                <Clock size={13} /> Waktu Layanan Operasional
              </div>
              <h3 className="text-base font-bold font-heading">
                Standar Penanganan Respon NutriShare
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Untuk menjaga mutu makanan surplus, tim siaga darurat NutriShare memprioritaskan makanan siap konsumsi dengan masa simpan di bawah 6 jam untuk segera dialokasikan.
              </p>
              <div className="space-y-2 pt-2 text-xs border-t border-white/20">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Senin - Minggu</span>
                  <span className="font-bold">08:00 - 22:00 WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Bantuan Darurat Jemput</span>
                  <span className="font-bold">Siaga 24 Jam via WA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Verifikasi Berkas Lembaga</span>
                  <span className="font-bold">Maks. 1x24 Jam Kerja</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-3 text-xs text-stone-600">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <HelpCircle size={16} className="text-[#D4893B]" /> Butuh Akses Peta Lokasi?
              </h4>
              <p>
                Ingin melihat lokasi hotel, resto donatur, dan panti asuhan penerima di sekitar Anda?
              </p>
              <Link
                to="/map"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D7A4F] hover:underline"
              >
                Buka Peta Interaktif Mitra NutriShare &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-heading">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
              <p className="text-xs text-stone-500">
                Temukan jawaban cepat seputar tata cara donasi, distribusi, dan syarat verifikasi.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              <button
                type="button"
                onClick={() => setFaqCategory("all")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  faqCategory === "all"
                    ? "bg-[#2D7A4F] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFaqCategory("donatur")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  faqCategory === "donatur"
                    ? "bg-[#2D7A4F] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Donatur
              </button>
              <button
                type="button"
                onClick={() => setFaqCategory("penerima")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  faqCategory === "penerima"
                    ? "bg-[#2D7A4F] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Penerima
              </button>
              <button
                type="button"
                onClick={() => setFaqCategory("keamanan")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  faqCategory === "keamanan"
                    ? "bg-[#2D7A4F] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Keamanan Pangan
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-stone-200/80 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-stone-800">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#2D7A4F]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 NutriShare Yogyakarta. Bersama cegah food waste, sejahterakan sesama.</p>
          <div className="flex items-center gap-4">
            <Link to="/map" className="hover:text-[#2D7A4F]">Peta Sebaran</Link>
            <Link to="/#tentang" className="hover:text-[#2D7A4F]">Tentang Kami</Link>
            <Link to="/login" className="hover:text-[#2D7A4F]">Portal Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

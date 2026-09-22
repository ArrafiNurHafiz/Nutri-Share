import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  Plus,
  Compass,
  Star,
  CheckCircle2,
  MessageCircle,
  Building2,
  LogOut,
  User,
  ShieldCheck,
  BarChart3,
  Brain,
  Scale,
  Utensils,
  Flame,
  Activity,
  Heart,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { useRealtime, RealtimeEvent } from "../lib/useRealtime";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEO } from "../components/SEO";
import { LiveTrackingModal } from "../components/LiveTrackingModal";
import { ProfileModal } from "../components/ProfileModal";
import { DonationForm, DonorTOPSISModal } from "../components/donor";
import toast from "react-hot-toast";

const PRESETS = [
  { id: "makanan_berat", label: "Nasi & Lauk", p: 26, c: 540, name: "Paket Nasi & Lauk Komplit" },
  { id: "snack", label: "Roti & Pastry", p: 8, c: 260, name: "Roti & Aneka Pastry" },
  { id: "sayur", label: "Buah & Sayur", p: 4, c: 110, name: "Sayur & Buah Segar" },
  { id: "lauk_protein", label: "Lauk Protein", p: 28, c: 340, name: "Olahan Ayam / Daging / Ikan" },
];

function cleanPhone(p?: string): string {
  if (!p) return "";
  let digits = p.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits;
}

export function DonorDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history" | "reviews">("active");
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [topsisAuditDonation, setTopsisAuditDonation] = useState<any>(null);
  const [donorTopsisData, setDonorTopsisData] = useState<any[]>([]);

  const nav = useNavigate();
  const { user, profile, loading: authLoading, logout } = useAuth();

  const [form, setForm] = useState({
    food_name: "",
    food_type: "makanan_berat",
    portion_count: "",
    protein_per_portion: "",
    calorie_per_portion: "",
    hours_valid: "6",
    pickup_latitude: 0,
    pickup_longitude: 0,
    notes: "",
    iron_mg: "",
    vitamin_c_mg: "",
    photo_url: "",
  });

  useEffect(() => {
    if (profile?.latitude) {
      setForm((f) => ({
        ...f,
        pickup_latitude: Number(profile.latitude),
        pickup_longitude: Number(profile.longitude),
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "donor")) nav("/login");
  }, [authLoading, user, nav]);

  const loadDonations = useCallback(async () => {
    if (!user || user.role !== "donor") return;
    try {
      const [data, donorReviews, bdgs] = await Promise.all([
        api.fetchJSON(`/api/donations?donor_id=${user.id}&limit=500`).catch(() => []),
        api.fetchJSON(`/api/donors/${user.id}/reviews`).catch(() => []),
        api.fetchJSON(`/api/donors/${user.id}/badges`).catch(() => []),
      ]);
      setDonations(data || []);
      setReviews(donorReviews || []);
      setBadges(bdgs || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === "donor") loadDonations();
  }, [loadDonations, user]);

  useRealtime(
    user?.id,
    user?.role,
    (event: RealtimeEvent) => {
      loadDonations();
      if (event.event_type === "CLAIM_CREATED") toast("Lembaga mengklaim donasi Anda!");
      else if (event.event_type === "DELIVERY_ARRIVED") toast.success("Penjemput telah tiba di lokasi!");
      else if (event.event_type === "HANDOVER_COMPLETED") toast.success("Serah terima donasi selesai!");
    },
    loadDonations,
    5000,
  );

  if (authLoading || !user) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.fetchJSON("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, donor_id: user.id }),
      });
      toast.success("Donasi makanan siap disalurkan!");
      loadDonations();
      setShowModal(false);
      setFormStep(1);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat donasi.");
    }
  };

  const openDonorTopsis = async (donation: any) => {
    try {
      const res = await api.fetchJSON(`/api/topsis/${donation.id}`);
      setDonorTopsisData(Array.isArray(res?.results) ? res.results : []);
    } catch {
      setDonorTopsisData([]);
    }
    setTopsisAuditDonation(donation);
  };

  // Strictly only UNCOMPLETED donations in active view
  const activeList = donations.filter((d) => d.status === "active" || d.status === "claimed");
  const inTransitList = donations.filter((d) => d.status === "claimed");
  const historyList = donations.filter((d) => d.status === "completed");

  const totalPortionsShared = historyList.reduce((acc, d) => acc + (d.portion_count || 0), 0);
  const totalProteinSharedGrams = donations.reduce(
    (acc, d) => acc + (Number(d.protein_per_portion || 0) * Number(d.portion_count || 0)),
    0
  );
  const totalCaloriesSharedKcal = donations.reduce(
    (acc, d) => acc + (Number(d.calorie_per_portion || 0) * Number(d.portion_count || 0)),
    0
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <LoadingSpinner size={32} label="Memuat dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] font-sans flex flex-col antialiased">
      <SEO title="Portal Donatur | NutriShare" description="Kelola surplus makanan hotel dan restoran secara terorganisir." />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-[#E2E8F0] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logoterbaru.webp" alt="NutriShare" className="h-8 w-auto" />
            </Link>
            <div className="h-4 w-px bg-[#E2E8F0] hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <Building2 size={14} className="text-[#2D7A4F]" />
              <span>{profile?.business_name || user.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/peta"
              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#334155] transition-colors flex items-center gap-1.5"
            >
              <Compass size={14} className="text-[#2D7A4F]" />
              <span className="hidden sm:inline">Peta Sebaran</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setShowModal(true);
                setFormStep(1);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#2D7A4F] hover:bg-[#235F3D] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Donasikan Makanan</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] transition-colors cursor-pointer"
              title="Profil"
            >
              <User size={15} />
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                nav("/");
              }}
              className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#FEF2F2] hover:text-[#DC2626] text-[#64748B] transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* Aesthetic Ambient Hero Banner for Donor */}
        <section className="relative rounded-3xl overflow-hidden bg-[#0F2418] text-white p-6 sm:p-8 border border-[#2D7A4F]/30 shadow-md">
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="/images/fresh-food.webp"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#091710] via-[#0F2418]/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7F3D0] bg-white/10 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
                  Portal Mitra Donatur (HoReKa)
                </span>
                <span className="text-[11px] font-semibold text-[#6EE7B7] flex items-center gap-1">
                  <Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" /> Rating {avgRating}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
                {profile?.business_name || user.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Pusat manajemen distribusi surplus pangan hotel, restoran, dan katering Anda secara aman, termonitor, dan tepat sasaran.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-white/70">Pilihan Cepat:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        food_name: p.name,
                        food_type: p.id,
                        protein_per_portion: p.p.toString(),
                        calorie_per_portion: p.c.toString(),
                      }));
                      setShowModal(true);
                      setFormStep(2);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer backdrop-blur-md"
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Card Overlay */}
            <div className="grid grid-cols-3 gap-3 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-center">
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider block">Porsi Selesai</span>
                <span className="text-xl font-extrabold text-white">{totalPortionsShared}</span>
              </div>
              <div className="text-center border-x border-white/15 px-2">
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider block">Dijemput</span>
                <span className="text-xl font-extrabold text-[#6EE7B7]">{inTransitList.length}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider block">Ulasan</span>
                <span className="text-xl font-extrabold text-[#FCD34D]">{reviews.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* AKG & Hybrid Entropy-TOPSIS Platform Impact Card */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded border border-[#A7F3D0]">
                  Transparansi Distribusi Presisi
                </span>
                <span className="text-xs text-[#64748B]">Berdasarkan Standar AKG Kemenkes RI</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                Kontribusi Angka Kecukupan Gizi (AKG) & Akurasi TOPSIS
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Brain size={14} className="text-[#059669]" />
                Hybrid Shannon Entropy-TOPSIS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between text-[#64748B] text-xs">
                <span>Total Protein Disalurkan</span>
                <Utensils size={14} className="text-[#059669]" />
              </div>
              <span className="text-lg sm:text-xl font-black text-[#047857] block font-heading">
                {(totalProteinSharedGrams / 1000).toFixed(1)} kg
              </span>
              <span className="text-[10px] text-[#64748B] block">
                ~{Math.round(totalProteinSharedGrams / 40)} Porsi Kebutuhan Protein Anak
              </span>
            </div>

            <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between text-[#64748B] text-xs">
                <span>Total Energi Kalori</span>
                <Flame size={14} className="text-[#D97706]" />
              </div>
              <span className="text-lg sm:text-xl font-black text-[#D97706] block font-heading">
                {(totalCaloriesSharedKcal / 1000).toFixed(1)} Mkal
              </span>
              <span className="text-[10px] text-[#64748B] block">
                Suplai Energi Siap Konsumsi
              </span>
            </div>

            <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between text-[#64748B] text-xs">
                <span>Objektivitas Penyaluran</span>
                <Scale size={14} className="text-[#2563EB]" />
              </div>
              <span className="text-lg sm:text-xl font-black text-[#2563EB] block font-heading">
                100%
              </span>
              <span className="text-[10px] text-[#64748B] block">
                Bebas Intervensi Manual
              </span>
            </div>

            <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between text-[#64748B] text-xs">
                <span>Panti/Yayasan Binaan</span>
                <Heart size={14} className="text-[#E11D48]" />
              </div>
              <span className="text-lg sm:text-xl font-black text-[#E11D48] block font-heading">
                {donations.length > 0 ? new Set(donations.filter((d: any) => d.claimed_by).map((d: any) => d.claimed_by)).size || 1 : 0} Mitra
              </span>
              <span className="text-[10px] text-[#64748B] block">
                Penerima Tervalidasi
              </span>
            </div>
          </div>
        </section>

        {/* In-Transit Alert Strip (Only uncompleted ongoing pickups) */}
        {inTransitList.length > 0 && (
          <section className="bg-white rounded-xl border border-[#FCD34D] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#FEF3C7] pb-2">
              <span className="text-xs font-bold text-[#92400E] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                {inTransitList.length} Makanan Sedang Dalam Proses Penjemputan Mandiri
              </span>
              <span className="text-[11px] text-[#B45309] font-medium">Mitra sedang bergerak ke lokasi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inTransitList.map((item) => {
                const phoneClean = cleanPhone(item.recipient_phone);
                return (
                  <div key={item.id} className="p-3 bg-[#FFFBEB] rounded-lg border border-[#FDE68A] flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-[#78350F]">{item.food_name}</h4>
                        <span className="text-[10px] font-semibold text-[#92400E] bg-white px-2 py-0.5 rounded border border-[#FCD34D]">
                          {item.arrived_at ? "Tiba di Lokasi" : "Dalam Perjalanan"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#92400E] mt-0.5">
                        {item.portion_count} Porsi • Dijemput: <strong>{item.recipient_name || "Lembaga Penerima"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#FDE68A]/60">
                      <button
                        type="button"
                        onClick={() => setTrackingData(item)}
                        className="flex-1 py-1.5 rounded-md bg-[#2D7A4F] hover:bg-[#235F3D] text-white font-medium text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Compass size={12} /> Buka Pelacakan Rute
                      </button>
                      <button
                        type="button"
                        onClick={() => openDonorTopsis(item)}
                        className="p-1.5 rounded-md border border-[#FCD34D] bg-white text-[#92400E] hover:bg-[#FEF3C7] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        title="Audit TOPSIS & AKG"
                      >
                        <BarChart3 size={13} className="text-[#D97706]" />
                      </button>
                      {phoneClean && (
                        <a
                          href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(`Halo pengurus ${item.recipient_name || ""}, kami dari ${profile?.business_name || "donatur"} menginfokan makanan "${item.food_name}" sudah siap diambil.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-md bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle size={12} className="text-[#2D7A4F]" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab Navigation & List */}
        <section className="space-y-4">
          <div className="flex items-center gap-1 border-b border-[#E2E8F0] pb-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === "active" ? "bg-[#2D7A4F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Donasi Berjalan ({activeList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === "history" ? "bg-[#2D7A4F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Riwayat Selesai ({historyList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === "reviews" ? "bg-[#2D7A4F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Ulasan Lembaga ({reviews.length})
            </button>
          </div>

          {/* Active / History Content */}
          {(activeTab === "active" || activeTab === "history") && (
            <div className="space-y-3">
              {(activeTab === "active" ? activeList : historyList).length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-[#64748B] space-y-2">
                  <Package size={24} className="mx-auto text-[#94A3B8]" />
                  <p className="font-semibold text-[#334155]">
                    {activeTab === "active" ? "Tidak ada donasi yang sedang berlangsung." : "Belum ada riwayat donasi yang selesai."}
                  </p>
                  {activeTab === "active" && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(true);
                        setFormStep(1);
                      }}
                      className="text-xs font-bold text-[#2D7A4F] hover:underline cursor-pointer"
                    >
                      + Buat Donasi Makanan Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(activeTab === "active" ? activeList : historyList).map((item) => {
                    const isClaimed = item.status === "claimed";
                    const isDone = item.status === "completed";

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-2xs flex flex-col justify-between gap-3.5 hover:border-[#CBD5E1] transition-colors"
                      >
                        <div
                          className="relative h-32 bg-[#F1F5F9] overflow-hidden rounded-t-xl"
                        >
                          <img
                            src={item.photo_url || "/images/fresh-food.webp"}
                            alt={item.food_name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute top-2.5 left-2.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded shadow-xs ${
                              isDone
                                ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                : isClaimed
                                ? "bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]"
                                : "bg-white/90 text-[#475569] border border-[#E2E8F0]"
                            }`}>
                              {isDone ? "Selesai Diserahkan" : isClaimed ? "Sedang Dijemput" : "Tersedia & Menunggu Klaim"}
                            </span>
                          </div>
                          <div className="absolute top-2.5 right-2.5 text-[11px] text-white/90 font-mono bg-black/40 px-2 py-0.5 rounded">
                            #{item.id}
                          </div>
                          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-semibold">
                            <span className="bg-black/40 px-2 py-0.5 rounded">{item.portion_count} Porsi</span>
                            <span className="bg-black/40 px-2 py-0.5 rounded text-[#A7F3D0]">Sisa {item.hours_valid || 6} Jam</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-[#0F172A]">{item.food_name}</h3>
                            <div className="flex items-center gap-2 text-[11px] text-[#475569] font-medium mt-2">
                              <span className="px-2 py-0.5 bg-[#F1F5F9] rounded">Protein: {item.protein_per_portion || 0}g</span>
                              <span className="px-2 py-0.5 bg-[#F1F5F9] rounded">Kalori: {item.calorie_per_portion || 0} kkal</span>
                            </div>

                            {item.recipient_name && (
                              <p className="text-xs text-[#334155] pt-2 flex items-center gap-1">
                                <span className="text-[#64748B]">Pengambil:</span>
                                <strong>{item.recipient_name}</strong>
                              </p>
                            )}
                          </div>

                          <div className="pt-2.5 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                              <button
                                type="button"
                                onClick={() => openDonorTopsis(item)}
                                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Lihat Audit Perhitungan AKG & Peringkat TOPSIS"
                              >
                                <BarChart3 size={13} className="text-[#2D7A4F]" />
                                <span>Audit TOPSIS & AKG</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {isClaimed && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setTrackingData(item)}
                                    className="py-1.5 px-3 rounded-lg bg-[#2D7A4F] hover:bg-[#235F3D] text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Compass size={13} /> Pantau
                                  </button>
                                  {item.recipient_phone && (
                                    <a
                                      href={`https://wa.me/${cleanPhone(item.recipient_phone)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]"
                                      title="WhatsApp"
                                    >
                                      <MessageCircle size={15} className="text-[#2D7A4F]" />
                                    </a>
                                  )}
                                </>
                              )}

                              {!isClaimed && !isDone && (
                                <span className="text-xs text-[#64748B] flex items-center gap-1">
                                  <CheckCircle2 size={13} className="text-[#2D7A4F]" />
                                  <span className="hidden sm:inline">Terdaftar TOPSIS</span>
                                </span>
                              )}

                              {isDone && (
                                <span className="text-xs text-[#065F46] font-medium flex items-center gap-1">
                                  <ShieldCheck size={14} />
                                  <span className="hidden sm:inline">Tervalidasi</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-xs text-[#64748B]">
                  Belum ada ulasan yang diterima dari lembaga penerima.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reviews.map((r, i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[#D97706]">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={13}
                              className={idx < r.rating ? "fill-[#D97706] text-[#D97706]" : "text-[#E2E8F0]"}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">{new Date(r.created_at || Date.now()).toLocaleDateString("id-ID")}</span>
                      </div>
                      <p className="text-xs text-[#334155] italic">"{r.comment || "Donasi sangat bermanfaat bagi anak-anak panti."}"</p>
                      <p className="text-[11px] font-semibold text-[#64748B]">— {r.recipient_name || "Lembaga Penerima"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Pop-up Donation Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-[#E2E8F0] overflow-hidden my-auto">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0F172A]">Bagikan Surplus Makanan</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                aria-label="Tutup modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <DonationForm
                form={form}
                formStep={formStep}
                uploading={false}
                showCatalog={false}
                onSetForm={setForm}
                onSetStep={setFormStep}
                onSetUploading={() => {}}
                onSubmit={handleSubmit}
                onToggleCatalog={() => {}}
                onSelectCatalog={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {trackingData && (
        <LiveTrackingModal
          donation={trackingData}
          user={user}
          profile={profile}
          onClose={() => setTrackingData(null)}
          onComplete={loadDonations}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          profile={profile}
          onClose={() => setShowProfile(false)}
          onUpdate={loadDonations}
        />
      )}

      {/* Donor TOPSIS & AKG Audit Modal */}
      {topsisAuditDonation && (
        <DonorTOPSISModal
          donation={topsisAuditDonation}
          topsisData={donorTopsisData}
          onClose={() => setTopsisAuditDonation(null)}
        />
      )}
    </div>
  );
}

export default DonorDashboard;


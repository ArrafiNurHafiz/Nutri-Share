import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Package,
  Clock,
  MapPin,
  Truck,
  Search,
  MessageCircle,
  AlertTriangle,
  User,
  LogOut,
  Compass,
  Star,
  Sparkles,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { api } from "../lib/api";
import { useRealtime, RealtimeEvent } from "../lib/useRealtime";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEO } from "../components/SEO";
import { ReviewModal } from "../components/ReviewModal";
import { ProfileModal } from "../components/ProfileModal";
import { LiveTrackingModal } from "../components/LiveTrackingModal";
import { TOPSISModal } from "../components/recipient/TOPSISModal";
import toast from "react-hot-toast";

function cleanPhone(p?: string): string {
  if (!p) return "";
  let digits = p.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (digits.startsWith("622") || digits.length < 9) return "";
  return digits;
}

export function RecipientDashboard() {
  const [activeDonations, setActiveDonations] = useState<any[]>([]);
  const [transitDonations, setTransitDonations] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [akg, setAkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"explore" | "active" | "history">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedReviewDonation, setSelectedReviewDonation] = useState<any>(null);
  const [topsisModalDonation, setTopsisModalDonation] = useState<any>(null);
  const [topsisData, setTopsisData] = useState<any[]>([]);

  const nav = useNavigate();
  const { user, profile, loading: authLoading, logout, refresh } = useAuth();
  const [emergency, setEmergency] = useState("none");

  useEffect(() => {
    if (profile) setEmergency(profile.emergency || "none");
  }, [profile]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "recipient")) nav("/login");
  }, [authLoading, user, nav]);

  const loadData = useCallback(async () => {
    if (!user || user.role !== "recipient") return;
    try {
      const [data, transit, history, akgData] = await Promise.all([
        api.fetchJSON(`/api/donations/active?recipient_id=${user.id}`).catch(() => []),
        api.fetchJSON(`/api/donations/transit?user_id=${user.id}&role=recipient`).catch(() => []),
        api.fetchJSON(`/api/donations/history?recipient_id=${user.id}`).catch(() => []),
        api.fetchJSON(`/api/recipient/akg?user_id=${user.id}`).catch(() => null),
      ]);
      setActiveDonations(data || []);
      // Filter out completed donations from active transit
      setTransitDonations((transit || []).filter((d: any) => d.status === "claimed"));
      setHistoryData(history || []);
      setAkg(akgData || null);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === "recipient") loadData();
  }, [loadData, user]);

  useRealtime(
    user?.id,
    user?.role,
    (event: RealtimeEvent) => {
      loadData();
      if (event.event_type === "CLAIM_APPROVED") {
        toast.success("Klaim donasi makanan Anda berhasil disetujui!");
      } else if (event.event_type === "DONATION_CREATED") {
        toast("Ada donasi surplus baru tersedia!");
      } else if (event.event_type === "HANDOVER_COMPLETED") {
        toast.success("Serah terima donasi selesai!");
      }
    },
    loadData,
    5000,
  );

  if (authLoading || !user) return null;

  const handleClaim = async (donationId: number) => {
    setClaimingId(donationId);
    try {
      await api.fetchJSON(`/api/donations/${donationId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: user.id }),
      });
      toast.success("Donasi berhasil diklaim! Silakan koordinasi penjemputan.");
      loadData();
      setActiveTab("active");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengklaim donasi.");
    } finally {
      setClaimingId(null);
    }
  };

  const openTopsisAudit = async (donation: any) => {
    try {
      const res = await api.fetchJSON(`/api/topsis/${donation.id}`);
      setTopsisData(Array.isArray(res?.results) ? res.results : []);
    } catch {
      setTopsisData([]);
    }
    setTopsisModalDonation(donation);
  };

  const handleEmergencyToggle = async () => {
    try {
      const res = await api.fetchJSON("/api/recipient/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      setEmergency(res.emergency);
      refresh();
      toast.success(
        res.emergency === "pending"
          ? "Status Darurat Diaktifkan. Panti Anda diprioritaskan di algoritma TOPSIS."
          : "Status darurat dinonaktifkan.",
      );
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status.");
    }
  };

  const filteredExplore = activeDonations
    .filter((d) => selectedCategory === "all" || d.food_type === selectedCategory)
    .filter(
      (d) =>
        !searchQuery ||
        d.food_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.donor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const completedList = historyData.filter((d) => d.status === "completed");

  const todayCalories = Math.round(akg?.today_intake?.calories || 0);
  const targetCalories = Math.round(akg?.daily_needs?.calories || profile?.daily_calorie_need || (profile?.resident_count ? profile.resident_count * 1900 : 66500));
  const caloriePct = targetCalories > 0 ? Math.min(100, Math.round((todayCalories / targetCalories) * 100)) : 0;

  const todayProtein = Math.round(akg?.today_intake?.protein || 0);
  const targetProtein = Math.round(akg?.daily_needs?.protein || profile?.daily_protein_need || (profile?.resident_count ? profile.resident_count * 45 : 1575));
  const proteinPct = targetProtein > 0 ? Math.min(100, Math.round((todayProtein / targetProtein) * 100)) : 0;

  const todayIron = Number((akg?.today_intake?.iron || 0).toFixed(1));
  const targetIron = Math.round(akg?.daily_needs?.iron || (profile?.resident_count ? profile.resident_count * 10 : 350));
  const ironPct = targetIron > 0 ? Math.min(100, Math.round((todayIron / targetIron) * 100)) : 0;

  const todayVitC = Number((akg?.today_intake?.vitamin_c || 0).toFixed(1));
  const targetVitC = Math.round(akg?.daily_needs?.vitamin_c || (profile?.resident_count ? profile.resident_count * 50 : 1750));
  const vitCPct = targetVitC > 0 ? Math.min(100, Math.round((todayVitC / targetVitC) * 100)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <LoadingSpinner size={32} label="Memuat portal penerima..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fbf7] bg-emerald-grid text-emerald-950 font-sans flex flex-col antialiased">
      <SEO
        title="Portal Penerima Manfaat | NutriShare"
        description="Portal distribusi pangan bernutrisi untuk panti asuhan dan lembaga sosial di Yogyakarta."
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 border-b border-emerald-100 backdrop-blur-xl shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/images/logoterbaru.webp"
                alt="NutriShare Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-heading font-extrabold text-base text-emerald-950 tracking-tight">NutriShare</span>
            </Link>
            <div className="h-4 w-px bg-emerald-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Heart size={14} className="text-emerald-600" />
              <span>{profile?.institution_name || user.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Emergency Mode Toggle */}
            <button
              type="button"
              onClick={handleEmergencyToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                emergency === "approved" || emergency === "pending"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
              }`}
              title="Aktifkan status darurat jika stok pangan panti menipis"
            >
              <AlertTriangle size={13} />
              <span>{emergency === "approved" || emergency === "pending" ? "Darurat Aktif" : "Status Darurat"}</span>
            </button>

            <Link
              to="/peta"
              className="px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 text-xs font-bold text-emerald-900 transition-colors flex items-center gap-1.5"
            >
              <Compass size={14} className="text-emerald-700" />
              <span className="hidden sm:inline">Peta Sebaran</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="p-2 rounded-xl border border-emerald-200 hover:bg-emerald-50 text-emerald-800 transition-colors cursor-pointer"
              title="Profil & Pengaturan AKG"
            >
              <User size={15} />
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                nav("/");
              }}
              className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Flow Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 flex-1">
        {/* Aesthetic Ambient Hero Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 border border-emerald-700/50 shadow-lg">
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="/images/charity-kids.webp"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e1fcad] bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30 backdrop-blur-md">
                  Portal Lembaga Penerima
                </span>
                {emergency !== "none" && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-red-600 px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                    Status Darurat Aktif
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
                {profile?.institution_name || user.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                Prioritas alokasi pangan surplus bernutrisi berbasis algoritma Hybrid Entropy-TOPSIS. Pantau asupan gizi harian dan ajukan klaim donasi secara transparan.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto bg-emerald-950/60 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Heart size={20} />
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block">Kebutuhan Binaan</span>
                <span className="text-sm font-extrabold text-white">{profile?.resident_count ?? 0} Orang</span>
              </div>
            </div>
          </div>
        </section>

        {/* AKG Nutrition 4-Pillar Progress Card */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  RDA Nutrition Target (Ministry of Health)
                </span>
                <span className="text-xs text-slate-500">
                  ({akg?.resident_count || profile?.resident_count || 35} Resident Beneficiaries)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-emerald-950 font-heading">
                Daily Recommended Dietary Allowance (RDA) Fulfillment
              </h2>
              <p className="text-[11px] text-slate-500">
                Automated daily reset at 00:00 UTC+7 &bull; Real-time tracking of received meals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                Cumulative Institution Target
              </span>
            </div>
          </div>

          {/* 4 Nutrient Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            <div className="p-4 bg-[#f4fbf7] rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Calorie Energy</span>
                <span className="font-bold text-slate-900">{caloriePct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                <span>In: {todayCalories.toLocaleString("en-US")} kcal</span>
                <span>Target: {targetCalories.toLocaleString("en-US")}</span>
              </div>
            </div>

            <div className="p-4 bg-[#f4fbf7] rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Protein (C1)</span>
                <span className="font-bold text-emerald-800">{proteinPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                <span>In: {todayProtein.toLocaleString("en-US")}g</span>
                <span>Target: {targetProtein.toLocaleString("en-US")}g</span>
              </div>
            </div>

            <div className="p-4 bg-[#f4fbf7] rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Iron (Fe)</span>
                <span className="font-bold text-sky-700">{ironPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${ironPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                <span>In: {todayIron.toLocaleString("en-US")}mg</span>
                <span>Target: {targetIron.toLocaleString("en-US")}mg</span>
              </div>
            </div>

            <div className="p-4 bg-[#f4fbf7] rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Vitamin C</span>
                <span className="font-bold text-purple-700">{vitCPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vitCPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                <span>In: {todayVitC.toLocaleString("en-US")}mg</span>
                <span>Target: {targetVitC.toLocaleString("en-US")}mg</span>
              </div>
            </div>
          </div>
        </section>

        {/* Active In-Transit Alert Strip */}
        {transitDonations.length > 0 && (
          <section className="bg-white rounded-2xl border border-sky-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Truck size={15} className="text-sky-600" />
                {transitDonations.length} Active Pickup Ready at Donor Location
              </span>
              <span className="text-[11px] text-sky-600 font-medium">Follow navigation route</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transitDonations.map((item) => {
                const phoneClean = cleanPhone(item.donor_phone);
                return (
                  <div
                    key={item.id}
                    className="bg-sky-50/50 rounded-xl border border-sky-200/80 p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-sky-950">{item.food_name}</h4>
                        <span className="text-[10px] font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
                          Ready for Pickup
                        </span>
                      </div>
                      <p className="text-xs text-sky-900 mt-0.5">
                        {item.portion_count} Portions &bull; Donor: <strong>{item.donor_name || "Food Partner"}</strong>
                      </p>
                      <p className="text-[11px] text-sky-700/80 mt-0.5 truncate flex items-center gap-1">
                        <MapPin size={11} /> {item.donor_address || "Yogyakarta"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-sky-200/60">
                      <button
                        type="button"
                        onClick={() => setTrackingData(item)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Compass size={12} /> Open 3D Road Navigation
                      </button>
                      {phoneClean && (
                        <a
                          href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                            `Hello ${item.donor_name || "Donor"}, we from ${profile?.institution_name || "Recipient"} are confirming we are on the way to pick up the donation "${item.food_name}".`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle size={12} className="text-emerald-700" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab Navigation & Content */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-2">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("explore")}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === "explore" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-950 hover:bg-emerald-50"
                }`}
              >
                Explore Surplus ({activeDonations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === "active" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-950 hover:bg-emerald-50"
                }`}
              >
                Active Pickups ({transitDonations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === "history" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-950 hover:bg-emerald-50"
                }`}
              >
                Received History ({completedList.length})
              </button>
            </div>

            {activeTab === "explore" && (
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food, restaurants, hotels..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Tab 1: Explore Feed */}
          {activeTab === "explore" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: "all", label: "All Categories" },
                  { id: "makanan_berat", label: "Meals" },
                  { id: "lauk_protein", label: "Protein" },
                  { id: "sayur", label: "Produce & Fruit" },
                  { id: "snack", label: "Bakery & Snacks" },
                  { id: "minuman", label: "Beverages" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === c.id
                        ? "bg-[#334155] text-white font-medium"
                        : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {filteredExplore.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-[#64748B] space-y-2">
                  <Package size={24} className="mx-auto text-[#94A3B8]" />
                  <p className="font-semibold text-[#334155]">Belum ada donasi makanan surplus yang tersedia saat ini.</p>
                  <p className="text-[11px] text-[#64748B]">Restoran dan hotel mitra akan mempublikasikan donasi secara berkala.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExplore.map((item) => {
                    const isRank1 = item.rank === 1;
                    const isClaimingThis = claimingId === item.id;
                    const isClaimEligible = item.is_claim_eligible !== false;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border p-4.5 shadow-2xs flex flex-col justify-between gap-3.5 transition-colors ${
                          isRank1 ? "border-[#2D7A4F] ring-1 ring-[#2D7A4F]" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Header row: rank/badge + score & ID */}
                          <div className="flex items-center justify-between gap-2">
                            {isRank1 ? (
                              <span className="bg-[#2D7A4F] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-xs border border-emerald-400/30 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-emerald-200" /> Rekomendasi TOPSIS #1
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#64748B] font-mono bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                                #{item.id} {item.rank ? `(Peringkat #${item.rank})` : ""}
                              </span>
                            )}

                            <div className="flex items-center gap-1.5">
                              {item.ci_score != null && (
                                <span className="text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-1.5 py-0.5 rounded shrink-0">
                                  V = {Number(item.ci_score).toFixed(3)}
                                </span>
                              )}
                              {isRank1 && (
                                <span className="text-[11px] text-[#64748B] font-mono bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                                  #{item.id}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Food title & Donor & Portion Badges */}
                          <div className="space-y-2">
                            <h3 className="font-bold text-base text-[#0F172A] leading-snug">
                              {item.food_name}
                            </h3>

                            <p className="text-xs text-[#64748B] flex items-center gap-1">
                              <MapPin size={11} className="text-[#94A3B8] shrink-0" />
                              <span className="truncate font-medium">{item.donor_name || "Mitra Donatur"}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#334155] pt-1">
                              <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#334155] rounded border border-[#E2E8F0]">
                                {item.portion_count} Porsi
                              </span>
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#ECFDF5] text-[#065F46] rounded border border-[#A7F3D0]">
                                <Clock size={11} /> Sisa {item.hours_valid || 6} Jam
                              </span>
                              {item.escalation_stage_name && (
                                <span className={`px-2 py-0.5 rounded border text-[10px] ${
                                  item.escalation_stage === 1
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : item.escalation_stage === 2
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : item.escalation_stage === 3
                                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                    : "bg-purple-50 text-purple-800 border-purple-200"
                                }`}>
                                  {item.escalation_stage_name}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-medium">
                              {item.protein_per_portion ? (
                                <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] rounded border border-[#BFDBFE]">
                                  {Math.round(item.protein_per_portion * item.portion_count)}g Protein Total
                                </span>
                              ) : null}
                              {item.calorie_per_portion ? (
                                <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded border border-[#FDE68A]">
                                  {Math.round(item.calorie_per_portion * item.portion_count)} kkal
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2.5 border-t border-[#F1F5F9] flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openTopsisAudit(item)}
                            className="px-2.5 py-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Audit Perankingan TOPSIS & Simulasi AKG"
                          >
                            <BarChart3 size={13} className="text-[#2D7A4F]" />
                            <span>Audit TOPSIS</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleClaim(item.id)}
                            disabled={isClaimingThis || !isClaimEligible}
                            className={`flex-1 py-2 rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 ${
                              !isClaimEligible
                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                : "bg-[#2D7A4F] hover:bg-[#235F3D] text-white cursor-pointer"
                            } disabled:opacity-75`}
                            title={
                              !isClaimEligible
                                ? `Menunggu giliran kuarter prioritas (Peringkat Anda: #${item.rank || 'N/A'})`
                                : "Klaim donasi ini"
                            }
                          >
                            {isClaimingThis ? (
                              <span>Mengonfirmasi...</span>
                            ) : !isClaimEligible ? (
                              <span>Menunggu Giliran (#{item.rank || 'N/A'})</span>
                            ) : (
                              <>
                                <Heart size={13} className="fill-white" />
                                <span>Ambil Donasi</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* Tab 2: Active Transit */}
          {activeTab === "active" && (
            <div className="space-y-3">
              {transitDonations.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-[#64748B] space-y-1">
                  <CheckCircle2 size={24} className="mx-auto text-[#2D7A4F]" />
                  <p className="font-semibold text-[#334155]">Tidak ada penjemputan yang sedang berlangsung.</p>
                  <p className="text-[11px]">Klaim donasi makanan di tab "Jelajah Surplus" untuk memulai proses penjemputan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {transitDonations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-2xs space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-bold border border-[#BFDBFE]">
                          Siap Diambil
                        </span>
                        <span className="text-xs text-[#94A3B8] font-mono">#{item.id}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0F172A]">{item.food_name}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">{item.portion_count} Porsi • Donatur: <strong>{item.donor_name}</strong></p>
                        <p className="text-[11px] text-[#64748B] mt-1">{item.donor_address || "Yogyakarta"}</p>
                      </div>
                      <div className="pt-2 border-t border-[#F1F5F9]">
                        <button
                          type="button"
                          onClick={() => setTrackingData(item)}
                          className="w-full py-2 rounded-lg bg-[#2D7A4F] hover:bg-[#235F3D] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Compass size={13} /> Buka Pelacakan Rute Jalan 3D
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Completed History */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {completedList.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-xs text-[#64748B]">
                  Belum ada riwayat donasi yang selesai diserahterimakan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {completedList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#065F46] flex items-center gap-1">
                            <ShieldCheck size={13} /> Selesai Diterima
                          </span>
                          <span className="text-[#94A3B8] text-[10px]">
                            {item.completed_at ? new Date(item.completed_at).toLocaleDateString("id-ID") : "Tervalidasi"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#0F172A]">{item.food_name}</h4>
                        <p className="text-xs text-[#64748B]">
                          {item.portion_count} Porsi dari <strong>{item.donor_name}</strong>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F1F5F9] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewDonation(item)}
                          className="px-3 py-1.5 rounded-md border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#D97706] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Star size={13} className="fill-[#D97706]" />
                          <span>Beri Ulasan Donatur</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* TOPSIS Transparency Modal */}
      {topsisModalDonation && (
        <TOPSISModal
          donation={topsisModalDonation}
          topsisData={topsisData}
          userProfile={profile}
          onClaim={handleClaim}
          onClose={() => setTopsisModalDonation(null)}
        />
      )}

      {/* Review Modal */}
      {selectedReviewDonation && (
        <ReviewModal
          donation={selectedReviewDonation}
          onClose={() => setSelectedReviewDonation(null)}
          onReviewed={() => {
            loadData();
            setSelectedReviewDonation(null);
          }}
        />
      )}

      {/* Live Tracking Modal */}
      {trackingData && (
        <LiveTrackingModal
          donation={trackingData}
          user={user}
          profile={profile}
          onClose={() => setTrackingData(null)}
          onComplete={loadData}
          onRate={(d: any) => setSelectedReviewDonation(d)}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          profile={profile}
          onClose={() => setShowProfile(false)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

export default RecipientDashboard;

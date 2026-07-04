import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Donation, TopsisResult, Notification, AKGData } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Bell, Download, Truck, Package, Clock, MapPin, ChevronDown, Heart, BarChart3, AlertTriangle, Star, FileText, Home } from "lucide-react";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);
import "leaflet/dist/leaflet.css";
import { LiveTrackingModal } from "../components/LiveTrackingModal";
import { ProfileModal } from "../components/ProfileModal";
import { ReviewModal } from "../components/ReviewModal";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react"
import { SEO } from "../components/SEO";
import { recipientIcon, donorIcon } from "../lib/mapIcons";

import "../lib/mapIcons";

function Countdown({ validUntil }: { validUntil: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(validUntil).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Kadaluarsa"); clearInterval(timer); }
      else { const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000); setTimeLeft(`${h}j ${m}m ${s}d`); }
    }, 1000);
    return () => clearInterval(timer);
  }, [validUntil]);
  return <span className={`font-mono text-sm font-bold ${timeLeft === "Kadaluarsa" ? "text-[#E53935]" : "text-gray-600"}`}>{timeLeft === "Kadaluarsa" ? "⏰ Kadaluarsa" : `⏱ ${timeLeft}`}</span>;
}

function CollapsibleSection({ title, icon, badge, children, defaultOpen = true }: {
  title: string; icon: ReactNode; badge?: ReactNode; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div layout className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-[#2D7A4F]">{icon}</span>
          <span className="font-bold text-gray-800">{title}</span>
          {badge}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}><ChevronDown size={20} className="text-gray-400" /></motion.div>
      </button>
      <AnimatePresence>
        {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="px-5 pb-5">{children}</div></motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}

function NutritionBar({ label, value, need, pct }: { label: string; value: string; need: number; pct: number }) {
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="bg-[#F7F4EE] p-4 rounded-xl">
      <p className="text-sm font-bold text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-bold">{value}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }} className={`h-2 rounded-full ${color}`} />
      </div>
      <p className={`text-xs font-bold mt-1 ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}>{pct}%</p>
    </div>
  );
}

export function RecipientDashboard() {
  const [activeDonations, setActiveDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<number | null>(null);
  const [topsisData, setTopsisData] = useState<TopsisResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [mapData, setMapData] = useState<{ donors: any[]; recipients: any[] }>({ donors: [], recipients: [] });
  const [transitDonations, setTransitDonations] = useState<any[]>([]);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [akg, setAkg] = useState<AKGData | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedReviewDonation, setSelectedReviewDonation] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"available" | "history" | "map">("available");

  const nav = useNavigate();
  const { user, profile, loading: authLoading, logout, refresh } = useAuth();
  const [emergency, setEmergency] = useState("none");

  useEffect(() => { if (profile) setEmergency(profile.emergency || "none"); }, [profile]);
  useEffect(() => { if (!authLoading && (!user || user.role !== "recipient")) nav("/login"); }, [authLoading, user]);

  if (authLoading || !user) return <LoadingSpinner size={32} label="Memuat..." />;

  const loadData = async () => {
    try {
      const [data, notifs, mData, transit, history, akgData] = await Promise.all([
        api.fetchJSON(`/api/donations/active?recipient_id=${user.id}`),
        api.fetchJSON(`/api/notifications?user_id=${user.id}`),
        api.fetchJSON(`/api/map/data`),
        api.fetchJSON(`/api/donations/transit?user_id=${user.id}&role=recipient`),
        api.fetchJSON(`/api/donations/history?recipient_id=${user.id}`),
        api.fetchJSON(`/api/recipient/akg?user_id=${user.id}`),
      ]);
      setActiveDonations(data); setNotifications(notifs); setMapData(mData);
      setTransitDonations(transit); setHistoryData(history); setAkg(akgData);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const loadTopsis = async (donationId: number) => {
    setSelectedDonation(donationId);
    const data = await api.fetchJSON(`/api/topsis/${donationId}`);
    setTopsisData(data.results);
  };

  const handleClaim = async (donationId: number) => {
    try {
      await api.fetchJSON(`/api/donations/${donationId}/claim`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient_id: user.id }) });
      toast.success("Klaim berhasil diajukan!");
      loadData();
    } catch (err: any) { toast.error(err.message || "Gagal mengajukan klaim"); }
  };

  const markRead = async (id: number) => { await api.fetchJSON(`/api/notifications/${id}/read`, { method: "POST" }); loadData(); };

  const downloadReport = async () => {
    try {
      const history = await api.fetchJSON(`/api/donations/history?recipient_id=${user.id}`);
      let csv = "data:text/csv;charset=utf-8," + "ID,Nama Makanan,Donor,Protein(g),Status,Tanggal Selesai\n";
      history.forEach((r: any) => { csv += `${r.id},"${r.food_name}","${r.donor_name}",${r.protein},"Selesai",${r.completed_at || '-'}\n`; });
      const link = document.createElement("a"); link.setAttribute("href", encodeURI(csv)); link.setAttribute("download", `laporan_${(profile.institution_name || "penerima").replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success("Laporan diunduh!");
    } catch { toast.error("Gagal mengunduh laporan"); }
  };

  const handleEmergencyToggle = async () => {
    try {
      const res = await api.fetchJSON("/api/recipient/emergency", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id }) });
      setEmergency(res.emergency); refresh();
      toast.success(res.emergency === "pending" ? "Permintaan darurat dikirim" : res.emergency === "none" ? "Darurat dibatalkan" : "Status berubah");
    } catch (err: any) { toast.error(err.message || "Gagal"); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const transitArrived = transitDonations.filter((d: any) => d.arrived_at);
  const transitPending = transitDonations.filter((d: any) => !d.arrived_at);
  const completedHistory = historyData.filter(d => d.status === "completed");
  const todayCalories = akg?.today_intake.calories || 0;
  const todayProtein = akg?.today_intake.protein || 0;
  const overallPct = akg?.overall_percentage || 0;

  if (loading) return <LoadingSpinner size={36} label="Memuat dashboard..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F7F4EE] p-4 md:p-6 text-[#2C2C2C]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-6 border-l-4 relative ${
            emergency === "active" ? "border-[#E53935] bg-gradient-to-r from-red-50 to-white" :
            emergency === "pending" ? "border-[#F9A825] bg-gradient-to-r from-yellow-50 to-white" :
            "border-[#2D7A4F] bg-gradient-to-r from-green-50/30 to-white"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#2D7A4F]">Dashboard Penerima</h1>
                {emergency === "active" && <span className="bg-[#E53935] text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">🚨 DARURAT AKTIF</span>}
                {emergency === "pending" && <span className="bg-[#F9A825] text-white text-xs font-bold px-3 py-1 rounded-full">⏳ MENUNGGU KONFIRMASI</span>}
              </div>
              <p className="text-gray-500 mt-1 flex items-center gap-2"><Home size={14} /> {profile.institution_name} &middot; Urgensi: <b className="text-[#2D7A4F]">{profile.urgency_score}/5</b></p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleEmergencyToggle} disabled={emergency === "active"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  emergency === "active" ? "bg-[#E53935] text-white cursor-not-allowed opacity-70" :
                  emergency === "pending" ? "bg-[#F9A825] text-white hover:bg-yellow-600" :
                  "bg-white border border-[#E53935] text-[#E53935] hover:bg-red-50"
                }`}
              ><AlertTriangle size={16} /> {emergency === "active" ? "Darurat Aktif" : emergency === "pending" ? "Batalkan" : "Darurat"}</button>
              <button onClick={downloadReport} className="hidden md:flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"><Download size={16} /> Laporan</button>
              <button onClick={() => setShowProfile(true)} className="hidden md:flex items-center gap-2 bg-[#2D7A4F] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 shadow-sm transition-all">Profil Saya</button>
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="relative p-2.5 text-gray-500 hover:text-gray-800 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <Bell size={22} />
                  {unreadCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 bg-[#E53935] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">{unreadCount}</motion.span>}
                </button>
                <AnimatePresence>{showNotif && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl overflow-hidden z-50 border border-gray-100"
                    onClick={() => setShowNotif(false)}>
                    <div className="p-4 border-b bg-gradient-to-r from-[#F7F4EE] to-white"><h3 className="font-bold text-sm">Notifikasi</h3></div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? <div className="p-6 text-center text-gray-400"><Bell size={28} className="mx-auto mb-2 opacity-50" /><p className="text-sm">Belum ada</p></div> :
                        notifications.map(n => (
                          <div key={n.id} onClick={() => markRead(n.id)}
                            className={`p-3 border-b text-sm cursor-pointer ${!n.is_read ? "bg-blue-50/50 border-l-2 border-l-[#1565C0]" : "hover:bg-gray-50"}`}>
                            <p className="font-bold text-gray-800">{n.title}</p>
                            <p className="text-gray-600 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: idLocale })}</p>
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
              <button onClick={async () => { await logout(); nav("/"); }} className="text-sm font-medium text-gray-500 hover:text-[#E53935]">Logout</button>
            </div>
          </div>
        </motion.div>

        {/* Quick Summary Cards — lebih besar & visual */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Asupan Kalori", value: `${todayCalories} kkal`, sub: `/${akg?.daily_needs.calories || 0}`, pct: akg?.percentages.calories || 0, color: "text-[#2D7A4F]", bg: "bg-[#E8F5E9]" },
            { label: "Protein", value: `${todayProtein}g`, sub: `/${akg?.daily_needs.protein || 0}g`, pct: akg?.percentages.protein || 0, color: "text-[#1565C0]", bg: "bg-[#E3F2FD]" },
            { label: "Donasi Diterima", value: `${completedHistory.length}`, sub: "selesai", color: "text-[#F5A623]", bg: "bg-[#FFF8E1]" },
            { label: "Dalam Perjalanan", value: `${transitPending.length + transitArrived.length}`, sub: "menuju lokasi", color: "text-[#E65100]", bg: "bg-[#FFF3E0]" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 card-hover"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <div className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${item.color}`}>{item.pct > 0 ? `${item.pct}%` : item.value}</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${item.color}`}>{item.pct > 0 ? item.value : ""}</div>
                  <div className="text-[11px] text-gray-500">{item.sub}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AKG Section */}
        {akg && (
          <CollapsibleSection title="Pemenuhan Gizi Harian (AKG)" icon={<Heart size={18} />}
            badge={<span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallPct >= 80 ? "bg-green-100 text-green-700" : overallPct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{overallPct}%</span>}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <NutritionBar label="Protein" value={`${akg.today_intake.protein}g / ${akg.daily_needs.protein}g`} need={akg.daily_needs.protein} pct={akg.percentages.protein} />
              <NutritionBar label="Kalori" value={`${akg.today_intake.calories}kkal / ${akg.daily_needs.calories}kkal`} need={akg.daily_needs.calories} pct={akg.percentages.calories} />
              <NutritionBar label="Zat Besi" value={`${akg.today_intake.iron}mg / ${akg.daily_needs.iron}mg`} need={akg.daily_needs.iron} pct={akg.percentages.iron} />
              <NutritionBar label="Vitamin C" value={`${akg.today_intake.vitamin_c}mg / ${akg.daily_needs.vitamin_c}mg`} need={akg.daily_needs.vitamin_c} pct={akg.percentages.vitamin_c} />
            </div>
            {akg.donations_today.length > 0 && (
              <div className="bg-[#F7F4EE] rounded-xl overflow-hidden">
                <p className="text-sm font-bold text-gray-600 p-3 border-b bg-white/50">Donasi Hari Ini</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-gray-500 text-xs">
                      <tr><th className="p-3 border-b">Makanan</th><th className="p-3 border-b">Porsi</th><th className="p-3 border-b">Protein</th><th className="p-3 border-b">Kalori</th><th className="p-3 border-b">Fe</th><th className="p-3 border-b">Vit C</th></tr>
                    </thead>
                    <tbody>
                      {akg.donations_today.map(d => (
                        <tr key={d.id} className="border-b hover:bg-white/50 transition-colors">
                          <td className="p-3 font-bold">{d.food_name}</td>
                          <td className="p-3">{d.portion_count}</td>
                          <td className="p-3">{d.protein_total}g</td>
                          <td className="p-3">{d.calorie_total}kkal</td>
                          <td className="p-3">{d.iron_total != null ? `${d.iron_total}mg` : "-"}</td>
                          <td className="p-3">{d.vitamin_c_total != null ? `${d.vitamin_c_total}mg` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Transit & Tracking */}
        {transitDonations.length > 0 && (
          <div className="mb-4 space-y-4">
            {transitArrived.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#FFB74D] overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-[#FFF8E1] to-white flex items-center justify-between">
                  <h3 className="font-bold text-[#E65100] flex items-center gap-2"><MapPin size={18} /> Kurir Telah Sampai</h3>
                  <span className="bg-[#FFF3E0] text-[#E65100] text-xs font-bold px-2 py-0.5 rounded-full">{transitArrived.length}</span>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-3">
                  {transitArrived.map(d => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div><h4 className="font-bold">{d.food_name}</h4><p className="text-xs text-gray-500">Dari: {d.donor_name}</p></div>
                      <button onClick={() => setTrackingData(d)} className="bg-[#E65100] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 shadow-sm">Lacak</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {transitPending.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#90CAF9] overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-[#F0F8FF] to-white flex items-center justify-between">
                  <h3 className="font-bold text-[#1565C0] flex items-center gap-2"><Truck size={18} /> Dalam Perjalanan</h3>
                  <span className="bg-[#E3F2FD] text-[#1565C0] text-xs font-bold px-2 py-0.5 rounded-full">{transitPending.length}</span>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-3">
                  {transitPending.map(d => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div><h4 className="font-bold">{d.food_name}</h4><p className="text-xs text-gray-500">Dari: {d.donor_name}</p></div>
                      <button onClick={() => setTrackingData(d)} className="bg-[#1565C0] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 shadow-sm">Lacak</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs — lebih jelas */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { key: "available" as const, label: "Donasi Tersedia", icon: Package },
            { key: "history" as const, label: "Riwayat", icon: FileText },
            { key: "map" as const, label: "Peta Distribusi", icon: MapPin },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key ? "bg-[#2D7A4F] text-white shadow-md shadow-[#2D7A4F]/20" : "bg-white text-gray-600 border border-gray-200 hover:border-[#2D7A4F] hover:text-[#2D7A4F]"
              }`}
            ><tab.icon size={16} /> {tab.label}</button>
          ))}
        </div>

        {/* Available */}
        {activeTab === "available" && (
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 flex flex-col gap-4">
              {activeDonations.length === 0 ? (
                <EmptyState icon={<Package size={40} />} title="Belum Ada Donasi Aktif" description="Sistem akan memberitahu jika ada donasi yang sesuai." />
              ) : activeDonations.map((d, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  key={d.id} className={`bg-white p-5 rounded-2xl shadow-sm ${d.my_claim_status === 'pending' ? 'ring-2 ring-yellow-400' : 'border border-gray-100'} flex flex-col gap-3 relative overflow-hidden card-hover`}
                >
                  {d.rank === 1 && !d.my_claim_status && <div className="absolute top-0 right-0 bg-gradient-to-l from-[#E53935] to-[#E53935]/80 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">PRIORITAS</div>}
                  {d.my_claim_status === "pending" && <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-yellow-500/80 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">MENUNGGU ADMIN</div>}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg">{d.food_name}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{d.donor_name}</span><span className="text-gray-300">•</span><span className="flex items-center gap-1"><Package size={14} /> {d.portion_count} porsi</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold ${d.rank === 1 ? 'text-[#E53935]' : 'text-gray-500'}`}>Rank #{d.rank}</div>
                      <Countdown validUntil={d.valid_until} />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex justify-between text-xs text-gray-600"><span>Protein: {d.protein_per_portion}g/porsi</span><span>Kalori: {d.calorie_per_portion}/porsi</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((d.protein_per_portion / (profile.daily_protein_need || 1)) * 100, 100)}%` }} transition={{ duration: 1 }}
                        className="bg-[#2D7A4F] h-1.5 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadTopsis(d.id)} className="flex-1 border border-gray-200 text-sm font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"><BarChart3 size={16} /> TOPSIS</button>
                    {d.my_claim_status === "pending" ? (
                      <div className="flex-1 bg-yellow-50 text-yellow-800 text-sm font-bold py-2.5 rounded-xl text-center border border-yellow-200">Menunggu Admin</div>
                    ) : (
                      <button onClick={() => handleClaim(d.id)} disabled={d.rank !== 1}
                        className={`flex-1 text-white text-sm font-bold py-2.5 rounded-xl transition-all ${d.rank === 1 ? "bg-[#2D7A4F] hover:bg-opacity-90 shadow-md active:scale-[0.98]" : "bg-gray-300 cursor-not-allowed"}`}
                      >{d.rank === 1 ? "Klaim Donasi" : "Rank #1 untuk klaim"}</button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* TOPSIS Panel */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
              {selectedDonation ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="font-bold text-[#1565C0] mb-1">Analisis TOPSIS</h3>
                  <p className="text-xs text-gray-500 mb-4">Donasi #{selectedDonation}</p>
                  <div className="overflow-x-auto">
                    {/* Radar Chart */}
                    <div className="h-48 mb-4">
                      <Radar
                        data={{
                          labels: ["Nutrisi (C1)", "Urgensi (C2)", "Kelayakan (C3)", "Lokasi (C4)", "Riwayat (C5)"],
                          datasets: [{
                            label: "Skor Kriteria",
                            data: [
                              topsisData.find(t => t.recipient_id === user.id)?.raw_c1 || 0,
                              topsisData.find(t => t.recipient_id === user.id)?.raw_c2 || 0,
                              topsisData.find(t => t.recipient_id === user.id)?.raw_c3 || 0,
                              topsisData.find(t => t.recipient_id === user.id)?.raw_c4 || 0,
                              topsisData.find(t => t.recipient_id === user.id)?.raw_c5 || 0,
                            ],
                            backgroundColor: "rgba(45,122,79,0.2)",
                            borderColor: "#2D7A4F",
                            pointBackgroundColor: "#2D7A4F",
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: { r: { beginAtZero: true, max: 10 } },
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                    <table className="w-full text-xs">
                      <thead className="bg-[#F7F4EE] text-gray-600">
                        <tr><th className="p-2 border-b text-center">#</th><th className="p-2 border-b">Lembaga</th><th className="p-2 border-b">Ci</th></tr>
                      </thead>
                      <tbody>
                        {topsisData.map(t => (
                          <tr key={t.id} className={t.recipient_id === user.id ? "bg-[#E8F5E9] font-bold" : "hover:bg-gray-50"}>
                            <td className="p-2 border-b text-center">#{t.rank_position}</td>
                            <td className="p-2 border-b truncate max-w-[100px]">{t.institution_name}</td>
                            <td className="p-2 border-b text-[#2D7A4F]">{t.ci_score.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-gray-400 py-8">
                  <BarChart3 size={40} className="mb-3 opacity-50" />
                  <p className="text-sm">Pilih "TOPSIS" pada donasi.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            {completedHistory.length === 0 ? (
              <EmptyState icon={<FileText size={40} />} title="Belum Ada Riwayat" description="Donasi selesai akan muncul di sini." />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedHistory.map((d, i) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{d.food_name}</h3>
                      <p className="text-sm text-gray-500">Dari: {d.donor_name}</p>
                      {d.completed_at && <p className="text-[10px] text-gray-400 mt-1">{new Date(d.completed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>}
                    </div>
                    {d.has_reviewed ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0"><Star size={12} fill="currentColor" /> Dinilai</span>
                    ) : (
                      <button onClick={() => setSelectedReviewDonation(d)}
                        className="bg-white border-2 border-[#1565C0] text-[#1565C0] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#E3F2FD] transition-all shrink-0"
                      >Beri Nilai</button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {activeTab === "map" && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin size={20} className="text-[#2D7A4F]" /> Peta Target Distribusi</h2>
            <div className="h-[400px] w-full rounded-xl overflow-hidden border">
              {profile.latitude && (
                <MapContainer center={[profile.latitude, profile.longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" referrerPolicy="origin" />
                  <Marker position={[profile.latitude, profile.longitude]} icon={recipientIcon}><Popup><b>{profile.institution_name}</b></Popup></Marker>
                  {mapData.donors.map(donor => <Marker key={donor.id} position={[donor.latitude, donor.longitude]} icon={donorIcon}><Popup><b>{donor.business_name}</b></Popup></Marker>)}
                  {activeDonations.filter(d => d.rank === 1).map(d => {
                    const donorInfo = mapData.donors.find(p => p.user_id === d.donor_id);
                    return donorInfo ? <Polyline key={`l-${d.id}`} positions={[[profile.latitude, profile.longitude], [donorInfo.latitude, donorInfo.longitude]]} color="#E53935" weight={3} dashArray="5, 10" /> : null;
                  })}
                </MapContainer>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReviewDonation && <ReviewModal donation={selectedReviewDonation} onClose={() => setSelectedReviewDonation(null)} onReviewed={loadData} />}
        {trackingData && <LiveTrackingModal donation={trackingData} user={user} onClose={() => setTrackingData(null)} onComplete={loadData} />}
        {showProfile && <ProfileModal user={user} profile={profile} onClose={() => setShowProfile(false)} onUpdate={() => refresh()} />}
      </AnimatePresence>
    </motion.div>
  );
}

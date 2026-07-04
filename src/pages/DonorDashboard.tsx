import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Donation } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { LiveTrackingModal } from "../components/LiveTrackingModal";
import { ProfileModal } from "../components/ProfileModal";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  Star, Package, Clock, Plus, Activity, CheckCircle, Truck, TrendingUp,
  Bell, Dices, Book, Upload
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react"
import { SEO } from "../components/SEO";

type FilterTab = "all" | "active" | "claimed" | "completed";

export function DonorDashboard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  const nav = useNavigate();
  const { user, profile, loading: authLoading, logout, refresh } = useAuth();

  const [form, setForm] = useState({
    food_name: "", food_type: "makanan_berat", portion_count: "", protein_per_portion: "",
    calorie_per_portion: "", hours_valid: "6", pickup_latitude: 0, pickup_longitude: 0,
    notes: "", iron_mg: "", vitamin_c_mg: "", photo_url: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) setForm(f => ({ ...f, pickup_latitude: profile.latitude, pickup_longitude: profile.longitude }));
  }, [profile]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "donor")) nav("/login");
  }, [authLoading, user]);

  if (authLoading || !user) return null;

  const loadDonations = async () => {
    try {
      const [data, donorReviews, notifs, bdgs] = await Promise.all([
        api.fetchJSON(`/api/donations?donor_id=${user.id}`),
        api.fetchJSON(`/api/donors/${user.id}/reviews`),
        api.fetchJSON(`/api/notifications?user_id=${user.id}`),
        api.fetchJSON(`/api/donors/${user.id}/badges`),
      ]);
      setDonations(data);
      setReviews(donorReviews);
      setNotifications(notifs);
      setBadges(bdgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDonations(); }, []);

  // Real-time notifications via SSE
  useEffect(() => {
    if (!user?.id) return;
    const es = new EventSource(`/api/notifications/subscribe?user_id=${user.id}`);
    es.onmessage = (e) => {
      if (e.data === "connected") return;
      try {
        const data = JSON.parse(e.data);
        setNotifications(prev => [data, ...prev]);
        toast.success(data.title || "Notifikasi baru!");
      } catch {}
    };
    return () => es.close();
  }, [user?.id]);

  // Fallback polling
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const notifs = await api.fetchJSON(`/api/notifications?user_id=${user.id}`);
        setNotifications(notifs);
      } catch {}
    }, 30000);
    return () => clearInterval(timer);
  }, [user.id]);

  // Food catalog for quick selection
  const [showCatalog, setShowCatalog] = useState(false);
  const FOOD_CATALOG = [
    { name: "Nasi Kotak", type: "makanan_berat", protein: 8, calorie: 500, iron: 1.5, vitamin_c: 0 },
    { name: "Nasi Kuning", type: "makanan_berat", protein: 7, calorie: 480, iron: 1.2, vitamin_c: 0 },
    { name: "Ayam Goreng (porsi)", type: "lauk_protein", protein: 25, calorie: 350, iron: 2.0, vitamin_c: 0 },
    { name: "Telur Rebus (per butir)", type: "lauk_protein", protein: 6, calorie: 70, iron: 0.8, vitamin_c: 0 },
    { name: "Sayur Sop (porsi)", type: "sayur", protein: 2, calorie: 60, iron: 0.5, vitamin_c: 5 },
    { name: "Capcay (porsi)", type: "sayur", protein: 3, calorie: 80, iron: 1.0, vitamin_c: 8 },
    { name: "Buah Potong", type: "snack", protein: 1, calorie: 100, iron: 0.3, vitamin_c: 15 },
    { name: "Roti Isi", type: "snack", protein: 5, calorie: 200, iron: 1.0, vitamin_c: 0 },
    { name: "Air Mineral (botol)", type: "minuman", protein: 0, calorie: 0, iron: 0, vitamin_c: 0 },
    { name: "Susu Kotak", type: "minuman", protein: 7, calorie: 150, iron: 0.5, vitamin_c: 2 },
  ];

  const selectFromCatalog = (item: typeof FOOD_CATALOG[0]) => {
    setForm({
      ...form,
      food_name: item.name,
      food_type: item.type,
      protein_per_portion: item.protein.toString(),
      calorie_per_portion: item.calorie.toString(),
      iron_mg: item.iron > 0 ? item.iron.toString() : "",
      vitamin_c_mg: item.vitamin_c > 0 ? item.vitamin_c.toString() : "",
    });
    setShowCatalog(false);
    setFormStep(2);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.fetchJSON("/api/donations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, donor_id: user.id })
      });
      toast.success("Donasi berhasil dipublikasikan!");
      loadDonations();
      setForm({ ...form, food_name: "", portion_count: "", protein_per_portion: "", calorie_per_portion: "", iron_mg: "", vitamin_c_mg: "" });
      setShowForm(false);
      setFormStep(1);
    } catch (err: any) { toast.error(err.message || "Gagal mencatat donasi"); }
  };

  const handleComplete = async (donationId: number) => {
    try {
      await api.fetchJSON(`/api/donations/${donationId}/complete`, { method: "POST" });
      toast.success("Donasi berhasil diselesaikan!");
      loadDonations();
    } catch (err: any) { toast.error(err.message || "Gagal menyelesaikan donasi"); }
  };

  const filtered = donations.filter(d => {
    if (filterTab === "active") return d.status === "active";
    if (filterTab === "claimed") return d.status === "claimed";
    if (filterTab === "completed") return d.status === "completed";
    return true;
  });

  const statusCount = (status: string) => donations.filter(d => d.status === status).length;
  const totalPorsi = donations.filter(d => d.status !== "expired").reduce((a, d) => a + (d.portion_count || 0), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0";
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const statusBadge = (status: string, arrived?: boolean) => {
    const styles: Record<string, string> = {
      active: "bg-[#E8F5E9] text-[#2D7A4F] border border-[#52C77F]/30",
      claimed: arrived ? "bg-[#FFF3E0] text-[#E65100] border border-[#FFB74D]/30" : "bg-[#E3F2FD] text-[#1565C0] border border-[#90CAF9]/30",
      completed: "bg-gray-100 text-gray-600 border border-gray-200",
      expired: "bg-red-50 text-red-500 border border-red-200",
    };
    const labels: Record<string, string> = {
      active: "AKTIF", claimed: arrived ? "KURIR SAMPAI" : "DIKLAIM", completed: "SELESAI", expired: "KADALUARSA",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${styles[status] || styles.active}`}>
        {status === "active" && <Activity size={12} />}
        {status === "claimed" && <Truck size={12} />}
        {status === "completed" && <CheckCircle size={12} />}
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <LoadingSpinner size={36} label="Memuat dashboard..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F7F4EE] p-4 md:p-6 text-[#2C2C2C]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-5 border-l-4 border-[#2D7A4F] bg-gradient-to-r from-green-50/30 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#2D7A4F]">Dashboard Donor</h1>
                <span className="bg-[#E8F5E9] text-[#2D7A4F] text-xs font-bold px-3 py-1 rounded-full border border-[#52C77F]/30">{donations.length} Donasi</span>
              </div>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                {profile.business_name} — {profile.business_type}
                {reviews.length > 0 && (
                  <span className="flex items-center gap-1 text-[#F5A623] bg-[#FFF8E1] px-2 py-0.5 rounded-full text-xs font-bold border border-[#FFECB3]">
                    <Star size={12} fill="currentColor" /> {avgRating} ({reviews.length})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="relative p-2.5 text-gray-500 hover:text-gray-800 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <Bell size={22} />
                  {unreadCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 bg-[#E53935] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">{unreadCount}</motion.span>}
                </button>
                <AnimatePresence>
                  {showNotif && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl overflow-hidden z-50 border border-gray-100">
                      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white">
                        <h3 className="font-bold text-sm">Notifikasi</h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400"><Bell size={28} className="mx-auto mb-2 opacity-50" /><p className="text-sm">Belum ada notifikasi</p></div>
                        ) : notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b text-sm ${!n.is_read ? "bg-blue-50/50 border-l-2 border-l-[#1565C0]" : "hover:bg-gray-50"}`}>
                            <p className="font-bold text-gray-800">{n.title}</p>
                            <p className="text-gray-600 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: idLocale })}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => setShowProfile(true)} className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:border-[#2D7A4F] hover:text-[#2D7A4F] transition-all">Profil Saya</button>
              <button onClick={async () => { await logout(); nav("/"); }} className="text-sm font-medium text-gray-500 hover:text-[#E53935]">Logout</button>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {badges.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm text-sm" title={b.desc}>
                <span>{b.icon}</span>
                <span className="text-xs font-bold text-gray-700">{b.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Donasi", value: donations.length, icon: Package, color: "text-[#2D7A4F]", bg: "bg-[#E8F5E9]" },
            { label: "Total Porsi", value: totalPorsi, icon: TrendingUp, color: "text-[#1565C0]", bg: "bg-[#E3F2FD]" },
            { label: "Rating", value: reviews.length > 0 ? avgRating : "—", icon: Star, color: "text-[#F5A623]", bg: "bg-[#FFF8E1]" },
            { label: "Ulasan", value: reviews.length, icon: Dices, color: "text-gray-700", bg: "bg-gray-100" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${item.bg}`}><item.icon size={18} className={item.color} /></div>
                <div><div className={`text-lg md:text-xl font-bold ${item.color}`}>{item.value}</div><div className="text-[10px] text-gray-500">{item.label}</div></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Form Section */}
          <div className="md:col-span-1">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <button onClick={() => { setShowForm(!showForm); setFormStep(1); }} className="w-full flex items-center justify-between text-lg font-bold mb-1">
                <span className="flex items-center gap-2"><Plus size={20} className="text-[#2D7A4F]" /> Donasi Baru</span>
                <motion.span animate={{ rotate: showForm ? 45 : 0 }}><Plus size={20} className="text-[#2D7A4F]" /></motion.span>
              </button>
              <p className="text-xs text-gray-400 mb-4">Publikasikan surplus pangan Anda</p>

              <motion.div initial={false} animate={{ height: showForm ? "auto" : 0, opacity: showForm ? 1 : 0 }} className="overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm pt-3 border-t">
                  {/* Step indicator */}
                  {showForm && (
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3].map(s => <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${formStep >= s ? "bg-[#2D7A4F]" : "bg-gray-200"}`} />)}
                    </div>
                  )}

                  {/* Step 1: Basic Info */}
                  {formStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase">Informasi Makanan</p>

                      {/* Catalog toggle */}
                      {!showCatalog ? (
                        <button type="button" onClick={() => setShowCatalog(true)}
                          className="w-full flex items-center gap-2 text-xs font-bold text-[#2D7A4F] bg-[#E8F5E9] border border-[#52C77F]/30 px-3 py-2 rounded-xl hover:bg-[#C8E6C9] transition-all"
                        >
                          <Book size={14} /> Pilih dari Katalog Makanan
                        </button>
                      ) : null}

                      {/* Catalog grid */}
                      <AnimatePresence>
                        {showCatalog && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-gray-400">10 Makanan Tersedia</p>
                              <button type="button" onClick={() => setShowCatalog(false)} className="text-xs text-gray-400 hover:text-gray-600">Tutup</button>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                              {FOOD_CATALOG.map((item, ci) => (
                                <button key={ci} type="button" onClick={() => selectFromCatalog(item)}
                                  className="text-left p-2 rounded-lg border border-gray-200 hover:border-[#52C77F] hover:bg-[#E8F5E9] transition-all text-xs"
                                >
                                  <p className="font-bold truncate">{item.name}</p>
                                  <p className="text-[10px] text-gray-400">{item.protein}g protein · {item.calorie}kkal</p>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Nama Makanan</label>
                        <input placeholder="Ex: Nasi Kotak" value={form.food_name} onChange={e => setForm({ ...form, food_name: e.target.value })}
                          className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" required />
                      </div>

                      {/* Upload Foto */}
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Foto Makanan <span className="font-normal text-gray-400">opsional</span></label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all text-xs font-medium text-gray-600">
                            <Upload size={14} /> {uploading ? "Mengupload..." : "Pilih Foto"}
                            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const fd = new FormData();
                                  fd.append("photo", file);
                                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                                  const data = await res.json();
                                  if (data.url) { setForm(f => ({ ...f, photo_url: data.url })); toast.success("Foto diupload!"); }
                                } catch { toast.error("Gagal upload foto"); }
                                finally { setUploading(false); }
                              }}
                            />
                          </label>
                          {form.photo_url && (
                            <div className="relative">
                              <img src={form.photo_url} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                              <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: "" }))}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600"
                              >×</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Jumlah Porsi</label>
                          <input type="number" placeholder="Porsi" value={form.portion_count} onChange={e => setForm({ ...form, portion_count: e.target.value })}
                            className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Masa Layak (Jam)</label>
                          <input type="number" placeholder="Jam" value={form.hours_valid} onChange={e => setForm({ ...form, hours_valid: e.target.value })}
                            className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" required />
                        </div>
                      </div>
                      <button type="button" onClick={() => setFormStep(2)} disabled={!form.food_name || !form.portion_count}
                        className="w-full bg-[#2D7A4F] text-white py-3 rounded-xl font-bold mt-2 hover:bg-opacity-90 transition-all disabled:opacity-40"
                      >Selanjutnya</button>
                    </motion.div>
                  )}

                  {/* Step 2: Nutrition */}
                  {formStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase">Kandungan Gizi</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Protein/porsi (g)</label>
                          <input type="number" placeholder="Protein" value={form.protein_per_portion} onChange={e => setForm({ ...form, protein_per_portion: e.target.value })}
                            className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Kalori/porsi</label>
                          <input type="number" placeholder="Kalori" value={form.calorie_per_portion} onChange={e => setForm({ ...form, calorie_per_portion: e.target.value })}
                            className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Zat Besi (mg) <span className="font-normal text-gray-400">opsional</span></label>
                          <input type="number" placeholder="Fe" value={form.iron_mg} onChange={e => setForm({ ...form, iron_mg: e.target.value })}
                            className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">Vitamin C (mg) <span className="font-normal text-gray-400">opsional</span></label>
                          <input type="number" placeholder="Vit C" value={form.vitamin_c_mg} onChange={e => setForm({ ...form, vitamin_c_mg: e.target.value })}
                            className="w-full border border-gray-200 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] outline-none transition-all" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFormStep(1)} className="flex-1 border border-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">Kembali</button>
                        <button type="button" onClick={() => setFormStep(3)} disabled={!form.protein_per_portion || !form.calorie_per_portion}
                          className="flex-1 bg-[#2D7A4F] text-white py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all disabled:opacity-40"
                        >Selanjutnya</button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Confirm */}
                  {formStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase">Konfirmasi</p>
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                        <p><span className="font-bold">Makanan:</span> {form.food_name}</p>
                        <p><span className="font-bold">Porsi:</span> {form.portion_count}</p>
                        <p><span className="font-bold">Protein:</span> {form.protein_per_portion}g | <span className="font-bold">Kalori:</span> {form.calorie_per_portion}</p>
                        <p><span className="font-bold">Masa Layak:</span> {form.hours_valid} jam</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setFormStep(2)} className="flex-1 border border-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">Kembali</button>
                        <button type="submit" className="flex-1 bg-gradient-to-r from-[#2D7A4F] to-[#52C77F] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                          Publikasi Donasi
                        </button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>

          {/* List Section */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {([["all", "Semua"], ["active", "Aktif"], ["claimed", "Dalam Perjalanan"], ["completed", "Selesai"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setFilterTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    filterTab === key ? "bg-[#2D7A4F] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-[#2D7A4F] hover:text-[#2D7A4F]"
                  }`}
                >
                  {label}
                  {key !== "all" && <span className="text-xs ml-0.5 opacity-70">({statusCount(key)})</span>}
                </button>
              ))}
            </div>

            {/* Donation Cards */}
            <div className="grid gap-3">
              {filtered.map((d, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  key={d.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 card-hover"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg truncate">{d.food_name}</h3>
                      {statusBadge(d.status, (d as any).arrived_at)}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Package size={14} /> {d.portion_count} Porsi</span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {new Date(d.valid_until).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 justify-between w-full sm:w-auto shrink-0">
                    <div className="flex gap-2">
                      {(d.status === 'claimed' || (d as any).arrived_at) && (
                        <button onClick={() => setTrackingData({ ...d, donor_lat: d.pickup_latitude, donor_lon: d.pickup_longitude, donor_name: profile.business_name, recipient_lat: (d as any).recipient_info?.lat, recipient_lon: (d as any).recipient_info?.lon, recipient_name: (d as any).recipient_info?.name })}
                          className="text-xs border border-gray-300 text-gray-700 bg-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-1"
                        >Lacak Live</button>
                      )}
                      {d.status === 'claimed' && (
                        <button onClick={() => handleComplete(d.id)} className="text-xs bg-[#2D7A4F] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-opacity-90 transition-all">Selesai</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <EmptyState icon={<Package size={40} />}
                title={filterTab === "all" ? "Belum Ada Donasi" : "Tidak Ada Donasi"}
                description={filterTab === "all" ? "Mulai kurangi food waste dengan donasi pertama Anda." : `Tidak ada donasi dengan status ${filterTab}.`}
              />
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className="text-[#F5A623]" size={20} /> Ulasan Penerima</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {reviews.slice(0, 4).map((r: any) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={r.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 card-hover"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-[#1565C0]">{r.recipient_name}</span>
                        <div className="flex items-center text-[#F5A623]">
                          {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-300"} />))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 italic">"{r.comment}"</p>}
                      <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: idLocale })}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {trackingData && <LiveTrackingModal donation={trackingData} user={user} onClose={() => setTrackingData(null)} onComplete={loadDonations} />}
      {showProfile && <ProfileModal user={user} profile={profile} onClose={() => setShowProfile(false)} onUpdate={() => refresh()} />}
    </motion.div>
  );
}

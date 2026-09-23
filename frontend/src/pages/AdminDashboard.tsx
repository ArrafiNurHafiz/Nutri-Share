import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useRealtime, RealtimeEvent } from "../lib/useRealtime";
import { Claim } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { ProfileModal } from "../components/ProfileModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "motion/react";
import { SEO } from "../components/SEO";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import {
  Users,
  CheckCircle,
  Package,
  Trash2,
  UserCheck,
  TrendingUp,
  Activity,
  Shield,
  Database,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Search,
  X,
  LogOut,
  User,
  Heart,
  Compass,
  Layers,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

type TabId = "overview" | "verifikasi" | "data" | "aktivitas";
type SortKey = "name" | "type" | "total" | "status" | "urgency" | "emergency";
type SortDir = "asc" | "desc";

export function AdminDashboard() {
  const [users, setUsers] = useState<{ donors: any[]; recipients: any[] }>({
    donors: [],
    recipients: [],
  });
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchResults, setSearchResults] = useState<{
    donors: any[];
    recipients: any[];
    donations: any[];
    claims: any[];
  } | null>(null);
  const [trends, setTrends] = useState<{
    weekly: { date: string; count: number }[];
    foodTypes: any[];
    totalPortions: number;
    totalProtein: number;
  } | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const nav = useNavigate();
  const {
    user: currentUser,
    loading: authLoading,
    logout,
  } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "admin"))
      nav("/login");
  }, [authLoading, currentUser]);

  const loadData = useCallback(async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const [usr, clm, st, tr, logs] = await Promise.all([
        api.fetchJSON("/api/admin/users"),
        api.fetchJSON("/api/admin/claims"),
        api.fetchJSON("/api/dashboard/stats"),
        api.fetchJSON("/api/dashboard/trends"),
        api.fetchJSON("/api/activity-logs"),
      ]);
      setUsers(usr);
      setClaims(clm);
      setStats(st);
      setTrends(tr);
      setActivityLogs(logs);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") loadData();
  }, [loadData]);

  // Global search with debounce
  useEffect(() => {
    if (!search || search.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.fetchJSON(
          `/api/admin/search?q=${encodeURIComponent(search)}`,
        );
        setSearchResults(res);
      } catch {
        // ignore search error
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Real-time synchronization
  useRealtime(
    currentUser?.id,
    currentUser?.role,
    (event: RealtimeEvent) => {
      loadData();
      if (event.event_type === "CLAIM_CREATED") {
        toast("Klaim donasi baru masuk!");
      } else if (event.event_type === "CLAIM_APPROVED") {
        toast("Klaim donasi disetujui!");
      } else if (event.event_type === "DONATION_CREATED") {
        toast("Donasi baru telah dibuat!");
      } else if (event.event_type === "DELIVERY_ARRIVED") {
        toast.success("Kurir telah tiba di lokasi!");
      } else if (event.event_type === "HANDOVER_COMPLETED") {
        toast.success("Serah terima donasi selesai!");
      }
    },
    loadData,
    5000,
  );

  const handleVerify = async (userId: number, urgencyScore?: number) => {
    try {
      await api.fetchJSON(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urgency_score: urgencyScore }),
      });
      toast.success("Mitra berhasil diverifikasi!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memverifikasi user.");
    }
  };

  const handleEmergencyToggle = async (userId: number) => {
    try {
      const res = await api.fetchJSON(`/api/admin/users/${userId}/emergency`, {
        method: "POST",
      });
      toast.success(
        res.emergency === "approved"
          ? "Status darurat disetujui! Diprioritaskan di TOPSIS."
          : "Status darurat dinonaktifkan.",
      );
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status darurat.");
    }
  };

  const handleApproveClaim = async (claimId: number) => {
    try {
      await api.fetchJSON(`/api/admin/claims/${claimId}/approve`, {
        method: "POST",
      });
      toast.success("Klaim donasi berhasil disetujui!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyetujui klaim.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.fetchJSON(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success(`Akun ${deleteTarget.name} berhasil dihapus.`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus user.");
    }
  };

  const pendingDonors = users.donors.filter((d: any) => d.status === "pending");
  const pendingRecipients = users.recipients.filter(
    (r: any) => r.status === "pending",
  );
  const pendingClaims = claims.filter((c: any) => c.status === "pending");
  const totalPending =
    pendingDonors.length + pendingRecipients.length + pendingClaims.length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d: SortDir) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const pieData = {
    labels: ["Panti Asuhan", "Rumah Singgah", "Lembaga Sosial / Lainnya"],
    datasets: [
      {
        label: "Sebaran",
        data: [
          users.recipients.filter((x: any) => x.institution_type === "panti_asuhan").length,
          users.recipients.filter((x: any) => x.institution_type === "rumah_singgah").length,
          users.recipients.filter(
            (x: any) =>
              x.institution_type === "lainnya" ||
              x.institution_type === "lembaga_sosial",
          ).length,
        ],
        backgroundColor: ["#2D7A4F", "#059669", "#D97706"],
      },
    ],
  };

  const tabs = [
    { id: "overview" as TabId, label: "Overview & Metrik", icon: Layers },
    { id: "verifikasi" as TabId, label: "Verifikasi & Klaim", icon: Shield, count: totalPending },
    { id: "data" as TabId, label: "Data Mitra & Penerima", icon: Database },
    { id: "aktivitas" as TabId, label: "Log Aktivitas", icon: Activity },
  ];

  const statCards = [
    {
      label: "Total Mitra Donatur",
      value: stats.donors || 0,
      icon: Heart,
      color: "text-[#2D7A4F]",
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
      desc: "Hotel, Resto & Kafe terdaftar",
    },
    {
      label: "Lembaga Penerima",
      value: stats.recipients || 0,
      icon: Users,
      color: "text-[#2563EB]",
      bg: "bg-[#EFF6FF]",
      border: "border-[#BFDBFE]",
      desc: "Panti asuhan & rumah singgah",
    },
    {
      label: "Donasi Aktif & Berjalan",
      value: stats.active_donations || 0,
      icon: Package,
      color: "text-[#D97706]",
      bg: "bg-[#FFFBEB]",
      border: "border-[#FDE68A]",
      desc: "Siap disalurkan via TOPSIS",
    },
    {
      label: "Donasi Selesai",
      value: stats.completed_donations || 0,
      icon: CheckCircle,
      color: "text-[#059669]",
      bg: "bg-[#F0FDF4]",
      border: "border-[#BBF7D0]",
      desc: "Tersalurkan ke penerima",
    },
  ];

  const sortDonors = (list: any[]) => {
    return [...list].sort((a, b) => {
      let va: any, vb: any;
      switch (sortKey) {
        case "name":
          va = a.business_name || a.name;
          vb = b.business_name || b.name;
          break;
        case "type":
          va = a.business_type || "";
          vb = b.business_type || "";
          break;
        case "total":
          va = a.total_donations || 0;
          vb = b.total_donations || 0;
          break;
        case "status":
          va = a.status || "";
          vb = b.status || "";
          break;
        default:
          va = a.id;
          vb = b.id;
      }
      if (typeof va === "string")
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  };

  const sortRecipients = (list: any[]) => {
    return [...list].sort((a, b) => {
      let va: any, vb: any;
      switch (sortKey) {
        case "name":
          va = a.institution_name || a.name;
          vb = b.institution_name || b.name;
          break;
        case "type":
          va = a.institution_type || "";
          vb = b.institution_type || "";
          break;
        case "status":
          va = a.status || "";
          vb = b.status || "";
          break;
        case "urgency":
          va = a.urgency_score || 0;
          vb = b.urgency_score || 0;
          break;
        case "emergency":
          va = a.emergency || "none";
          vb = b.emergency || "none";
          break;
        default:
          va = a.id;
          vb = b.id;
      }
      if (typeof va === "string")
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const filteredDonors = sortDonors(
    users.donors.filter(
      (d) =>
        !search ||
        d.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const filteredRecipients = sortRecipients(
    users.recipients.filter(
      (r) =>
        !search ||
        r.institution_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  if (authLoading || !currentUser) return null;
  if (loading)
    return <LoadingSpinner size={36} label="Memuat Control Center Admin..." />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col">
      <SEO title="Control Center Admin | NutriShare" description="Pusat kendali ekosistem donasi pangan dan pemantauan real-time." />

      {/* ===== COMMAND CENTER TOP HEADER ===== */}
      <header className="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden border-b border-emerald-800">
        {/* Ambient background glow & image */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img
            src="/images/nutrishare_hero.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-emerald-950/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Brand and Title */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src="/images/logoterbaru.webp"
                    alt="NutriShare Logo"
                    className="w-9 h-9 object-contain"
                  />
                  <span className="text-xl font-extrabold tracking-tight font-heading text-white">
                    NutriShare
                  </span>
                </Link>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-[#e1fcad] border border-emerald-400/40">
                  Command Center
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 max-w-xl">
                Platform pusat orkestrasi surplus pangan, penentuan prioritas gizi Hybrid TOPSIS, dan verifikasi mitra.
              </p>
            </div>

            {/* Live Indicator & Quick Header Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-500/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs font-semibold text-emerald-100">
                  Realtime Synced
                </span>
              </div>

              <Link
                to="/peta"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#e1fcad] hover:text-emerald-950 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
              >
                <Compass size={14} />
                <span>Peta Sebaran</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  loadData();
                  toast.success("Data berhasil diperbarui!");
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw size={14} />
              </button>

              <button
                type="button"
                onClick={() => setShowProfile(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
              >
                <User size={14} />
                <span>{currentUser.name}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  nav("/");
                }}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors border border-red-500/30 cursor-pointer"
                title="Keluar"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Floating Navigation Pill Bar */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-[#0F172A] shadow-md shadow-black/20"
                    : "bg-white/10 hover:bg-white/15 text-white/80 border border-white/5"
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
                {Boolean(tab.count) && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DC2626] text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Global Search Bar if on User Data or Overview */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari data mitra donatur, panti asuhan penerima, donasi, atau klaim..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#0F172A] shadow-xs focus:outline-none focus:border-[#2D7A4F] focus:ring-2 focus:ring-[#2D7A4F]/10 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown/Card */}
        {searchResults && (
          <div className="bg-white rounded-2xl border border-[#CBD5E1] p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#64748B]">
              Hasil Pencarian ({search})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {searchResults.donors?.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-[#2D7A4F]">Mitra Donatur ({searchResults.donors.length})</span>
                  {searchResults.donors.map((d: any) => (
                    <div key={d.id} className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex justify-between items-center">
                      <div>
                        <p className="font-bold">{d.business_name || d.name}</p>
                        <p className="text-[11px] text-[#64748B]">{d.email} • {d.business_type}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2E8F0]">{d.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.recipients?.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-[#2563EB]">Lembaga Penerima ({searchResults.recipients.length})</span>
                  {searchResults.recipients.map((r: any) => (
                    <div key={r.id} className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex justify-between items-center">
                      <div>
                        <p className="font-bold">{r.institution_name || r.name}</p>
                        <p className="text-[11px] text-[#64748B]">{r.email} • Urgensi: {r.urgency_score || 1}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2E8F0]">{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TAB 1: OVERVIEW & METRICS ===== */}
        {activeTab === "overview" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stat Cards Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((item) => (
                  <div
                    key={item.label}
                    className={`p-5 rounded-2xl border ${item.border} ${item.bg} shadow-xs flex flex-col justify-between gap-4 transition-transform hover:-translate-y-0.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                        {item.label}
                      </span>
                      <item.icon size={20} className={item.color} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                        {item.value}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Graphical Charts Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                    <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#2D7A4F]" />
                      Tren Distribusi Pangan Mingguan
                    </h3>
                    <span className="text-[11px] text-[#64748B]">Data 7 hari terakhir</span>
                  </div>
                  {trends && trends.weekly.some((d) => d.count > 0) ? (
                    <div className="h-64">
                      <Line
                        data={{
                          labels: trends.weekly.map((d) => {
                            const dt = new Date(d.date);
                            return dt.toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                            });
                          }),
                          datasets: [
                            {
                              label: "Donasi Tersalurkan",
                              data: trends.weekly.map((d) => d.count),
                              fill: true,
                              borderColor: "#2D7A4F",
                              backgroundColor: "rgba(45, 122, 79, 0.08)",
                              tension: 0.4,
                              pointBackgroundColor: "#2D7A4F",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-[#94A3B8]">
                      Menunggu akumulasi data donasi minggu ini...
                    </div>
                  )}
                </div>

                {/* Recipient Distribution Pie */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                  <div className="border-b border-[#F1F5F9] pb-3">
                    <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <Users size={16} className="text-[#2563EB]" />
                      Proporsi Lembaga Penerima
                    </h3>
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    {users.recipients.length > 0 ? (
                      <Pie
                        data={pieData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom" as const,
                              labels: { boxWidth: 12, font: { size: 10 } },
                            },
                          },
                        }}
                      />
                    ) : (
                      <span className="text-xs text-[#94A3B8]">Belum ada data lembaga</span>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ===== TAB 2: VERIFIKASI & KLAIM ===== */}
        {activeTab === "verifikasi" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="verifikasi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Pending Claims Review */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <Package size={16} className="text-[#D97706]" />
                      Persetujuan Klaim Donasi ({pendingClaims.length})
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Klaim dari panti asuhan/lembaga yang menunggu verifikasi admin sebelum proses penjemputan.
                    </p>
                  </div>
                </div>

                {pendingClaims.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#94A3B8]">
                    Tidak ada antrean klaim yang tertunda. Semua klaim telah diproses.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {pendingClaims.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-4 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-[#78350F]">
                              {c.food_name || `Donasi #${c.donation_id}`}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
                              Rank TOPSIS: #{c.topsis_rank_at_claim || 1}
                            </span>
                          </div>
                          <p className="text-xs text-[#92400E]">
                            Pemohon: <strong>{c.institution_name || `Recipient #${c.recipient_id}`}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApproveClaim(c.id)}
                          className="w-full py-2 bg-[#2D7A4F] hover:bg-[#235F3D] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Setujui Penjemputan Makanan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending User Verifications */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <div className="border-b border-[#F1F5F9] pb-3">
                  <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                    <UserCheck size={16} className="text-[#2D7A4F]" />
                    Partner &amp; Shelter Verification Queue ({pendingDonors.length + pendingRecipients.length})
                  </h3>
                </div>

                {pendingDonors.length === 0 && pendingRecipients.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#94A3B8]">
                    All donor partners and beneficiary institutions are verified.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingDonors.map((d: any) => (
                      <div key={d.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#2D7A4F] uppercase">HoReKa Donor Partner</span>
                          <h4 className="font-bold text-sm text-[#0F172A]">{d.business_name || d.name}</h4>
                          <p className="text-xs text-[#64748B]">{d.email} • {d.business_type} • Telp: {d.phone || "-"}</p>
                          <p className="text-[11px] text-[#94A3B8] truncate">{d.address || "Yogyakarta"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerify(d.id)}
                          className="w-full py-2 bg-[#2D7A4F] hover:bg-[#235F3D] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Verify Donor Account
                        </button>
                      </div>
                    ))}

                    {/* Recipients */}
                    {pendingRecipients.map((r: any) => (
                      <div key={r.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#2563EB] uppercase">Beneficiary Shelter</span>
                          <h4 className="font-bold text-sm text-[#0F172A]">{r.institution_name || r.name}</h4>
                          <p className="text-xs text-[#64748B]">{r.email} • {r.resident_count || 0} Residents</p>
                          <p className="text-[11px] text-[#94A3B8] truncate">{r.address || "Yogyakarta"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerify(r.id, 3)}
                            className="flex-1 py-2 bg-[#2D7A4F] hover:bg-[#235F3D] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Verify (High Priority)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerify(r.id, 1)}
                            className="px-3 py-2 bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Standard
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ===== TAB 3: USER DATA ===== */}
        {activeTab === "data" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Donors Table Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <h3 className="font-bold text-sm text-[#0F172A]">Donor Partners List ({filteredDonors.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#F1F5F9] text-[#64748B] uppercase tracking-wider font-semibold">
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort("name")}>Business Name <SortIcon k="name" /></th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Email &amp; Phone</th>
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort("total")}>Total Donations <SortIcon k="total" /></th>
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort("status")}>Status <SortIcon k="status" /></th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {filteredDonors.map((d) => (
                        <tr key={d.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 font-bold text-[#0F172A]">{d.business_name || d.name}</td>
                          <td className="py-3 text-[#64748B] capitalize">{d.business_type || "-"}</td>
                          <td className="py-3 text-[#64748B]">{d.email} {d.phone && `• ${d.phone}`}</td>
                          <td className="py-3 font-bold text-[#2D7A4F]">{d.total_donations || 0} Portions</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === "verified" ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FFFBEB] text-[#92400E]"
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: d.id, name: d.business_name || d.name })}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recipients Table Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                  <h3 className="font-bold text-sm text-[#0F172A]">Beneficiary Institutions List ({filteredRecipients.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#F1F5F9] text-[#64748B] uppercase tracking-wider font-semibold">
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort("name")}>Institution Name <SortIcon k="name" /></th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Residents</th>
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort("urgency")}>Urgency Level <SortIcon k="urgency" /></th>
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort("emergency")}>Emergency <SortIcon k="emergency" /></th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {filteredRecipients.map((r: any) => (
                        <tr key={r.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 font-bold text-[#0F172A]">{r.institution_name || r.name}</td>
                          <td className="py-3 text-[#64748B] capitalize">{r.institution_type?.replace(/_/g, " ") || "-"}</td>
                          <td className="py-3 text-[#64748B]">{r.resident_count || 0} People</td>
                          <td className="py-3 font-bold text-[#2563EB]">Level {r.urgency_score || 1}</td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => handleEmergencyToggle(r.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                r.emergency === "approved" || r.emergency === "pending"
                                  ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                                  : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              {r.emergency === "approved" || r.emergency === "pending" ? "Active (Priority)" : "Normal"}
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: r.id, name: r.institution_name || r.name })}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ===== TAB 4: ACTIVITY LOGS ===== */}
        {activeTab === "aktivitas" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="aktivitas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                  <Activity size={16} className="text-[#2D7A4F]" />
                  Audit Trail & Log Aktivitas Sistem
                </h3>
              </div>

              {activityLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  Belum ada rekaman aktivitas sistem.
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log: any, idx: number) => (
                    <div
                      key={log.id || idx}
                      className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#2D7A4F]" />
                        <div>
                          <p className="font-bold text-[#0F172A]">{log.action || "Aksi Sistem"}</p>
                          <p className="text-[11px] text-[#64748B]">{log.details || "-"}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono">
                        {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Hapus Akun Pengguna"
          message={`Apakah Anda yakin ingin menghapus akun "${deleteTarget.name}" secara permanen? Seluruh profil terkait akan dihapus.`}
          confirmLabel="Hapus Permanen"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

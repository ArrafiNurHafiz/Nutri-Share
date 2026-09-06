import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useRealtime, RealtimeEvent } from "../lib/useRealtime";
import { Claim } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { ProfileModal } from "../components/ProfileModal";
import { EmptyState } from "../components/EmptyState";
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
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Users,
  FileCheck,
  CheckCircle,
  Package,
  Mail,
  Building2,
  Trash2,
  UserCheck,
  TrendingUp,
  Activity,
  LayoutDashboard,
  Shield,
  Settings,
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
  Upload,
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

const AUTO_REFRESH_MS = 5000;

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
  const [prevStats, setPrevStats] = useState<any>({});
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
  const [searching, setSearching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = useNavigate();
  const {
    user: currentUser,
    profile,
    loading: authLoading,
    logout,
    refresh,
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
      setPrevStats(stats);
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
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.fetchJSON(
          `/api/admin/search?q=${encodeURIComponent(search)}`,
        );
        setSearchResults(res);
      } catch {
      } finally {
        setSearching(false);
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
        toast("Klaim donasi baru masuk!", { icon: "🔔" });
      } else if (event.event_type === "CLAIM_APPROVED") {
        toast("Klaim donasi disetujui!", { icon: "✅" });
      } else if (event.event_type === "DONATION_CREATED") {
        toast("Donasi baru telah dibuat!", { icon: "📦" });
      } else if (event.event_type === "DELIVERY_ARRIVED") {
        toast("Penerima tiba di lokasi donasi!", { icon: "📍" });
      } else if (event.event_type === "HANDOVER_COMPLETED") {
        toast("Distribusi donasi selesai!", { icon: "🤝" });
      } else if (event.event_type === "EMERGENCY_STATUS_UPDATED") {
        toast("Status darurat penerima diperbarui!", { icon: "🚨" });
      }
    },
    loadData,
    AUTO_REFRESH_MS,
  );

  const handleVerify = async (userId: number, urgencyScore?: number) => {
    const body = urgencyScore ? { urgency_score: urgencyScore } : {};
    try {
      await api.fetchJSON(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      toast.success("User verified successfully");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
  };

  const handleEmergencyToggle = async (userId: number) => {
    try {
      const res = await api.fetchJSON(`/api/admin/users/${userId}/emergency`, {
        method: "POST",
      });
      const msgs: Record<string, string> = {
        active: "Emergency status ACTIVE",
        pending: "Emergency request submitted",
        none: "Emergency status INACTIVE",
      };
      toast.success(
        msgs[res.emergency as string] || "Emergency status changed",
      );
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to change emergency status");
    }
  };

  const handleApproveClaim = async (claimId: number) => {
    try {
      await api.fetchJSON(`/api/admin/claims/${claimId}/approve`, {
        method: "POST",
      });
      toast.success("Claim approved");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve claim");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.fetchJSON(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.success(`User deleted successfully`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const chartData = {
    labels: users.donors.slice(0, 5).map((d) => d.business_name || d.name),
    datasets: [
      {
        label: "Total Donations",
        data: users.donors.slice(0, 5).map((d) => d.total_donations || 0),
        backgroundColor: [
          "#10b981",
          "#047857",
          "#34d399",
          "#6ee7b7",
          "#d1fae5",
        ],
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: ["Orphanages", "Shelters", "Others"],
    datasets: [
      {
        label: "Distribution",
        data: [
          users.recipients.filter((x) => x.institution_type === "panti_asuhan")
            .length,
          users.recipients.filter((x) => x.institution_type === "rumah_singgah")
            .length,
          users.recipients.filter(
            (x) =>
              x.institution_type === "lainnya" ||
              x.institution_type === "lembaga_sosial",
          ).length,
        ],
        backgroundColor: ["#10b981", "#047857", "#d4893b"],
      },
    ],
  };

  const tabs = [
    { id: "overview" as TabId, label: "Dashboard", icon: LayoutDashboard },
    { id: "verifikasi" as TabId, label: "Verification", icon: Shield },
    { id: "data" as TabId, label: "User Data", icon: Database },
    { id: "aktivitas" as TabId, label: "Activity Log", icon: Activity },
  ];

  const statCards = [
    {
      label: "Total Donors",
      value: stats.donors || 0,
      icon: Heart,
      color: "text-primary-orange",
      trend: "+12% this month",
      trendUp: true,
    },
    {
      label: "Total Recipients",
      value: stats.recipients || 0,
      icon: Users,
      color: "text-brand-dark",
      trend: "+5.2% this month",
      trendUp: true,
    },
    {
      label: "Active Donations",
      value: stats.active_donations || 0,
      icon: Package,
      color: "text-accent",
      trend: "In processing queue",
      trendUp: null,
    },
    {
      label: "Completed",
      value: stats.completed_donations || 0,
      icon: CheckCircle,
      color: "text-accent-light",
      trend: "Lifetime successful shares",
      trendUp: null,
    },
  ];

  // Sort helpers
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
    return sortDir === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
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
    return <LoadingSpinner size={36} label="Loading admin dashboard..." />;

  return (
    <div className="h-screen overflow-hidden bg-surface-gray text-on-surface font-sans">
      <SEO title="Admin Dashboard | NutriShare" />

      <div className="flex h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ===== SIDEBAR ===== */}
        <aside
          className={`flex flex-col h-screen p-4 gap-4 bg-surface-gray border-r border-[#e7e5e4] w-64 shrink-0 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:relative z-50`}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-brand-dark font-heading">
              NutriShare
            </h1>
            <p className="text-gray-500 text-xs font-semibold tracking-widest uppercase mt-1">
              Intelligence Panel
            </p>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-primary-orange/10 text-primary-orange-dark shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto border-t border-[#e7e5e4] pt-4 space-y-3">
            <button
              onClick={() => nav("/map")}
              className="w-full bg-primary-orange/10 hover:bg-primary-orange/20 text-primary-orange-dark py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-xs"
            >
              <Search size={16} /> Browse Map
            </button>
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-brand-medium/20 flex items-center justify-center text-brand-dark font-bold text-sm">
                A
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-gray-500">Administrator</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
              >
                <Settings size={14} /> Profile
              </button>
              <button
                onClick={() => nav("/contact")}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
              >
                <Shield size={14} /> Support
              </button>
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 overflow-y-auto bg-surface-gray">
          {/* Top Bar */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 lg:px-8 sticky top-0 bg-[#faf8f4]/90 backdrop-blur-md z-10 border-b border-[#e7e5e4]/80">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-lg"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-brand-dark font-heading">
                  Good Morning, Admin 👋
                </h2>
                <p className="text-xs text-gray-500">
                  Monitor food rescue operations in real time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800">
                  LIVE · Real-time synchronization active
                </span>
              </div>
              <button
                onClick={() => {
                  loadData();
                  toast.success("Data refreshed");
                }}
                className="p-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={async () => {
                  await logout();
                  nav("/");
                }}
                className="flex items-center gap-1.5 text-gray-600 hover:text-alert-red px-3 py-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-xs font-bold"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </header>

          <div className="p-4 lg:p-8 space-y-6 max-w-[1280px] mx-auto">
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Stats Cards */}
                  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.05 * i }}
                        className="bg-white p-6 rounded-xl border border-[#e7e5e4]/50 hover:border-primary-orange/30 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-gray-500 text-sm font-medium">
                            {item.label}
                          </span>
                          <item.icon size={22} className={item.color} />
                        </div>
                        <div className="mt-4">
                          <h3 className="text-3xl font-bold text-brand-dark">
                            {item.value}
                          </h3>
                          {item.trendUp !== null && (
                            <p className="text-xs text-primary-orange font-bold flex items-center gap-1 mt-1">
                              <TrendingUp size={12} />
                              {item.trend}
                            </p>
                          )}
                          {item.trendUp === null && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.trend}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </section>

                  {/* Charts Section */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                    {/* Weekly Trends */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#e7e5e4]/50">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-brand-dark">
                          Weekly Donation Trends
                        </h3>
                      </div>
                      {trends && trends.weekly.some((d) => d.count > 0) ? (
                        <div className="h-64">
                          <Line
                            data={{
                              labels: trends.weekly.map((d) => {
                                const dt = new Date(d.date);
                                return dt.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  day: "numeric",
                                });
                              }),
                              datasets: [
                                {
                                  label: "Donations",
                                  data: trends.weekly.map((d) => d.count),
                                  fill: true,
                                  borderColor: "#10b981",
                                  backgroundColor: "rgba(16,185,129,0.08)",
                                  tension: 0.4,
                                  pointBackgroundColor: "#10b981",
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: { stepSize: 1 },
                                },
                              },
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                          Waiting for data...
                        </div>
                      )}
                    </div>

                    {/* Food Categories */}
                    <div className="bg-white p-6 rounded-xl border border-[#e7e5e4]/50 flex flex-col">
                      <h3 className="font-bold text-lg text-brand-dark mb-4">
                        Institution Distribution
                      </h3>
                      {users.recipients.length > 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <Pie
                            data={pieData}
                            options={{
                              responsive: true,
                              plugins: { legend: { position: "bottom" } },
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                          No data yet
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Trend Stats */}
                  {trends && trends.weekly.some((d) => d.count > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
                      <div className="bg-white p-5 rounded-xl border border-[#e7e5e4]/50 text-center">
                        <div className="text-2xl font-bold text-primary-orange">
                          {trends.totalPortions}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Total Portions
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#e7e5e4]/50 text-center">
                        <div className="text-2xl font-bold text-brand-dark">
                          {trends.totalProtein.toFixed(0)}g
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Total Protein
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-[#e7e5e4]/50 text-center">
                        <div className="text-2xl font-bold text-accent">
                          {trends.weekly
                            .filter((d) => d.count > 0)
                            .reduce((a, d) => a + d.count, 0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          7-Day Donations
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TOPSIS Intelligence Section */}
                  <section className="bg-brand-dark text-white p-8 rounded-2xl relative overflow-hidden mt-6">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-orange rounded-full blur-[100px] opacity-20" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2 text-brand-light mb-2">
                          <span className="text-xs font-bold uppercase tracking-widest">
                            Decision Intelligence
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                          TOPSIS Distribution Logic
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                          Our system uses the Technique for Order of Preference
                          by Similarity to Ideal Solution to prioritize food
                          distribution. It balances nutritional value,
                          proximity, and urgency.
                        </p>
                        <div className="mt-4 flex gap-4 text-[10px] text-white/40">
                          <span>Urgency: 35%</span>
                          <span>Proximity: 25%</span>
                          <span>Nutrition: 30%</span>
                          <span>Equity: 10%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toast.success("TOPSIS Recalculation Started");
                        }}
                        className="px-6 py-3 bg-primary-orange text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary-orange/20 transition-all active:scale-95"
                      >
                        <RefreshCw size={18} />
                        Recalculate Now
                      </button>
                    </div>
                  </section>
                </motion.div>
              </AnimatePresence>
            )}

            {/* ===== VERIFICATION TAB ===== */}
            {activeTab === "verifikasi" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="verifikasi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Verify Recipients */}
                    <div className="bg-white rounded-xl border border-[#e7e5e4]/50 p-6">
                      <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-brand-medium" />{" "}
                        Verify Recipients
                      </h2>
                      {users.recipients.filter((u) => u.status === "pending")
                        .length === 0 ? (
                        <EmptyState
                          icon={<CheckCircle size={32} />}
                          title="All Clear"
                          description="No pending recipients."
                        />
                      ) : (
                        <div className="space-y-3">
                          {users.recipients
                            .filter((u) => u.status === "pending")
                            .map((u, i) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={u.id}
                                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-brand-dark/10 flex items-center justify-center text-sm font-bold text-brand-dark">
                                    {(u.institution_name || "R")[0]}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-sm">
                                      {u.institution_name || u.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      {u.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-bold shrink-0 text-gray-600">
                                    Urgency:
                                  </label>
                                  <select
                                    id={`urgency-${u.id}`}
                                    className="border border-gray-200 rounded-lg p-1.5 text-sm bg-white focus:ring-2 focus:ring-primary-orange outline-none"
                                    defaultValue="3"
                                  >
                                    {[1, 2, 3, 4, 5].map((v) => (
                                      <option key={v} value={v}>
                                        {v} -{" "}
                                        {
                                          [
                                            "Standard",
                                            "Vulnerable",
                                            "Attention",
                                            "High",
                                            "Critical",
                                          ][v - 1]
                                        }
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => {
                                      const el = document.getElementById(
                                        `urgency-${u.id}`,
                                      ) as HTMLSelectElement;
                                      handleVerify(u.id, parseInt(el.value));
                                    }}
                                    className="ml-auto bg-primary-orange text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-orange-dark transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle size={16} /> Verify
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Approve Claims */}
                    <div className="bg-white rounded-xl border border-[#e7e5e4]/50 p-6">
                      <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                        <FileCheck size={20} className="text-brand-medium" />{" "}
                        Claim Approvals
                      </h2>
                      {claims.filter((c) => c.status === "pending").length ===
                      0 ? (
                        <EmptyState
                          icon={<Package size={32} />}
                          title="No queue"
                          description="No pending claims."
                        />
                      ) : (
                        <div className="space-y-3">
                          {claims
                            .filter((c) => c.status === "pending")
                            .map((c, i) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                key={c.id}
                                className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-bold text-sm text-brand-dark flex items-center gap-1">
                                    <Package size={16} /> Claim #{c.donation_id}
                                  </h3>
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded font-mono font-bold text-gray-700">
                                    Rank #{c.topsis_rank_at_claim}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  Institution:{" "}
                                  <b>{c.institution_name || "Unknown"}</b>
                                </p>
                                <button
                                  onClick={() => handleApproveClaim(c.id)}
                                  className="w-full bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                                >
                                  Approve Claim
                                </button>
                              </motion.div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* ===== DATA TAB ===== */}
            {activeTab === "data" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Search */}
                  <div className="mb-5">
                    <div className="relative max-w-md">
                      <Search
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users, donations, claims..."
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 bg-white focus:ring-2 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all text-sm"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    {searching && (
                      <p className="text-xs text-gray-400 mt-1">Searching...</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Donor Table */}
                    <div className="bg-white rounded-xl border border-[#e7e5e4]/50 p-5">
                      <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-brand-medium" />{" "}
                        Donors
                      </h2>
                      {filteredDonors.length === 0 ? (
                        <EmptyState
                          icon={<Users size={32} />}
                          title="Empty"
                          description="No donors yet."
                        />
                      ) : (
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-gray-500">
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("name")}
                                >
                                  <span className="flex items-center gap-1">
                                    Name <SortIcon k="name" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("type")}
                                >
                                  <span className="flex items-center gap-1">
                                    Type <SortIcon k="type" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("total")}
                                >
                                  <span className="flex items-center gap-1">
                                    Donations <SortIcon k="total" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("status")}
                                >
                                  <span className="flex items-center gap-1">
                                    Status <SortIcon k="status" />
                                  </span>
                                </th>
                                <th className="pb-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDonors.map((d) => (
                                <tr
                                  key={d.id}
                                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                >
                                  <td className="py-3">
                                    <div className="font-medium">
                                      {d.business_name || d.name}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <Mail size={12} />
                                      {d.email}
                                    </div>
                                  </td>
                                  <td className="py-3 capitalize text-gray-600">
                                    {d.business_type || "-"}
                                  </td>
                                  <td className="py-3 font-bold">
                                    {d.total_donations || 0}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        d.status === "verified"
                                          ? "bg-brand-medium/10 text-brand-medium"
                                          : "bg-accent-light/10 text-accent"
                                      }`}
                                    >
                                      {d.status === "verified"
                                        ? "Verified"
                                        : "Pending"}
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      {d.status !== "verified" && (
                                        <button
                                          onClick={() => handleVerify(d.id)}
                                          className="text-primary-orange hover:text-primary-orange-dark transition-colors"
                                          title="Verify"
                                        >
                                          <UserCheck size={16} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          setDeleteTarget({
                                            id: d.id,
                                            name: d.business_name || d.name,
                                          })
                                        }
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Recipient Table */}
                    <div className="bg-white rounded-xl border border-[#e7e5e4]/50 p-5">
                      <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                        <Users size={20} className="text-brand-dark" />{" "}
                        Recipients
                      </h2>
                      {filteredRecipients.length === 0 ? (
                        <EmptyState
                          icon={<Users size={32} />}
                          title="Empty"
                          description="No recipients yet."
                        />
                      ) : (
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 text-left text-gray-500">
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("name")}
                                >
                                  <span className="flex items-center gap-1">
                                    Name <SortIcon k="name" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("type")}
                                >
                                  <span className="flex items-center gap-1">
                                    Type <SortIcon k="type" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("urgency")}
                                >
                                  <span className="flex items-center gap-1">
                                    Urgency <SortIcon k="urgency" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("emergency")}
                                >
                                  <span className="flex items-center gap-1">
                                    Emergency <SortIcon k="emergency" />
                                  </span>
                                </th>
                                <th
                                  className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none"
                                  onClick={() => handleSort("status")}
                                >
                                  <span className="flex items-center gap-1">
                                    Status <SortIcon k="status" />
                                  </span>
                                </th>
                                <th className="pb-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRecipients.map((r) => (
                                <tr
                                  key={r.id}
                                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                                    r.emergency === "active"
                                      ? "bg-red-50"
                                      : r.emergency === "pending"
                                        ? "bg-yellow-50"
                                        : ""
                                  }`}
                                >
                                  <td className="py-3">
                                    <div className="font-medium">
                                      {r.institution_name || r.name}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                      <Mail size={12} />
                                      {r.email}
                                    </div>
                                  </td>
                                  <td className="py-3 capitalize text-gray-600">
                                    {r.institution_type?.replace(/_/g, " ") ||
                                      "-"}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`font-bold ${
                                        (r.urgency_score || 0) >= 4
                                          ? "text-red-600"
                                          : (r.urgency_score || 0) >= 3
                                            ? "text-yellow-600"
                                            : "text-gray-600"
                                      }`}
                                    >
                                      {r.urgency_score || "-"}/5
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    <button
                                      onClick={() =>
                                        handleEmergencyToggle(r.id)
                                      }
                                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                        r.emergency === "active"
                                          ? "bg-red-500 text-white hover:bg-red-600"
                                          : r.emergency === "pending"
                                            ? "bg-accent text-white hover:opacity-90"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                      }`}
                                    >
                                      {r.emergency === "active"
                                        ? "Active"
                                        : r.emergency === "pending"
                                          ? "Pending"
                                          : "Inactive"}
                                    </button>
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        r.status === "verified"
                                          ? "bg-brand-medium/10 text-brand-medium"
                                          : "bg-accent-light/10 text-accent"
                                      }`}
                                    >
                                      {r.status === "verified"
                                        ? "Verified"
                                        : "Pending"}
                                    </span>
                                  </td>
                                  <td className="py-3">
                                    <button
                                      onClick={() =>
                                        setDeleteTarget({
                                          id: r.id,
                                          name: r.institution_name || r.name,
                                        })
                                      }
                                      className="text-red-400 hover:text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* ===== ACTIVITY TAB ===== */}
            {activeTab === "aktivitas" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="aktivitas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-white rounded-xl border border-[#e7e5e4]/50 p-6">
                    <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                      <Activity size={20} className="text-brand-medium" />{" "}
                      Activity History
                    </h2>
                    {activityLogs.length === 0 ? (
                      <EmptyState
                        icon={<Activity size={32} />}
                        title="No activity yet"
                        description="Activity will appear when interactions occur."
                      />
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {activityLogs.map((log: any) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 bg-[#faf8f4] rounded-xl text-sm"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary-orange-bg flex items-center justify-center text-xs font-bold text-primary-orange shrink-0">
                              {log.user_name?.[0] || "N"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium capitalize">
                                {log.action?.replace(/_/g, " ")}
                              </p>
                              {log.details && (
                                <p className="text-xs text-gray-500 truncate">
                                  {log.details}
                                </p>
                              )}
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {log.user_name && (
                                  <span className="font-medium">
                                    {log.user_name}
                                  </span>
                                )}{" "}
                                ·{" "}
                                {new Date(log.created_at).toLocaleString(
                                  "en-US",
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
      {showProfile && (
        <ProfileModal
          user={currentUser}
          profile={profile}
          onClose={() => setShowProfile(false)}
          onUpdate={() => refresh()}
        />
      )}
    </div>
  );
}

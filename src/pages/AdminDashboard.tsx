import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Claim } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { ProfileModal } from "../components/ProfileModal";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "motion/react"
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
  Filler
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Users, FileCheck, CheckCircle, Package, Mail, Building2, Trash2,
  UserCheck, TrendingUp, Activity, LayoutDashboard, Shield, Database,
  RefreshCw, ChevronUp, ChevronDown, ArrowUpDown, Search, X
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

type TabId = "overview" | "verifikasi" | "data" | "aktivitas";
type SortKey = "name" | "type" | "total" | "status" | "urgency" | "emergency";
type SortDir = "asc" | "desc";

const AUTO_REFRESH_MS = 30000;

export function AdminDashboard() {
  const [users, setUsers] = useState<{ donors: any[]; recipients: any[] }>({ donors: [], recipients: [] });
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [prevStats, setPrevStats] = useState<any>({});
  const [searchResults, setSearchResults] = useState<{ donors: any[]; recipients: any[]; donations: any[]; claims: any[] } | null>(null);
  const [trends, setTrends] = useState<{ weekly: { date: string; count: number }[]; foodTypes: any[]; totalPortions: number; totalProtein: number } | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const nav = useNavigate();
  const { user: currentUser, profile, loading: authLoading, logout, refresh } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "admin")) nav("/login");
  }, [authLoading, currentUser]);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Global search with debounce
  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults(null); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.fetchJSON(`/api/admin/search?q=${encodeURIComponent(search)}`);
        setSearchResults(res);
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Auto-refresh
  useEffect(() => {
    const timer = setInterval(loadData, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleVerify = async (userId: number, urgencyScore?: number) => {
    const body = urgencyScore ? { urgency_score: urgencyScore } : {};
    try {
      await api.fetchJSON(`/api/admin/users/${userId}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      toast.success("User berhasil diverifikasi");
      loadData();
    } catch (err: any) { toast.error(err.message || "Gagal verifikasi"); }
  };

  const handleEmergencyToggle = async (userId: number) => {
    try {
      const res = await api.fetchJSON(`/api/admin/users/${userId}/emergency`, { method: "POST" });
      const msgs: Record<string, string> = { active: "Status darurat AKTIF", pending: "Permintaan darurat diajukan", none: "Status darurat NONAKTIF" };
      toast.success(msgs[res.emergency as string] || "Status darurat berubah");
      loadData();
    } catch (err: any) { toast.error(err.message || "Gagal mengubah status darurat"); }
  };

  const handleApproveClaim = async (claimId: number) => {
    try {
      await api.fetchJSON(`/api/admin/claims/${claimId}/approve`, { method: "POST" });
      toast.success("Klaim disetujui");
      loadData();
    } catch (err: any) { toast.error(err.message || "Gagal menyetujui klaim"); }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.fetchJSON(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`User berhasil dihapus`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) { toast.error(err.message || "Gagal menghapus user"); }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const chartData = {
    labels: users.donors.slice(0, 5).map(d => d.business_name || d.name),
    datasets: [{
      label: 'Total Donasi',
      data: users.donors.slice(0, 5).map(d => d.total_donations || 0),
      backgroundColor: ['#2D7A4F', '#52C77F', '#81C784', '#A5D6A7', '#C8E6C9'],
      borderRadius: 6,
    }]
  };

  const pieData = {
    labels: ['Panti Asuhan', 'Rumah Singgah', 'Lainnya'],
    datasets: [{
      label: 'Sebaran',
      data: [
        users.recipients.filter(x => x.institution_type === 'panti_asuhan').length,
        users.recipients.filter(x => x.institution_type === 'rumah_singgah').length,
        users.recipients.filter(x => x.institution_type === 'lainnya' || x.institution_type === 'lembaga_sosial').length,
      ],
      backgroundColor: ['#1565C0', '#E53935', '#F5A623'],
    }]
  };

  const tabs = [
    { id: "overview" as TabId, label: "Overview", icon: LayoutDashboard },
    { id: "verifikasi" as TabId, label: "Verifikasi", icon: Shield },
    { id: "data" as TabId, label: "Data", icon: Database },
    { id: "aktivitas" as TabId, label: "Aktivitas", icon: Activity },
  ];

  const statCards = [
    { label: "Donor Terdaftar", value: stats.donors || 0, color: "text-[#2D7A4F]", bg: "bg-[#E8F5E9]", icon: Building2 },
    { label: "Penerima Terdaftar", value: stats.recipients || 0, color: "text-[#1565C0]", bg: "bg-[#E3F2FD]", icon: Users },
    { label: "Donasi Aktif", value: stats.active_donations || 0, color: "text-[#F5A623]", bg: "bg-[#FFF8E1]", icon: Activity },
    { label: "Donasi Selesai", value: stats.completed_donations || 0, color: "text-gray-700", bg: "bg-gray-100", icon: CheckCircle },
  ];

  // Sort helpers
  const sortDonors = (list: any[]) => {
    return [...list].sort((a, b) => {
      let va: any, vb: any;
      switch (sortKey) {
        case "name": va = a.business_name || a.name; vb = b.business_name || b.name; break;
        case "type": va = a.business_type || ""; vb = b.business_type || ""; break;
        case "total": va = a.total_donations || 0; vb = b.total_donations || 0; break;
        case "status": va = a.status || ""; vb = b.status || ""; break;
        default: va = a.id; vb = b.id;
      }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  };

  const sortRecipients = (list: any[]) => {
    return [...list].sort((a, b) => {
      let va: any, vb: any;
      switch (sortKey) {
        case "name": va = a.institution_name || a.name; vb = b.institution_name || b.name; break;
        case "type": va = a.institution_type || ""; vb = b.institution_type || ""; break;
        case "status": va = a.status || ""; vb = b.status || ""; break;
        case "urgency": va = a.urgency_score || 0; vb = b.urgency_score || 0; break;
        case "emergency": va = a.emergency || "none"; vb = b.emergency || "none"; break;
        default: va = a.id; vb = b.id;
      }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const filteredDonors = sortDonors(users.donors.filter(d => !search || d.business_name?.toLowerCase().includes(search.toLowerCase()) || d.name?.toLowerCase().includes(search.toLowerCase()) || d.email?.toLowerCase().includes(search.toLowerCase())));
  const filteredRecipients = sortRecipients(users.recipients.filter(r => !search || r.institution_name?.toLowerCase().includes(search.toLowerCase()) || r.name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())));

  if (authLoading || !currentUser) return null;
  if (loading) return <LoadingSpinner size={36} label="Memuat dashboard admin..." />;

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2C2C2C]">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm mb-5 border-l-4 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Admin Command Center</h1>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><RefreshCw size={10} /> Auto-refresh</span>
              </div>
              <p className="text-gray-500 flex items-center gap-2 mt-1"><Activity size={14} /> Otorisasi & Pemantauan Sistem</p>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={loadData} className="text-sm text-gray-500 hover:text-[#2D7A4F] p-2 rounded-xl hover:bg-gray-100 transition-all" title="Refresh data"><RefreshCw size={18} /></button>
              <button onClick={() => setShowProfile(true)} className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:border-[#2D7A4F] hover:text-[#2D7A4F] transition-all">Profil Saya</button>
              <button onClick={async () => { await logout(); nav("/"); }} className="text-sm font-medium text-gray-500 hover:text-[#E53935] transition-all px-2">Logout</button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* === TAB: OVERVIEW === */}
        {activeTab === "overview" && (
          <AnimatePresence mode="wait">
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map((item, i) => (
                  <motion.div key={item.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
                    className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${item.bg}`}><item.icon size={20} className={item.color} /></div>
                      <div>
                        <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-gray-500">{item.label}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-4">Top Donor Aktif</h2>
                  {users.donors.length > 0 ? (
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">Belum ada data</div>
                  )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border px-12">
                  <h2 className="text-lg font-bold mb-4 text-center">Distribusi Jenis Lembaga</h2>
                  {users.recipients.length > 0 ? (
                    <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">Belum ada data</div>
                  )}
                </div>
              </div>

              {/* Trend Chart */}
              {trends && trends.weekly.some(d => d.count > 0) && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-[#2D7A4F]" /> Tren Donasi 7 Hari</h2>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: trends.weekly.map(d => {
                          const dt = new Date(d.date);
                          return dt.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
                        }),
                        datasets: [{
                          label: "Donasi Selesai",
                          data: trends.weekly.map(d => d.count),
                          fill: true,
                          borderColor: "#2D7A4F",
                          backgroundColor: "rgba(45,122,79,0.1)",
                          tension: 0.4,
                          pointBackgroundColor: "#2D7A4F",
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#2D7A4F]">{trends.totalPortions}</div>
                      <div className="text-xs text-gray-500">Total Porsi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#1565C0]">{trends.totalProtein.toFixed(0)}g</div>
                      <div className="text-xs text-gray-500">Protein Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#F5A623]">{trends.weekly.filter(d => d.count > 0).reduce((a, d) => a + d.count, 0)}</div>
                      <div className="text-xs text-gray-500">Donasi 7 Hari</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* === TAB: VERIFIKASI === */}
        {activeTab === "verifikasi" && (
          <AnimatePresence mode="wait">
            <motion.div key="verifikasi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Verifikasi Penerima */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><UserCheck size={20} /> Verifikasi Penerima</h2>
                  {users.recipients.filter(u => u.status === "pending").length === 0 ? (
                    <EmptyState icon={<CheckCircle size={32} />} title="Bersih" description="Tidak ada penerima pending." />
                  ) : (
                    users.recipients.filter(u => u.status === "pending").map((u, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} key={u.id}
                        className="bg-white p-4 rounded-xl border flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div>
                          <h3 className="font-bold">{u.institution_name}</h3>
                          <p className="text-xs text-gray-500">{u.email} • {u.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-bold shrink-0">Urgensi:</label>
                          <select id={`urgency-${u.id}`} className="border rounded-lg p-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-[#2D7A4F] outline-none" defaultValue="3">
                            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} - {["Standar","Rentan","Perhatian","Tinggi","Kritis"][v-1]}</option>)}
                          </select>
                          <button onClick={() => { const el = document.getElementById(`urgency-${u.id}`) as HTMLSelectElement; handleVerify(u.id, parseInt(el.value)); }}
                            className="ml-auto bg-[#2D7A4F] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-90 flex items-center gap-1 shadow-sm"
                          ><CheckCircle size={16} /> Verifikasi</button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Approve Klaim */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold flex items-center gap-2"><FileCheck size={20} /> Persetujuan Klaim</h2>
                  {claims.filter(c => c.status === "pending").length === 0 ? (
                    <EmptyState icon={<Package size={32} />} title="Tidak ada antrian" description="Tidak ada klaim pending." />
                  ) : (
                    claims.filter(c => c.status === "pending").map((c, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} key={c.id}
                        className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-[#1565C0] flex items-center gap-1"><Package size={16} /> Klaim #{c.donation_id}</h3>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono font-bold">Rank #{c.topsis_rank_at_claim}</span>
                        </div>
                        <p className="text-sm my-2">Lembaga: <b>{c.institution_name}</b></p>
                        <button onClick={() => handleApproveClaim(c.id)}
                          className="w-full bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 shadow-sm transition-all"
                        >Setujui Klaim</button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* === TAB: DATA === */}
        {activeTab === "data" && (
          <AnimatePresence mode="wait">
            <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Search */}
              <div className="mb-5">
                <div className="relative max-w-md">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari user, donasi, klaim..."
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent outline-none transition-all text-sm"
                  />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={18} /></button>}
                </div>
                {searching && <p className="text-xs text-gray-400 mt-1">Mencari...</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Donor Table */}
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Building2 size={20} /> Pendonasi</h2>
                  {filteredDonors.length === 0 ? (
                    <EmptyState icon={<Users size={32} />} title="Kosong" description="Belum ada pendonasi." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-gray-500">
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("name")}>
                              <span className="flex items-center gap-1">Nama <SortIcon k="name" /></span>
                            </th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("type")}>
                              <span className="flex items-center gap-1">Tipe <SortIcon k="type" /></span>
                            </th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("total")}>
                              <span className="flex items-center gap-1">Donasi <SortIcon k="total" /></span>
                            </th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("status")}>
                              <span className="flex items-center gap-1">Status <SortIcon k="status" /></span>
                            </th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDonors.map(d => (
                            <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="py-3"><div className="font-medium">{d.business_name || d.name}</div><div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={12} />{d.email}</div></td>
                              <td className="py-3 capitalize text-gray-600">{d.business_type || "-"}</td>
                              <td className="py-3 font-bold">{d.total_donations || 0}</td>
                              <td className="py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${d.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.status === "verified" ? "Terverifikasi" : "Pending"}</span></td>
                              <td className="py-3"><button onClick={() => setDeleteTarget({ id: d.id, name: d.business_name || d.name })} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus"><Trash2 size={16} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recipient Table */}
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={20} /> Penerima</h2>
                  {filteredRecipients.length === 0 ? (
                    <EmptyState icon={<Users size={32} />} title="Kosong" description="Belum ada penerima." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-gray-500">
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("name")}><span className="flex items-center gap-1">Nama <SortIcon k="name" /></span></th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("type")}><span className="flex items-center gap-1">Tipe <SortIcon k="type" /></span></th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("urgency")}><span className="flex items-center gap-1">Urgensi <SortIcon k="urgency" /></span></th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("emergency")}><span className="flex items-center gap-1">Darurat <SortIcon k="emergency" /></span></th>
                            <th className="pb-2 font-semibold cursor-pointer hover:text-gray-800 select-none" onClick={() => handleSort("status")}><span className="flex items-center gap-1">Status <SortIcon k="status" /></span></th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecipients.map(r => (
                            <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${r.emergency === "active" ? "bg-red-50" : r.emergency === "pending" ? "bg-yellow-50" : ""}`}>
                              <td className="py-3"><div className="font-medium">{r.institution_name || r.name}</div><div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={12} />{r.email}</div></td>
                              <td className="py-3 capitalize text-gray-600">{r.institution_type?.replace(/_/g, " ") || "-"}</td>
                              <td className="py-3"><span className={`font-bold ${(r.urgency_score || 0) >= 4 ? "text-red-600" : (r.urgency_score || 0) >= 3 ? "text-yellow-600" : "text-gray-600"}`}>{r.urgency_score || "-"}/5</span></td>
                              <td className="py-3"><button onClick={() => handleEmergencyToggle(r.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${r.emergency === "active" ? "bg-[#E53935] text-white hover:bg-red-700" : r.emergency === "pending" ? "bg-[#F9A825] text-white hover:bg-yellow-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{r.emergency === "active" ? "Aktif" : r.emergency === "pending" ? "Pending" : "Nonaktif"}</button></td>
                              <td className="py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status === "verified" ? "Terverifikasi" : "Pending"}</span></td>
                              <td className="py-3"><button onClick={() => setDeleteTarget({ id: r.id, name: r.institution_name || r.name })} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus"><Trash2 size={16} /></button></td>
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

        {/* === TAB: AKTIVITAS === */}
        {activeTab === "aktivitas" && (
          <AnimatePresence mode="wait">
            <motion.div key="aktivitas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={20} /> Riwayat Aktivitas</h2>
                {activityLogs.length === 0 ? (
                  <EmptyState icon={<Activity size={32} />} title="Belum ada aktivitas" description="Aktivitas akan muncul saat ada interaksi." />
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {activityLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-xs font-bold text-[#2D7A4F] shrink-0">
                          {log.user_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium capitalize">{log.action?.replace(/_/g, " ")}</p>
                          {log.details && <p className="text-xs text-gray-500 truncate">{log.details}</p>}
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {log.user_name && <span className="font-medium">{log.user_name}</span>} · {new Date(log.created_at).toLocaleString("id-ID")}
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

      <ConfirmDialog open={!!deleteTarget} title="Hapus User" message={`Yakin ingin menghapus "${deleteTarget?.name}"?`} confirmLabel="Ya, Hapus" variant="danger" onConfirm={handleDeleteUser} onCancel={() => setDeleteTarget(null)} />
      {showProfile && <ProfileModal user={currentUser} profile={profile} onClose={() => setShowProfile(false)} onUpdate={() => refresh()} />}
    </div>
  );
}

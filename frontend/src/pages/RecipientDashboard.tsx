import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Truck, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { SEO } from "../components/SEO";
import { ReviewModal } from "../components/ReviewModal";
import { ProfileModal } from "../components/ProfileModal";
import { LiveTrackingModal } from "../components/LiveTrackingModal";
import {
  RecipientSidebar,
  RecipientHeader,
  StatsCards,
  NutritionTracker,
  DonationList,
  TOPSISPanel,
  ClaimLifecycle,
  TransitSection,
  HistorySection,
  MapView,
} from "../components/recipient";
import toast from "react-hot-toast";

export function RecipientDashboard() {
  const [activeDonations, setActiveDonations] = useState<any[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<number | null>(null);
  const [topsisData, setTopsisData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [mapData, setMapData] = useState<{ donors: any[]; recipients: any[] }>({
    donors: [],
    recipients: [],
  });
  const [transitDonations, setTransitDonations] = useState<any[]>([]);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [akg, setAkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedReviewDonation, setSelectedReviewDonation] =
    useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useNavigate();
  const { user, profile, loading: authLoading, logout, refresh } = useAuth();
  const [emergency, setEmergency] = useState("none");

  useEffect(() => {
    if (profile) setEmergency(profile.emergency || "none");
  }, [profile]);
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "recipient")) nav("/login");
  }, [authLoading, user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [data, notifs, mData, transit, history, akgData] =
        await Promise.all([
          api.fetchJSON(`/api/donations/active?recipient_id=${user.id}`),
          api.fetchJSON(`/api/notifications?user_id=${user.id}`),
          api.fetchJSON(`/api/map/data`),
          api.fetchJSON(
            `/api/donations/transit?user_id=${user.id}&role=recipient`,
          ),
          api.fetchJSON(`/api/donations/history?recipient_id=${user.id}`),
          api.fetchJSON(`/api/recipient/akg?user_id=${user.id}`),
        ]);
      setActiveDonations(data);
      setNotifications(notifs);
      setMapData(mData);
      setTransitDonations(transit);
      setHistoryData(history);
      setAkg(akgData);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [loadData, user]);

  if (authLoading || !user)
    return <LoadingSpinner size={32} label="Loading..." />;

  const handleArrived = async (donationId: number) => {
    try {
      await api.fetchJSON(`/api/donations/${donationId}/arrived`, {
        method: "POST",
      });
      toast.success("Arrival confirmed!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const loadTopsis = async (donationId: number) => {
    try {
      setSelectedDonation(donationId);
      const res = await api.fetchJSON(`/api/topsis/${donationId}`);
      setTopsisData(Array.isArray(res?.results) ? res.results : []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load TOPSIS data");
      setTopsisData([]);
    }
  };

  const handleClaim = async (donationId: number) => {
    try {
      await api.fetchJSON(`/api/donations/${donationId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: user.id }),
      });
      toast.success("Claim submitted!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const markRead = async (id: number) => {
    await api.fetchJSON(`/api/notifications/${id}/read`, { method: "POST" });
    loadData();
  };

  const downloadReport = async () => {
    try {
      const history = await api.fetchJSON(
        `/api/donations/history?recipient_id=${user.id}`,
      );
      let csv =
        "data:text/csv;charset=utf-8," +
        "ID,Food Name,Donor,Protein(g),Status,Completed Date\n";
      history.forEach((r: any) => {
        csv += `${r.id},"${r.food_name}","${r.donor_name}",${r.protein},"Completed",${r.completed_at || "-"}\n`;
      });
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csv));
      link.setAttribute(
        "download",
        `report_${(profile?.institution_name || "recipient").replace(/\s+/g, "_")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed");
    }
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
        res.emergency === "pending" ? "Emergency sent" : "Cancelled",
      );
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const completedHistory = historyData.filter(
    (d: any) => d.status === "completed",
  );
  const todayCalories = akg?.today_intake.calories || 0;
  const todayProtein = akg?.today_intake.protein || 0;

  const statsItems = [
    {
      label: "Calorie Intake",
      value: `${todayCalories} cal`,
      sub: `/${akg?.daily_needs.calories || 0}`,
      pct: akg?.percentages.calories || 0,
      color: "text-primary-orange",
      bg: "bg-primary-orange-bg",
      icon: "",
    },
    {
      label: "Protein",
      value: `${todayProtein}g`,
      sub: `/${akg?.daily_needs.protein || 0}g`,
      pct: akg?.percentages.protein || 0,
      color: "text-primary-orange",
      bg: "bg-primary-orange-bg",
      icon: "",
    },
    {
      label: "Donations Received",
      value: `${completedHistory.length}`,
      sub: "completed",
      color: "text-accent",
      bg: "bg-accent/10",
      icon: "",
    },
    {
      label: "In Transit",
      value: `${transitDonations.length}`,
      sub: "en route",
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
      icon: "",
    },
  ];

  if (loading) return <LoadingSpinner size={36} label="Loading dashboard..." />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[100dvh] bg-gradient-to-br from-surface to-surface-container-low text-on-surface"
    >
      <SEO title="Recipient Dashboard | NutriShare" />
      <RecipientSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 flex-1 p-4 lg:p-8 w-full">
        <RecipientHeader
          user={user}
          profile={profile}
          emergency={emergency}
          onEmergencyToggle={handleEmergencyToggle}
          onDownloadReport={downloadReport}
          onMenuClick={() => setSidebarOpen(true)}
          onShowProfile={() => setShowProfile(true)}
          onLogout={async () => {
            await logout();
            nav("/");
          }}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
        />

        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <StatsCards stats={statsItems} />

            {/* Row 2: Map (8) + Quick Panel (4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <MapView
                  mapData={mapData}
                  profile={profile}
                  activeDonations={activeDonations}
                />
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4 lg:h-[450px]">
                <div className="flex-1 min-h-0">
                  <DonationList
                    donations={activeDonations}
                    profile={profile}
                    onClaim={handleClaim}
                    onTopsis={loadTopsis}
                    user={user}
                  />
                </div>
                {selectedDonation && (
                  <div className="bg-white rounded-2xl border border-[var(--border-primary)] p-5 shadow-sm">
                    <TOPSISPanel
                      selectedDonation={selectedDonation}
                      topsisData={topsisData}
                      userId={user.id}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Nutrition (6) + Claim Status (6) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <NutritionTracker akg={akg} />
              </div>
              <div className="lg:col-span-6 flex flex-col gap-4">
                <ClaimLifecycle
                  transitDonations={transitDonations}
                  onArrived={handleArrived}
                />
                <TransitSection
                  transitDonations={transitDonations}
                  onArrived={handleArrived}
                />
              </div>
            </div>

            {/* Row 4: Full width History */}
            {completedHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-brand-dark mb-4">
                  Recent History
                </h3>
                <HistorySection
                  completedHistory={completedHistory.slice(0, 6)}
                  onRate={setSelectedReviewDonation}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "claims" && (
          <div className="mt-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <DonationList
                donations={activeDonations}
                profile={profile}
                onClaim={handleClaim}
                onTopsis={loadTopsis}
                user={user}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm bg-gradient-to-br from-brand-medium/10 to-transparent">
                <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
                  <Activity size={18} className="text-brand-medium"/> Claims Tips
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Make sure to arrive on time when claiming a donation. Donors will appreciate your punctuality!
                  <br/><br/>
                  Our AI TOPSIS algorithm prioritizes claims based on urgency and nutritional match.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logistics" && (
          <div className="mt-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <TransitSection
                transitDonations={transitDonations}
                onArrived={handleArrived}
              />
              {transitDonations.length === 0 && (
                <EmptyState
                  icon={
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m0 0l2 1m-2-1v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  }
                  title="No Logistics"
                  description="No donations in transit."
                />
              )}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
               <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm bg-gradient-to-br from-brand-accent/10 to-transparent">
                 <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
                   <Truck size={18} className="text-brand-accent"/> Logistics Tracking
                 </h3>
                 <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                   Track your inbound donations here. Once the courier arrives, mark the donation as received to update the donor!
                 </p>
               </div>
            </div>
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="mt-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <NutritionTracker akg={akg} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
               <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm bg-gradient-to-br from-primary-orange/10 to-transparent">
                 <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
                   <TrendingUp size={18} className="text-primary-orange"/> AKG Goals
                 </h3>
                 <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                   Your nutritional needs are calculated automatically based on the demographics you provided in your profile.
                   <br/><br/>
                   Try to balance your claims across different food types to reach 100% of your daily goals!
                 </p>
               </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedReviewDonation && (
          <ReviewModal
            donation={selectedReviewDonation}
            onClose={() => setSelectedReviewDonation(null)}
            onReviewed={loadData}
          />
        )}
        {trackingData && (
          <LiveTrackingModal
            donation={trackingData}
            user={user}
            onClose={() => setTrackingData(null)}
            onComplete={loadData}
          />
        )}
        {showProfile && (
          <ProfileModal
            user={user}
            profile={profile}
            onClose={() => setShowProfile(false)}
            onUpdate={() => refresh()}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

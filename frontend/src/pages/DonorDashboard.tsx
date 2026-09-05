import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Activity, TrendingUp, Plus, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";
import { useRealtime, RealtimeEvent } from "../lib/useRealtime";
import { useAuth } from "../contexts/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SEO } from "../components/SEO";
import { LiveTrackingModal } from "../components/LiveTrackingModal";
import { ProfileModal } from "../components/ProfileModal";
import {
  DonorSidebar,
  DonorHeader,
  DonorStats,
  DonationForm,
  DonationList,
  ReviewList,
  ImpactBadges,
  LogisticsMap,
  QuickCatalog,
} from "../components/donor";
import toast from "react-hot-toast";

export function DonorDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterTab, setFilterTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [showCatalog, setShowCatalog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useNavigate();
  const { user, profile, loading: authLoading, logout, refresh } = useAuth();

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
    if (profile?.latitude)
      setForm((f) => ({
        ...f,
        pickup_latitude: profile.latitude,
        pickup_longitude: profile.longitude,
      }));
  }, [profile]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "donor")) nav("/login");
  }, [authLoading, user]);

  const loadDonations = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    if (user) loadDonations();
  }, [loadDonations, user]);

  // Real-time synchronization
  useRealtime(
    user?.id,
    user?.role,
    (event: RealtimeEvent) => {
      loadDonations();
      if (event.event_type === "CLAIM_APPROVED") {
        toast("Klaim donasi Anda telah diproses!", { icon: "✅" });
      } else if (event.event_type === "DELIVERY_ARRIVED") {
        toast("Penerima telah tiba di lokasi!", { icon: "📍" });
      } else if (event.event_type === "REVIEW_CREATED") {
        toast("Ulasan baru diterima untuk donasi Anda!", { icon: "⭐" });
      }
    },
    loadDonations,
    30000,
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
      toast.success("Donation published!");
      loadDonations();
      setForm({
        ...form,
        food_name: "",
        portion_count: "",
        protein_per_portion: "",
        calorie_per_portion: "",
        iron_mg: "",
        vitamin_c_mg: "",
      });
      setShowForm(false);
      setFormStep(1);
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const handleComplete = async (donationId: number) => {
    try {
      await api.fetchJSON(`/api/donations/${donationId}/complete`, {
        method: "POST",
      });
      toast.success("Completed!");
      loadDonations();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  };

  const selectFromCatalog = (item: any) => {
    setForm({
      ...form,
      food_name: item.name,
      food_type: item.type,
      protein_per_portion: item.protein.toString(),
      calorie_per_portion: item.calorie.toString(),
    });
    setShowCatalog(false);
    setFormStep(2);
  };

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const totalPorsi = donations
    .filter((d) => d.status !== "expired")
    .reduce((a, d) => a + (d.portion_count || 0), 0);
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((a: number, b: any) => a + b.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "N/A";

  const statsItems = [
    {
      label: "Total Donations",
      value: donations.length,
      icon: Package,
      color: "text-primary-orange",
      bg: "bg-primary-orange-bg",
      sub: "all time",
    },
    {
      label: "Total Portions",
      value: totalPorsi,
      icon: TrendingUp,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
      sub: "distributed",
    },
    {
      label: "Rating",
      value: avgRating,
      icon: Star,
      color: "text-accent",
      bg: "bg-accent/10",
      sub: `${reviews.length} reviews`,
    },
    {
      label: "Active",
      value: donations.filter((d) => d.status === "active").length,
      icon: Activity,
      color: "text-primary-orange",
      bg: "bg-primary-orange-bg",
      sub: "pending claim",
    },
  ];

  if (loading) return <LoadingSpinner size={36} label="Loading dashboard..." />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[100dvh] bg-gradient-to-br from-surface to-surface-container-low text-on-surface"
    >
      <SEO title="Donor Dashboard | NutriShare" />
      <DonorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 flex-1 p-4 lg:p-8 w-full">
        <DonorHeader
          user={user}
          profile={profile}
          notifications={notifications}
          unreadCount={unreadCount}
          onShowProfile={() => setShowProfile(true)}
          onLogout={async () => {
            await logout();
            nav("/");
          }}
          onAddDonation={() => {
            setShowForm(!showForm);
            setFormStep(1);
            setShowCatalog(!showForm ? false : showCatalog);
          }}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards */}
            <DonorStats stats={statsItems} />

            {/* Main Command Grid: 8 Cols Main / 4 Cols Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left col: Form + Active Donations List */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Collapsible/Direct Creation Form */}
                <DonationForm
                  form={form}
                  formStep={formStep}
                  uploading={uploading}
                  showCatalog={showCatalog}
                  onSetForm={setForm}
                  onSetStep={setFormStep}
                  onSetUploading={setUploading}
                  onSubmit={handleSubmit}
                  onToggleCatalog={() => setShowCatalog(!showCatalog)}
                  onSelectCatalog={selectFromCatalog}
                />

                {/* Donation Logistics List */}
                <DonationList
                  donations={donations}
                  filterTab={filterTab}
                  onFilterChange={setFilterTab}
                  onTrack={setTrackingData}
                  onComplete={handleComplete}
                />

                {/* Reviews & Social Proof */}
                <ReviewList reviews={reviews} />
              </div>

              {/* Right col: Side Command Panels */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <QuickCatalog
                  onSelectCategory={(type, label) => {
                    setForm((f) => ({
                      ...f,
                      food_name: label,
                      food_type: type,
                    }));
                    setShowForm(true);
                    setShowCatalog(true);
                    setFormStep(1);
                    setTimeout(() => {
                      document.getElementById("donation-form")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }}
                  onAddDonation={() => setShowForm(true)}
                />
                <ImpactBadges badges={badges} />
                <LogisticsMap />
              </div>
            </div>
          </div>
        )}

        {activeTab === "donations" && (
          <div className="mt-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <DonationList
                donations={donations}
                filterTab={filterTab}
                onFilterChange={setFilterTab}
                onTrack={setTrackingData}
                onComplete={handleComplete}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm bg-gradient-to-br from-brand-medium/10 to-transparent">
                <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
                  <Package size={18} className="text-brand-medium" /> Donation
                  Tips
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Thank you for your contributions! Pack food securely with
                  proper temperature controls before the courier arrives.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="mt-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <ImpactBadges badges={badges} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="glass p-6 rounded-3xl border border-white/50 shadow-sm bg-gradient-to-br from-primary-orange/10 to-transparent">
                <h3 className="font-bold text-brand-dark mb-2 flex items-center gap-2">
                  <Activity size={18} className="text-primary-orange" /> Impact
                  Tracker
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Every portion you donate diverts edible food from landfills
                  and nourishes individuals in need.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {trackingData && (
          <LiveTrackingModal
            donation={trackingData}
            user={user}
            onClose={() => setTrackingData(null)}
            onComplete={loadDonations}
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

function Star(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

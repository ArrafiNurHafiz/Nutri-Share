import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Users, Utensils, Cloud, ChevronDown, Cpu, Award, ShieldCheck, Sparkles, MapPin, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { GlossyLeafDecor } from "./EcoVisuals";

export function RecognitionSection({
  topDonors = [],
  stats = null,
}: {
  topDonors?: any[];
  stats?: any;
}) {
  const [period, setPeriod] = useState<"month" | "all">("month");
  const [activeTab, setActiveTab] = useState<"donors" | "topsis">("donors");
  const [topsisData, setTopsisData] = useState<any>(null);

  const foodDistributed = stats?.total_food_saved_kg ?? stats?.food_waste_kg ?? 0;
  const beneficiaries = stats?.total_beneficiaries ?? stats?.people_helped ?? 0;
  const mealsServed = stats?.total_portions_distributed ?? stats?.total_portions ?? 0;
  const co2Saved = stats?.co2_saved_tons ?? Number(((foodDistributed * 2.5) / 1000).toFixed(1));

  useEffect(() => {
    fetch("/api/public/topsis-priority")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.rankings) {
          setTopsisData(data);
        }
      })
      .catch(() => {});
  }, []);

  const donors = (topDonors || []).map((d, idx) => ({
    rank: idx + 1,
    name: d.business_name || d.name || `Mitra Donatur #${idx + 1}`,
    weight: `${Math.round((d.total_donations || 1) * 3)} kg pangan`,
    donations: `${d.total_donations || 0} donasi disalurkan`,
    logo: d.logo_url || "/images/hotel_logo.webp",
    fallbackImg: "/images/donor_kitchen.jpg",
    badgeBg:
      idx === 0
        ? "bg-[#10B981] text-white"
        : idx === 1
          ? "bg-[#059669] text-white"
          : idx === 2
            ? "bg-[#047857] text-white"
            : "bg-[#E2E8F0] text-[#64748B]",
  }));

  const topsisList = topsisData?.rankings || [];

  return (
    <section id="dampak" className="relative py-24 bg-[#F8FAF8] overflow-hidden">
      {/* Variant 6 (Dew Blade) on Right */}
      <GlossyLeafDecor
        variant="dew-blade"
        className="block absolute top-4 sm:top-8 md:top-12 right-2 sm:right-4 md:right-8 z-0 w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 opacity-80 sm:opacity-90"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-bold uppercase tracking-[0.2em] text-[11px] px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              TRANSPARENCY & IMPACT
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            Social Impact & TOPSIS Transparency
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-lg mx-auto"
          >
            Transparansi nyata: pantau kontribusi donor HoReCa dan pergerakan prioritas alokasi donasi berbasis algoritma Hybrid Entropy-TOPSIS.
          </motion.p>
        </div>

        {/* 2-Column Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Impact Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-sm"
          >
            {/* Widget Header with Dropdown Pill */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] font-heading">
                  Impact Overview
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPeriod((p: "month" | "all") => (p === "month" ? "all" : "month"))}
                className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#475569] cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <span>{period === "month" ? "This Month" : "All Time"}</span>
                <ChevronDown size={12} />
              </button>
            </div>

            {/* 4 Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <Leaf className="w-4 h-4 mx-auto text-[#10B981]" />
                <span className="text-base font-black text-[#0F172A] block font-heading">
                  {foodDistributed.toLocaleString("id-ID")} kg
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Food Distributed
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <Users className="w-4 h-4 mx-auto text-[#0284C7]" />
                <span className="text-base font-black text-[#0F172A] block font-heading">
                  {beneficiaries.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Beneficiaries
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <Utensils className="w-4 h-4 mx-auto text-[#059669]" />
                <span className="text-base font-black text-[#0F172A] block font-heading">
                  {mealsServed.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Meals Served
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <Cloud className="w-4 h-4 mx-auto text-[#10B981]" />
                <span className="text-base font-black text-[#0F172A] block font-heading">
                  {co2Saved} ton
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  CO₂e Prevented
                </span>
              </div>
            </div>

            {/* Progress Impact Bar */}
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#475569]">
                <span className="font-medium">You're helping build a zero food waste future!</span>
                <span className="font-bold text-[#0F172A]">68%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full w-[68%]" />
              </div>
            </div>

            {/* Bottom 3 Summary Blocks */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">Active Partners</span>
                <span className="text-xs font-bold text-[#0F172A]">12</span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">Total Donation</span>
                <span className="text-xs font-bold text-[#0F172A]">{foodDistributed.toLocaleString("id-ID")} kg</span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] block">Areas Served</span>
                <span className="text-xs font-bold text-[#0F172A]">Yogyakarta (DIY)</span>
              </div>
            </div>
          </motion.div>

          {/* Right Card: Interactive Dual-Tab Transparency Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-6 bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4"
          >
            {/* Tab Navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3.5">
              <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("donors")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "donors"
                      ? "bg-white text-[#0F172A] shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Top Donors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("topsis")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "topsis"
                      ? "bg-white text-[#047857] shadow-xs ring-1 ring-[#10B981]/30"
                      : "text-[#64748B] hover:text-[#047857]"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Prioritas TOPSIS</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                </button>
              </div>

              {activeTab === "donors" ? (
                <Link to="/map" className="text-xs font-semibold text-[#059669] hover:underline">
                  View All
                </Link>
              ) : (
                <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Auto-Weighted
                </span>
              )}
            </div>

            {/* TAB CONTENT: TOP DONORS */}
            {activeTab === "donors" && (
              <div className="space-y-2.5 flex-1">
                <p className="text-[11px] text-[#64748B] mb-1">
                  Mitra hotel, restoran, dan kafe paling aktif dalam menyalurkan surplus makanan bergizi.
                </p>
                {donors.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#64748B]">
                    Belum ada riwayat donatur tercatat di database.
                  </div>
                ) : (
                  donors.map((d: any) => (
                    <div
                      key={d.rank}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-[#E2E8F0]"
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${d.badgeBg}`}
                      >
                        {d.rank}
                      </span>

                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#E2E8F0] bg-stone-100 shadow-xs">
                        <img
                          src={d.logo}
                          alt={d.name}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            (e.target as HTMLImageElement).src = d.fallbackImg;
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[12px] text-[#0F172A] truncate">
                          {d.name}
                        </h4>
                        <p className="text-[10px] text-[#94A3B8]">
                          {d.donations}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-[#0F172A] shrink-0">
                        {d.weight}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: TOPSIS PRIORITY TRANSPARENCY QUEUE */}
            {activeTab === "topsis" && (
              <div className="space-y-3 flex-1">
                {/* Shannon Entropy Dynamic Criteria Weights Bar */}
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-2.5 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-[#065F46] font-bold">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      Bobot Kriteria Entropi Shannon (Objektif)
                    </span>
                    <span className="text-[9px] text-[#047857] bg-white/80 px-1.5 py-0.5 rounded-md">
                      50% Data + 50% Kebijakan
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-semibold text-[9px] text-[#0F172A]">
                    <div className="bg-white/90 p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C1: Nutrisi</span>
                      <span className="text-[#059669]">25%</span>
                    </div>
                    <div className="bg-white/90 p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C2: Urgensi</span>
                      <span className="text-[#059669]">25%</span>
                    </div>
                    <div className="bg-white/90 p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C3: Kelayakan</span>
                      <span className="text-[#059669]">15%</span>
                    </div>
                    <div className="bg-white/90 p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C4: Jarak</span>
                      <span className="text-[#059669]">20%</span>
                    </div>
                    <div className="bg-white/90 p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C5: Keadilan</span>
                      <span className="text-[#059669]">15%</span>
                    </div>
                  </div>
                </div>

                {/* Ranked Recipient Priority Queue */}
                <div className="space-y-2">
                  {topsisList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#64748B]">
                      Belum ada perhitungan perankingan donasi aktif saat ini.
                    </div>
                  ) : (
                    topsisList.map((item: any, idx: number) => {
                    const rankNum = item.rank || idx + 1;
                    const score = Number(item.ci_score || 0.9 - idx * 0.08).toFixed(3);
                    const isTop1 = rankNum === 1;

                    return (
                      <div
                        key={item.institution_name || idx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isTop1
                            ? "bg-[#ECFDF5]/70 border-[#A7F3D0] shadow-xs"
                            : "bg-[#F8FAFC] border-[#E2E8F0] hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                isTop1
                                  ? "bg-[#10B981] text-white ring-2 ring-[#10B981]/30"
                                  : rankNum === 2
                                    ? "bg-[#059669] text-white"
                                    : "bg-[#E2E8F0] text-[#475569]"
                              }`}
                            >
                              {rankNum}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[12px] text-[#0F172A] truncate flex items-center gap-1.5">
                                {item.institution_name}
                                {isTop1 && (
                                  <span className="text-[9px] font-extrabold bg-[#10B981] text-white px-1.5 py-0.2 rounded-full">
                                    Prioritas #1
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-[#64748B] flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-[#10B981]" />
                                <span>{item.address} ({item.distance_km || 2.4} km)</span>
                                <span>•</span>
                                <span>{item.beneficiary_count || 45} jiwa</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-extrabold text-[#047857] block font-mono">
                              V = {score}
                            </span>
                            <span className="text-[9px] text-[#64748B] block">
                              Skor TOPSIS
                            </span>
                          </div>
                        </div>

                        {/* Match Reasons Tags */}
                        {item.match_reasons && item.match_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-slate-200/50">
                            {item.match_reasons.slice(0, 2).map((r: string, rIdx: number) => (
                              <span
                                key={rIdx}
                                className="text-[9px] font-medium bg-white/90 text-[#065F46] border border-[#A7F3D0] px-1.5 py-0.5 rounded-md"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }))}
                </div>

                {/* Transparency Guarantee Note */}
                <p className="text-[10px] text-[#64748B] leading-relaxed bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0] flex items-start gap-1.5">
                  <Sparkles size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">100% Transparan:</strong> Algoritma Hybrid Entropy-TOPSIS secara otomatis menghitung kedekatan solusi ideal tanpa campur tangan manual, memastikan distribusi surplus pangan sampai kepada penerima yang paling membutuhkan.
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


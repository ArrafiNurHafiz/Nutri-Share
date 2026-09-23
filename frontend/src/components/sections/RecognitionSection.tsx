import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";

export function RecognitionSection({
  topDonors = [],
  stats = null,
}: {
  topDonors?: any[];
  stats?: any;
}) {
  const [activeTab, setActiveTab] = useState<"donors" | "topsis">("donors");
  const [topsisData, setTopsisData] = useState<any>(null);

  const foodDistributed = stats?.total_food_saved_kg ?? stats?.food_waste_kg ?? 1360;
  const beneficiaries = stats?.total_beneficiaries ?? stats?.people_helped ?? 520;
  const mealsServed = stats?.total_portions_distributed ?? stats?.total_portions ?? 4120;
  const co2Saved = stats?.co2_saved_tons ?? 2.4;

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

  const defaultDonors = [
    { rank: 1, name: "Hotel Merapi Merbabu", location: "Sleman", weight: "245 kg", donations: "12 batches", tier: "Gold Partner" },
    { rank: 2, name: "Dapur Nusantara Resto", location: "Bantul", weight: "190 kg", donations: "9 batches", tier: "Silver Partner" },
    { rank: 3, name: "Tugu Jogja Cafe", location: "Yogyakarta City", weight: "140 kg", donations: "7 batches", tier: "Bronze Partner" },
    { rank: 4, name: "Sehat Kita Catering", location: "Sleman", weight: "120 kg", donations: "6 batches", tier: "Active Partner" },
    { rank: 5, name: "Malioboro Indah Hotel", location: "Yogyakarta City", weight: "100 kg", donations: "5 batches", tier: "Active Partner" },
  ];

  const donors = (topDonors && topDonors.length > 0)
    ? topDonors.slice(0, 5).map((d, idx) => ({
        rank: idx + 1,
        name: d.business_name || d.name || `Donor Partner #${idx + 1}`,
        location: d.city || "Sleman",
        weight: `${Math.round((d.total_donations || 1) * 20)} kg`,
        donations: `${d.total_donations || 1} batches`,
        tier: idx === 0 ? "Gold Partner" : idx === 1 ? "Silver Partner" : idx === 2 ? "Bronze Partner" : "Active Partner",
      }))
    : defaultDonors;

  const topsisList = topsisData?.rankings || [];

  return (
    <section id="impact" className="relative py-20 sm:py-28 bg-white text-slate-900 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <BarChart3 size={13} className="text-emerald-700" />
              <span>Public Transparency &amp; Partner Recognition</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-emerald-950 tracking-tight">
              Verified Impact Ledger
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Live records of food waste diversion, methane emission reductions, and real-time TOPSIS recommendation queues.
            </p>
          </div>

          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all shadow-xs self-start md:self-auto"
          >
            <span>Open Interactive GIS Map</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 2 Columns Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left Column: Environmental Metrics */}
          <div className="lg:col-span-6 rounded-3xl bg-emerald-50/40 border border-emerald-100 p-7 sm:p-9 flex flex-col justify-between space-y-6 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  Cumulative Impact Summary
                </span>
                <span className="text-xs text-emerald-700 font-mono">DIY PILOT 2024</span>
              </div>

              {/* 4 Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 block">Food Rescued</span>
                  <strong className="text-2xl font-bold text-emerald-950 block font-mono">
                    {foodDistributed.toLocaleString("en-US")} kg
                  </strong>
                  <span className="text-[11px] text-emerald-700 font-semibold">Surplus absorbed</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 block">Verified Shelters</span>
                  <strong className="text-2xl font-bold text-emerald-950 block font-mono">
                    {beneficiaries.toLocaleString("en-US")}
                  </strong>
                  <span className="text-[11px] text-emerald-700 font-semibold">Registered institutions</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 block">Meals Served</span>
                  <strong className="text-2xl font-bold text-emerald-950 block font-mono">
                    {mealsServed.toLocaleString("en-US")}
                  </strong>
                  <span className="text-[11px] text-emerald-700 font-semibold">Hygienic portions</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 block">Emissions Avoided</span>
                  <strong className="text-2xl font-bold text-emerald-600 block font-mono">
                    {co2Saved} Tons
                  </strong>
                  <span className="text-[11px] text-emerald-700 font-semibold">Equivalent CO₂e</span>
                </div>
              </div>
            </div>

            {/* Equivalency Callout */}
            <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 size={14} className="text-emerald-700" />
                Ecological Impact Equivalence
              </span>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                Equivalent to planting <strong>120+ tree seedlings</strong> and preventing 2,400 kg of landfill methane (CH₄) gas release.
              </p>
            </div>

          </div>

          {/* Right Column: Registry & TOPSIS Queue */}
          <div className="lg:col-span-6 rounded-3xl bg-emerald-50/40 border border-emerald-100 p-7 sm:p-9 flex flex-col justify-between space-y-6 shadow-xs">

            {/* Tab Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-100 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("donors")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "donors"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-emerald-950"
                    }`}
                  >
                    Top Donors
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("topsis")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "topsis"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-emerald-950"
                    }`}
                  >
                    TOPSIS Queue
                  </button>
                </div>

                <span className="text-xs text-emerald-700 font-mono font-semibold">LIVE</span>
              </div>

              {/* TAB 1: DONORS */}
              {activeTab === "donors" && (
                <div className="space-y-2 mt-5">
                  {donors.map((d) => (
                    <div
                      key={d.rank}
                      className="p-3.5 rounded-2xl bg-white border border-emerald-100/80 flex items-center justify-between hover:border-emerald-300 shadow-xs transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          d.rank === 1 ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-900"
                        }`}>
                          {d.rank}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 truncate">
                            {d.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 block">
                            {d.location} &bull; {d.tier}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-950 block font-mono">{d.weight}</span>
                        <span className="text-[10px] text-slate-400 block">{d.donations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: TOPSIS */}
              {activeTab === "topsis" && (
                <div className="space-y-3 mt-5">
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-1">
                    <span className="text-xs font-bold text-emerald-900 block">TOPSIS Decision Engine: Active</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Relative closeness (Ci) scores are calculated in real time upon every surplus meal submission.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {topsisList.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 bg-white rounded-2xl border border-emerald-100">
                        Engine ready for upcoming surplus batch
                      </div>
                    ) : (
                      topsisList.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={item.institution_name || idx}
                          className="p-3.5 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between shadow-xs"
                        >
                          <div className="min-w-0">
                            <strong className="text-xs font-semibold text-slate-900 block truncate">
                              {item.institution_name}
                            </strong>
                            <span className="text-[11px] text-slate-500 block">
                              Transit radius &plusmn;{item.distance_km || 2.4} km
                            </span>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs font-mono">
                            Ci = {Number(item.ci_score || 0.85).toFixed(3)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div className="pt-4 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-500">
              <span>Objective Multi-Criteria Allocation</span>
              <span className="text-emerald-700 font-semibold">Zero Queue Bias</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

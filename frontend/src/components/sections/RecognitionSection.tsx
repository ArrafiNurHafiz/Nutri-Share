import { useState } from "react";
import { motion } from "motion/react";
import { Award, Leaf, Users, Utensils, Cloud, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { LeafIllustration } from "./EcoVisuals";

export function RecognitionSection({
  topDonors = [],
  stats = null,
}: {
  topDonors?: any[];
  stats?: any;
}) {
  const [period] = useState<"month" | "all">("month");

  const foodDistributed = stats?.food_waste_kg ?? 1360;
  const beneficiaries = stats?.people_helped ?? 520;
  const mealsServed = stats?.total_portions ?? 4120;
  const co2Saved = Number(((foodDistributed * 2.5) / 1000).toFixed(1)) || 2.4;

  const donors = topDonors.length > 0
    ? topDonors.slice(0, 5).map((d: any, i: number) => ({
        rank: i + 1,
        name: d.business_name || d.name,
        type: d.type || d.business_type || "Mitra Donatur",
        portions: `${d.total_donations ?? 0} kg`,
        logo_url: d.logo_url,
      }))
    : [
        { rank: 1, name: "Hotel Merapi Merbabu", type: "245 kg", portions: "245 kg", tag: "12 donations" },
        { rank: 2, name: "Restoran Dapur Rasa Nusantara", type: "9 donations", portions: "180 kg", tag: "9 donations" },
        { rank: 3, name: "Cafe Tugu Jogja", type: "7 donations", portions: "150 kg", tag: "7 donations" },
        { rank: 4, name: "Catering Sehat Kita", type: "6 donations", portions: "120 kg", tag: "6 donations" },
        { rank: 5, name: "Hotel Malioboro Indah", type: "5 donations", portions: "100 kg", tag: "5 donations" },
      ];

  return (
    <section id="dampak" className="relative py-28 bg-[#F4FAF5] overflow-hidden">
      {/* Decorative botanical leaves */}
      <LeafIllustration className="absolute top-1/3 -left-10 w-52 h-52 opacity-85" />
      <LeafIllustration className="absolute -bottom-10 -right-10 w-56 h-56 opacity-85 rotate-180" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-extrabold uppercase tracking-[0.25em] text-xs px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              RECOGNITION
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            Social Impact & Top Donors
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl mx-auto"
          >
            Our most active HoReCa partners distributing nutritious food surplus.
          </motion.p>
        </div>

        {/* 2-Column Grid: Impact Dashboard (Left) + Top Donors Leaderboard (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Impact Overview Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm"
          >
            {/* Widget Header with Filter */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-heading">
                  Impact Overview
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1 text-xs font-semibold text-[#475569]">
                <span>This Month</span>
                <ChevronDown size={13} />
              </div>
            </div>

            {/* 4 Metric Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
                <Leaf className="w-5 h-5 mx-auto text-[#10B981] mb-1.5" />
                <span className="text-lg font-black text-[#0F172A] block font-heading">{foodDistributed.toLocaleString()} kg</span>
                <span className="text-[10px] text-[#64748B] font-medium">Food Distributed</span>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
                <Users className="w-5 h-5 mx-auto text-[#0284C7] mb-1.5" />
                <span className="text-lg font-black text-[#0F172A] block font-heading">{beneficiaries.toLocaleString()}</span>
                <span className="text-[10px] text-[#64748B] font-medium">Beneficiaries</span>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
                <Utensils className="w-5 h-5 mx-auto text-[#2D7A4F] mb-1.5" />
                <span className="text-lg font-black text-[#0F172A] block font-heading">{mealsServed.toLocaleString()}</span>
                <span className="text-[10px] text-[#64748B] font-medium">Meals Served</span>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-center">
                <Cloud className="w-5 h-5 mx-auto text-[#059669] mb-1.5" />
                <span className="text-lg font-black text-[#0F172A] block font-heading">{co2Saved} ton</span>
                <span className="text-[10px] text-[#64748B] font-medium">CO₂e Prevented</span>
              </div>
            </div>

            {/* Progress Impact Bar */}
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs text-[#475569]">
                <span className="font-medium">You're helping build a zero food waste future!</span>
                <span className="font-bold text-[#0F172A]">68%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full transition-all duration-700 w-[68%]" />
              </div>
            </div>

            {/* Bottom Meta Stats Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center">
                <span className="text-[10px] text-[#64748B] block">Active Partners</span>
                <span className="text-sm font-black text-[#0F172A]">{stats?.partner_count || 12}</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center">
                <span className="text-[10px] text-[#64748B] block">Total Donation</span>
                <span className="text-sm font-black text-[#0F172A]">{foodDistributed.toLocaleString()} kg</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center">
                <span className="text-[10px] text-[#64748B] block">Areas Served</span>
                <span className="text-sm font-black text-[#0F172A]">Yogyakarta (DIY)</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Top Donors Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] font-heading">
                Top Donors
              </h3>
              <Link to="/map" className="text-xs font-semibold text-[#059669] hover:underline">
                View All
              </Link>
            </div>

            {/* List of Donors */}
            <div className="space-y-3 flex-1">
              {donors.map((d, index) => (
                <div
                  key={d.rank}
                  className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#F8FAFC] transition-colors"
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                      index === 0
                        ? "bg-[#10B981] text-white"
                        : index === 1
                        ? "bg-[#059669] text-white"
                        : index === 2
                        ? "bg-[#047857] text-white"
                        : "bg-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    {d.rank}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-[#E2E8F0] overflow-hidden shrink-0">
                    <img
                      src="/images/fresh-food.webp"
                      alt={d.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-[#0F172A] truncate">
                      {d.name}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8]">
                      {d.tag || "Donatur Aktif"}
                    </p>
                  </div>

                  <span className="text-xs font-black text-[#0F172A] shrink-0">
                    {d.portions}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

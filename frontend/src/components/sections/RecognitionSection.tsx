import { useState } from "react";
import { motion } from "motion/react";
import { Leaf, Users, Utensils, Cloud, ChevronDown } from "lucide-react";
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

  const foodDistributed = stats?.total_food_saved_kg || 1360;
  const beneficiaries = stats?.total_beneficiaries || 520;
  const mealsServed = stats?.total_portions_distributed || 4120;
  const co2Saved = Number(((foodDistributed * 2.5) / 1000).toFixed(1)) || 2.4;

  const defaultDonorsList = [
    {
      rank: 1,
      name: "Hotel Merapi Merbabu",
      weight: "245 kg",
      donations: "12 donations",
      logo: "/images/hotel_logo.webp",
      fallbackImg: "/images/donor_kitchen.jpg",
      badgeBg: "bg-[#10B981] text-white",
    },
    {
      rank: 2,
      name: "Restoran Dapur Rasa Nusantara",
      weight: "180 kg",
      donations: "9 donations",
      logo: "/images/restaurant_logo.webp",
      fallbackImg: "/images/fresh-food.webp",
      badgeBg: "bg-[#059669] text-white",
    },
    {
      rank: 3,
      name: "Cafe Tugu Jogja",
      weight: "150 kg",
      donations: "7 donations",
      logo: "/images/cafe_logo.webp",
      fallbackImg: "/images/fresh-food.webp",
      badgeBg: "bg-[#047857] text-white",
    },
    {
      rank: 4,
      name: "Catering Sehat Kita",
      weight: "120 kg",
      donations: "6 donations",
      logo: "/images/food_pack.jpg",
      fallbackImg: "/images/fresh-food.webp",
      badgeBg: "bg-[#E2E8F0] text-[#64748B]",
    },
    {
      rank: 5,
      name: "Hotel Malioboro Indah",
      weight: "100 kg",
      donations: "5 donations",
      logo: "/images/donor_kitchen.jpg",
      fallbackImg: "/images/donor_kitchen.jpg",
      badgeBg: "bg-[#E2E8F0] text-[#64748B]",
    },
  ];

  const donors = (topDonors && topDonors.length > 0) ? topDonors.slice(0, 5).map((d, idx) => ({
    rank: idx + 1,
    name: d.name || d.business_name || `Partner #${idx + 1}`,
    weight: `${d.total_weight_kg || d.total_kg || (245 - idx * 35)} kg`,
    donations: `${d.donation_count || (12 - idx * 2)} donations`,
    logo: d.avatar_url || defaultDonorsList[idx]?.logo || "/images/hotel_logo.webp",
    fallbackImg: "/images/donor_kitchen.jpg",
    badgeBg: idx === 0 ? "bg-[#10B981] text-white" : idx === 1 ? "bg-[#059669] text-white" : idx === 2 ? "bg-[#047857] text-white" : "bg-[#E2E8F0] text-[#64748B]"
  })) : defaultDonorsList;

  return (
    <section id="dampak" className="relative py-24 bg-[#F8FAF8] overflow-hidden">
      {/* Variant 6 (Dew Blade) on Right */}
      <GlossyLeafDecor
        variant="dew-blade"
        className="hidden md:block absolute top-12 -right-8 z-10 w-28 h-28 opacity-90 rotate-180"
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
              RECOGNITION
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            Social Impact & Top Donors
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-lg mx-auto"
          >
            Our most active HoReCa partners distributing nutritious food surplus.
          </motion.p>
        </div>

        {/* 2-Column Bento Grid matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Impact Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-sm"
          >
            {/* Widget Header with Dropdown Pill */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] font-heading">
                Impact Overview
              </h3>

              <button
                type="button"
                onClick={() => setPeriod((p: "month" | "all") => p === "month" ? "all" : "month")}
                className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#475569] cursor-pointer"
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

          {/* Right Card: Top Donors Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3.5">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] font-heading">
                Top Donors
              </h3>
              <Link to="/map" className="text-xs font-semibold text-[#059669] hover:underline">
                View All
              </Link>
            </div>

            {/* 5 Ranked Donors List */}
            <div className="space-y-3 flex-1">
              {donors.map((d: any) => (
                <div
                  key={d.rank}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
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
                    <h4 className="font-bold text-[11px] text-[#0F172A] truncate">
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
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";
import { Award, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function RecognitionSection({
  topDonors = [],
  stats = null,
}: {
  topDonors?: any[];
  stats?: any;
}) {
  const hasDonors = topDonors.length > 0;

  const donors = topDonors.slice(0, 4).map((d: any, i: number) => ({
    rank: i + 1,
    name: d.business_name,
    type: d.type || d.business_type || "Partner",
    portions: d.total_donations ?? 0,
    rating: d.rating,
    review_count: d.review_count,
    logo_url: d.logo_url,
    color:
      i === 0
        ? "bg-[#10b981]"
        : i === 1
          ? "bg-brand-accent"
          : i === 2
            ? "bg-brand-accent/70"
            : "bg-gray-200 text-gray-500",
  }));

  const totalDonations = topDonors.reduce(
    (sum: number, d: any) => sum + (d.total_donations || 0),
    0,
  );
  const totalReviews = topDonors.reduce(
    (sum: number, d: any) => sum + (d.review_count || 0),
    0,
  );
  const avgRating =
    totalReviews > 0
      ? (
          topDonors.reduce(
            (sum: number, d: any) => sum + parseFloat(d.rating || "0"),
            0,
          ) / topDonors.length
        ).toFixed(1)
      : "N/A";

  return (
    <section className="py-24 bg-[#eef5f7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#10b981] font-bold uppercase tracking-widest text-sm mb-2 inline-flex items-center gap-1.5">
            <Award size={14} /> Recognition
          </span>
          <h2 className="text-4xl font-extrabold text-brand-dark mb-4">
            Social Impact &amp; Top Donors
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most active HoReCa partners distributing nutritious food
            surplus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Impact Overview */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-brand-dark">
                  Impact Overview
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-[#ecfdf5] text-[#10b981]">
                  {totalDonations > 0
                    ? `${totalDonations} donations`
                    : "Live Data"}
                </span>
              </div>

              {/* Impact visual */}
              <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center border-2 border-dashed border-gray-200 min-h-[220px]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-dark">
                        {totalDonations || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">
                        Total Donations
                      </div>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden sm:block" />
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-dark">
                        {totalReviews || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">
                        Reviews
                      </div>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden sm:block" />
                    <div className="text-center">
                      <div className="text-3xl font-black text-brand-dark">
                        {avgRating}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">
                        Avg Rating
                      </div>
                    </div>
                  </div>
                  {stats?.total_portions && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="text-lg font-bold text-brand-dark">
                        {stats.total_portions.toLocaleString()} portions
                        distributed
                      </div>
                      <div className="text-xs text-gray-400">
                        ~{stats.food_waste_kg?.toLocaleString()} kg food waste
                        saved · {stats.people_helped?.toLocaleString()} people
                        helped
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {hasDonors && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-[#ecfdf5] p-3 rounded-xl border border-[#10b981]/10">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Active Donors
                    </p>
                    <p className="text-sm font-bold text-brand-dark">
                      {topDonors.length} Partners
                    </p>
                  </div>
                  <div className="bg-[#ecfdf5] p-3 rounded-xl border border-[#10b981]/10">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Total Portions
                    </p>
                    <p className="text-sm font-bold text-brand-dark">
                      {stats?.total_portions?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="bg-[#ecfdf5] p-3 rounded-xl border border-[#10b981]/10">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Food Waste Saved
                    </p>
                    <p className="text-sm font-bold text-brand-dark">
                      {stats?.food_waste_kg
                        ? `${stats.food_waste_kg} kg`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-dark">
                  Leaderboard
                </h3>
              </div>
              {hasDonors ? (
                donors.map((donor) => (
                  <div
                    key={donor.rank}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                      donor.rank === 1
                        ? "bg-white border-[#10b981] shadow-sm"
                        : "bg-white/70 border-gray-100 hover:border-[#10b981]/30"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        donor.rank === 1
                          ? "shadow-lg ring-4 ring-[#10b981]/20 bg-[#10b981]"
                          : donor.color
                      }`}
                    >
                      {donor.logo_url ? (
                        <img
                          src={donor.logo_url}
                          alt=""
                          loading="lazy"
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{donor.rank}</span>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-brand-dark truncate">
                        {donor.name}
                      </h4>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                        {donor.type}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-lg font-black text-brand-dark">
                        {donor.portions}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        {donor.portions === 1 ? "Donation" : "Donations"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No donor data available yet</p>
                </div>
              )}
              <div className="pt-2">
                <Link
                  to="/register/donor"
                  className="w-full py-3 px-4 bg-[#10b981] hover:bg-[#047857] text-white rounded-xl text-xs font-bold btn-hover-effect flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/15"
                >
                  <span>Become a Donor</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 4v16m8-8H4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

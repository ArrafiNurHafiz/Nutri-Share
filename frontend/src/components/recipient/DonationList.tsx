import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, BarChart3, Clock } from "lucide-react";

function Countdown({ validUntil }: { validUntil: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(validUntil).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / 3600000),
          m = Math.floor((diff % 3600000) / 60000),
          s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [validUntil]);
  return (
    <span
      className={`font-mono text-xs font-bold ${timeLeft === "Expired" ? "text-danger" : "text-[var(--text-tertiary)]"}`}
    >
      {timeLeft === "Expired" ? "⏰ Expired" : `⏱ ${timeLeft}`}
    </span>
  );
}

interface Props {
  donations: any[];
  profile: any;
  onClaim: (id: number) => void;
  onTopsis: (id: number) => void;
  user: any;
}

export function DonationList({
  donations,
  profile,
  onClaim,
  onTopsis,
  user,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] flex flex-col shadow-sm h-full">
      <div className="p-5 border-b border-[var(--border-primary)] flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-brand-dark">
          <svg
            className="w-5 h-5 text-brand-medium"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Ranked Donations
        </h3>
        <span className="font-mono text-[10px] text-brand-medium bg-brand-medium/10 px-2 py-0.5 rounded font-bold">
          TOPSIS CI Score
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-tertiary)]">
            <Package size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No active donations</p>
          </div>
        ) : (
          donations.map((d: any, i: number) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border transition-colors ${
                d.rank === 1
                  ? "border-primary-orange/40 hover:border-primary-orange"
                  : "border-[var(--border-primary)] hover:border-primary-orange/30"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`font-mono text-xs font-bold ${d.rank === 1 ? "text-primary-orange" : "text-[var(--text-tertiary)]"}`}
                >
                  RANK {d.rank}
                </span>
                {d.rank === 1 && (
                  <span className="bg-primary-orange-bg text-primary-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
                    HIGH IMPACT
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-brand-dark">
                {d.food_name}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Donor: {d.donor_name}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-[var(--text-tertiary)]">
                  {d.protein_per_portion}g protein &middot;{" "}
                  {d.calorie_per_portion} cal
                </div>
                <Countdown validUntil={d.valid_until} />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onTopsis(d.id)}
                  className="flex-1 border border-[var(--border-primary)] text-xs font-bold py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center gap-1"
                >
                  <BarChart3 size={14} /> TOPSIS
                </button>
                {d.my_claim_status === "pending" ? (
                  <div className="flex-1 bg-accent/10 text-accent text-xs font-bold py-2 rounded-lg text-center border border-accent/20">
                    Waiting for Admin
                  </div>
                ) : (
                  <button
                    onClick={() => onClaim(d.id)}
                    disabled={d.rank !== 1}
                    className={`flex-1 text-white text-xs font-bold py-2 rounded-lg transition-all ${
                      d.rank === 1
                        ? "bg-primary-orange hover:bg-primary-orange-dark"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {d.rank === 1 ? "Claim Donation" : "Rank #1 to claim"}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-[var(--border-primary)]">
        <button className="w-full bg-[var(--bg-tertiary)] text-brand-dark py-3 rounded-xl font-bold text-sm hover:bg-primary-orange hover:text-white transition-all">
          View All Results
        </button>
      </div>
    </div>
  );
}

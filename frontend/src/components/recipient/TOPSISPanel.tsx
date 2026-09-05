import { motion } from "motion/react";
import {
  BarChart3,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { Radar } from "react-chartjs-2";

interface Props {
  selectedDonation: number | null;
  topsisData: any[];
  userId: number;
  onClaim?: (donationId: number) => void;
}

export function TOPSISPanel({
  selectedDonation,
  topsisData,
  userId,
  onClaim,
}: Props) {
  const myScore = topsisData.find((t: any) => t.recipient_id === userId);

  if (!selectedDonation) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-[var(--text-tertiary)] py-8">
        <BarChart3 size={40} className="mb-3 opacity-50" />
        <p className="text-sm font-semibold">
          Pilih &ldquo;TOPSIS&rdquo; pada donasi untuk melihat analisis
          kecocokan AI.
        </p>
      </div>
    );
  }

  const hasData = topsisData.length > 0;
  const isTopRank = myScore?.rank_position === 1;

  const radarData = {
    labels: [
      "Protein (C1)",
      "Urgensi (C2)",
      "Masa Simpan (C3)",
      "Jarak (C4)",
      "Pemerataan (C5)",
    ],
    datasets: [
      {
        label: "Skor Kecocokan",
        data: [
          Math.min(10, (myScore?.raw_c1 ?? 0) / 10),
          Math.min(
            10,
            (myScore?.raw_c2 ?? 0) > 500 ? 10 : (myScore?.raw_c2 ?? 0),
          ),
          Math.min(10, (myScore?.raw_c3 ?? 0) / 4),
          Math.max(0, 10 - (myScore?.raw_c4 ?? 0) / 2),
          Math.min(10, (myScore?.raw_c5 ?? 0) / 3),
        ].map(Number),
        backgroundColor: "rgba(249,115,22,0.15)",
        borderColor: "#f97316",
        pointBackgroundColor: "#f97316",
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-brand-dark text-sm">
              Analisis Hybrid TOPSIS
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Entropy-Weighted
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Alokasi Donasi #{selectedDonation}
          </p>
        </div>
        {myScore && (
          <div className="text-right">
            <span className="text-xs font-bold text-primary-orange">
              Rank #{myScore.rank_position}
            </span>
            <p className="text-[10px] text-slate-500">
              {myScore.match_percentage ?? Math.round(myScore.ci_score * 100)}%
              Match
            </p>
          </div>
        )}
      </div>

      {/* Highlights & Match Reasons */}
      {myScore?.match_reasons && myScore.match_reasons.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-orange-50/70 to-amber-50/70 rounded-xl border border-orange-200/60 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-orange-dark">
            <Sparkles size={14} className="text-primary-orange" />
            <span>Alasan Kecocokan Alokasi:</span>
          </div>
          <ul className="text-[11px] space-y-1 text-slate-700 font-medium">
            {myScore.match_reasons.map((r: string, idx: number) => (
              <li key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Radar Chart */}
      <div className="h-44">
        <Radar
          data={radarData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                max: 10,
                grid: { color: "#f1f5f9" },
                ticks: { display: false },
                pointLabels: {
                  font: { size: 9, weight: 600 },
                  color: "#64748b",
                },
              },
            },
            plugins: { legend: { display: false } },
          }}
        />
      </div>

      {/* Quick 1-Click Claim if Top Priority */}
      {isTopRank && onClaim && (
        <button
          type="button"
          onClick={() => onClaim(selectedDonation)}
          className="w-full bg-primary-orange hover:bg-primary-orange-dark text-white py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <ShieldCheck size={14} /> Klaim Prioritas Utama (1-Click)
        </button>
      )}

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-1.5 border-b text-center">Rank</th>
                <th className="p-1.5 border-b text-left">Penerima</th>
                <th className="p-1.5 border-b text-right">Skor (Ci)</th>
              </tr>
            </thead>
            <tbody>
              {topsisData.map((t: any) => (
                <tr
                  key={t.id}
                  className={
                    t.recipient_id === userId
                      ? "bg-primary-orange/10 font-bold"
                      : "hover:bg-[var(--bg-tertiary)]"
                  }
                >
                  <td className="p-1.5 border-b text-center">
                    #{t.rank_position}
                  </td>
                  <td className="p-1.5 border-b truncate max-w-[120px]">
                    {t.institution_name || `Recipient #${t.recipient_id}`}
                  </td>
                  <td className="p-1.5 border-b text-right text-primary-orange font-bold">
                    {t.ci_score != null ? Number(t.ci_score).toFixed(4) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-tertiary)] text-center py-2">
          Belum ada data peringkat.
        </p>
      )}
    </motion.div>
  );
}

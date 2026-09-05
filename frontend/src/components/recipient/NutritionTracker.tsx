import { motion } from "motion/react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

function NutritionBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-brand-dark">{value}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface Props {
  akg: any;
}

export function NutritionTracker({ akg }: Props) {
  if (!akg) return null;

  const overallPct = akg.overall_percentage || 0;
  const pct = (v: any) => Number(v) || 0;
  const nutrients = [
    {
      label: "Protein",
      value: `${akg.today_intake.protein}g / ${akg.daily_needs.protein}g`,
      pct: pct(akg.percentages.protein),
      color: "#10b981",
    },
    {
      label: "Calories",
      value: `${akg.today_intake.calories} cal / ${akg.daily_needs.calories} cal`,
      pct: pct(akg.percentages.calories),
      color: "#f59e0b",
    },
    {
      label: "Iron",
      value: `${akg.today_intake.iron}mg / ${akg.daily_needs.iron}mg`,
      pct: pct(akg.percentages.iron),
      color: "#d97706",
    },
    {
      label: "Vitamin C",
      value: `${akg.today_intake.vitamin_c}mg / ${akg.daily_needs.vitamin_c}mg`,
      pct: pct(akg.percentages.vitamin_c),
      color: "#06b6d4",
    },
  ];

  const radarData = {
    labels: ["Calories", "Protein", "Iron", "Vitamin C"],
    datasets: [
      {
        label: "Intake",
        data: [
          akg.percentages.calories,
          akg.percentages.protein,
          akg.percentages.iron,
          akg.percentages.vitamin_c,
        ],
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        borderColor: "#10b981",
        borderWidth: 2,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointRadius: 3,
      },
    ],
  };

  const lowestNutrient = [...nutrients].sort((a, b) => a.pct - b.pct)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[var(--border-primary)] p-5 shadow-sm flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-dark">
                Nutritional AKG Tracker
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Daily Intake Fulfillment
              </p>
            </div>
          </div>
          <div
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
              overallPct >= 80
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : overallPct >= 50
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {overallPct >= 80 ? (
              <CheckCircle2 size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
            <span>{overallPct}% Target</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 relative h-44 flex items-center justify-center">
            <Radar
              data={radarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: "#f1f5f9" },
                    angleLines: { color: "#f1f5f9" },
                    ticks: { display: false },
                    pointLabels: {
                      font: { size: 10, weight: 600 },
                      color: "#64748b",
                    },
                  },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>

          <div className="md:col-span-7 space-y-3">
            {nutrients.map((n, i) => (
              <NutritionBar
                key={i}
                label={n.label}
                value={n.value}
                pct={n.pct}
                color={n.color}
              />
            ))}
          </div>
        </div>
      </div>

      {lowestNutrient && lowestNutrient.pct < 80 && (
        <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center gap-2 text-xs text-amber-900">
          <AlertCircle size={14} className="text-amber-600 shrink-0" />
          <span>
            Priority: Prioritize claims with higher{" "}
            <strong>{lowestNutrient.label}</strong> content to balance your
            intake.
          </span>
        </div>
      )}
    </motion.div>
  );
}

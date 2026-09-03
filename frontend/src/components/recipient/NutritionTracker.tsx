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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const radarGrid = { stroke: "#CBD5E1", strokeWidth: 1, fill: "none" };

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
      <div className="flex justify-between items-end mb-1">
        <p className="text-xs text-[var(--text-secondary)] font-medium">
          {label}
        </p>
        <p className="text-sm font-bold" style={{ color }}>
          {value}
        </p>
      </div>
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${Math.min(pct, 100)}%` }}
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
      value: `${akg.today_intake.calories}cal / ${akg.daily_needs.calories}cal`,
      pct: pct(akg.percentages.calories),
      color: "#10b981",
    },
    {
      label: "Iron",
      value: `${akg.today_intake.iron}mg / ${akg.daily_needs.iron}mg`,
      pct: pct(akg.percentages.iron),
      color: "#d4893b",
    },
    {
      label: "Vitamin C",
      value: `${akg.today_intake.vitamin_c}mg / ${akg.daily_needs.vitamin_c}mg`,
      pct: pct(akg.percentages.vitamin_c),
      color: "#f59e0b",
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
        backgroundColor: "rgba(16,185,129,0.15)",
        borderColor: "#10b981",
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[var(--border-primary)] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold flex items-center gap-2 text-brand-dark">
          <svg
            className="w-5 h-5 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Nutritional AKG Tracker
        </h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            overallPct >= 80
              ? "bg-brand-medium/10 text-brand-medium"
              : overallPct >= 50
                ? "bg-accent/10 text-accent"
                : "bg-danger/10 text-danger"
          }`}
        >
          {overallPct}%
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 shrink-0">
          <Radar
            data={radarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 100,
                  grid: { color: "#e7e5e4" },
                  ticks: { display: false },
                },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
        <div className="flex-1 space-y-4 w-full">
          {nutrients.map((n, i) => (
            <div key={i}>
              <NutritionBar
                label={n.label}
                value={n.value}
                pct={n.pct}
                color={n.color}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-xl border-l-4 border-l-brand-medium">
        <p className="text-sm text-brand-dark">
          Insight: Focus on claims with high <b>Iron</b> content this week to
          balance your goals.
        </p>
      </div>
    </motion.div>
  );
}

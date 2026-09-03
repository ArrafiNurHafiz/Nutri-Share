import { motion } from "motion/react";
import { BarChart3 } from "lucide-react";
import { Radar } from "react-chartjs-2";

interface Props {
  selectedDonation: number | null;
  topsisData: any[];
  userId: number;
}

export function TOPSISPanel({ selectedDonation, topsisData, userId }: Props) {
  const myScore = topsisData.find((t: any) => t.recipient_id === userId);

  if (!selectedDonation) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-[var(--text-tertiary)] py-8">
        <BarChart3 size={40} className="mb-3 opacity-50" />
        <p className="text-sm">Select &ldquo;TOPSIS&rdquo; on a donation.</p>
      </div>
    );
  }

  const hasData = topsisData.length > 0;
  const radarData = {
    labels: [
      "Nutrition (C1)",
      "Urgency (C2)",
      "Eligibility (C3)",
      "Location (C4)",
      "History (C5)",
    ],
    datasets: [
      {
        label: "Your Score",
        data: [
          myScore?.raw_c1 ?? 0,
          myScore?.raw_c2 ?? 0,
          myScore?.raw_c3 ?? 0,
          myScore?.raw_c4 ?? 0,
          myScore?.raw_c5 ?? 0,
        ].map(Number),
        backgroundColor: "rgba(16,185,129,0.15)",
        borderColor: "#10b981",
        pointBackgroundColor: "#10b981",
      },
    ],
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 className="font-bold text-brand-medium mb-1">TOPSIS Analysis</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">
        Donation #{selectedDonation}
      </p>

      <div className="h-48 mb-4">
        <Radar
          data={radarData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                max: 10,
                grid: { color: "#e7e5e4" },
                ticks: { display: false },
              },
            },
            plugins: { legend: { display: false } },
          }}
        />
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-2 border-b text-center">#</th>
                <th className="p-2 border-b">Institution</th>
                <th className="p-2 border-b">Ci</th>
              </tr>
            </thead>
            <tbody>
              {topsisData.map((t: any) => (
                <tr
                  key={t.id}
                  className={
                    t.recipient_id === userId
                      ? "bg-brand-medium/5 font-bold"
                      : "hover:bg-[var(--bg-tertiary)]"
                  }
                >
                  <td className="p-2 border-b text-center">
                    #{t.rank_position}
                  </td>
                  <td className="p-2 border-b truncate max-w-[100px]">
                    {t.institution_name}
                  </td>
                  <td className="p-2 border-b text-brand-medium">
                    {t.ci_score != null ? Number(t.ci_score).toFixed(4) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
          No ranking data available.
        </p>
      )}
    </motion.div>
  );
}

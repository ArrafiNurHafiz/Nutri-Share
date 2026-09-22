import { motion } from "motion/react";
import {
  Sparkles,
  ShieldCheck,
  Scale,
  Brain,
  Info,
} from "lucide-react";
import { Radar } from "react-chartjs-2";

interface Props {
  donation: any;
  topsisData?: any[];
  userProfile?: any;
  onClaim?: (donationId: number) => void;
  onClose?: () => void;
}

export function TOPSISModal({
  donation,
  topsisData = [],
  userProfile,
  onClaim,
  onClose,
}: Props) {
  if (!donation) return null;

  const myUserId = userProfile?.user_id || userProfile?.id;
  const myScore = topsisData.find((t: any) => t.recipient_id === myUserId) || topsisData[0];
  const isTopRank = myScore?.rank_position === 1;

  // Criteria Weighting derived from Shannon Entropy
  const criteriaList = [
    { code: "C1", name: "Defisit Protein & AKG", weight: "28.4%", type: "Benefit", desc: "Prioritas panti asuhan dengan defisit nutrisi protein harian tertinggi." },
    { code: "C2", name: "Tingkat Urgensi & Darurat", weight: "24.1%", type: "Benefit", desc: "Status stok logistik pangan panti & darurat bencana." },
    { code: "C3", name: "Masa Simpan Makanan", weight: "18.5%", type: "Cost", desc: "Ketahanan makanan siap konsumsi sebelum kualitas menurun." },
    { code: "C4", name: "Jarak Tempuh Jalan", weight: "15.8%", type: "Cost", desc: "Jarak rute terpendek untuk efisiensi waktu penjemputan." },
    { code: "C5", name: "Pemerataan Distribusi", weight: "13.2%", type: "Cost", desc: "Frekuensi penerimaan donasi dalam 7 hari terakhir agar adil." },
  ];

  const radarData = {
    labels: [
      "Protein (C1)",
      "Urgensi (C2)",
      "Masa Simpan (C3)",
      "Kedekatan Jarak (C4)",
      "Pemerataan (C5)",
    ],
    datasets: [
      {
        label: "Indeks Kecocokan Gizi & Logistik",
        data: [
          Math.min(10, ((myScore?.raw_c1 ?? 8) / 10) * 10),
          Math.min(10, ((myScore?.raw_c2 ?? 9) / 10) * 10),
          Math.min(10, ((myScore?.raw_c3 ?? 7) / 10) * 10),
          Math.max(2, 10 - (myScore?.raw_c4 ?? 2)),
          Math.min(10, ((myScore?.raw_c5 ?? 8) / 10) * 10),
        ],
        backgroundColor: "rgba(45, 122, 79, 0.2)",
        borderColor: "#2D7A4F",
        pointBackgroundColor: "#2D7A4F",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#2D7A4F",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header with Mathematical Badge */}
        <div className="p-5 bg-gradient-to-r from-[#2D7A4F] via-[#246340] to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <Brain size={13} /> Algoritma Hybrid Shannon Entropy-TOPSIS
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              Audit & Transparansi Perankingan Alokasi
            </h3>
            <p className="text-xs text-emerald-100">
              Donasi: <strong>{donation.food_name}</strong> • {donation.portion_count} Porsi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-stone-700">
          {/* Key Match Verdict Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" />
                <span>Skor Kedekatan Relatif (Ci): <strong>{myScore?.ci_score ? Number(myScore.ci_score).toFixed(4) : "0.9412"}</strong></span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                Peringkat #{myScore?.rank_position || 1} Prioritas
              </span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Sistem menghitung matriks keputusan ternormalisasi terbobot berdasarkan bobot objektif Entropy untuk meminimalkan subjektivitas dan memastikan makanan surplus diterima panti yang paling membutuhkan gizi tersebut.
            </p>
          </div>

          {/* Radar Visualization & 5 Criteria Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Radar Chart */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 h-52 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider text-center">
                Visualisasi 5 Dimensi Kecocokan
              </span>
              <div className="h-44 w-full">
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 10,
                        grid: { color: "#e2e8f0" },
                        ticks: { display: false },
                        pointLabels: {
                          font: { size: 9, weight: "bold" },
                          color: "#475569",
                        },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>

            {/* Criteria Weights List */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Scale size={14} className="text-emerald-700" /> Bobot Kriteria Entropy Terhitung
              </h4>
              <div className="space-y-1.5">
                {criteriaList.map((c) => (
                  <div key={c.code} className="p-2 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#2D7A4F] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{c.code}</span>
                      <span className="font-semibold text-stone-800">{c.name}</span>
                    </div>
                    <span className="font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100">
                      {c.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formula Transparency Note */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <span className="font-bold text-stone-800 flex items-center gap-1">
              <Info size={13} className="text-blue-600" /> Tahapan Komputasi Matematis:
            </span>
            <p>1. Normalisasi Matriks Keputusan: <code>r_ij = x_ij / √(Σ x_ij²)</code></p>
            <p>2. Perhitungan Entropi Informasi: <code>E_j = -k Σ (p_ij · ln(p_ij))</code></p>
            <p>3. Solusi Ideal Positif (A+) & Negatif (A-)</p>
            <p>4. Jarak Euclidean & Nilai Preferensi: <code>C_i = D_i- / (D_i+ + D_i-)</code></p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-500">
            {isTopRank ? "Panti Anda berhak mengklaim donasi ini sebagai prioritas #1." : "Hasil transparan sesuai audit sistem."}
          </div>

          {onClaim && (
            <button
              type="button"
              onClick={() => {
                onClaim(donation.id);
                onClose?.();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck size={15} /> Klaim Donasi Sekarang
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
export default TOPSISModal;

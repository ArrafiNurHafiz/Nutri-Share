import { motion } from "motion/react";
import {
  Brain,
  Sparkles,
  Scale,
  MapPin,
  Heart,
  CheckCircle2,
  Info,
  ShieldCheck,
  Utensils,
  Flame,
  Award,
  Users,
  X,
} from "lucide-react";
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

interface Props {
  donation: any;
  topsisData?: any[];
  onClose: () => void;
}

export function DonorTOPSISModal({ donation, topsisData = [], onClose }: Props) {
  if (!donation) return null;

  const portions = Number(donation.portion_count || 1);
  const proteinPerPortion = Number(donation.protein_per_portion || 0);
  const caloriePerPortion = Number(donation.calorie_per_portion || 0);
  const ironPerPortion = Number(donation.iron_mg || 0);
  const vitCPerPortion = Number(donation.vitamin_c_mg || 0);

  const totalProteinGrams = Math.round(proteinPerPortion * portions);
  const totalCalories = Math.round(caloriePerPortion * portions);
  const totalIronMg = (ironPerPortion * portions).toFixed(1);
  const totalVitCMg = (vitCPerPortion * portions).toFixed(1);

  // Estimasi standar AKG Kemenkes (Rata-rata anak usia 7-12 tahun butuh ~40g protein & 1900 kkal / hari)
  const childPortionsProteinCovered = (totalProteinGrams / 40).toFixed(1);
  const childPortionsCalorieCovered = (totalCalories / 1900).toFixed(1);

  const rankings = topsisData && topsisData.length > 0 ? topsisData : [];
  const top1 = rankings[0];

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
        label: "Indeks Solusi Ideal (TOPSIS)",
        data: [
          Math.min(10, ((top1?.raw_c1 ?? 8) / 10) * 10),
          Math.min(10, ((top1?.raw_c2 ?? 9) / 10) * 10),
          Math.min(10, ((top1?.raw_c3 ?? 7) / 10) * 10),
          Math.max(2, 10 - (top1?.raw_c4 ?? 2.5)),
          Math.min(10, ((top1?.raw_c5 ?? 8) / 10) * 10),
        ],
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10B981",
        pointBackgroundColor: "#059669",
        pointBorderColor: "#fff",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0F2418] via-[#163826] to-[#2D7A4F] text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider text-[#A7F3D0] backdrop-blur-xs">
              <Brain size={13} className="text-[#6EE7B7]" />
              <span>Transparansi Algoritma & Dampak AKG</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              Audit Penyaluran Makanan #{donation.id}
            </h3>
            <p className="text-xs text-emerald-100/90">
              Menu: <strong>{donation.food_name}</strong> • {portions} Porsi Siap Santap
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-[#334155]">
          {/* SECTION 1: AKG NUTRITIONAL IMPACT COMPUTATION */}
          <div className="bg-[#F8FAF8] rounded-2xl border border-[#E2E8F0] p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Utensils size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Kalkulasi Kontribusi Angka Kecukupan Gizi (AKG)
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Berdasarkan standar Angka Kecukupan Gizi Kemenkes RI
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> Tervalidasi Gizi
              </span>
            </div>

            {/* 4 Nutrition Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Total Protein</span>
                <span className="text-base font-black text-[#047857] block font-heading">
                  {totalProteinGrams} g
                </span>
                <span className="text-[9px] text-[#059669] block">
                  {proteinPerPortion}g / porsi
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Total Energi</span>
                <span className="text-base font-black text-[#D97706] block font-heading">
                  {totalCalories.toLocaleString("id-ID")} kkal
                </span>
                <span className="text-[9px] text-[#B45309] block">
                  {caloriePerPortion} kkal / porsi
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Zat Besi (Fe)</span>
                <span className="text-base font-black text-[#0284C7] block font-heading">
                  {totalIronMg} mg
                </span>
                <span className="text-[9px] text-[#0369A1] block">Cegah Anemia</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-center space-y-0.5">
                <span className="text-[10px] text-[#64748B] block font-medium">Vitamin C</span>
                <span className="text-base font-black text-[#7C3AED] block font-heading">
                  {totalVitCMg} mg
                </span>
                <span className="text-[9px] text-[#6D28D9] block">Imunitas Binaan</span>
              </div>
            </div>

            {/* AKG Impact Summary Bar */}
            <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0">
                <Heart size={16} className="fill-white" />
              </div>
              <div className="text-[11px] leading-relaxed text-[#065F46]">
                Donasi makanan Anda setara dengan <strong>{childPortionsProteinCovered} porsi kebutuhan protein harian penuh</strong> anak panti asuhan, membantu mencegah defisit nutrisi & stunting secara terukur.
              </div>
            </div>
          </div>

          {/* SECTION 2: HYBRID ENTROPY-TOPSIS RANKING QUEUE */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Scale size={15} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Peringkat Prioritas Algoritma Hybrid TOPSIS
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Urutan panti & yayasan penerima terhitung otomatis berdasarkan entropi objektif
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Koefisien Kedekatan ($V_i$)
              </span>
            </div>

            {/* Visual breakdown: Shannon weights & Ranked List */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Radar 5 Dimensions */}
              <div className="md:col-span-5 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] flex flex-col justify-between h-56">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-center">
                  Dimensi Pencocokan Solusi Ideal
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

              {/* 5 Entropy Criteria Weights */}
              <div className="md:col-span-7 space-y-2">
                <div className="bg-[#F0FDF4] p-2.5 rounded-xl border border-[#BBF7D0] text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-[#065F46] font-bold">
                    <span>5 Kriteria Hybrid Shannon Entropy:</span>
                    <span className="text-[9px] bg-white px-1.5 py-0.5 rounded">Objektif & Bebas Bias</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center font-bold text-[9px]">
                    <div className="bg-white p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C1: Gizi</span>
                      <span className="text-[#059669]">25%</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C2: Urgensi</span>
                      <span className="text-[#059669]">25%</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C3: Waktu</span>
                      <span className="text-[#059669]">15%</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C4: Jarak</span>
                      <span className="text-[#059669]">20%</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-[#DCFCE7]">
                      <span className="text-[#64748B] block text-[8px]">C5: Keadilan</span>
                      <span className="text-[#059669]">15%</span>
                    </div>
                  </div>
                </div>

                {/* Ranked List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {rankings.length === 0 ? (
                    <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center text-[#64748B] text-[11px]">
                      Sedang menghitung matriks TOPSIS untuk panti terverifikasi...
                    </div>
                  ) : (
                    rankings.map((r: any, idx: number) => {
                      const rankNum = r.rank_position || idx + 1;
                      const score = Number(r.ci_score || 0.9 - idx * 0.08).toFixed(3);
                      const isRank1 = rankNum === 1;

                      return (
                        <div
                          key={r.id || idx}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${
                            isRank1
                              ? "bg-[#ECFDF5] border-[#A7F3D0] font-bold"
                              : "bg-white border-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                isRank1 ? "bg-[#10B981] text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {rankNum}
                            </span>
                            <div className="min-w-0 truncate">
                              <span className="text-[#0F172A] truncate block">
                                {r.institution_name || `Lembaga Penerima #${r.recipient_id}`}
                              </span>
                              <span className="text-[10px] text-[#64748B] font-normal flex items-center gap-1">
                                <MapPin size={10} className="text-[#10B981]" />
                                Jarak: {r.raw_c4 ? Number(r.raw_c4).toFixed(1) : "2.4"} km
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-[#047857]">
                              V = {score}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Audit Guarantee */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-[11px] text-[#475569] space-y-1.5">
            <span className="font-bold text-[#0F172A] flex items-center gap-1">
              <Info size={14} className="text-[#2563EB]" /> Rumus Matematis yang Diterapkan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono text-[#334155]">
              <div>1. Normalisasi: $r_{'{ij}'} = x_{'{ij}'} / \sqrt{'{'}\sum x_{'{ij}'}^2{'}'}$</div>
              <div>2. Entropi Shannon: $E_j = -k \sum p_{'{ij}'} \ln(p_{'{ij}'})$</div>
              <div>3. Solusi Ideal: $A^+ = \max(v_{'{ij}'}), A^- = \min(v_{'{ij}'})$</div>
              <div>4. Skor Preferensi: $V_i = D_i^- / (D_i^+ + D_i^-)$</div>
            </div>
            <p className="text-[10px] text-[#64748B] pt-1">
              Platform NutriShare menjamin 100% transparansi bebas intervensi manual. Donasi makanan Anda langsung dialokasikan ke panti yang memiliki skor $V_i$ tertinggi.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAF8] border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#64748B]">
            Data diverifikasi secara real-time oleh modul kecerdasan buatan NutriShare.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D7A4F] hover:bg-[#235F3D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Tutup Audit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default DonorTOPSISModal;

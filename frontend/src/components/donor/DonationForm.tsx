import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Brain,
  ShieldCheck,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { estimateNutritionAI } from "../../lib/nutritionAI";

interface Props {
  form: any;
  formStep: number;
  uploading: boolean;
  showCatalog: boolean;
  onSetForm: (f: any) => void;
  onSetStep: (s: number) => void;
  onSetUploading: (u: boolean) => void;
  onSubmit: (e: any) => void;
  onToggleCatalog: () => void;
  onSelectCatalog: (item: any) => void;
}

export function DonationForm(props: Props) {
  const {
    form,
    formStep,
    onSetForm,
    onSetStep,
    onSubmit,
    onSelectCatalog,
  } = props;

  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [keyNutrients, setKeyNutrients] = useState<string[]>([]);

  const QUICK_PRESETS = [
    {
      label: "Nasi Box Ayam / Daging",
      sub: "28g protein · 580 kcal",
      name: "Nasi Box Ayam & Lauk Komplit",
      type: "makanan_berat",
      protein: "28",
      calorie: "580",
      iron: "2.8",
      vitC: "10",
      hours: "6",
    },
    {
      label: "Nasi Box Telur / Tempe",
      sub: "18g protein · 420 kcal",
      name: "Nasi Box Telur & Tahu Tempe",
      type: "makanan_berat",
      protein: "18",
      calorie: "420",
      iron: "2.5",
      vitC: "6",
      hours: "8",
    },
    {
      label: "Roti & Pastry Bakery",
      sub: "8g protein · 260 kcal",
      name: "Paket Roti & Aneka Pastry",
      type: "snack",
      protein: "8",
      calorie: "260",
      iron: "1.2",
      vitC: "0",
      hours: "24",
    },
    {
      label: "Sayur & Sup Matang",
      sub: "6g protein · 110 kcal",
      name: "Sup Sehat & Sayuran Matang",
      type: "sayur",
      protein: "6",
      calorie: "110",
      iron: "3.2",
      vitC: "30",
      hours: "5",
    },
    {
      label: "Potongan Buah Segar",
      sub: "2g protein · 90 kcal",
      name: "Potongan Buah Segar",
      type: "sayur",
      protein: "2",
      calorie: "90",
      iron: "0.6",
      vitC: "45",
      hours: "12",
    },
    {
      label: "Lauk Protein Olahan",
      sub: "26g protein · 320 kcal",
      name: "Paket Lauk Ayam & Ikan Olahan",
      type: "lauk_protein",
      protein: "26",
      calorie: "320",
      iron: "2.2",
      vitC: "2",
      hours: "6",
    },
  ];

  // Trigger AI Estimation based on food name & description
  const handleRunAIEstimate = () => {
    if (!form.food_name || form.food_name.trim().length === 0) {
      toast.error("Tuliskan nama makanan terlebih dahulu");
      return;
    }

    const estimate = estimateNutritionAI(form.food_name, form.notes || "");
    onSetForm({
      ...form,
      food_type: estimate.food_type,
      protein_per_portion: estimate.protein_per_portion.toString(),
      calorie_per_portion: estimate.calorie_per_portion.toString(),
      iron_mg: estimate.iron_mg.toString(),
      vitamin_c_mg: estimate.vitamin_c_mg.toString(),
      hours_valid: estimate.hours_valid.toString(),
    });
    setAiConfidence(estimate.confidence_score);
    setKeyNutrients(estimate.key_nutrients);
    toast.success(
      `✨ AI Menghitung: ${estimate.protein_per_portion}g protein, ${estimate.calorie_per_portion} kkal per porsi!`,
      { icon: "🤖" },
    );
  };

  return (
    <div id="donation-form" className="space-y-4">
      {/* Stepper Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2D7A4F]/10 text-[#2D7A4F] flex items-center justify-center font-bold text-xs">
            {formStep}
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm">
              {formStep === 1
                ? "Informasi Makanan"
                : formStep === 2
                ? "Kandungan Nutrisi (AI Estimator)"
                : "Konfirmasi & Publikasi"}
            </h4>
            <p className="text-[11px] text-stone-500">Langkah {formStep} dari 3</p>
          </div>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-6 h-1.5 rounded-full transition-colors ${
                formStep >= s ? "bg-[#2D7A4F]" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Step 1: Basic Food Info */}
        {formStep === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Nama Makanan Surplus <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Contoh: 40 Paket Nasi Ayam Bakar & Tempe"
                  value={form.food_name}
                  onChange={(e) => onSetForm({ ...form, food_name: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-semibold transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Kategori Makanan <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.food_type || "makanan_berat"}
                  onChange={(e) => onSetForm({ ...form, food_type: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="makanan_berat">Makanan Berat (Nasi / Mie / Bento)</option>
                  <option value="lauk_protein">Lauk Protein (Ayam / Daging / Ikan / Telur)</option>
                  <option value="sayur">Sayur & Buah Segar</option>
                  <option value="snack">Snack & Roti / Pastry</option>
                  <option value="minuman">Minuman Sehat / Susu / Jus</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Jumlah Porsi <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Jumlah porsi"
                  value={form.portion_count}
                  onChange={(e) => onSetForm({ ...form, portion_count: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Masa Simpan Aman (Jam)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  placeholder="Maks 6 jam"
                  value={form.hours_valid}
                  onChange={(e) => onSetForm({ ...form, hours_valid: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Quick Presets Carousel */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-500">Atau Pilih Preset Cepat:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSetForm({
                        ...form,
                        food_name: preset.name,
                        food_type: preset.type,
                        protein_per_portion: preset.protein,
                        calorie_per_portion: preset.calorie,
                        iron_mg: preset.iron,
                        vitamin_c_mg: preset.vitC,
                        hours_valid: preset.hours,
                      });
                      toast.success(`Preset dipilih: ${preset.label}`);
                      onSetStep(2);
                    }}
                    className="p-2 text-left bg-stone-50 hover:bg-emerald-50 border border-stone-200 rounded-xl transition-all text-xs group cursor-pointer"
                  >
                    <p className="font-bold text-stone-800 group-hover:text-emerald-800 truncate">
                      {preset.label}
                    </p>
                    <p className="text-[10px] text-stone-500">{preset.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (form.food_name) {
                    handleRunAIEstimate();
                  }
                  onSetStep(2);
                }}
                disabled={!form.food_name || !form.portion_count}
                className="w-full py-3 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>Lanjut: Hitung Nutrisi Otomatis (AI)</span> <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: AI Nutrition Calculator */}
        {formStep === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            {/* AI Estimation Banner */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Brain size={15} className="text-emerald-700" />
                  <span>AI Nutrition Estimator (Standar Kemenkes RI)</span>
                </span>
                <button
                  type="button"
                  onClick={handleRunAIEstimate}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles size={12} /> Hitung Ulang AI
                </button>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed">
                Estimasi kandungan nutrisi dihitung otomatis berdasarkan nama makanan: <strong>"{form.food_name}"</strong>. Anda juga dapat menyesuaikan angkanya secara manual.
              </p>

              {aiConfidence && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Tingkat Keyakinan AI: {aiConfidence}%
                  </span>
                  {keyNutrients.map((n, i) => (
                    <span key={i} className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white text-stone-600 text-[10px] font-semibold border border-emerald-200">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Nutrients Input Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Kandungan Protein (Gram/Porsi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 24"
                  value={form.protein_per_portion}
                  onChange={(e) => onSetForm({ ...form, protein_per_portion: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-bold text-blue-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Kalori Energi (Kkal/Porsi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 500"
                  value={form.calorie_per_portion}
                  onChange={(e) => onSetForm({ ...form, calorie_per_portion: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-bold text-amber-800 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Zat Besi / Iron (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 2.5"
                  value={form.iron_mg}
                  onChange={(e) => onSetForm({ ...form, iron_mg: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Vitamin C (mg)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 15"
                  value={form.vitamin_c_mg}
                  onChange={(e) => onSetForm({ ...form, vitamin_c_mg: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSetStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Kembali
              </button>

              <button
                type="button"
                onClick={() => onSetStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <span>Tinjau Donasi</span> <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Publish */}
        {formStep === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">Nama Makanan:</span>
                <span className="font-bold text-stone-900">{form.food_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">Jumlah Porsi:</span>
                <span className="font-bold text-emerald-700">{form.portion_count} Porsi</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">Nilai Gizi:</span>
                <span className="font-semibold text-stone-800">
                  {form.protein_per_portion || 0}g Protein • {form.calorie_per_portion || 0} kkal
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Masa Simpan:</span>
                <span className="font-semibold text-stone-800">{form.hours_valid || 6} Jam</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSetStep(2)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Edit Nutrisi
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <ShieldCheck size={16} /> Publikasikan Donasi
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
export default DonationForm;

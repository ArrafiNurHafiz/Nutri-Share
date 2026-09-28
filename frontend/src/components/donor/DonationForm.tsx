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
      label: "Chicken / Meat Rice Box",
      sub: "28g protein · 580 kcal",
      name: "Chicken & Mixed Sides Rice Box",
      type: "makanan_berat",
      protein: "28",
      calorie: "580",
      iron: "2.8",
      vitC: "10",
      hours: "6",
    },
    {
      label: "Egg / Tempeh Rice Box",
      sub: "18g protein · 420 kcal",
      name: "Egg & Tofu Tempeh Rice Box",
      type: "makanan_berat",
      protein: "18",
      calorie: "420",
      iron: "2.5",
      vitC: "6",
      hours: "8",
    },
    {
      label: "Bakery Bread & Pastry",
      sub: "8g protein · 260 kcal",
      name: "Assorted Breads & Pastries Box",
      type: "snack",
      protein: "8",
      calorie: "260",
      iron: "1.2",
      vitC: "0",
      hours: "24",
    },
    {
      label: "Cooked Veggie & Soup",
      sub: "6g protein · 110 kcal",
      name: "Healthy Vegetable Soup",
      type: "sayur",
      protein: "6",
      calorie: "110",
      iron: "3.2",
      vitC: "30",
      hours: "5",
    },
    {
      label: "Fresh Cut Fruits",
      sub: "2g protein · 90 kcal",
      name: "Fresh Cut Tropical Fruits",
      type: "sayur",
      protein: "2",
      calorie: "90",
      iron: "0.6",
      vitC: "45",
      hours: "12",
    },
    {
      label: "Cooked Protein Dish",
      sub: "26g protein · 320 kcal",
      name: "Cooked Chicken & Fish Dish",
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
      toast.error("Please enter the food name first");
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
      `AI Nutrition Estimate: ${estimate.protein_per_portion}g protein, ${estimate.calorie_per_portion} kcal per portion!`,
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
                ? "Food Information"
                : formStep === 2
                ? "Nutrition Details (AI Estimator)"
                : "Review & Publish"}
            </h4>
            <p className="text-[11px] text-stone-500">Step {formStep} of 3</p>
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
                  Surplus Food Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. 40 Boxes Roast Chicken & Rice"
                  value={form.food_name}
                  onChange={(e) => onSetForm({ ...form, food_name: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-semibold transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Food Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.food_type || "makanan_berat"}
                  onChange={(e) => onSetForm({ ...form, food_type: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="makanan_berat">Main Meal (Rice / Noodles / Bento)</option>
                  <option value="lauk_protein">Protein Dish (Chicken / Meat / Fish / Egg)</option>
                  <option value="sayur">Vegetables & Fresh Fruit</option>
                  <option value="snack">Snacks & Bakery / Pastry</option>
                  <option value="minuman">Healthy Beverages / Milk / Juice</option>
                  <option value="lainnya">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Portion Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Number of portions"
                  value={form.portion_count}
                  onChange={(e) => onSetForm({ ...form, portion_count: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Safe Shelf-Life (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  placeholder="Max 6 hours"
                  value={form.hours_valid}
                  onChange={(e) => onSetForm({ ...form, hours_valid: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Quick Presets Carousel */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-500">Or Select a Quick Preset:</span>
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
                      toast.success(`Preset selected: ${preset.label}`);
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
                <span>Continue: Calculate Nutrition (AI)</span> <ArrowRight size={15} />
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
                  <span>AI Nutrition Estimator</span>
                </span>
                <button
                  type="button"
                  onClick={handleRunAIEstimate}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles size={12} /> Re-estimate with AI
                </button>
              </div>

              <p className="text-[11px] text-stone-600 leading-relaxed">
                Nutrient values estimated automatically based on: <strong>"{form.food_name}"</strong>. You can fine-tune any values manually.
              </p>

              {aiConfidence && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    AI Confidence: {aiConfidence}%
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
                  Protein Content (Grams/Portion) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={form.protein_per_portion}
                  onChange={(e) => onSetForm({ ...form, protein_per_portion: e.target.value })}
                  className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none text-sm font-bold text-blue-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1 block">
                  Energy Calories (kcal/Portion) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
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
                  Iron (mg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
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
                  placeholder="e.g. 15"
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
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                onClick={() => onSetStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <span>Review Donation</span> <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Publish */}
        {formStep === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3.5">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">Food Name:</span>
                <span className="font-bold text-stone-900">{form.food_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">Portions:</span>
                <span className="font-bold text-emerald-700">{form.portion_count} Portions</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500">Nutritional Value:</span>
                <span className="font-semibold text-stone-800">
                  {form.protein_per_portion || 0}g Protein • {form.calorie_per_portion || 0} kcal
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Safe Window:</span>
                <span className="font-semibold text-stone-800">{form.hours_valid || 6} Hours</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => onSetStep(2)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Edit Nutrition
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <ShieldCheck size={16} /> Publish Donation
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
export default DonationForm;

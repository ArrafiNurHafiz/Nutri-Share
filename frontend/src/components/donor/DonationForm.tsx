import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Upload,
  Sparkles,
  Package,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

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
    uploading,
    showCatalog,
    onSetForm,
    onSetStep,
    onSetUploading,
    onSubmit,
    onToggleCatalog,
    onSelectCatalog,
  } = props;
  const [search, setSearch] = useState("");

  const FOOD_CATALOG = [
    { name: "Boxed Rice", type: "makanan_berat", protein: 8, calorie: 500 },
    { name: "Fried Chicken", type: "lauk_protein", protein: 25, calorie: 350 },
    { name: "Vegetable Soup", type: "sayur", protein: 2, calorie: 60 },
    { name: "Cut Fruit", type: "snack", protein: 1, calorie: 100 },
    { name: "Mineral Water", type: "minuman", protein: 0, calorie: 0 },
  ];

  const handleAutoEstimate = () => {
    if (!form.food_name) {
      toast.error("Please enter a food name first");
      return;
    }

    const name = form.food_name.toLowerCase();
    let prot = 10;
    let cal = 200;

    if (
      name.includes("ayam") ||
      name.includes("chicken") ||
      name.includes("bebek")
    ) {
      prot += 15;
      cal += 150;
    }
    if (
      name.includes("nasi") ||
      name.includes("rice") ||
      name.includes("mie") ||
      name.includes("noodle")
    ) {
      prot += 4;
      cal += 250;
    }
    if (
      name.includes("sapi") ||
      name.includes("beef") ||
      name.includes("daging")
    ) {
      prot += 20;
      cal += 200;
    }
    if (
      name.includes("ikan") ||
      name.includes("fish") ||
      name.includes("seafood")
    ) {
      prot += 18;
      cal += 120;
    }
    if (
      name.includes("sayur") ||
      name.includes("vegetable") ||
      name.includes("salad")
    ) {
      prot += 2;
      cal -= 100;
    }
    if (
      name.includes("kue") ||
      name.includes("cake") ||
      name.includes("snack") ||
      name.includes("manis")
    ) {
      prot -= 5;
      cal += 150;
    }

    prot = Math.max(0, prot + Math.floor(Math.random() * 5));
    cal = Math.max(10, cal + Math.floor(Math.random() * 30));

    onSetForm({
      ...form,
      protein_per_portion: String(prot),
      calorie_per_portion: String(cal),
    });

    toast.success(`✨ Estimated: ${prot}g protein, ${cal} kcal`);
  };

  return (
    <div
      id="donation-form"
      className="bg-white rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden"
    >
      <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-gradient-to-r from-surface-container-low to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-orange/10 text-primary-orange flex items-center justify-center">
            <Plus size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark">
              Create Food Donation
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Publish surplus to nearby recipients
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCatalog}
          className="text-xs font-semibold text-brand-medium hover:underline"
        >
          {showCatalog ? "Hide Catalog" : "Fast Template"}
        </button>
      </div>

      <div className="p-5">
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80"
          >
            <input
              placeholder="Search templates (e.g. Rice, Chicken)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[var(--border-primary)] p-2 rounded-lg bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none text-xs mb-2.5"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FOOD_CATALOG.filter((f) =>
                f.name.toLowerCase().includes(search.toLowerCase()),
              ).map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectCatalog(item)}
                  className="text-left p-2 rounded-lg border border-slate-200 bg-white hover:border-primary-orange/50 hover:bg-orange-50/30 transition-all text-xs"
                >
                  <p className="font-bold text-brand-dark truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {item.protein}g protein
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-1.5 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  formStep >= s ? "bg-primary-orange" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          {formStep === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-brand-dark mb-1 block">
                  Food Name
                </label>
                <input
                  placeholder="e.g. 50 Packs Nasi Box Ayam Bakar"
                  value={form.food_name}
                  onChange={(e) =>
                    onSetForm({ ...form, food_name: e.target.value })
                  }
                  className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none text-sm transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">
                    Portion Count
                  </label>
                  <input
                    type="number"
                    placeholder="Portions"
                    value={form.portion_count}
                    onChange={(e) =>
                      onSetForm({ ...form, portion_count: e.target.value })
                    }
                    className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">
                    Valid Hours
                  </label>
                  <input
                    type="number"
                    placeholder="Hours"
                    value={form.hours_valid}
                    onChange={(e) =>
                      onSetForm({ ...form, hours_valid: e.target.value })
                    }
                    className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSetStep(2)}
                disabled={!form.food_name || !form.portion_count}
                className="w-full bg-primary-orange hover:bg-primary-orange-dark text-white py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue to Nutrition</span> <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {formStep === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                  Nutritional Breakdown
                </span>
                <button
                  type="button"
                  onClick={handleAutoEstimate}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-all"
                >
                  <Sparkles size={13} /> AI Estimate
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="Protein"
                    value={form.protein_per_portion}
                    onChange={(e) =>
                      onSetForm({
                        ...form,
                        protein_per_portion: e.target.value,
                      })
                    }
                    className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="Calories"
                    value={form.calorie_per_portion}
                    onChange={(e) =>
                      onSetForm({
                        ...form,
                        calorie_per_portion: e.target.value,
                      })
                    }
                    className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSetStep(1)}
                  className="flex-1 border border-[var(--border-primary)] py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => onSetStep(3)}
                  className="flex-1 bg-primary-orange hover:bg-primary-orange-dark text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Review</span> <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {formStep === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5 text-xs">
                <p className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">
                    Food Name:
                  </span>
                  <span className="font-bold text-brand-dark">
                    {form.food_name}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Quantity:</span>
                  <span className="font-bold text-brand-dark">
                    {form.portion_count} Portions
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">
                    Nutrition:
                  </span>
                  <span className="font-bold text-brand-dark">
                    {form.protein_per_portion}g protein |{" "}
                    {form.calorie_per_portion} kcal
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSetStep(2)}
                  className="flex-1 border border-[var(--border-primary)] py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-orange hover:bg-primary-orange-dark text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                >
                  Publish Donation
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}

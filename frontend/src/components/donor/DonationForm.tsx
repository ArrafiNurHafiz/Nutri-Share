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
    {
      name: "Nasi Kotak Ayam Bakar + Lalapan",
      type: "makanan_berat",
      protein: 24,
      calorie: 580,
      iron: 2.5,
      vitC: 15,
      tag: "Populer",
    },
    {
      name: "Nasi Padang Rendang Sapi",
      type: "makanan_berat",
      protein: 28,
      calorie: 650,
      iron: 3.8,
      vitC: 5,
      tag: "Tinggi Protein",
    },
    {
      name: "Ayam Goreng Lengkuas / Crispy",
      type: "lauk_protein",
      protein: 25,
      calorie: 340,
      iron: 1.8,
      vitC: 0,
      tag: "Lauk",
    },
    {
      name: "Ikan Bakar / Goreng Balado",
      type: "lauk_protein",
      protein: 22,
      calorie: 280,
      iron: 1.5,
      vitC: 4,
      tag: "Seafood",
    },
    {
      name: "Telur Balado / Dadar Padang",
      type: "lauk_protein",
      protein: 14,
      calorie: 210,
      iron: 2.0,
      vitC: 2,
      tag: "Lauk",
    },
    {
      name: "Tahu & Tempe Bacem / Goreng",
      type: "lauk_protein",
      protein: 12,
      calorie: 180,
      iron: 2.8,
      vitC: 1,
      tag: "Nabati",
    },
    {
      name: "Sayur Sop Ayam Komplit",
      type: "sayur",
      protein: 8,
      calorie: 130,
      iron: 1.5,
      vitC: 25,
      tag: "Sayur",
    },
    {
      name: "Sayur Asem Jakarta",
      type: "sayur",
      protein: 3,
      calorie: 85,
      iron: 1.2,
      vitC: 20,
      tag: "Sayur",
    },
    {
      name: "Tumis Kangkung / Capcay",
      type: "sayur",
      protein: 4,
      calorie: 95,
      iron: 2.2,
      vitC: 30,
      tag: "Sayur",
    },
    {
      name: "Potongan Buah Segar (Semangka/Melon/Pepaya)",
      type: "snack",
      protein: 2,
      calorie: 110,
      iron: 0.8,
      vitC: 45,
      tag: "Buah",
    },
    {
      name: "Roti & Pastry Bakery",
      type: "snack",
      protein: 6,
      calorie: 260,
      iron: 1.0,
      vitC: 0,
      tag: "Snack",
    },
    {
      name: "Susu Kotak UHT & Minuman Nutrisi",
      type: "minuman",
      protein: 8,
      calorie: 150,
      iron: 1.0,
      vitC: 10,
      tag: "Minuman",
    },
  ];

  const QUICK_PRESETS = [
    {
      label: "🍱 Nasi + Ayam/Daging",
      sub: "~24g protein · 550 kcal",
      name: "Nasi Box Ayam / Daging Komplit",
      type: "makanan_berat",
      protein: "24",
      calorie: "550",
      iron: "2.5",
      vitC: "15",
    },
    {
      label: "🍳 Nasi + Telur/Tahu Tempe",
      sub: "~14g protein · 400 kcal",
      name: "Nasi Box Telur & Tahu Tempe",
      type: "makanan_berat",
      protein: "14",
      calorie: "400",
      iron: "2.2",
      vitC: "8",
    },
    {
      label: "🥗 Sayur / Sup / Capcay",
      sub: "~5g protein · 120 kcal",
      name: "Menu Sayuran & Sup Sehat",
      type: "sayur",
      protein: "5",
      calorie: "120",
      iron: "1.8",
      vitC: "28",
    },
    {
      label: "🍞 Roti / Snack / Pastry",
      sub: "~6g protein · 250 kcal",
      name: "Roti, Kue & Camilan",
      type: "snack",
      protein: "6",
      calorie: "250",
      iron: "1.0",
      vitC: "2",
    },
    {
      label: "🍉 Buah-buahan Segar",
      sub: "~2g protein · 100 kcal",
      name: "Potongan Buah Segar",
      type: "snack",
      protein: "2",
      calorie: "100",
      iron: "0.8",
      vitC: "45",
    },
    {
      label: "🥛 Susu / Minuman Nutrisi",
      sub: "~8g protein · 150 kcal",
      name: "Susu & Minuman Bernutrisi",
      type: "minuman",
      protein: "8",
      calorie: "150",
      iron: "1.0",
      vitC: "10",
    },
  ];

  const estimateNutritionFromName = (nameStr: string) => {
    if (!nameStr || nameStr.trim().length === 0) return null;
    const name = nameStr.toLowerCase();
    let prot = 8;
    let cal = 200;
    let iron = 1.2;
    let vitC = 5;
    let detectedType = "makanan_berat";

    if (
      name.includes("ayam") ||
      name.includes("chicken") ||
      name.includes("bebek")
    ) {
      prot += 16;
      cal += 180;
      iron += 0.8;
      detectedType = "lauk_protein";
    }
    if (
      name.includes("nasi") ||
      name.includes("rice") ||
      name.includes("mie") ||
      name.includes("bihun") ||
      name.includes("pasta")
    ) {
      prot += 4;
      cal += 220;
      detectedType = "makanan_berat";
    }
    if (
      name.includes("sapi") ||
      name.includes("beef") ||
      name.includes("rendang") ||
      name.includes("daging")
    ) {
      prot += 22;
      cal += 240;
      iron += 2.5;
      detectedType = "lauk_protein";
    }
    if (
      name.includes("ikan") ||
      name.includes("fish") ||
      name.includes("udang") ||
      name.includes("seafood")
    ) {
      prot += 19;
      cal += 130;
      iron += 1.0;
      detectedType = "lauk_protein";
    }
    if (
      name.includes("telur") ||
      name.includes("egg") ||
      name.includes("dadar") ||
      name.includes("ceplok")
    ) {
      prot += 12;
      cal += 150;
      iron += 1.4;
      detectedType = "lauk_protein";
    }
    if (name.includes("tempe") || name.includes("tahu")) {
      prot += 10;
      cal += 120;
      iron += 1.8;
      detectedType = "lauk_protein";
    }
    if (
      name.includes("sayur") ||
      name.includes("sop") ||
      name.includes("capcay") ||
      name.includes("kangkung") ||
      name.includes("salad")
    ) {
      prot += 3;
      cal = Math.max(70, cal - 60);
      vitC += 25;
      iron += 1.2;
      detectedType = "sayur";
    }
    if (
      name.includes("buah") ||
      name.includes("fruit") ||
      name.includes("jeruk") ||
      name.includes("pisang") ||
      name.includes("melon") ||
      name.includes("pepaya")
    ) {
      prot = Math.max(1, prot - 6);
      cal = 110;
      vitC += 40;
      detectedType = "snack";
    }
    if (
      name.includes("roti") ||
      name.includes("kue") ||
      name.includes("cake") ||
      name.includes("snack") ||
      name.includes("pastry")
    ) {
      prot = Math.max(4, prot - 3);
      cal += 160;
      detectedType = "snack";
    }
    if (
      name.includes("susu") ||
      name.includes("milk") ||
      name.includes("jus")
    ) {
      prot += 8;
      cal += 120;
      vitC += 8;
      detectedType = "minuman";
    }

    return {
      protein: String(Math.round(prot)),
      calorie: String(Math.round(cal)),
      iron: String(iron.toFixed(1)),
      vitC: String(Math.round(vitC)),
      foodType: detectedType,
    };
  };

  const handleAutoEstimate = () => {
    if (!form.food_name) {
      toast.error("Masukkan nama makanan terlebih dahulu");
      return;
    }

    const est = estimateNutritionFromName(form.food_name);
    if (est) {
      onSetForm({
        ...form,
        food_type: est.foodType,
        protein_per_portion: est.protein,
        calorie_per_portion: est.calorie,
        iron_mg: est.iron,
        vitamin_c_mg: est.vitC,
      });
      toast.success(
        `✨ Estimasi AI: ${est.protein}g protein, ${est.calorie} kkal per porsi!`,
      );
    }
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
                onClick={() => {
                  if (form.food_name) {
                    const est = estimateNutritionFromName(form.food_name);
                    if (
                      est &&
                      (!form.protein_per_portion ||
                        form.protein_per_portion === "0" ||
                        !form.calorie_per_portion ||
                        form.calorie_per_portion === "0")
                    ) {
                      onSetForm({
                        ...form,
                        food_type: est.foodType,
                        protein_per_portion: est.protein,
                        calorie_per_portion: est.calorie,
                        iron_mg: est.iron,
                        vitamin_c_mg: est.vitC,
                      });
                      toast.success(
                        `✨ Estimasi AI otomatis terisi untuk "${form.food_name}"!`,
                      );
                    }
                  }
                  onSetStep(2);
                }}
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
                  Nutritional Breakdown (Per Porsi)
                </span>
                <button
                  type="button"
                  onClick={handleAutoEstimate}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-all"
                >
                  <Sparkles size={13} /> Hitung Otomatis
                </button>
              </div>

              {/* Quick Macro Presets */}
              <div className="space-y-1.5 pb-1">
                <p className="text-[11px] font-semibold text-slate-500">
                  Pilih Preset Menu Siap Pakai (1-Klik):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSetForm({
                          ...form,
                          food_type: preset.type,
                          protein_per_portion: preset.protein,
                          calorie_per_portion: preset.calorie,
                          iron_mg: preset.iron,
                          vitamin_c_mg: preset.vitC,
                        });
                        toast.success(`Preset diterapkan: ${preset.label}`);
                      }}
                      className="text-left p-2.5 bg-slate-50 hover:bg-orange-50/60 hover:border-primary-orange/40 border border-slate-200/80 rounded-xl transition-all shadow-2xs group"
                    >
                      <p className="text-xs font-bold text-slate-800 group-hover:text-primary-orange truncate">
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {preset.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 24"
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
                    Kalori (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 500"
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
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                <p className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Makanan:</span>
                  <span className="font-bold text-brand-dark">
                    {form.food_name}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Jumlah:</span>
                  <span className="font-bold text-brand-dark">
                    {form.portion_count} Porsi
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">
                    Total Nutrisi:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {(
                      Number(form.protein_per_portion || 0) *
                      Number(form.portion_count || 1)
                    ).toLocaleString()}
                    g Protein ·{" "}
                    {(
                      Number(form.calorie_per_portion || 0) *
                      Number(form.portion_count || 1)
                    ).toLocaleString()}{" "}
                    kkal
                  </span>
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-slate-600">
                  <Sparkles size={13} className="text-primary-orange" />
                  <span>
                    Sistem TOPSIS akan memprioritaskan penerima berjarak
                    terdekat & kebutuhan gizi tertinggi.
                  </span>
                </div>
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

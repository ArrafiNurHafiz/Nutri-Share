import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Upload } from "lucide-react";

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

  return (
    <div
      id="donation-form"
      className="bg-white rounded-2xl border border-[var(--border-primary)] p-5 shadow-sm"
    >
      <button
        onClick={onToggleCatalog}
        className="w-full flex items-center justify-between mb-1"
      >
        <span className="text-sm font-bold text-brand-dark flex items-center gap-2">
          <Plus size={18} className="text-brand-medium" /> New Donation
        </span>
        <motion.span animate={{ rotate: showCatalog ? 45 : 0 }}>
          <Plus size={20} className="text-brand-medium" />
        </motion.span>
      </button>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">
        Publish your food surplus
      </p>

      {showCatalog && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <input
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[var(--border-primary)] p-2 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all text-xs mb-3"
          />
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto mb-3">
            {FOOD_CATALOG.filter((f) =>
              f.name.toLowerCase().includes(search.toLowerCase()),
            ).map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectCatalog(item)}
                className="text-left p-2.5 rounded-xl border border-[var(--border-primary)] hover:border-primary-orange/40 hover:bg-primary-orange-bg transition-all text-xs"
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

      <form onSubmit={onSubmit} className="flex flex-col gap-3 text-sm">
        {showCatalog && (
          <div className="flex gap-1.5 mb-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${formStep >= s ? "bg-brand-medium" : "bg-[var(--bg-tertiary)]"}`}
              />
            ))}
          </div>
        )}

        {formStep === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase">
              Food Info
            </p>
            <div>
              <label className="text-xs font-bold text-brand-dark mb-1 block">
                Food Name
              </label>
              <input
                placeholder="e.g. Boxed Rice"
                value={form.food_name}
                onChange={(e) =>
                  onSetForm({ ...form, food_name: e.target.value })
                }
                className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-brand-dark mb-1 block">
                  Portions
                </label>
                <input
                  type="number"
                  placeholder="Portions"
                  value={form.portion_count}
                  onChange={(e) =>
                    onSetForm({ ...form, portion_count: e.target.value })
                  }
                  className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all"
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
                  className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-brand-dark mb-1 block">
                Food Photo{" "}
                <span className="font-normal text-[var(--text-tertiary)]">
                  optional
                </span>
              </label>
              <label className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl cursor-pointer hover:bg-[var(--bg-secondary)] transition-all text-xs font-medium">
                <Upload size={14} />{" "}
                {uploading ? "Uploading..." : "Choose Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    /* upload logic */
                  }}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => onSetStep(2)}
              disabled={!form.food_name || !form.portion_count}
              className="w-full bg-primary-orange text-white py-3 rounded-xl font-bold hover:bg-primary-orange-dark transition-all disabled:opacity-40 text-sm"
            >
              Next
            </button>
          </motion.div>
        )}

        {formStep === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase">
              Nutrition
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-brand-dark mb-1 block">
                  Protein/portion (g)
                </label>
                <input
                  type="number"
                  placeholder="Protein"
                  value={form.protein_per_portion}
                  onChange={(e) =>
                    onSetForm({ ...form, protein_per_portion: e.target.value })
                  }
                  className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-dark mb-1 block">
                  Calories/portion
                </label>
                <input
                  type="number"
                  placeholder="Calories"
                  value={form.calorie_per_portion}
                  onChange={(e) =>
                    onSetForm({ ...form, calorie_per_portion: e.target.value })
                  }
                  className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetStep(1)}
                className="flex-1 border border-[var(--border-primary)] py-3 rounded-xl font-bold text-sm hover:bg-[var(--bg-tertiary)] transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => onSetStep(3)}
                className="flex-1 bg-primary-orange text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-orange-dark transition-all"
              >
                Next
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
            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase">
              Confirm
            </p>
            <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 space-y-2 text-xs">
              <p>
                <span className="font-bold">Food:</span> {form.food_name}
              </p>
              <p>
                <span className="font-bold">Portions:</span>{" "}
                {form.portion_count}
              </p>
              <p>
                <span className="font-bold">Protein:</span>{" "}
                {form.protein_per_portion}g |{" "}
                <span className="font-bold">Calories:</span>{" "}
                {form.calorie_per_portion}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetStep(2)}
                className="flex-1 border border-[var(--border-primary)] py-3 rounded-xl font-bold text-sm hover:bg-[var(--bg-tertiary)] transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-orange text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary-orange-dark transition-all"
              >
                Publish
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}

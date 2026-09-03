import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Upload, Book } from "lucide-react";

const FOOD_CATALOG = [
  {
    name: "Boxed Rice",
    type: "makanan_berat",
    protein: 8,
    calorie: 500,
    iron: 1.5,
    vitamin_c: 0,
  },
  {
    name: "Yellow Rice",
    type: "makanan_berat",
    protein: 7,
    calorie: 480,
    iron: 1.2,
    vitamin_c: 0,
  },
  {
    name: "Fried Chicken",
    type: "lauk_protein",
    protein: 25,
    calorie: 350,
    iron: 2.0,
    vitamin_c: 0,
  },
  {
    name: "Boiled Egg",
    type: "lauk_protein",
    protein: 6,
    calorie: 70,
    iron: 0.8,
    vitamin_c: 0,
  },
  {
    name: "Vegetable Soup",
    type: "sayur",
    protein: 2,
    calorie: 60,
    iron: 0.5,
    vitamin_c: 5,
  },
  {
    name: "Stir-fry Veggies",
    type: "sayur",
    protein: 3,
    calorie: 80,
    iron: 1.0,
    vitamin_c: 8,
  },
  {
    name: "Cut Fruit",
    type: "snack",
    protein: 1,
    calorie: 100,
    iron: 0.3,
    vitamin_c: 15,
  },
  {
    name: "Filled Bread",
    type: "snack",
    protein: 5,
    calorie: 200,
    iron: 1.0,
    vitamin_c: 0,
  },
  {
    name: "Mineral Water",
    type: "minuman",
    protein: 0,
    calorie: 0,
    iron: 0,
    vitamin_c: 0,
  },
  {
    name: "Boxed Milk",
    type: "minuman",
    protein: 7,
    calorie: 150,
    iron: 0.5,
    vitamin_c: 2,
  },
];

interface Props {
  showForm: boolean;
  onToggle: () => void;
  onSelectCatalog: (item: any) => void;
}

export function FoodCatalog({ showForm, onToggle, onSelectCatalog }: Props) {
  const [search, setSearch] = useState("");

  const filtered = FOOD_CATALOG.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-all mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-orange-bg rounded-xl">
            <Plus size={20} className="text-primary-orange" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-brand-dark">
              Quick Catalog
            </span>
            <p className="text-xs text-[var(--text-tertiary)]">
              Select food type to start a donation
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: showForm ? 45 : 0 }}>
          <Plus size={20} className="text-brand-medium" />
        </motion.div>
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-[var(--border-primary)] p-5 shadow-sm space-y-3">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Select Item
              </p>
              <input
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-[var(--border-primary)] p-2.5 rounded-xl bg-[var(--bg-tertiary)] focus:bg-white focus:ring-2 focus:ring-brand-medium/30 outline-none transition-all text-sm"
              />
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {filtered.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSelectCatalog(item)}
                    className="text-left p-3 rounded-xl border border-[var(--border-primary)] hover:border-primary-orange/40 hover:bg-primary-orange-bg transition-all"
                  >
                    <p className="text-xs font-bold text-brand-dark truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {item.protein}g protein &middot; {item.calorie}cal
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

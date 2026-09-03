import { motion } from "motion/react";
import {
  ArrowRight,
  Apple,
  Egg,
  Beef,
  Croissant,
  Coffee,
  Soup,
  Milk,
  Cookie,
} from "lucide-react";

interface Props {
  onSelectCategory: (foodType: string, label: string) => void;
  onAddDonation: () => void;
}

const CATEGORIES = [
  {
    icon: Apple,
    label: "Groceries",
    type: "makanan_berat",
    desc: "Rice, noodles, staples",
    color: "text-brand-medium",
  },
  {
    icon: Egg,
    label: "Perishables",
    type: "lauk_protein",
    desc: "Eggs, tofu, fresh items",
    color: "text-accent",
  },
  {
    icon: Beef,
    label: "Protein",
    type: "lauk_protein",
    desc: "Chicken, meat, fish",
    color: "text-brand-accent",
  },
  {
    icon: Croissant,
    label: "Bakery",
    type: "snack",
    desc: "Bread, cakes, pastries",
    color: "text-accent-light",
  },
  {
    icon: Coffee,
    label: "Beverages",
    type: "minuman",
    desc: "Water, juice, milk",
    color: "text-brand-medium",
  },
  {
    icon: Soup,
    label: "Soups & Veggies",
    type: "sayur",
    desc: "Vegetables, soup",
    color: "text-accent",
  },
  {
    icon: Cookie,
    label: "Snacks",
    type: "snack",
    desc: "Packaged snacks",
    color: "text-brand-accent",
  },
  {
    icon: Milk,
    label: "Dairy",
    type: "makanan_berat",
    desc: "Milk, yogurt, cheese",
    color: "text-brand-medium",
  },
];

export function QuickCatalog({ onSelectCategory, onAddDonation }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-brand-dark">Quick Catalog</h4>
        <span className="text-xs text-primary-orange font-semibold bg-primary-orange-bg px-2 py-1 rounded-lg">
          8 types
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Select item type to start a fast donation.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={() => onSelectCategory(item.type, item.label)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-white hover:scale-[1.02] transition-all border border-transparent hover:border-primary-orange/30 group"
            >
              <Icon
                size={24}
                className={`${item.color} mb-1 group-hover:scale-110 transition-transform`}
              />
              <span className="text-[10px] uppercase font-bold text-brand-dark">
                {item.label}
              </span>
              <span className="text-[8px] text-[var(--text-tertiary)] mt-0.5">
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
      <button
        onClick={onAddDonation}
        className="w-full mt-4 text-center text-brand-medium font-bold text-sm flex items-center justify-center gap-1 hover:underline"
      >
        Browse full catalog <ArrowRight size={14} />
      </button>
    </div>
  );
}

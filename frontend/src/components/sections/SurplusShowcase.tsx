import { useState } from "react";
import { Clock, CheckCircle2, ArrowUpRight, ShieldCheck, Package } from "lucide-react";
import { Link } from "react-router-dom";

interface FoodItem {
  id: string;
  batchCode: string;
  title: string;
  category: "all" | "prepared" | "fresh" | "bakery";
  categoryLabel: string;
  donorName: string;
  location: string;
  portions: number;
  expiryHours: number;
  image: string;
  nutrients: {
    calories: string;
    protein: string;
    specs: string[];
  };
  priorityRecipient: string;
  ciScore: string;
}

const SAMPLE_ITEMS: FoodItem[] = [
  {
    id: "item-1",
    batchCode: "BATCH-8901",
    title: "Liwet Rice & Roasted Chicken Meal",
    category: "prepared",
    categoryLabel: "Prepared Meals",
    donorName: "Hotel Merapi Merbabu",
    location: "Depok, Sleman",
    portions: 35,
    expiryHours: 3.5,
    image: "/images/donor_kitchen.jpg",
    nutrients: {
      calories: "450 kcal",
      protein: "24g protein",
      specs: ["Sealed Packaging", "Temperature Controlled", "HACCP Certified"],
    },
    priorityRecipient: "Al-Furqan Orphanage",
    ciScore: "0.942",
  },
  {
    id: "item-2",
    batchCode: "BATCH-8902",
    title: "Fresh Green Vegetables & Local Fruits",
    category: "fresh",
    categoryLabel: "Fresh Produce",
    donorName: "Dapur Nusantara Resto",
    location: "Bantul, DIY",
    portions: 20,
    expiryHours: 8.0,
    image: "/images/vegetables_fresh.jpg",
    nutrients: {
      calories: "120 kcal",
      protein: "6g fiber",
      specs: ["Grade-A Fresh", "Rich in Vitamin C", "Residue Free"],
    },
    priorityRecipient: "Kasih Bunda Nursing Home",
    ciScore: "0.885",
  },
  {
    id: "item-3",
    batchCode: "BATCH-8903",
    title: "Nutritious Rice Box & Tempeh Bacem",
    category: "prepared",
    categoryLabel: "Prepared Meals",
    donorName: "Sehat Kita Catering",
    location: "Yogyakarta City",
    portions: 45,
    expiryHours: 4.0,
    image: "/images/food_pack.jpg",
    nutrients: {
      calories: "380 kcal",
      protein: "18g protein",
      specs: ["Cooked <2h", "Low Sodium", "Eco Package"],
    },
    priorityRecipient: "Harapan Bangsa Shelter",
    ciScore: "0.912",
  },
  {
    id: "item-4",
    batchCode: "BATCH-8904",
    title: "Whole Wheat Bread & Assorted Pastries",
    category: "bakery",
    categoryLabel: "Bakery & Bread",
    donorName: "Tugu Jogja Cafe",
    location: "Kraton, Yogyakarta",
    portions: 25,
    expiryHours: 12.0,
    image: "/images/fresh-food.webp",
    nutrients: {
      calories: "280 kcal",
      protein: "8g fiber",
      specs: ["Whole Grain", "No Preservatives", "Hygienic Sealed"],
    },
    priorityRecipient: "Muhammadiyah Orphanage",
    ciScore: "0.864",
  },
];

export function SurplusShowcase() {
  const [activeCategory, setActiveCategory] = useState<"all" | "prepared" | "fresh" | "bakery">("all");

  const filteredItems = activeCategory === "all"
    ? SAMPLE_ITEMS
    : SAMPLE_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="catalog" className="relative py-20 sm:py-28 bg-[#f8fafc] text-slate-900 border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Package size={13} className="text-emerald-700" />
              <span>Live Food Inventory</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-950 tracking-tight">
              Verified Surplus Food Catalog
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Organoleptic sensory validation, nutrition verification, and expiry tracking prior to TOPSIS allocation.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-emerald-100 shadow-xs">
            {[
              { id: "all", label: "All Batches" },
              { id: "prepared", label: "Prepared Meals" },
              { id: "fresh", label: "Fresh Produce" },
              { id: "bakery", label: "Bakery & Bread" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-emerald-900 hover:bg-emerald-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Cards Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-emerald-100/90 hover:border-emerald-300 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md group"
            >
              <div>
                {/* Photo with Overlay Badge */}
                <div className="relative h-48 w-full bg-emerald-50 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-emerald-900 text-[11px] font-bold border border-emerald-200/60 shadow-xs">
                    {item.categoryLabel}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md text-white text-[11px] font-semibold">
                    {item.portions} Portions
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 block truncate">
                      {item.donorName} &bull; {item.location}
                    </span>
                    <h3 className="font-heading font-bold text-base text-slate-900 leading-snug mt-1 line-clamp-1">
                      {item.title}
                    </h3>
                  </div>

                  {/* Nutrients Pills */}
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{item.nutrients.calories}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold">{item.nutrients.protein}</span>
                  </div>

                  {/* Expiry Hours */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <Clock size={13} />
                      Approx. {item.expiryHours}h Remaining
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Recipient Allocation Footer */}
              <div className="px-5 py-3.5 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider">TOPSIS Priority Target</span>
                  <strong className="text-emerald-950 block truncate font-semibold">
                    {item.priorityRecipient}
                  </strong>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 font-mono">
                  Ci {item.ciScore}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                3-Tier Food Safety Verification (BPOM &amp; HACCP Compliant)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every batch undergoes visual inspection, cold-chain temperature monitoring, and digital handover logs.
              </p>
            </div>
          </div>

          <Link
            to="/register/donor"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>Donate Surplus Batch</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}

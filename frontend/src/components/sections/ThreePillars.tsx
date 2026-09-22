import { motion } from "motion/react";
import { UtensilsCrossed, Users, Truck, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GlossyLeafDecor } from "./EcoVisuals";

const PILLARS = [
  {
    icon: UtensilsCrossed,
    title: "Donor (HoReCa)",
    desc: "Hotels, restaurants, and cafeterias can donate surplus food. Turn excess into opportunity for a healthier society.",
    img: "/images/donor_kitchen.jpg",
    fallbackImg: "/images/fresh-food.webp",
    ctaLabel: "Join as Donor",
    ctaLink: "/register/donor",
    items: [
      "Provide surplus with nutrition info",
      "Real-time waste disposal alerts",
      "Builds a positive brand image",
    ],
  },
  {
    icon: Users,
    title: "Recipient (Social Institution)",
    desc: "Orphanages, schools, and social institutions can access nutritious food based on verified needs.",
    img: "/images/recipient_kids.jpg",
    fallbackImg: "/images/charity-kids.webp",
    ctaLabel: "Register as Recipient",
    ctaLink: "/register/recipient",
    items: [
      "Access free nutritious food",
      "Priority based on health data",
      "Monitor distribution history",
    ],
  },
  {
    icon: Truck,
    title: "Courier & Distribution",
    desc: "Logistics partners and volunteers help ensure food reaches recipients safely and on time.",
    img: "/images/delivery.webp",
    fallbackImg: "/images/delivery.webp",
    ctaLabel: "Join as Partner",
    ctaLink: "/register/donor",
    items: [
      "Automated delivery scheduling",
      "Real-time live tracking",
      "Digital handover confirmation",
    ],
  },
];

export function ThreePillars() {
  return (
    <section id="tentang" className="relative py-24 bg-[#FFFFFF] overflow-hidden">
      {/* Variant 4 (Single Gloss Blade) on Right */}
      <GlossyLeafDecor
        variant="single-gloss"
        className="hidden md:block absolute top-1/2 -right-8 w-32 h-32 opacity-90 -translate-y-1/2"
      />
      {/* Variant 5 (Fanned Trio) on Bottom Left */}
      <GlossyLeafDecor
        variant="fanned-trio"
        className="hidden md:block absolute -bottom-8 -left-8 w-32 h-32 opacity-90 rotate-45"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-bold uppercase tracking-[0.2em] text-[11px] px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              ECOSYSTEM
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            Three Pillars, One Greater Impact
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-lg mx-auto"
          >
            Collaboration between donors, social institutions, and logistics partners to build a more nourished and sustainable community.
          </motion.p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Visual Image Header */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={p.img}
                    alt={p.title}
                    width={400}
                    height={240}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = p.fallbackImg;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Circular Icon Floating Badge with emerald green background & white ring */}
                  <div className="absolute -bottom-4 left-5">
                    <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md border-2 border-white">
                      <p.icon size={17} strokeWidth={2.4} />
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 pt-7 space-y-3">
                  <h3 className="text-sm font-bold text-[#0F172A] font-heading">
                    {p.title}
                  </h3>

                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    {p.desc}
                  </p>

                  <ul className="space-y-2 pt-1">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-[11px] text-[#334155] font-medium">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Outlined CTA Button */}
              <div className="p-5 pt-0">
                <Link
                  to={p.ctaLink}
                  className="w-full py-2 px-3 rounded-full bg-[#ECFDF5] hover:bg-[#10B981] text-[#065F46] hover:text-white border border-[#A7F3D0] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200"
                >
                  <span>{p.ctaLabel}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

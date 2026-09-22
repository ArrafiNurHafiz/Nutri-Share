import { motion } from "motion/react";
import { Building2, Heart, Truck, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LeafIllustration } from "./EcoVisuals";

const PILLARS = [
  {
    icon: Building2,
    title: "Donor (HoReCa)",
    desc: "Hotels, restaurants, and cafeterias can donate surplus food. Turn excess into opportunity for a healthier society.",
    img: "/images/fresh-food.webp",
    ctaLabel: "Join as Donor",
    ctaLink: "/register/donor",
    items: [
      "Provide surplus with nutrition info",
      "Real-time waste disposal alerts",
      "Builds a positive brand image",
    ],
  },
  {
    icon: Heart,
    title: "Recipient (Social Institution)",
    desc: "Orphanages, schools, and social institutions can access nutritious food based on verified needs.",
    img: "/images/charity-kids.webp",
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
    <section id="tentang" className="relative py-28 bg-[#FFFFFF] overflow-hidden">
      {/* Decorative Botanical Leaf Accents matching reference */}
      <LeafIllustration className="absolute top-1/2 -right-8 w-56 h-56 opacity-85 -translate-y-1/2" />
      <LeafIllustration className="absolute -bottom-10 -left-10 w-56 h-56 opacity-85 rotate-90" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-extrabold uppercase tracking-[0.25em] text-xs px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              ECOSYSTEM
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            Three Pillars, One Greater Impact
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl mx-auto"
          >
            Collaboration between donors, social institutions, and logistics partners to build a more nourished and sustainable community.
          </motion.p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Visual Image Header */}
                <div className="relative h-56 w-full overflow-hidden bg-[#E2E8F0]">
                  <img
                    src={p.img}
                    alt={p.title}
                    width={600}
                    height={360}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Circular Icon Floating Badge */}
                  <div className="absolute -bottom-5 left-6">
                    <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md border-4 border-white">
                      <p.icon size={20} strokeWidth={2.4} />
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-7 pt-9 space-y-4">
                  <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    {p.desc}
                  </p>

                  <ul className="space-y-2.5 pt-1">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs text-[#334155] font-medium">
                        <span className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} strokeWidth={3.5} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Outlined CTA Button matching reference */}
              <div className="p-6 pt-0">
                <Link
                  to={p.ctaLink}
                  className="w-full py-2.5 px-4 rounded-full bg-[#ECFDF5] hover:bg-[#10B981] text-[#065F46] hover:text-white border border-[#A7F3D0] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-200"
                >
                  <span>{p.ctaLabel}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

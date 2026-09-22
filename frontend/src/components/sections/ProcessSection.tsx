import { motion } from "motion/react";
import { FileText, Cpu, CheckCircle2, Truck } from "lucide-react";
import { LeafIllustration, WaveConnector } from "./EcoVisuals";

const STEPS = [
  {
    num: "01",
    title: "Publication",
    icon: FileText,
    desc: "Donors upload surplus food with nutrition information. The system records food type, quantity, and expiration date.",
  },
  {
    num: "02",
    title: "TOPSIS Algorithm",
    icon: Cpu,
    desc: "System automatically calculates weights from nutrition density, urgency, feasibility, distance, and aid history to determine recipient ranking.",
  },
  {
    num: "03",
    title: "Priority Claim",
    icon: CheckCircle2,
    desc: "The top-ranked recipients get priority to claim. The system ensures fair distribution based on need, not queue order.",
  },
  {
    num: "04",
    title: "Live Distribution",
    icon: Truck,
    desc: "Courier, volunteers, or donors deliver the food with real-time tracking. Donors and recipients can monitor the journey.",
  },
];

export function ProcessSection() {
  return (
    <section id="cara-kerja" className="relative py-28 bg-[#F4FAF5] overflow-hidden">
      {/* Decorative Botanical Leaf Accents matching reference */}
      <LeafIllustration className="absolute -top-6 -left-6 w-48 h-48 opacity-80" />
      <LeafIllustration className="absolute -bottom-8 -right-8 w-56 h-56 opacity-80 rotate-180" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-extrabold uppercase tracking-[0.25em] text-xs px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              PROCESS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            From Surplus to Nutrition
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-lg mx-auto"
          >
            A transparent and data-driven process to make sure every nutritious food reaches the right people.
          </motion.p>

          {/* Floating Handwritten Style Badge: Good Food Brighter Lives 💚 */}
          <div className="hidden lg:block absolute -right-32 top-2 transform rotate-6 pointer-events-none">
            <span className="font-heading font-extrabold text-sm text-[#059669] tracking-wide bg-white/80 px-4 py-1.5 rounded-full border border-[#A7F3D0] shadow-sm inline-flex items-center gap-1">
              Good Food Brighter Lives <span className="text-[#10B981]">💚</span>
            </span>
          </div>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 relative">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="bg-white rounded-3xl p-7 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div>
                {/* Step Circular Number Header Badge (Dark Teal Circle) */}
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-full bg-[#0F472A] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    {step.num}
                  </span>

                  <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
                    <step.icon size={22} strokeWidth={2.2} />
                  </div>
                </div>

                {/* Step Title & Description */}
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-2.5 font-heading">
                  {step.title}
                </h3>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

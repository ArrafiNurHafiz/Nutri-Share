import { motion } from "motion/react";
import { FileText, Cpu, Users, Truck } from "lucide-react";
import { GlossyLeafDecor, CurvedDoodleArrow, StepConnector } from "./EcoVisuals";

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
    icon: Users,
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
    <section id="cara-kerja" className="relative pt-32 pb-24 bg-[#F8FAF8] overflow-hidden">
      {/* Variant 2 (Tropical Duo) on Left */}
      <GlossyLeafDecor
        variant="tropical-duo"
        className="hidden md:block absolute top-12 -left-6 z-10 w-28 h-28 opacity-90"
      />
      {/* Variant 3 (Sprig with Stem) on Right */}
      <GlossyLeafDecor
        variant="sprig-stem"
        className="hidden md:block absolute top-48 -right-6 z-10 w-32 h-32 opacity-90 rotate-180"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2 relative">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#059669] font-bold uppercase tracking-[0.2em] text-[11px] px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              PROCESS
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading"
          >
            From Surplus to Nutrition
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-lg mx-auto"
          >
            A transparent and data-driven process to make sure every nutritious food reaches the right people.
          </motion.p>

          {/* Floating Handwritten Style Badge: Good Food Brighter Lives 💚 */}
          <div className="hidden lg:flex flex-col items-center absolute -right-20 top-2 transform rotate-6 pointer-events-none">
            <span className="font-handwriting font-bold text-2xl text-[#059669] tracking-wide inline-flex items-center gap-1 drop-shadow-sm leading-none">
              Good Food<br />Brighter Lives <span className="text-[#10B981]">💚</span>
            </span>
            <CurvedDoodleArrow className="mt-1 -mr-4" />
          </div>
        </div>

        {/* 4 Connected Cards Grid */}
        <div className="relative">
          {/* Connecting Curved Dashed Wave Line */}
          <StepConnector />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Step Circular Number Badge (Top Center Green Badge) */}
                  <div className="flex justify-center -mt-10 mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#047857] text-white font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white">
                      {step.num}
                    </span>
                  </div>

                  {/* Icon centered in card */}
                  <div className="w-11 h-11 mx-auto rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] mb-4 group-hover:scale-105 transition-transform">
                    <step.icon size={20} strokeWidth={2.2} />
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="text-sm font-bold text-[#0F172A] mb-2 font-heading text-center">
                    {step.title}
                  </h3>

                  <p className="text-[11px] text-[#64748B] leading-relaxed text-center">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

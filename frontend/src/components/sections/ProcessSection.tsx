import { motion } from "motion/react";

const STEPS = [
  {
    num: "01",
    title: "Publication",
    desc: "Donors upload surplus food with nutritional information. The system records the type, quantity, and expiration date.",
  },
  {
    num: "02",
    title: "TOPSIS Algorithm",
    desc: "Shannon Entropy automatically calculates weights from data. Five criteria (nutrition, urgency, expiration, distance, history) determine recipient ranking.",
  },
  {
    num: "03",
    title: "Priority Claim",
    desc: "The top-ranked recipient gets priority claim. The system ensures fair distribution based on need, not queue order.",
  },
  {
    num: "04",
    title: "Live Distribution",
    desc: "Couriers deliver with live tracking. Donors and recipients monitor the journey in real-time until digital handover.",
  },
];

export function ProcessSection() {
  return (
    <section id="cara-kerja" className="py-24 bg-[#f4fafd] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#10b981] font-bold uppercase tracking-widest text-sm mb-2 block">
            Process
          </span>
          <h2 className="text-4xl font-extrabold text-brand-dark">
            From Surplus to Nutrition
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span
                className="text-6xl font-black text-[#10b981]/15 block mb-4 animate-float"
                style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
              >
                {step.num}
              </span>
              <h3 className="text-xl font-bold text-brand-dark mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

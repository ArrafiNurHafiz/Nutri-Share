import { motion } from "motion/react";
import { Building2, HandHeart, Truck, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const PILLARS = [
  {
    icon: Building2,
    title: "Donor",
    subtitle: "(HoReCa)",
    color: "#10b981",
    img: "fresh-food",
    desc: "Hotels, restaurants, and cafes can donate surplus food that is still fit for consumption directly to verified recipients.",
    items: [
      "Publish surplus with nutrition info",
      "Reduce waste disposal costs",
      "Ratings & public recognition",
    ],
  },
  {
    icon: HandHeart,
    title: "Recipient",
    subtitle: "(Social Institution)",
    color: "#d4893b",
    img: "charity-kids",
    desc: "Orphanages and social institutions access free nutritious food. Priority is determined by algorithm, not queues.",
    items: [
      "Access free nutritious food daily",
      "Priority based on needs data",
      "Monitor daily nutritional intake (RDA)",
    ],
  },
  {
    icon: Truck,
    title: "Courier & Distribution",
    subtitle: "",
    color: "#065f46",
    img: "delivery",
    desc: "Claimed donations are immediately scheduled. Donors and recipients can track courier location live.",
    items: [
      "Automatic delivery scheduling",
      "Real-time live tracking",
      "Digital handover confirmation",
    ],
  },
];

export function ThreePillars() {
  return (
    <section id="tentang" className="py-24 bg-[#f4fafd] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#10b981] font-bold uppercase tracking-widest text-sm mb-2 block">
            Ecosystem
          </span>
          <h2 className="text-4xl font-extrabold text-brand-dark">
            Three Pillars
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#fdfcf7] rounded-2xl overflow-hidden shadow-sm border border-gray-100 btn-hover-effect group"
            >
              <div className="overflow-hidden">
                <img
                  src={`/images/${p.img}.webp`}
                  alt=""
                  loading="lazy"
                  width={768}
                  height={384}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-2">
                  <p.icon size={20} style={{ color: p.color }} />
                  <h3 className="text-xl font-bold" style={{ color: p.color }}>
                    {p.title}{" "}
                    <span className="font-normal text-gray-500">
                      {p.subtitle}
                    </span>
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{p.desc}</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle
                        size={14}
                        className="text-[#10b981] shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

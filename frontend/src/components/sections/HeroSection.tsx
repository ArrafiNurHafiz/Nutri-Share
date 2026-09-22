import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, Utensils } from "lucide-react";
import { motion } from "motion/react";
import { LeafIllustration } from "./EcoVisuals";

/* ─── Smooth Counter Component ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || done) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setDone(true);
            if (target <= 0) {
              setCount(0);
              return;
            }
            const dur = 1400;
            const steps = 40;
            const inc = target / steps;
            let cur = 0;
            const t = setInterval(() => {
              cur += inc;
              if (cur >= target) {
                setCount(target);
                clearInterval(t);
              } else {
                setCount(Math.floor(cur));
              }
            }, dur / steps);
          }
        },
        { threshold: 0.2 },
      );
      obs.observe(node);
      return () => obs.disconnect();
    },
    [target, done],
  );

  return (
    <div
      ref={ref}
      className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#0F172A] font-heading"
    >
      {count.toLocaleString("id-ID")}
      {suffix}
    </div>
  );
}

export function HeroSection({ stats }: { stats: any }) {
  const impactItems = [
    {
      icon: Leaf,
      value: stats?.food_waste_kg ?? 1360,
      suffix: " kg",
      label: "Food Waste Saved",
      iconColor: "text-[#10B981]",
    },
    {
      icon: Users,
      value: stats?.people_helped ?? 520,
      suffix: " Orang",
      label: "Penerima Manfaat Terbantu",
      iconColor: "text-[#10B981]",
    },
    {
      icon: Utensils,
      value: stats?.total_portions ?? 4120,
      suffix: " Porsi",
      label: "Porsi Makanan Tersalurkan",
      iconColor: "text-[#10B981]",
    },
  ];

  return (
    <section className="relative bg-[#061F16] min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-28 lg:pt-36 pb-16">
      {/* Decorative Leaf Branch (Ambient) */}
      <LeafIllustration className="absolute top-16 right-4 w-72 h-72 opacity-15 text-[#34D399]" />
      <LeafIllustration className="absolute bottom-16 left-2 w-64 h-64 opacity-15 text-[#A7F3D0]" />

      {/* Full-width Natural Background Image with Dark Gradient Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/nutrishare_hero.webp"
          alt="Relawan NutriShare mendistribusikan makanan"
          className="w-full h-full object-cover object-right-top lg:object-center opacity-50"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
        />
        {/* Soft dark vignette on the left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#04160F] via-[#061F16]/90 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061F16] via-transparent to-black/40" />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-10 w-full">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          {/* Eyebrow Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30 backdrop-blur-md">
              FOOD DISTRIBUTION PLATFORM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight font-heading"
          >
            Your Surplus Food,
            <br />
            <span className="text-[#10B981]">Their Nutrition</span>
          </motion.h1>

          {/* Subheading / Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed max-w-xl font-normal"
          >
            Connecting HoReCa food surplus with those in need, using the{" "}
            <strong className="text-white font-semibold">
              Hybrid Entropy-TOPSIS
            </strong>{" "}
            algorithm to ensure every donation is precisely targeted.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3.5 pt-2"
          >
            <Link
              to="/register/donor"
              className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Register as Donor</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/register/recipient"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-full font-bold text-xs sm:text-sm transition-all transform hover:-translate-y-0.5"
            >
              Register as Recipient
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Handwritten Slogan on the right: "Less Waste More Hope" */}
      <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-20 transform rotate-6 pointer-events-none">
        <div className="text-right">
          <p className="font-heading font-black text-white text-xl sm:text-2xl tracking-wide drop-shadow-md">
            Less Waste
          </p>
          <p className="font-heading font-extrabold text-[#34D399] text-lg sm:text-xl drop-shadow-md">
            More Hope
          </p>
        </div>
      </div>

      {/* Floating Bottom Impact Statistics Card (3 Columns with Rounded Corners) */}
      <div className="relative z-20 max-w-5xl w-full mx-auto px-4 sm:px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9]"
        >
          {impactItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center text-center ${i > 0 ? "pt-4 md:pt-0 md:pl-6" : ""}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <item.icon className={`h-6 w-6 ${item.iconColor}`} strokeWidth={2.2} />
              </div>
              <Counter target={item.value} suffix={item.suffix} />
              <span className="text-[11px] sm:text-xs font-medium text-[#64748B] mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

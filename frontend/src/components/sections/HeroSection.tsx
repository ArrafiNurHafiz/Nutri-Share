import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, Utensils } from "lucide-react";
import { motion } from "motion/react";
import { GlossyLeafDecor } from "./EcoVisuals";

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
            const dur = 1200;
            const steps = 35;
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
      className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] font-heading"
    >
      {count.toLocaleString("id-ID")}
      {suffix}
    </div>
  );
}

export function HeroSection({ stats }: { stats?: any }) {
  const impactItems = [
    {
      icon: Leaf,
      value: stats?.total_food_saved_kg || 1360,
      suffix: " kg",
      label: "Food Waste Saved",
      iconColor: "text-[#10B981]",
    },
    {
      icon: Users,
      value: stats?.total_beneficiaries || 520,
      suffix: " Orang",
      label: "Penerima Manfaat Terbantu",
      iconColor: "text-[#10B981]",
    },
    {
      icon: Utensils,
      value: stats?.total_portions_distributed || 4120,
      suffix: " Porsi",
      label: "Porsi Makanan Tersalurkan",
      iconColor: "text-[#10B981]",
    },
  ];

  return (
    <section className="relative bg-[#061F16] min-h-[580px] lg:min-h-[640px] flex flex-col justify-between overflow-visible pt-28 sm:pt-32 pb-0">
      {/* Background Hero Image with Left Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/images/nutrishare_hero_new.jpg"
          alt="Relawan NutriShare"
          className="w-full h-full object-cover object-center sm:object-right"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/nutrishare_hero.webp";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04160F] via-[#061F16]/90 to-transparent w-full lg:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061F16] via-transparent to-black/30" />
      </div>

      {/* Floating 3D Leaf Top Right - Hero Cluster Variant */}
      <GlossyLeafDecor variant="hero-cluster" className="hidden lg:block absolute -right-6 top-52 z-20 w-36 h-36" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-8 w-full">
        <div className="max-w-xl lg:max-w-2xl space-y-5">
          {/* Eyebrow Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30 backdrop-blur-md">
              FOOD DISTRIBUTION PLATFORM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.15] tracking-tight font-heading"
          >
            Your Surplus Food,
            <br />
            <span className="text-[#34D399]">Their Nutrition</span>
          </motion.h1>

          {/* Subheading / Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-[13px] text-white/80 leading-relaxed max-w-lg font-normal"
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
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Link
              to="/register/donor"
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Register as Donor</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/register/recipient"
              className="px-5 py-2.5 bg-black/40 hover:bg-black/60 text-white border border-white/30 rounded-full font-bold text-xs transition-all transform hover:-translate-y-0.5 backdrop-blur-xs"
            >
              Register as Recipient
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Handwritten Slogan on the right matching reference */}
      <div className="hidden lg:block absolute right-14 top-[55%] -translate-y-1/2 z-20 transform rotate-[-6deg] pointer-events-none text-right">
        <p className="font-handwriting font-bold text-white text-3xl tracking-wide drop-shadow-md leading-none">
          Less Waste
        </p>
        <p className="font-handwriting font-bold text-[#34D399] text-3xl tracking-wide drop-shadow-md leading-none mt-1">
          More Hope
        </p>
      </div>

      {/* Floating Bottom 3 KPI Metric Card */}
      <div className="relative z-30 max-w-4xl w-full mx-auto px-4 sm:px-6 translate-y-10 sm:translate-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="bg-white rounded-[1.75rem] shadow-xl shadow-emerald-950/10 border border-stone-100 p-6 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100"
        >
          {impactItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center text-center ${i > 0 ? "pt-4 md:pt-0 md:pl-6" : ""}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5">
                <item.icon className={`h-6 w-6 ${item.iconColor}`} strokeWidth={2.2} />
              </div>
              <Counter target={item.value} suffix={item.suffix} />
              <span className="text-xs font-semibold text-gray-500 mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

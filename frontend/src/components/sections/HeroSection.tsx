import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, TrendingUp, Heart } from "lucide-react";
import { motion } from "motion/react";
import { LeafDeco } from "./EcoVisuals";

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
      bgBadge: "bg-[#ECFDF5]",
    },
    {
      icon: Users,
      value: stats?.people_helped ?? 520,
      suffix: " Orang",
      label: "Penerima Manfaat Terbantu",
      iconColor: "text-[#0284C7]",
      bgBadge: "bg-[#F0F9FF]",
    },
    {
      icon: TrendingUp,
      value: stats?.total_portions ?? 4120,
      suffix: " Porsi",
      label: "Porsi Makanan Tersalurkan",
      iconColor: "text-[#2D7A4F]",
      bgBadge: "bg-[#F4FAF5]",
    },
  ];

  return (
    <section className="relative bg-[#0A261A] min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-24 lg:pt-32 pb-16">
      {/* Decorative Leaf Element (Background Ambient) */}
      <LeafDeco className="absolute top-20 right-10 w-64 h-64 opacity-10 text-[#34D399]" />
      <LeafDeco className="absolute bottom-20 left-6 w-48 h-48 opacity-10 text-[#A7F3D0]" />

      {/* Full-width Natural Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/nutrishare_hero.webp"
          alt="Relawan NutriShare mendistribusikan makanan"
          className="w-full h-full object-cover object-center opacity-45"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061B13] via-[#0A261A]/85 to-[#0A261A]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A261A] via-transparent to-black/30" />
      </div>

      {/* Hero Body Content */}
      <div className="relative z-10 max-w-7xl 2xl:max-w-[85vw] w-full mx-auto px-4 sm:px-6 lg:px-8 my-auto py-12">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Food Distribution Platform
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-extrabold text-white leading-[1.12] tracking-tight font-heading"
          >
            Your Surplus Food,
            <br />
            <span className="text-[#34D399] drop-shadow-sm">Their Nutrition</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed max-w-xl font-medium"
          >
            Connecting HoReCa food surplus with those in need, using the{" "}
            <strong className="text-white font-bold underline decoration-[#34D399] decoration-2 underline-offset-4">
              Hybrid Entropy-TOPSIS
            </strong>{" "}
            algorithm to ensure every donation is precisely targeted.
          </motion.p>

          {/* CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              to="/register/donor"
              className="px-7 py-3.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#10B981]/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Register as Donor</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/register/recipient"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-full font-bold text-sm sm:text-base transition-all transform hover:-translate-y-0.5"
            >
              Register as Recipient
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Handwritten Slogan Ornament (Top-Right on Hero) */}
      <div className="hidden lg:block absolute right-12 top-1/3 z-20 transform rotate-6 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl text-right">
          <p className="font-heading font-extrabold text-white text-base tracking-wide">
            Less Waste
          </p>
          <p className="font-heading font-bold text-[#34D399] text-xs">
            More Hope 💚
          </p>
        </div>
      </div>

      {/* Floating Impact Statistics Card Grid */}
      <div className="relative z-20 max-w-5xl 2xl:max-w-[75vw] w-full mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border border-white/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9]"
        >
          {impactItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center text-center ${i > 0 ? "pt-4 md:pt-0 md:pl-6" : ""}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl ${item.bgBadge} flex items-center justify-center mb-3 shadow-xs`}
              >
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <Counter target={item.value} suffix={item.suffix} />
              <span className="text-xs sm:text-sm font-semibold text-[#64748B] mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

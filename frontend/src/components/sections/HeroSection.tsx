import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Users, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

/* ─── Counter ─── */
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
            const dur = 1500,
              steps = 60,
              inc = target / steps;
            let cur = 0;
            const t = setInterval(() => {
              cur += inc;
              if (cur >= target) {
                setCount(target);
                clearInterval(t);
              } else setCount(Math.floor(cur));
            }, dur / steps);
          }
        },
        { threshold: 0.3 },
      );
      obs.observe(node);
      return () => obs.disconnect();
    },
    [target, done],
  );
  return (
    <div
      ref={ref}
      className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#161d1f]"
    >
      {count}
      {suffix}
    </div>
  );
}

export function HeroSection({ stats }: { stats: any }) {
  const impactItems = stats
    ? [
        {
          icon: Leaf,
          value: stats.food_waste_kg ?? 1200,
          suffix: "+ kg",
          label: "Food Waste Saved",
        },
        {
          icon: Users,
          value: stats.people_helped ?? 850,
          suffix: "",
          label: "Children & Elderly Helped",
        },
        {
          icon: TrendingUp,
          value: stats.total_portions ?? 5400,
          suffix: "+",
          label: "Portions Distributed",
        },
      ]
    : [
        { icon: Leaf, value: 1200, suffix: "+ kg", label: "Food Waste Saved" },
        {
          icon: Users,
          value: 850,
          suffix: "",
          label: "Children & Elderly Helped",
        },
        {
          icon: TrendingUp,
          value: 5400,
          suffix: "+",
          label: "Portions Distributed",
        },
      ];

  return (
    <section className="relative bg-[#161d1f] min-h-[100dvh] flex flex-col items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/nutrishare_hero.webp"
          alt=""
          className="w-full h-full object-cover opacity-60"
          loading="eager"
          fetchPriority="high"
          width={512}
          height={286}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#161d1f] via-[#161d1f]/70 to-[#161d1f]/60" />
      </div>

      <div className="relative z-10 w-full flex flex-col justify-center gap-16 md:gap-20 py-24 flex-1">
        {/* Text Area */}
        <div className="max-w-7xl 2xl:max-w-[80vw] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl 2xl:max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-primary-container font-bold uppercase tracking-[0.2em] text-xs 2xl:text-base mb-4 block font-heading">
                Food Distribution Platform
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-extrabold text-white leading-tight mb-6 font-heading"
            >
              Your Surplus Food,
              <br />
              <span className="text-primary-container">Their Nutrition</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg 2xl:text-2xl text-white/70 mb-10 leading-relaxed max-w-xl 2xl:max-w-3xl"
            >
              Connecting HoReCa food surplus with those in need, using the{" "}
              <strong className="text-white">Hybrid Entropy-TOPSIS</strong>{" "}
              algorithm to ensure every donation is precisely targeted.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/register/donor"
                className="bg-primary-container hover:bg-primary text-white px-8 py-3 2xl:px-10 2xl:py-4 rounded-full font-bold font-heading flex items-center gap-2 shadow-orange-lg btn-hover-effect 2xl:text-xl"
              >
                Register as Donor{" "}
                <ArrowRight size={18} className="2xl:w-6 2xl:h-6" />
              </Link>
              <Link
                to="/register/recipient"
                className="border-2 border-white/40 text-white px-8 py-3 2xl:px-10 2xl:py-4 rounded-full font-bold font-heading hover:bg-white/10 btn-hover-effect 2xl:text-xl"
              >
                Register as Recipient
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="w-full max-w-5xl 2xl:max-w-[70vw] mx-auto px-4 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-orange py-8 px-6 md:px-12 2xl:py-12 2xl:px-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border border-primary-container/20"
          >
            {impactItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <item.icon
                  className="h-8 w-8 2xl:h-12 2xl:w-12 text-primary-container mb-2 float"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
                <Counter target={item.value} suffix={item.suffix || ""} />
                <span className="text-xs md:text-sm 2xl:text-lg text-on-surface-variant font-medium mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

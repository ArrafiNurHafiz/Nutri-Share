import { useState, useEffect } from "react";
import { ArrowRight, Leaf, Users, Utensils, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function CounterItem({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!target || target <= 0) {
      setCount(0);
      return;
    }
    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-950 tabular-nums font-mono">
      {count.toLocaleString("en-US")}
      <span className="text-emerald-600 font-semibold text-2xl ml-1">{suffix}</span>
    </span>
  );
}

export function HeroSection({ stats }: { stats?: any }) {
  const metrics = [
    {
      icon: Leaf,
      value: stats?.total_food_saved_kg ?? stats?.food_waste_kg ?? 1360,
      suffix: " kg",
      label: "Food Rescued",
      desc: "Prevented organic food waste from HoReKa sector",
      badge: "+18.4% this month",
    },
    {
      icon: Users,
      value: stats?.total_beneficiaries ?? stats?.people_helped ?? 520,
      suffix: " people",
      label: "Verified Beneficiaries",
      desc: "24 verified orphanages & social shelters",
      badge: "100% targeted",
    },
    {
      icon: Utensils,
      value: stats?.total_portions_distributed ?? stats?.total_portions ?? 4120,
      suffix: " meals",
      label: "Portions Distributed",
      desc: "Optimized through TOPSIS ranking computation",
      badge: "Real-time dispatch",
    },
  ];

  return (
    <section id="impact-metrics" className="relative py-16 sm:py-24 bg-white border-b border-emerald-100 overflow-hidden">
      {/* Subtle green ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-50 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-8 border-b border-emerald-100 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Operational Telemetry &bull; D.I. Yogyakarta</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-emerald-950 tracking-tight leading-tight">
              Measurable Real-Time{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                Social Impact.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Continuous live tracking of surplus food distribution powered by Shannon Entropy and TOPSIS multi-criteria weighting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all shadow-xs"
            >
              <MapPin size={14} className="text-emerald-700" />
              <span>Explore Distribution Map</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 3 Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-3xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/70 transition-all duration-300 flex flex-col justify-between space-y-6 group shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <item.icon size={22} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-emerald-800/80 block uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className="mt-2">
                    <CounterItem target={item.value} suffix={item.suffix} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-600 pt-4 border-t border-emerald-200/60 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

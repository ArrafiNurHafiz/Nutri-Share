import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Leaf,
  Users,
  Utensils,
  Sparkles,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  MapPin,
  ShieldCheck,
  Scale,
  Building2,
  Clock,
  HeartHandshake
} from "lucide-react";
import { motion, useScroll, useTransform, useInView, useSpring } from "motion/react";
import { Link } from "react-router-dom";

export function HeroSection({ stats }: { stats?: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.2 });

  // Parallax effect for decorative elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 15]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -15]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: <Leaf className="w-5 h-5" />,
      secondaryIcon: <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-emerald-400" />,
      title: "Food Rescue Protocol",
      description:
        "Standardized collection workflows ensuring surplus organic food from hotels, restaurants, and catering services is safely recovered before expiration.",
      position: "left",
    },
    {
      icon: <Scale className="w-5 h-5" />,
      secondaryIcon: <CheckCircle className="w-3.5 h-3.5 absolute -top-1 -right-1 text-teal-400" />,
      title: "Entropy-TOPSIS Engine",
      description:
        "Mathematical multi-criteria decision algorithm weighting urgency, nutrition balance, distance, and historical fairness objectively.",
      position: "left",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      secondaryIcon: <Star className="w-3.5 h-3.5 absolute -top-1 -right-1 text-emerald-400" />,
      title: "HACCP Safety Assurance",
      description:
        "Strict 3-layer sensory and temperature validation matching BPOM food hygiene guidelines before distribution to recipients.",
      position: "left",
    },
    {
      icon: <Users className="w-5 h-5" />,
      secondaryIcon: <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-teal-400" />,
      title: "Verified Social Shelters",
      description:
        "Partnered with accredited orphanages, elderly nursing homes, and verified social foundations across Yogyakarta and surrounding regions.",
      position: "right",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      secondaryIcon: <CheckCircle className="w-3.5 h-3.5 absolute -top-1 -right-1 text-emerald-400" />,
      title: "Real-Time Telemetry",
      description:
        "Live dispatch routing and transparent milestone logging providing end-to-end auditability from donor kitchen to recipient table.",
      position: "right",
    },
    {
      icon: <HeartHandshake className="w-5 h-5" />,
      secondaryIcon: <Star className="w-3.5 h-3.5 absolute -top-1 -right-1 text-teal-400" />,
      title: "Zero-Waste Impact",
      description:
        "Measurable reduction in municipal organic waste and greenhouse gas emissions with verified ESG social impact metrics.",
      position: "right",
    },
  ];

  const statCounters = [
    {
      icon: <Leaf className="w-6 h-6" />,
      value: Math.round(stats?.total_food_saved_kg ?? stats?.food_waste_kg ?? 1360),
      label: "Food Rescued",
      suffix: " kg",
    },
    {
      icon: <Users className="w-6 h-6" />,
      value: stats?.total_beneficiaries ?? stats?.people_helped ?? 520,
      label: "Beneficiaries Helped",
      suffix: " people",
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      value: stats?.total_portions_distributed ?? stats?.total_portions ?? 4120,
      label: "Portions Distributed",
      suffix: " meals",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      value: stats?.total_donors ?? 28,
      label: "Partner Donors",
      suffix: "+",
    },
  ];

  return (
    <section
      id="impact-metrics"
      ref={sectionRef}
      className="w-full py-20 sm:py-28 px-4 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50 text-slate-900 overflow-hidden relative border-b border-emerald-100/80"
    >
      {/* Decorative background glow elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-300/10 blur-3xl pointer-events-none"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-300/10 blur-3xl pointer-events-none"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-emerald-400/40 pointer-events-none"
        animate={{
          y: [0, -15, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-teal-400/30 pointer-events-none"
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.9, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="flex flex-col items-center mb-6 text-center" variants={itemVariants}>
          <motion.span
            className="text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            LIVE OPERATIONAL TELEMETRY &bull; D.I. YOGYAKARTA
          </motion.span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-950 mb-4">
            Measurable Real-Time{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
              Social Impact.
            </span>
          </h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16 text-slate-600 text-sm sm:text-base leading-relaxed" variants={itemVariants}>
          Continuous live tracking of surplus food distribution powered by Shannon Entropy and TOPSIS multi-criteria weighting to eliminate food waste and guarantee nutritious allocation.
        </motion.p>

        {/* 3-Column Architecture with Center Hero Image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
          {/* Left Column */}
          <div className="flex flex-col justify-between py-1 space-y-8 md:space-y-0">
            {features
              .filter((service) => service.position === "left")
              .map((service, index) => (
                <FeatureItem
                  key={`left-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.15}
                  direction="left"
                />
              ))}
          </div>

          {/* Center Showcase Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0 h-full">
            <motion.div className="relative w-full max-w-sm h-full flex flex-col justify-center" variants={itemVariants}>
              <motion.div
                className="rounded-2xl overflow-hidden shadow-2xl border border-emerald-100/80 bg-white h-full max-h-[500px] flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              >
                <div className="relative h-full min-h-[440px] w-full overflow-hidden flex flex-col justify-end">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop"
                    alt="Food Distribution Impact"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="relative z-10 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent p-5 sm:p-6 text-white pt-24">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1 block">
                      Direct Distribution
                    </span>
                    <p className="text-xs text-emerald-100 font-medium mb-3.5 leading-relaxed">
                      Connecting surplus nutrition to 24+ accredited social shelters in Yogyakarta.
                    </p>
                    <Link
                      to="/map"
                      className="bg-[#e1fcad] text-emerald-950 hover:bg-white px-4 py-2.5 rounded-full flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-900" />
                      Explore Map <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Surrounding framing line */}
              <motion.div
                className="absolute inset-0 border-2 border-emerald-300/50 rounded-2xl -m-3 z-[-1]"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-6 w-16 h-16 rounded-full bg-emerald-400/15 blur-xl pointer-events-none"
                style={{ y: y1 }}
              />
              <motion.div
                className="absolute -bottom-6 -left-8 w-20 h-20 rounded-full bg-teal-400/15 blur-xl pointer-events-none"
                style={{ y: y2 }}
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-between py-1 space-y-8 md:space-y-0">
            {features
              .filter((service) => service.position === "right")
              .map((service, index) => (
                <FeatureItem
                  key={`right-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.15}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* Stats Counter Row */}
        <motion.div
          ref={statsRef}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {statCounters.map((stat, index) => (
            <StatCounter
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* Integrated CTA Banner */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-800/60 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#e1fcad]" />
              <span>Free &amp; Verified Public Platform</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Have surplus food ready for donation?
            </h3>
            <p className="text-emerald-100/80 text-sm">
              Our automated Entropy-TOPSIS system matches and coordinates rapid pickup in minutes.
            </p>
          </div>
          <Link
            to="/register/donor"
            className="relative z-10 bg-[#e1fcad] hover:bg-white text-emerald-950 px-6 py-3 rounded-full flex items-center gap-2 font-extrabold text-sm transition-all shadow-lg hover:shadow-xl shrink-0"
          >
            Start Donating <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

interface FeatureItemProps {
  key?: React.Key;
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  title: string;
  description: string;
  variants: {
    hidden: { opacity: number; y?: number };
    visible: { opacity: number; y?: number; transition: { duration: number; ease: string } };
  };
  delay: number;
  direction: "left" | "right";
}

function FeatureItem({ icon, secondaryIcon, title, description, variants, delay, direction }: FeatureItemProps) {
  return (
    <motion.div
      className="flex flex-col group"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="flex items-center gap-3 mb-2.5"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className="text-emerald-700 bg-emerald-100/70 border border-emerald-200 p-2.5 rounded-xl transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-md relative shrink-0"
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors duration-300">
          {title}
        </h3>
      </motion.div>
      <motion.p
        className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.3 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

interface StatCounterProps {
  key?: React.Key;
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(countRef, { once: false, amount: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 12,
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    } else if (!isInView && hasAnimated) {
      springValue.set(0);
      setHasAnimated(false);
    }
  }, [isInView, value, springValue, hasAnimated]);

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest));

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center group hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 shadow-xs"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay },
        },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-xs"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-2xl sm:text-3xl font-extrabold text-emerald-950 flex items-center tabular-nums font-mono">
        <motion.span>{displayValue}</motion.span>
        <span className="text-emerald-700 text-xl font-bold ml-0.5">{suffix}</span>
      </motion.div>
      <p className="text-slate-600 text-xs font-medium mt-1">{label}</p>
      <motion.div className="w-8 h-0.5 bg-emerald-400 mt-2.5 group-hover:w-14 transition-all duration-300 rounded-full" />
    </motion.div>
  );
}

import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection({ onLoginClick }: { onLoginClick?: () => void }) {
  return (
    <section className="relative py-20 sm:py-28 bg-[#f4fbf7] bg-emerald-grid text-slate-900 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[450px] bg-emerald-300/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Rich Textured Emerald Banner */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-16 overflow-hidden shadow-2xl flex flex-col items-center text-center border border-emerald-700/50">

          {/* Subtle Ambient Dots & Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-emerald-400/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-[#e1fcad]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-3xl flex flex-col items-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/90 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs font-bold shadow-sm">
              <HeartHandshake size={15} className="text-[#e1fcad]" />
              <span>Zero Food Waste Initiative &bull; D.I. Yogyakarta</span>
            </div>

            {/* Headline */}
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] drop-shadow-sm">
              Stop Waste.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e1fcad] via-emerald-200 to-teal-100">
                Allocate Nutrition.
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
              Join dozens of partner hotels, restaurants, catering services, and social shelters across Yogyakarta. Free of charge, food-safety compliant, and mathematically verified.
            </p>

            {/* Action Buttons (21st Signature Pill Style) */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/register/donor">
                <Button className="group not-disabled:inset-shadow-none flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-3 font-medium shadow-none hover:bg-transparent">
                  <span className="rounded-full bg-[#e1fcad] px-8 py-3.5 text-emerald-950 text-sm font-extrabold duration-300 ease-in-out group-hover:bg-white group-hover:text-emerald-950 shadow-xl">
                    Register as Donor
                  </span>
                  <div className="relative flex h-fit cursor-pointer items-center overflow-hidden rounded-full bg-[#e1fcad] p-3.5 text-emerald-950 duration-300 ease-in-out group-hover:bg-white group-hover:text-emerald-950 shadow-xl">
                    <ArrowUpRight className="h-5 w-5 -translate-x-1/2 transition-all duration-300 ease-in-out group-hover:translate-x-10" />
                    <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-300 ease-in-out group-hover:-translate-x-1/2" />
                  </div>
                </Button>
              </Link>

              <Link
                to="/register/recipient"
                className="px-7 py-3.5 rounded-full border border-emerald-400/40 bg-emerald-900/60 backdrop-blur-md hover:bg-emerald-800 text-white text-sm font-bold transition-all shadow-xs"
              >
                Register as Recipient
              </Link>
            </div>

            {/* Guarantees */}
            <div className="pt-8 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-100 w-full max-w-2xl font-medium">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-[#e1fcad] shrink-0" />
                <span>100% Free Public Platform</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={16} className="text-[#e1fcad] shrink-0" />
                <span>BPOM &amp; HACCP Hygiene Standard</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-[#e1fcad] shrink-0" />
                <span>Objective TOPSIS Allocation</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

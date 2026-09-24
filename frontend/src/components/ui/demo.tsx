import { ArrowUpRight, Leaf, CheckCircle2, ShieldCheck, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex h-[100dvh] max-h-[960px] w-full items-center justify-center overflow-hidden pt-16 pb-8 text-white">
      {/* Background Photography with High Clarity & Balanced Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-emerald-950/50 to-emerald-950/85" />
      </div>

      {/* 21st Signature 12-Column Grid Lines Overlay */}
      <div className="absolute inset-0 z-10 size-full pointer-events-none">
        <div className="grid w-full h-full grid-cols-12 divide-x divide-white/10">
          <div className="col-span-1 h-full" />
          <div className="col-span-3 h-full" />
          <div className="col-span-4 h-full" />
          <div className="col-span-3 h-full" />
          <div className="col-span-1 h-full" />
        </div>
      </div>

      {/* Soft Ambient Light Bloom */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-400/15 blur-[120px] rounded-full pointer-events-none z-10" />

      <div className="relative z-20 max-w-4xl px-6 text-center text-white flex flex-col items-center">

        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-xs font-semibold mb-5 shadow-sm">
          <Layers size={13} className="text-[#e1fcad]" />
          <span>Food Rescue Protocol &bull; Hybrid Shannon Entropy - TOPSIS</span>
        </div>

        {/* Big Editorial Headline */}
        <h1 className="text-center font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12] max-w-3xl drop-shadow-md">
          Sustainable Solutions for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e1fcad] via-emerald-200 to-teal-100">
            Zero Food Waste.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto my-5 max-w-xl text-center font-normal text-sm sm:text-base text-emerald-50/90 leading-relaxed drop-shadow-sm">
          NutriShare bridges surplus food from hotels, restaurants, and catering services directly to orphanages and social shelters through objective mathematical allocation.
        </p>

        {/* 21st Signature Pill Button */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-1">
          <Link to="/register/donor">
            <Button className="group not-disabled:inset-shadow-none flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-2.5 font-medium shadow-none hover:bg-transparent">
              <span className="rounded-full bg-[#e1fcad] px-7 py-3 text-emerald-950 text-sm font-bold duration-300 ease-in-out group-hover:bg-white group-hover:text-emerald-950 shadow-lg">
                Start Donating
              </span>
              <div className="relative flex size-11 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#e1fcad] text-emerald-950 duration-300 ease-in-out group-hover:bg-white group-hover:text-emerald-950 shadow-lg">
                <ArrowUpRight className="h-4 w-4 transition-all duration-300 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-6" />
                <ArrowUpRight className="absolute h-4 w-4 -translate-x-6 translate-y-6 transition-all duration-300 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0" />
              </div>
            </Button>
          </Link>

          <Link
            to="/register/recipient"
            className="px-6 py-3 rounded-full border border-white/40 bg-emerald-950/60 backdrop-blur-md hover:bg-emerald-900/90 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Register as Recipient
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl pt-6 border-t border-white/20 text-xs text-emerald-100 font-medium drop-shadow-xs">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="text-[#e1fcad] shrink-0" />
            <span>100% Free Public Platform</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-[#e1fcad] shrink-0" />
            <span>HACCP &amp; Food Safety Standard</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Leaf size={16} className="text-[#e1fcad] shrink-0" />
            <span>Smart Nutrition-Based Dispatch</span>
          </div>
        </div>

      </div>
    </section>
  );
}

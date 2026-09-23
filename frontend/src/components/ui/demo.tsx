import { ArrowUpRight, Leaf, CheckCircle2, ShieldCheck, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92dvh] w-full items-center justify-center overflow-hidden pt-20 pb-16 text-white">
      {/* Background Photography with High Clarity & Balanced Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/40 to-emerald-950/80" />
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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-400/15 blur-[140px] rounded-full pointer-events-none z-10" />

      <div className="relative z-20 max-w-5xl px-6 text-center text-white flex flex-col items-center">

        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-xs font-semibold mb-6 shadow-sm">
          <Layers size={14} className="text-[#e1fcad]" />
          <span>Food Rescue Protocol &bull; Hybrid Shannon Entropy - TOPSIS</span>
        </div>

        {/* Big Editorial Headline */}
        <h1 className="text-center font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] max-w-4xl drop-shadow-md">
          Sustainable Solutions for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e1fcad] via-emerald-200 to-teal-100">
            Zero Food Waste.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto my-6 max-w-2xl text-center font-normal text-base sm:text-lg text-emerald-50 leading-relaxed drop-shadow-sm">
          NutriShare bridges surplus food from hotels, restaurants, and catering services directly to orphanages and social shelters through objective mathematical allocation.
        </p>

        {/* 21st Signature Pill Button */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link to="/register/donor">
            <Button className="group not-disabled:inset-shadow-none flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-3 font-medium shadow-none hover:bg-transparent">
              <span className="rounded-full bg-[#e1fcad] px-8 py-3.5 text-emerald-950 text-sm font-bold duration-300 ease-in-out group-hover:bg-white group-hover:text-emerald-950 shadow-lg">
                Start Donating
              </span>
              <div className="relative flex h-fit cursor-pointer items-center overflow-hidden rounded-full bg-[#e1fcad] p-3.5 text-emerald-950 duration-300 ease-in-out group-hover:bg-white group-hover:text-emerald-950 shadow-lg">
                <ArrowUpRight className="h-5 w-5 -translate-x-1/2 transition-all duration-300 ease-in-out group-hover:translate-x-10" />
                <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-300 ease-in-out group-hover:-translate-x-1/2" />
              </div>
            </Button>
          </Link>

          <Link
            to="/register/recipient"
            className="px-7 py-3.5 rounded-full border border-white/40 bg-emerald-950/60 backdrop-blur-md hover:bg-emerald-900/90 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Register as Recipient
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl pt-8 border-t border-white/20 text-xs text-emerald-100 font-medium drop-shadow-xs">
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

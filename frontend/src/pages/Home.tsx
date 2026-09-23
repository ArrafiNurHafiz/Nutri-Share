import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import HeroAero from "../components/ui/demo";
import {
  HeroSection,
  MarqueeBanner,
  SurplusShowcase,
  ProcessSection,
  ThreePillars,
  RecognitionSection,
  Testimonials,
  CTASection,
} from "../components/sections";
import { api } from "../lib/api";

export default function Home() {
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([
        api.fetchJSON("/api/public/top-donors").catch(() => []),
        api.fetchJSON("/api/public/stats").catch(() => null),
      ]);
      setTopDonors(d);
      setStats(s);
    } catch {
      /* fallback defaults */
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoginClick = () => navigate("/login");

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] text-slate-900 font-sans overflow-x-hidden antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar onLoginClick={handleLoginClick} />
      <SEO title="NutriShare — Platform Distribusi Pangan Berbasis Gizi" />

      <main className="w-full max-w-full overflow-x-hidden">
        {/* Hero Section: 21st Rivr Emerald */}
        <HeroAero />

        {/* Real-time Impact Telemetry */}
        <HeroSection stats={stats} />

        {/* Ticker Banner */}
        <MarqueeBanner />

        {/* Surplus Food Inventory */}
        <SurplusShowcase />

        {/* 4-Step Process & TOPSIS Formula */}
        <ProcessSection />

        {/* 3 Pillars Ecosystem */}
        <ThreePillars />

        {/* Impact & Partner Recognition */}
        <RecognitionSection topDonors={topDonors} stats={stats} />

        {/* Testimonials */}
        <Testimonials />

        {/* Final CTA */}
        <CTASection onLoginClick={handleLoginClick} />
      </main>

      <Footer />
    </div>
  );
}

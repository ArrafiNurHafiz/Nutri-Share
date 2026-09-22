import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  HeroSection,
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
      /* fallback defaults used */
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoginClick = () => navigate("/login");

  return (
    <div className="min-h-[100dvh] bg-white text-[#0F172A] font-sans overflow-x-hidden antialiased selection:bg-[#10B981]/20 selection:text-[#065F46]">
      <Navbar onLoginClick={handleLoginClick} />
      <SEO title="NutriShare | Your Surplus Food, Their Nutrition" />

      <HeroSection stats={stats} />
      <ProcessSection />
      <ThreePillars />
      <RecognitionSection topDonors={topDonors} stats={stats} />
      <Testimonials />
      <CTASection onLoginClick={handleLoginClick} />

      <Footer />
    </div>
  );
}

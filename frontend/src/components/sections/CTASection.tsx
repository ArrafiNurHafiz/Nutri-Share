import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LeafIllustration } from "./EcoVisuals";

export function CTASection({ onLoginClick }: { onLoginClick?: () => void }) {
  return (
    <section className="relative py-28 bg-[#F4FAF5] overflow-hidden">
      {/* Decorative Botanical Leaf Accents matching reference */}
      <LeafIllustration className="absolute -top-10 left-10 w-52 h-52 opacity-85" />
      <LeafIllustration className="absolute -bottom-10 -right-8 w-56 h-56 opacity-85 rotate-180" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Kids Portrait in Organic Rounded Frame with Annotation */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-white shadow-xl bg-[#E2E8F0]">
              <img
                src="/images/charity-kids.webp"
                alt="Penerima donasi makanan tersenyum gembira"
                className="w-full h-full object-cover"
                width={400}
                height={400}
                loading="lazy"
              />
            </div>

            {/* Handwritten Style Annotation: Nourishing Today Brighter Tomorrow ♡ */}
            <div className="transform -rotate-3">
              <p className="font-heading font-extrabold text-sm sm:text-base text-[#065F46] leading-snug">
                Nourishing Today
                <br />
                Brighter Tomorrow ♡
              </p>
            </div>
          </div>

          {/* Middle: Headline, Description & Action Buttons */}
          <div className="lg:col-span-4 text-center space-y-5">
            <span className="text-[11px] font-extrabold text-[#059669] uppercase tracking-[0.25em] px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] inline-block">
              START NOW
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading leading-tight">
              Your Surplus Food,
              <br />
              <span className="text-[#0F172A]">Their Nutrition</span>
            </h2>

            <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
              Make leftover food a new nutrition reality. NutriShare is here to bridge the gap.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <Link
                to="/register/donor"
                className="px-6 py-2.5 bg-[#0F472A] hover:bg-[#062319] text-white rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <span>Register as Donor</span>
                <ArrowRight size={13} />
              </Link>

              <Link
                to="/register/recipient"
                className="px-6 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full font-bold text-xs flex items-center justify-center transition-all transform hover:-translate-y-0.5"
              >
                Register as Recipient
              </Link>
            </div>
          </div>

          {/* Right: Fresh Bento Food Platter in Organic Frame with Annotation */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#E2E8F0]">
              <img
                src="/images/fresh-food.webp"
                alt="Sajian makanan bergizi dan bernutrisi tinggi"
                className="w-full h-full object-cover"
                width={400}
                height={400}
                loading="lazy"
              />
            </div>

            {/* Handwritten Style Sticky Note: Good Food Good People ♡ */}
            <div className="transform rotate-3">
              <div className="bg-[#FEF3C7] border border-[#FCD34D] px-4 py-2 rounded-2xl shadow-sm text-center">
                <p className="font-heading font-extrabold text-xs text-[#92400E]">
                  Good Food
                </p>
                <p className="font-heading font-bold text-[11px] text-[#B45309]">
                  Good People ♡
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

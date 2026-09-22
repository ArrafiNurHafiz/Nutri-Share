import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { GlossyLeafDecor } from "./EcoVisuals";

export function CTASection({ onLoginClick }: { onLoginClick?: () => void }) {
  return (
    <section className="relative py-20 bg-[#F6FAF6] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* ─── LEFT: Organic Blob Framed Children + Handwritten Note ─── */}
          <div className="lg:col-span-4 flex flex-row items-center justify-center gap-3 sm:gap-4 relative px-2">
            {/* Handwritten note on the left */}
            <div className="flex flex-col items-end z-20 transform -rotate-6 pointer-events-none text-right shrink-0">
              <p className="font-handwriting font-bold text-lg sm:text-2xl lg:text-[26px] text-[#059669] leading-tight drop-shadow-xs">
                Nourishing<br />
                Today<br />
                Brighter<br />
                Tomorrow
              </p>
              <Heart size={18} className="text-[#059669] fill-current mr-1 mt-1" />
            </div>

            {/* Organic Blob Photo Container matching cutout shape */}
            <div className="relative z-10 shrink-0">
              <div
                className="w-36 h-44 sm:w-48 sm:h-56 lg:w-52 lg:h-64 overflow-hidden bg-stone-100 border-[5px] sm:border-[6px] border-white shadow-2xl shadow-emerald-950/20 ring-4 ring-[#D1FAE5]"
                style={{
                  borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%",
                }}
              >
                <img
                  src="/images/recipient_kids.jpg"
                  alt="Penerima donasi anak-anak tersenyum membawa makanan"
                  className="w-full h-full object-cover scale-110 object-center"
                  width={400}
                  height={450}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/charity-kids.webp";
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── MIDDLE: Headline, Description & Dual CTA Buttons ─── */}
          <div className="lg:col-span-4 text-center space-y-4 px-2">
            <span className="text-[10px] font-extrabold text-[#059669] uppercase tracking-[0.2em] px-3.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] inline-block shadow-xs">
              START NOW
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight font-heading leading-tight">
              Your Surplus Food,
              <br />
              <span className="text-[#059669]">Their Nutrition</span>
            </h2>

            <p className="text-xs sm:text-[13px] text-[#64748B] max-w-xs mx-auto leading-relaxed">
              Make leftover food a new nutrition reality. NutriShare is here to bridge the gap.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
              <Link
                to="/register/donor"
                className="px-5 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#047857]/20 transition-all transform hover:-translate-y-0.5"
              >
                <span>Register as Donor</span>
                <ArrowRight size={13} />
              </Link>

              <Link
                to="/register/recipient"
                className="px-5 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] rounded-full font-bold text-xs flex items-center justify-center transition-all shadow-xs transform hover:-translate-y-0.5"
              >
                Register as Recipient
              </Link>
            </div>
          </div>

          {/* ─── RIGHT: Food Bento Box + Overlapping Sticky Note & Leaf ─── */}
          <div className="lg:col-span-4 flex items-center justify-center relative px-2">
            <div className="relative z-10">

              {/* Overlapping Top-Left Vector Botanical Leaf - Variant Single Gloss */}
              <div className="absolute -top-6 -left-6 z-30 pointer-events-none">
                <GlossyLeafDecor variant="single-gloss" className="w-16 h-16 sm:w-20 sm:h-20 opacity-95 -rotate-45" />
              </div>

              {/* Fresh Bento Photo Box */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-[2rem] overflow-hidden bg-stone-100 border-[5px] sm:border-[6px] border-white shadow-2xl shadow-emerald-950/20 ring-4 ring-[#D1FAE5]">
                <img
                  src="/images/fresh-food.webp"
                  alt="Sajian makanan segar bernutrisi"
                  className="w-full h-full object-cover scale-105"
                  width={400}
                  height={400}
                  loading="lazy"
                />
              </div>

              {/* Overlapping Yellow Sticky Note on Bottom-Left of Photo */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-6 z-30 transform -rotate-6">
                <div className="bg-[#FEF08A] border border-[#FDE047] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-xl shadow-amber-950/10 text-center min-w-[110px] sm:min-w-[130px] relative">
                  {/* Sticky tape accent at top */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-white/70 rounded-xs border border-black/5" />

                  <p className="font-handwriting font-bold text-lg sm:text-2xl text-[#78350F] leading-none">
                    Good Food
                  </p>
                  <p className="font-handwriting font-bold text-lg sm:text-2xl text-[#854D0E] leading-none mt-1">
                    Good People
                  </p>
                  <div className="flex justify-center mt-1.5">
                    <Heart size={14} className="text-[#854D0E] fill-current" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

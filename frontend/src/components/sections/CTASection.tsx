import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GlossyLeafDecor } from "./EcoVisuals";

export function CTASection({ onLoginClick }: { onLoginClick?: () => void }) {
  return (
    <section className="relative py-20 bg-[#F6FAF6] overflow-hidden">
      {/* Ambient background vector leaves - Varied Variants */}
      <GlossyLeafDecor variant="tropical-duo" className="hidden md:block absolute -top-8 -left-8 w-32 h-32 opacity-80" />
      <GlossyLeafDecor variant="fanned-trio" className="hidden md:block absolute -bottom-8 -right-8 w-36 h-36 opacity-80 rotate-180" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Card matching reference layout */}
        <div className="relative bg-white/95 rounded-[2.5rem] border border-[#E2F0E7] shadow-lg shadow-black/5 p-6 sm:p-10 lg:p-12 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* ─── LEFT: Organic Blob Framed Children + Handwritten Note ─── */}
            <div className="lg:col-span-4 flex items-center justify-center relative">
              {/* Handwritten note on the left */}
              <div className="hidden sm:flex flex-col items-end absolute -left-2 lg:-left-12 top-1/2 -translate-y-1/2 z-20 transform -rotate-6 pointer-events-none text-right">
                <p className="font-handwriting font-bold text-2xl lg:text-3xl text-[#059669] leading-tight drop-shadow-xs">
                  Nourishing<br />
                  Today<br />
                  Brighter<br />
                  Tomorrow
                </p>
                <span className="font-handwriting font-bold text-2xl text-[#059669] mr-1 mt-0.5">
                  ♡
                </span>
              </div>

              {/* Organic Blob Photo Container matching cutout shape */}
              <div className="relative z-10 ml-auto sm:ml-20 lg:ml-12">
                <div
                  className="w-52 h-60 sm:w-60 sm:h-72 overflow-hidden bg-stone-100 border-[6px] border-white shadow-2xl shadow-emerald-950/20 ring-4 ring-[#D1FAE5]"
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
            <div className="lg:col-span-4 flex items-center justify-center relative">
              <div className="relative z-10 mr-auto sm:mr-10 lg:mr-2">

                {/* Overlapping Top-Left Vector Botanical Leaf - Variant Single Gloss */}
                <div className="absolute -top-7 -left-7 z-30 pointer-events-none">
                  <GlossyLeafDecor variant="single-gloss" className="w-20 h-20 opacity-95 -rotate-45" />
                </div>

                {/* Fresh Bento Photo Box */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-[2rem] overflow-hidden bg-stone-100 border-[6px] border-white shadow-2xl shadow-emerald-950/20 ring-4 ring-[#D1FAE5]">
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
                <div className="absolute -bottom-5 -left-6 z-30 transform -rotate-6">
                  <div className="bg-[#FEF08A] border border-[#FDE047] px-4 py-3 rounded-2xl shadow-xl shadow-amber-950/10 text-center min-w-[130px] relative">
                    {/* Sticky tape accent at top */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-white/70 rounded-xs border border-black/5" />

                    <p className="font-handwriting font-bold text-xl sm:text-2xl text-[#78350F] leading-none">
                      Good Food
                    </p>
                    <p className="font-handwriting font-bold text-xl sm:text-2xl text-[#854D0E] leading-none mt-1">
                      Good People
                    </p>
                    <p className="font-handwriting font-bold text-lg text-[#854D0E] leading-none mt-1">
                      ♡
                    </p>
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

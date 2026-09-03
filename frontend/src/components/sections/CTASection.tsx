import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function CTASection({ onLoginClick }: { onLoginClick?: () => void }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-bold text-[#10b981] uppercase tracking-[0.2em] mb-4 block">
            Start Now
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight mb-5 leading-tight">
            Your Surplus Food,
            <br />
            <span className="text-[#10b981]">Their Nutrition</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
            Have leftover food? Need nutritious meals? NutriShare is here to
            bridge the gap.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register/donor"
              className="px-8 py-3.5 bg-[#10b981] hover:bg-[#047857] text-white rounded-full font-bold shadow-lg shadow-[#10b981]/15 flex items-center justify-center gap-2 btn-hover-effect"
            >
              Register as Donor <ArrowRight size={18} />
            </Link>
            <Link
              to="/register/recipient"
              className="px-8 py-3.5 border-2 border-gray-200 text-brand-dark rounded-full font-bold hover:border-[#10b981] hover:text-[#10b981] btn-hover-effect"
            >
              Register as Recipient
            </Link>
          </div>
          <div className="mt-6 text-xs text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onLoginClick}
              className="text-[#10b981] hover:underline font-bold"
            >
              Sign in here
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

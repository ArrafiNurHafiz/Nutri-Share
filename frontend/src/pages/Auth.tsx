import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  getErrorClass,
  getErrorText,
} from "../lib/validation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Eye, EyeOff, ArrowLeft, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const nav = useNavigate();

  const validate = () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({
      email: emailErr.valid ? undefined : emailErr.message,
      password: passErr.valid ? undefined : passErr.message,
    });
    return emailErr.valid && passErr.valid;
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      toast.success("Signed in successfully!");
      if (res.user.role === "admin") nav("/admin");
      else if (res.user.role === "donor") nav("/donor");
      else nav("/recipient");
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4fbf7] bg-emerald-grid flex flex-col md:flex-row font-sans text-emerald-950">
      <SEO title="Sign In | NutriShare" />

      {/* Left - Heroic Visual Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-emerald-950 text-white p-10 flex-col justify-between"
      >
        {/* Photo Background with Rich Green Overlay */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/nutrishare_login_image_3.webp')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/70 to-emerald-950/50" />
        </div>

        {/* 12-col grid lines */}
        <div className="absolute inset-0 grid grid-cols-6 divide-x divide-white/10 pointer-events-none" />

        {/* Top Branding with Original Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="font-heading font-extrabold text-xl text-white tracking-tight">
              NutriShare
            </span>
          </Link>
        </div>

        {/* Bottom Glass Card */}
        <div className="relative z-10 p-8 rounded-3xl bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl space-y-4 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#e1fcad] text-xs font-bold border border-emerald-400/30">
            <ShieldCheck size={14} />
            <span>Automated Food Rescue &amp; Dispatch Protocol</span>
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-white leading-snug">
            Prevent Food Waste, Empower Community Nutrition.
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Bridging surplus food from hotels, restaurants, and catering businesses directly to verified shelters using TOPSIS multi-criteria optimization.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-emerald-800/80">
            <div>
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-semibold">Meals Distributed</span>
              <strong className="text-xl font-extrabold text-white font-mono">4,120+</strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-semibold">Active Partners</span>
              <strong className="text-xl font-extrabold text-[#e1fcad] font-mono">39 Centers</strong>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right - Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200/90 shadow-xl shadow-emerald-950/5"
        >
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-950 block" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.email)}`}
                  placeholder="name@organization.org"
                  required
                />
              </div>
              {getErrorText(errors.email)}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-emerald-950" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-950"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={`w-full rounded-xl pl-10 pr-12 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.password)}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {getErrorText(errors.password)}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size={16} inline /> Signing In...
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Registrasi Link */}
          <div className="mt-8 pt-6 border-t border-emerald-100 text-center space-y-3">
            <span className="text-xs text-slate-500 block">Do not have an account yet?</span>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/register/donor"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors text-center block truncate"
              >
                Join as Donor
              </Link>
              <Link
                to="/register/recipient"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors text-center block truncate"
              >
                Join as Recipient
              </Link>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

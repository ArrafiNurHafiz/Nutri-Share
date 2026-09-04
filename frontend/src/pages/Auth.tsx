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
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
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
      const res = await login(email, password);
      toast.success("Logged in successfully!");
      if (res.user.role === "admin") nav("/admin");
      else if (res.user.role === "donor") nav("/donor");
      else nav("/recipient");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#faf8f4] flex flex-col md:flex-row">
      <SEO title="Sign In | NutriShare" />

      {/* Left - Narrative Visual Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-brand-dark"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/nutrishare_login_image_3.webp')",
            }}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/30 to-transparent" />
        </div>

        {/* Glassmorphism Overlay for Branding */}
        <div className="absolute bottom-8 left-8 right-8 p-6 md:p-8 backdrop-blur-md bg-white/15 rounded-2xl border border-white/20 z-10">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg bg-white/90 p-1"
            />
            <h1 className="font-heading text-2xl font-bold text-white">
              NutriShare
            </h1>
          </div>
          <p className="text-white/85 leading-relaxed max-w-lg text-sm">
            Empowering communities through intelligent food distribution. Join
            our network of donors and recipients to minimize waste and maximize
            impact.
          </p>
          <div className="mt-5 flex gap-8">
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">
                Meals Shared
              </p>
              <p className="text-white font-bold text-3xl">1.2M+</p>
            </div>
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">
                Active Donors
              </p>
              <p className="text-white font-bold text-3xl">4,800</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right - Login Form Canvas */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[440px]"
        >
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-dark transition-colors mb-8 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-xs font-semibold tracking-widest uppercase">
              Back to Home
            </span>
          </Link>

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-heading text-lg font-bold text-brand-dark">
              NutriShare
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-brand-dark mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500">
              Enter your credentials to access your impact dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold tracking-widest uppercase text-gray-500"
                htmlFor="login-email"
              >
                Email Address
              </label>
              <div className="relative group">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-orange transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                      setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-[#f8fafc] border-gray-200 focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.email)}`}
                  placeholder="name@organization.org"
                  required
                />
              </div>
              {getErrorText(errors.email)}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-semibold tracking-widest uppercase text-gray-500"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold tracking-widest uppercase text-primary-orange hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-orange transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={`w-full border rounded-xl pl-10 pr-12 py-3 bg-[#f8fafc] border-gray-200 focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.password)}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getErrorText(errors.password)}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-500 select-none"
              >
                Keep me logged in
              </label>
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              type="submit"
              className="w-full py-3.5 bg-primary-orange text-white rounded-xl font-bold hover:bg-primary-orange-dark active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-orange/20"
            >
              {loading ? (
                <>
                  <LoadingSpinner size={18} inline /> Processing...
                </>
              ) : (
                <>
                  <span>Login</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs font-semibold tracking-widest uppercase text-gray-400">
                New to NutriShare?
              </span>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <Link
              to="/register/donor"
              className="w-full py-3.5 border-2 border-primary-orange/30 text-brand-dark font-bold rounded-xl hover:bg-primary-orange-bg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 text-primary-orange"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Register as Donor / Recipient
            </Link>
            <a
              href="#"
              className="w-full py-3 text-gray-400 text-sm rounded-lg hover:text-gray-600 transition-colors flex items-center justify-center gap-2 border border-transparent"
              onClick={(e) => e.preventDefault()}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Need Technical Support?
            </a>
          </div>

          {/* Compliance Footer */}
          <footer className="mt-10 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By logging in, you agree to NutriShare's{" "}
              <a
                href="#"
                className="underline hover:text-primary-orange"
                onClick={(e) => e.preventDefault()}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline hover:text-primary-orange"
                onClick={(e) => e.preventDefault()}
              >
                Privacy Policy
              </a>
              .
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}

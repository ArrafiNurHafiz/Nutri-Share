import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";
import { Heart, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { api } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { validateEmail, getErrorClass, getErrorText } from "../lib/validation";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const r = validateEmail(email);
    if (!r.valid) {
      setError(r.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const res = await api.fetchJSON("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      if (res.resetToken) setToken(res.resetToken);
      toast.success("Password reset instructions have been sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <SEO
        title="Forgot Password"
        description="Reset your NUTRI-SHARE account password"
      />
      <div className="max-w-md mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)]"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#2D7A4F] mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="w-14 h-14 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-4">
            <KeyRound size={28} className="text-[#2D7A4F]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your email and we will send you a link to reset your password.
          </p>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-[#2D7A4F]" />
              </div>
              <p className="font-bold text-lg mb-2">Check Your Email</p>
              <p className="text-sm text-gray-500 mb-4">
                A password reset link has been sent to <b>{email}</b>
              </p>
              {token && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-xs mb-4 break-all">
                  <p className="font-bold mb-1">Demo Token:</p>
                  <code className="text-[#2D7A4F]">{token}</code>
                </div>
              )}
              <Link
                to="/login"
                className="text-[#2D7A4F] font-bold text-sm hover:underline"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(undefined);
                  }}
                  className={`w-full border rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-[#52C77F] outline-none transition-all ${getErrorClass(error)}`}
                  placeholder="your@email.com"
                  required
                />
                {getErrorText(error)}
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#2D7A4F] text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size={18} inline /> Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

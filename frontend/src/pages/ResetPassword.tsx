import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { api } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  validatePassword,
  getErrorClass,
  getErrorText,
} from "../lib/validation";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const r = validatePassword(password);
    if (!r.valid) {
      setError(r.message);
      return;
    }
    if (!token) {
      toast.error("Token reset tidak ditemukan");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await api.fetchJSON("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
      toast.success("Kata sandi berhasil diperbarui!");
      setTimeout(() => nav("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengatur ulang kata sandi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4fbf7] bg-emerald-grid text-emerald-950 font-sans flex flex-col justify-between">
      <Navbar />
      <SEO
        title="Atur Ulang Kata Sandi | NutriShare"
        description="Buat kata sandi baru untuk akun NutriShare Anda"
      />
      <div className="max-w-md mx-auto w-full px-6 pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-emerald-200/90 shadow-emerald-950/5"
        >
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-extrabold text-emerald-950 font-heading">
                Kata Sandi Diperbarui!
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kata sandi baru Anda telah aktif. Mengalihkan ke halaman login...
              </p>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> <span>Kembali ke Masuk</span>
              </Link>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mb-4 font-bold shadow-xs">
                <Lock size={22} />
              </div>
              <h1 className="text-2xl font-extrabold text-emerald-950 font-heading tracking-tight mb-1">
                Atur Kata Sandi Baru
              </h1>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Masukkan token verifikasi dan kata sandi baru Anda.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-950 mb-1.5 block">
                    Token Verifikasi
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all"
                    placeholder="Masukkan token reset"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-emerald-950 mb-1.5 block">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(undefined);
                      }}
                      className={`w-full rounded-xl pl-4 pr-12 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(error)}`}
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {getErrorText(error)}
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size={16} inline /> Memproses...
                    </>
                  ) : (
                    "Simpan Kata Sandi Baru"
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

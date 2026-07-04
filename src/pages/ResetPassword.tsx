import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import { Heart, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { api } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { validatePassword, getErrorClass, getErrorText } from "../lib/validation";
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
    if (!r.valid) { setError(r.message); return; }
    if (!token) { toast.error("Token reset tidak ditemukan"); return; }
    setError(undefined);
    setLoading(true);
    try {
      await api.fetchJSON("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      setDone(true);
      toast.success("Password berhasil direset!");
      setTimeout(() => nav("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Gagal reset password");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <SEO title="Reset Password" description="Buat password baru akun NUTRI-SHARE" />
      <div className="max-w-md mx-auto px-6 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] p-8 rounded-3xl shadow-sm border border-[var(--border-color)]"
        >
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#2D7A4F]" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password Diubah!</h1>
              <p className="text-sm text-gray-500 mb-6">Password Anda berhasil direset. Mengarahkan ke halaman login...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-4">
                <Lock size={28} className="text-[#2D7A4F]" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
              <p className="text-sm text-gray-500 mb-6">Masukkan password baru Anda.</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Token Reset</label>
                  <input type="text" value={token} onChange={e => setToken(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-[#52C77F] outline-none transition-all font-mono text-xs"
                    placeholder="Masukkan token reset" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Password Baru</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(undefined); }}
                      className={`w-full border rounded-xl px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-[#52C77F] outline-none transition-all ${getErrorClass(error)}`}
                      placeholder="Min. 6 karakter" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {getErrorText(error)}
                </div>
                <button disabled={loading} type="submit"
                  className="w-full bg-[#2D7A4F] text-white py-3.5 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><LoadingSpinner size={18} /> Mereset...</> : "Reset Password"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-[#2D7A4F] font-bold text-sm hover:underline">Kembali ke Login</Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

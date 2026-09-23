import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
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
      toast.success("Petunjuk pemulihan kata sandi telah dikirim!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim tautan reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4fbf7] bg-emerald-grid text-emerald-950 font-sans flex flex-col justify-between">
      <Navbar />
      <SEO
        title="Lupa Kata Sandi | NutriShare"
        description="Pulihkan kata sandi akun NutriShare Anda"
      />

      <div className="max-w-md mx-auto w-full px-6 pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-emerald-200/90 shadow-emerald-950/5"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> <span>Kembali ke Masuk</span>
          </Link>

          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mb-4 font-bold shadow-xs">
            <KeyRound size={22} />
          </div>

          <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight mb-1 font-heading">
            Lupa Kata Sandi?
          </h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Masukkan alamat email akun Anda. Kami akan mengirimkan instruksi untuk mengatur ulang kata sandi.
          </p>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <p className="font-extrabold text-lg text-emerald-950">Periksa Email Anda</p>
                <p className="text-xs text-slate-600 mt-1">
                  Tautan pemulihan kata sandi telah dikirim ke <b className="text-emerald-900">{email}</b>
                </p>
              </div>
              {token && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-left break-all font-mono">
                  <p className="font-bold text-emerald-900 mb-1">Token Demo:</p>
                  <code className="text-emerald-700">{token}</code>
                </div>
              )}
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-emerald-950 mb-1.5 block">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(undefined);
                    }}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(error)}`}
                    placeholder="nama@organisasi.org"
                    required
                  />
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
                    <LoadingSpinner size={16} inline /> Mengirim...
                  </>
                ) : (
                  "Kirim Tautan Reset"
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

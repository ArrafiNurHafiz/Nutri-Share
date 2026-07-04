import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateEmail, validatePassword, getErrorClass, getErrorText } from "../lib/validation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Eye, EyeOff, Heart, ArrowRight, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import authHero from "../assets/images/auth_hero_1781550749621.webp";

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
      const res = await login(email, password);
      toast.success("Berhasil masuk!");
      if (res.user.role === "admin") nav("/admin");
      else if (res.user.role === "donor") nav("/donor");
      else nav("/recipient");
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex text-[#2C2C2C]">
      {/* Left Side - Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={authHero} alt="Volunteer" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D7A4F]/90 via-[#2D7A4F]/30 to-transparent flex flex-col justify-end p-12 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">NUTRI-SHARE</p>
                <p className="text-xs text-white/70">Platform Distribusi Pangan</p>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">Selamat Datang <br/>di NutriShare</h1>
            <p className="text-lg opacity-80 max-w-md leading-relaxed">
              Menghubungkan surplus pangan dengan mereka yang paling membutuhkan melalui teknologi cerdas Hybrid Entropy-TOPSIS.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 max-w-md w-full"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 text-[#2D7A4F] font-bold text-xl mb-6">
            <Heart className="fill-current text-[#52C77F]" size={22} /> NUTRI-SHARE
          </div>

          <h2 className="text-3xl font-bold mb-1">Masuk</h2>
          <p className="text-gray-500 mb-8">Silakan masuk ke akun Anda untuk melanjutkan.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className="text-sm font-medium mb-1.5 block text-gray-700">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="login-email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                  onBlur={() => { const r = validateEmail(email); setErrors(p => ({ ...p, email: r.valid ? undefined : r.message })); }}
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none ${getErrorClass(errors.email)}`}
                  placeholder="contoh@email.com" required />
              </div>
              {getErrorText(errors.email)}
            </div>

            <div>
              <label htmlFor="login-password" className="text-sm font-medium mb-1.5 block text-gray-700">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="login-password" type={showPassword ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                  onBlur={() => { const r = validatePassword(password); setErrors(p => ({ ...p, password: r.valid ? undefined : r.message })); }}
                  className={`w-full border rounded-xl pl-10 pr-12 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none ${getErrorClass(errors.password)}`}
                  placeholder="Min. 6 karakter" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {getErrorText(errors.password)}
            </div>

            <div className="text-right -mt-2">
              <Link to="/lupa-password" className="text-xs text-gray-500 hover:text-[#2D7A4F] transition-colors">Lupa password?</Link>
            </div>

            <button disabled={loading} type="submit"
              className="w-full bg-gradient-to-r from-[#2D7A4F] to-[#52C77F] text-white py-3.5 rounded-xl font-bold mt-2 hover:shadow-lg hover:shadow-[#2D7A4F]/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 text-base"
            >
              {loading ? <><LoadingSpinner size={18} /> Memproses...</> : "Masuk ke Sistem"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm">
              Belum punya akun?{" "}
              <Link to="/register/donor" className="text-[#2D7A4F] font-bold hover:underline">Daftar sebagai Donor</Link>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Ingin menerima donasi?{" "}
              <Link to="/register/recipient" className="text-[#1565C0] font-bold hover:underline">Daftar sebagai Penerima</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

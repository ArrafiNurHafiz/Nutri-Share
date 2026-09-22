import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { LocationPicker } from "../components/LocationPicker";
import { Store, Mail, Lock, Phone, MapPin, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  getErrorClass,
  getErrorText,
  type FieldErrors,
} from "../lib/validation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";

export function RegisterDonor() {
  const [form, setForm] = useState({
    business_name: "",
    business_type: "hotel",
    address: "",
    latitude: "-7.7956",
    longitude: "110.3695",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nav = useNavigate();

  const validateField = (field: string, value: string) => {
    const rules: Record<string, () => { valid: boolean; message?: string }> = {
      business_name: () => validateRequired(value, "Nama Usaha / Hotel / Resto"),
      phone: () => {
        if (!value.trim()) return { valid: false, message: "Nomor WhatsApp wajib diisi untuk koordinasi" };
        if (value.replace(/\D/g, "").length < 9) return { valid: false, message: "Nomor telepon minimal 9 digit" };
        return { valid: true };
      },
      email: () => validateEmail(value),
      password: () => validatePassword(value),
      address: () => validateRequired(value, "Alamat Lengkap"),
    };
    const r = rules[field]?.();
    if (r)
      setErrors((p) => ({ ...p, [field]: r.valid ? undefined : r.message }));
  };

  const validateAll = (): boolean => {
    const fields = [
      { key: "business_name", fn: () => validateRequired(form.business_name, "Nama Usaha") },
      {
        key: "phone",
        fn: () => {
          if (!form.phone.trim()) return { valid: false, message: "Nomor WhatsApp aktif wajib diisi" };
          if (form.phone.replace(/\D/g, "").length < 9) return { valid: false, message: "Nomor telepon minimal 9 digit" };
          return { valid: true };
        },
      },
      { key: "email", fn: () => validateEmail(form.email) },
      { key: "password", fn: () => validatePassword(form.password) },
      { key: "address", fn: () => validateRequired(form.address, "Alamat Lengkap") },
    ];
    const newErrors: FieldErrors = {};
    let valid = true;
    fields.forEach((f) => {
      const r = f.fn();
      if (!r.valid) {
        newErrors[f.key] = r.message;
        valid = false;
      }
    });
    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    try {
      await api.fetchJSON("/api/auth/register/donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Pendaftaran berhasil dikirim! Menunggu verifikasi admin.");
      nav("/login");
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan pendaftaran.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#faf8f4] flex flex-col md:flex-row">
      <SEO title="Pendaftaran Donatur Mitra | NutriShare" />

      {/* Left - Narrative Visual Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-brand-dark"
      >
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/nutrishare_login_image_3.webp')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/30 to-transparent" />
        </div>

        <div className="absolute bottom-8 left-8 right-8 p-6 md:p-8 backdrop-blur-md bg-white/15 rounded-3xl border border-white/20 z-10 text-white space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              className="h-10 w-auto bg-white/90 p-1 rounded-xl"
            />
            <h1 className="font-heading text-2xl font-bold">NutriShare HoReKa</h1>
          </div>
          <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-lg">
            Bergabunglah bersama hotel, restoran, dan katering di Yogyakarta untuk mencegah food waste dan menyalurkan surplus makanan bergizi.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-emerald-200 text-xs font-bold">
              <Sparkles size={13} className="text-amber-300" />
              <span>Dukungan AI Nutrition & TOPSIS</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-14 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[520px]"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors mb-6 text-xs font-semibold tracking-wider uppercase"
          >
            &larr; Kembali ke Masuk
          </Link>

          <div className="mb-6 space-y-1">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900">
              Daftar Sebagai Donatur
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Lengkapi data usaha Anda untuk mulai mempublikasikan donasi makanan.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                  Nama Usaha / Hotel / Restoran <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    placeholder="Contoh: Hotel Tentrem Yogyakarta"
                    value={form.business_name}
                    onChange={(e) => update("business_name", e.target.value)}
                    onBlur={() => validateField("business_name", form.business_name)}
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-stone-50 border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-xs font-semibold outline-none transition-all ${getErrorClass(errors.business_name)}`}
                    required
                  />
                </div>
                {getErrorText(errors.business_name)}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                  Jenis Usaha
                </label>
                <select
                  value={form.business_type}
                  onChange={(e) => update("business_type", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] outline-none transition-all"
                >
                  <option value="hotel">Hotel & Penginapan</option>
                  <option value="restoran">Restoran & Rumah Makan</option>
                  <option value="kafe">Kafe & Bakery</option>
                  <option value="katering">Jasa Katering</option>
                  <option value="lainnya">Supermarket / Lainnya</option>
                </select>
              </div>

              {/* Explicit WhatsApp Field with Integration Tooltip */}
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Nomor WhatsApp Aktif <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                    <MessageCircle size={11} /> Koordinasi WA
                  </span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    placeholder="0812xxxxxxxx"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    onBlur={() => validateField("phone", form.phone)}
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-stone-50 border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-xs font-semibold outline-none transition-all ${getErrorClass(errors.phone)}`}
                    required
                  />
                </div>
                {getErrorText(errors.phone)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                  Email Akun <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    placeholder="nama@hotel.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => validateField("email", form.email)}
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 bg-stone-50 border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-xs font-semibold outline-none transition-all ${getErrorClass(errors.email)}`}
                    required
                  />
                </div>
                {getErrorText(errors.email)}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    placeholder="Minimal 6 karakter"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onBlur={() => validateField("password", form.password)}
                    className={`w-full border rounded-xl pl-10 pr-12 py-3 bg-stone-50 border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-xs font-semibold outline-none transition-all ${getErrorClass(errors.password)}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                  >
                    {showPassword ? "Tutup" : "Lihat"}
                  </button>
                </div>
                {getErrorText(errors.password)}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                Alamat Lengkap Titik Penjemputan <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Jl. AM Sangaji No. xx, Jetis, Kota Yogyakarta"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                onBlur={() => validateField("address", form.address)}
                className={`w-full border rounded-xl px-4 py-3 bg-stone-50 border-stone-200 focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/20 focus:border-[#2D7A4F] text-xs font-semibold outline-none transition-all ${getErrorClass(errors.address)}`}
                rows={2}
                required
              />
              {getErrorText(errors.address)}
            </div>

            {/* Map Location Picker */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MapPin size={15} className="text-[#2D7A4F]" /> Titik Koordinat Peta Donatur
              </h3>
              <p className="text-[11px] text-stone-500">
                Pilih atau seret pin lokasi agar panti asuhan penerima dapat menghitung rute jalan penjemputan secara akurat.
              </p>
              <LocationPicker
                lat={parseFloat(form.latitude)}
                lng={parseFloat(form.longitude)}
                onChange={(lat, lng) =>
                  setForm({
                    ...form,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  })
                }
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#2D7A4F] hover:bg-emerald-800 text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size={18} inline />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Kirim Pendaftaran Donatur</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 mt-6">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="text-[#2D7A4F] font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
export default RegisterDonor;

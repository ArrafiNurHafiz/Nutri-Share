import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { LocationPicker } from "../components/LocationPicker";
import { MapPin, Eye, EyeOff, Heart, Building2, Mail, Lock, Phone } from "lucide-react";
import { validateEmail, validatePassword, validateRequired, getErrorClass, getErrorText, FieldErrors } from "../lib/validation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import donorImg from "../assets/images/register_donor_1781550765798.webp";

export function RegisterDonor() {
  const [form, setForm] = useState({
    business_name: "", business_type: "hotel", address: "", latitude: "-7.7956", longitude: "110.3695",
    email: "", phone: "", password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nav = useNavigate();

  const validateField = (field: string, value: string) => {
    const rules: Record<string, () => { valid: boolean; message?: string }> = {
      business_name: () => validateRequired(value, "Nama Bisnis"),
      email: () => validateEmail(value),
      password: () => validatePassword(value),
      address: () => validateRequired(value, "Alamat"),
    };
    const rule = rules[field];
    if (rule) {
      const result = rule();
      setErrors(p => ({ ...p, [field]: result.valid ? undefined : result.message }));
    }
  };

  const validateAll = (): boolean => {
    const fields = [
      { key: "business_name", fn: () => validateRequired(form.business_name, "Nama Bisnis") },
      { key: "email", fn: () => validateEmail(form.email) },
      { key: "password", fn: () => validatePassword(form.password) },
      { key: "address", fn: () => validateRequired(form.address, "Alamat") },
    ];
    const newErrors: FieldErrors = {};
    let valid = true;
    fields.forEach(f => {
      const r = f.fn();
      if (!r.valid) { newErrors[f.key] = r.message; valid = false; }
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      toast.success("Pendaftaran berhasil! Menunggu verifikasi admin.");
      nav("/login");
    } catch (err: any) {
      toast.error(err.message || "Gagal mendaftar");
    } finally { setLoading(false); }
  };

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex text-[#2C2C2C]">
      <div className="hidden lg:block lg:w-5/12 relative overflow-hidden">
        <img src={donorImg} alt="Donor" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D7A4F]/95 via-[#2D7A4F]/40 to-transparent flex flex-col justify-end p-12 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold mb-3">Menjadi Pahlawan Pangan</h1>
            <p className="opacity-90 leading-relaxed">Bergabunglah dengan jaringan bisnis peduli lingkungan. Ubah potensi food waste menjadi senyuman bagi mereka yang membutuhkan.</p>
          </motion.div>
        </div>
      </div>
      <div className="w-full lg:w-7/12 flex flex-col justify-center p-4 sm:p-8 md:p-12 overflow-y-auto max-h-screen">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 text-[#2D7A4F] font-bold text-xl mb-6">
            <Heart className="fill-current text-[#52C77F]" size={22} /> NUTRI-SHARE
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Daftar Donor Baru</h2>
            <p className="text-gray-500">Berkontribusi kurangi food waste dengan mendaftarkan entitas bisnis Anda.</p>
          </div>
          <form onSubmit={handleRegister} className="flex flex-col gap-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nama Bisnis</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Ex. Hotel Aston" value={form.business_name}
                    onChange={e => update("business_name", e.target.value)}
                    onBlur={() => validateField("business_name", form.business_name)}
                    className={`w-full border pl-9 pr-3.5 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none ${getErrorClass(errors.business_name)}`} required />
                </div>
                {getErrorText(errors.business_name)}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Tipe Bisnis</label>
                <select value={form.business_type} onChange={e => update("business_type", e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none">
                  <option value="hotel">Hotel</option>
                  <option value="restoran">Restoran</option>
                  <option value="kafe">Kafe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="email@bisnis.com" type="email" value={form.email}
                    onChange={e => update("email", e.target.value)}
                    onBlur={() => validateField("email", form.email)}
                    className={`w-full border pl-9 pr-3.5 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none ${getErrorClass(errors.email)}`} required />
                </div>
                {getErrorText(errors.email)}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Min. 6 karakter" type={showPassword ? "text" : "password"} value={form.password}
                    onChange={e => update("password", e.target.value)}
                    onBlur={() => validateField("password", form.password)}
                    className={`w-full border pl-9 pr-12 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none ${getErrorClass(errors.password)}`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {getErrorText(errors.password)}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Alamat Lengkap</label>
              <textarea placeholder="Alamat Bisnis" value={form.address}
                onChange={e => update("address", e.target.value)}
                onBlur={() => validateField("address", form.address)}
                className={`w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#52C77F] focus:border-transparent transition-all outline-none ${getErrorClass(errors.address)}`} rows={2} required />
              {getErrorText(errors.address)}
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl relative z-0 mt-2">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-sm"><MapPin size={16} className="text-[#2D7A4F]" /> Pilih Lokasi Bisnis</h3>
              <p className="text-xs text-gray-500 mb-4">Klik atau geser pin merah untuk menandai lokasi persis pickup donasi.</p>
              <div className="h-[220px] rounded-xl overflow-hidden shadow-inner border border-gray-200">
                <LocationPicker lat={parseFloat(form.latitude)} lng={parseFloat(form.longitude)}
                  onChange={(lat: number, lng: number) => setForm({ ...form, latitude: lat.toString(), longitude: lng.toString() })} />
              </div>
            </div>

            <button disabled={loading} type="submit"
              className="w-full bg-gradient-to-r from-[#2D7A4F] to-[#52C77F] text-white py-4 rounded-xl font-bold mt-4 hover:shadow-lg hover:shadow-[#2D7A4F]/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none text-base flex items-center justify-center gap-2">
              {loading ? <><LoadingSpinner size={18} /> Mendaftarkan...</> : "Kirim Pendaftaran"}
            </button>
          </form>
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <span className="text-gray-500 text-sm">Sudah punya akun? </span>
            <Link to="/login" className="text-[#2D7A4F] font-bold hover:underline">Masuk di sini.</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

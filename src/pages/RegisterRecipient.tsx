import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { LocationPicker } from "../components/LocationPicker";
import { MapPin, Eye, EyeOff, Heart, Mail, Lock, Users, Home } from "lucide-react";
import { validateEmail, validatePassword, validateRequired, validateNumber, getErrorClass, getErrorText, FieldErrors } from "../lib/validation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "motion/react"
import { SEO } from "../components/SEO";
import recipientImg from "../assets/images/register_recipient_1781550781399.webp";

export function RegisterRecipient() {
  const [form, setForm] = useState({
    institution_name: "", institution_type: "panti_asuhan", address: "", latitude: "-7.8089",
    longitude: "110.3741", email: "", phone: "", password: "", resident_count: "",
    age_range: "Anak-anak", health_condition: "Umum", daily_protein_need: "",
    daily_calorie_need: "", daily_iron_need: "", daily_vitamin_c_need: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nav = useNavigate();

  const validateField = (field: string, value: string) => {
    const rules: Record<string, () => { valid: boolean; message?: string }> = {
      institution_name: () => validateRequired(value, "Nama Lembaga"),
      email: () => validateEmail(value),
      password: () => validatePassword(value),
      address: () => validateRequired(value, "Alamat"),
      resident_count: () => validateNumber(value, "Jumlah Penghuni"),
    };
    const rule = rules[field];
    if (rule) {
      const result = rule();
      setErrors(p => ({ ...p, [field]: result.valid ? undefined : result.message }));
    }
  };

  const validateAll = (): boolean => {
    const fields = [
      { key: "institution_name", fn: () => validateRequired(form.institution_name, "Nama Lembaga") },
      { key: "email", fn: () => validateEmail(form.email) },
      { key: "password", fn: () => validatePassword(form.password) },
      { key: "address", fn: () => validateRequired(form.address, "Alamat") },
      { key: "resident_count", fn: () => validateNumber(form.resident_count, "Jumlah Penghuni") },
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
      await api.fetchJSON("/api/auth/register/recipient", {
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
    <div className="min-h-screen bg-[#F7F4EE] flex flex-row-reverse text-[#2C2C2C]">
      <div className="hidden lg:block lg:w-5/12 relative overflow-hidden">
        <img src={recipientImg} alt="Children" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1565C0]/95 via-[#1565C0]/40 to-transparent flex flex-col justify-end p-12 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-3xl font-bold mb-3">Menerima dengan Terhormat</h1>
            <p className="opacity-90 leading-relaxed">Daulat pangan untuk semua. Daftarkan lembaga Anda agar kami dapat menghubungkan donasi gizi yang tepat.</p>
          </motion.div>
        </div>
      </div>
      <div className="w-full lg:w-7/12 flex flex-col justify-center p-4 sm:p-8 md:p-12 overflow-y-auto max-h-screen">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="max-w-xl w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 text-[#1565C0] font-bold text-xl mb-6">
            <Heart className="fill-current text-[#1565C0]" size={22} /> NUTRI-SHARE
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Daftar Penerima Bantuan</h2>
            <p className="text-gray-500">Panti Asuhan, Rumah Singgah, atau Entitas Sosial.</p>
          </div>
          <form onSubmit={handleRegister} className="flex flex-col gap-5 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nama Lembaga</label>
                <div className="relative">
                  <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Nama Lembaga" value={form.institution_name}
                    onChange={e => update("institution_name", e.target.value)}
                    onBlur={() => validateField("institution_name", form.institution_name)}
                    className={`w-full border pl-9 pr-3.5 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none ${getErrorClass(errors.institution_name)}`} required />
                </div>
                {getErrorText(errors.institution_name)}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Tipe Lembaga</label>
                <select value={form.institution_type} onChange={e => update("institution_type", e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none">
                  <option value="panti_asuhan">Panti Asuhan</option>
                  <option value="rumah_singgah">Rumah Singgah</option>
                  <option value="lembaga_sosial">Lembaga Sosial Lain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email login</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="email@lembaga.org" type="email" value={form.email}
                    onChange={e => update("email", e.target.value)}
                    onBlur={() => validateField("email", form.email)}
                    className={`w-full border pl-9 pr-3.5 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none ${getErrorClass(errors.email)}`} required />
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
                    className={`w-full border pl-9 pr-12 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none ${getErrorClass(errors.password)}`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {getErrorText(errors.password)}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Jumlah Penghuni</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="Cth: 50" type="number" value={form.resident_count}
                  onChange={e => update("resident_count", e.target.value)}
                  onBlur={() => validateField("resident_count", form.resident_count)}
                  className={`w-full border pl-9 pr-3.5 p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none ${getErrorClass(errors.resident_count)}`} required />
              </div>
              {getErrorText(errors.resident_count)}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <h3 className="font-bold text-sm text-[#1565C0] mb-3">Kebutuhan Gizi Harian</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "daily_protein_need", label: "Protein", unit: "g" },
                  { key: "daily_calorie_need", label: "Kalori", unit: "kkal" },
                  { key: "daily_iron_need", label: "Zat Besi", unit: "mg" },
                  { key: "daily_vitamin_c_need", label: "Vitamin C", unit: "mg" },
                ].map(item => (
                  <div key={item.key}>
                    <label className="text-[10px] font-bold text-gray-500 block mb-0.5">{item.label}/hari ({item.unit})</label>
                    <input type="number" placeholder="0" value={(form as any)[item.key]}
                      onChange={e => update(item.key, e.target.value)}
                      className="w-full border border-gray-200 p-2.5 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none text-center" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Alamat Lengkap</label>
              <textarea placeholder="Alamat Lembaga" value={form.address}
                onChange={e => update("address", e.target.value)}
                onBlur={() => validateField("address", form.address)}
                className={`w-full border p-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all outline-none ${getErrorClass(errors.address)}`} rows={2} required />
              {getErrorText(errors.address)}
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl relative z-0 mt-2">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-sm"><MapPin size={16} className="text-[#1565C0]" /> Pilih Lokasi Lembaga</h3>
              <p className="text-xs text-gray-500 mb-4">Geser pin merah untuk menandai lokasi agar driver mudah menemukan Anda.</p>
              <div className="h-[220px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
                <LocationPicker lat={parseFloat(form.latitude)} lng={parseFloat(form.longitude)}
                  onChange={(lat: number, lng: number) => setForm({ ...form, latitude: lat.toString(), longitude: lng.toString() })} />
              </div>
            </div>

            <button disabled={loading} type="submit"
              className="w-full bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white py-4 rounded-xl font-bold mt-4 hover:shadow-lg hover:shadow-[#1565C0]/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none text-base flex items-center justify-center gap-2">
              {loading ? <><LoadingSpinner size={18} /> Mendaftarkan...</> : "Kirim Pendaftaran"}
            </button>
          </form>
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <span className="text-gray-500 text-sm">Sudah punya akun? </span>
            <Link to="/login" className="text-[#1565C0] font-bold hover:underline">Masuk di sini.</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

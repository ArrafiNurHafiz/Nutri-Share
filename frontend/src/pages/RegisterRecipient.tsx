import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { LocationPicker } from "../components/LocationPicker";
import { Building, Mail, Lock, Phone, MapPin, Users, MessageCircle, ShieldCheck, ArrowLeft, HeartHandshake } from "lucide-react";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateNumber,
  getErrorClass,
  getErrorText,
  type FieldErrors,
} from "../lib/validation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { SEO } from "../components/SEO";

export function RegisterRecipient() {
  const [form, setForm] = useState({
    institution_name: "",
    institution_type: "panti_asuhan",
    address: "",
    latitude: "-7.8089",
    longitude: "110.3741",
    email: "",
    phone: "",
    password: "",
    resident_count: "30",
    age_range: "Children",
    health_condition: "General",
    daily_protein_need: "0",
    daily_calorie_need: "0",
    daily_iron_need: "0",
    daily_vitamin_c_need: "0",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nav = useNavigate();

  const validateField = (field: string, value: string) => {
    const rules: Record<string, () => { valid: boolean; message?: string }> = {
      institution_name: () => validateRequired(value, "Shelter / Institution Name"),
      phone: () => {
        if (!value.trim()) return { valid: false, message: "Active WhatsApp number is required" };
        if (value.replace(/\D/g, "").length < 9) return { valid: false, message: "Phone number must be at least 9 digits" };
        return { valid: true };
      },
      email: () => validateEmail(value),
      password: () => validatePassword(value),
      address: () => validateRequired(value, "Complete Address"),
      resident_count: () => validateNumber(value, "Total Resident Children / Beneficiaries"),
    };
    const r = rules[field]?.();
    if (r)
      setErrors((p) => ({ ...p, [field]: r.valid ? undefined : r.message }));
  };

  const validateAll = (): boolean => {
    const fields = [
      { key: "institution_name", fn: () => validateRequired(form.institution_name, "Institution Name") },
      {
        key: "phone",
        fn: () => {
          if (!form.phone.trim()) return { valid: false, message: "Active WhatsApp number is required" };
          if (form.phone.replace(/\D/g, "").length < 9) return { valid: false, message: "Phone number must be at least 9 digits" };
          return { valid: true };
        },
      },
      { key: "email", fn: () => validateEmail(form.email) },
      { key: "password", fn: () => validatePassword(form.password) },
      { key: "address", fn: () => validateRequired(form.address, "Complete Address") },
      { key: "resident_count", fn: () => validateNumber(form.resident_count, "Resident Count") },
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
      await api.fetchJSON("/api/auth/register/recipient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Registration submitted! Awaiting administrator document verification.");
      nav("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#f4fbf7] bg-emerald-grid flex flex-col md:flex-row font-sans text-emerald-950">
      <SEO title="Beneficiary Registration | NutriShare" />

      {/* Left - Heroic Visual Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:flex md:w-1/2 lg:w-2/5 relative overflow-hidden bg-emerald-950 text-white p-10 flex-col justify-between"
      >
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/recipient_kids.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/70 to-emerald-950/60" />
        </div>

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

        <div className="relative z-10 p-8 rounded-3xl bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#e1fcad] text-xs font-bold border border-emerald-400/30">
            <HeartHandshake size={14} />
            <span>Beneficiary Shelter Portal</span>
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-white leading-snug">
            Nutritious Food Access for Growing Children.
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Register your orphanage or social welfare foundation to receive wholesome food supplies directly and free of charge.
          </p>
        </div>
      </motion.div>

      {/* Right - Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-14 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[580px] bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200/90 shadow-xl shadow-emerald-950/5"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>

          <div className="mb-6 space-y-1">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
              Register as Recipient
            </h2>
            <p className="text-xs text-slate-500">
              Register your social institution to receive objective surplus nutrition allocations.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="institution_name">
                  Institution / Orphanage Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="institution_name"
                    placeholder="e.g. Al-Furqan Orphanage Sleman"
                    value={form.institution_name}
                    onChange={(e) => update("institution_name", e.target.value)}
                    onBlur={() => validateField("institution_name", form.institution_name)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.institution_name)}`}
                    required
                  />
                </div>
                {getErrorText(errors.institution_name)}
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="institution_type">
                  Institution Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="institution_type"
                  value={form.institution_type}
                  onChange={(e) => update("institution_type", e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all cursor-pointer"
                >
                  <option value="panti_asuhan">Children Orphanage</option>
                  <option value="rumah_singgah">Halfway House / Shelter</option>
                  <option value="panti_lansia">Nursing / Elderly Home</option>
                  <option value="lembaga_sosial">General Social Foundation</option>
                  <option value="lainnya">Other Social Service</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="resident_count">
                  Beneficiary / Resident Count <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="resident_count"
                    placeholder="e.g. 35"
                    type="number"
                    min="1"
                    value={form.resident_count}
                    onChange={(e) => update("resident_count", e.target.value)}
                    onBlur={() => validateField("resident_count", form.resident_count)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.resident_count)}`}
                    required
                  />
                </div>
                {getErrorText(errors.resident_count)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5 flex items-center justify-between" htmlFor="recipient_phone">
                  <span>Caregiver WhatsApp <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <MessageCircle size={11} /> WA Dispatch
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="recipient_phone"
                    placeholder="0812xxxxxxxx"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    onBlur={() => validateField("phone", form.phone)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.phone)}`}
                    required
                  />
                </div>
                {getErrorText(errors.phone)}
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="recipient_email">
                  Institution Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="recipient_email"
                    placeholder="contact@orphanage.org"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => validateField("email", form.email)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.email)}`}
                    required
                  />
                </div>
                {getErrorText(errors.email)}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="recipient_password">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                <input
                  id="recipient_password"
                  placeholder="Minimum 6 characters"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  onBlur={() => validateField("password", form.password)}
                  className={`w-full rounded-xl pl-10 pr-12 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.password)}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {getErrorText(errors.password)}
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="recipient_address">
                Full Institution Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="recipient_address"
                placeholder="Jl. Kaliurang KM 7, Sinduharjo, Ngaglik, Sleman (or select pin below)"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                onBlur={() => validateField("address", form.address)}
                className={`w-full rounded-xl px-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.address)}`}
                rows={2}
                required
              />
              {getErrorText(errors.address)}
            </div>

            {/* Map Picker */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MapPin size={15} className="text-emerald-700" /> Geographic Shelter Coordinates
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Select or drag the pin so the dispatch fleet can navigate directly to your institution.
              </p>
              <LocationPicker
                lat={parseFloat(form.latitude) || -7.8089}
                lng={parseFloat(form.longitude) || 110.3741}
                onChange={(lat, lng) =>
                  setForm((prev) => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                  }))
                }
                onAddressSelect={(detectedAddr) => {
                  if (detectedAddr) {
                    setForm((prev) => ({
                      ...prev,
                      address: detectedAddr,
                    }));
                    setErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner size={16} inline />
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Submit Recipient Registration</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-700 font-bold hover:underline">
              Sign In here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default RegisterRecipient;

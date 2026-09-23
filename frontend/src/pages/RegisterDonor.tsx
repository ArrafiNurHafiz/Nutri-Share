import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { LocationPicker } from "../components/LocationPicker";
import { Store, Mail, Lock, Phone, MapPin, MessageCircle, ShieldCheck, ArrowLeft } from "lucide-react";
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
      business_name: () => validateRequired(value, "Business / Hotel / Restaurant Name"),
      phone: () => {
        if (!value.trim()) return { valid: false, message: "Active WhatsApp number is required for dispatch" };
        if (value.replace(/\D/g, "").length < 9) return { valid: false, message: "Phone number must be at least 9 digits" };
        return { valid: true };
      },
      email: () => validateEmail(value),
      password: () => validatePassword(value),
      address: () => validateRequired(value, "Complete Pickup Address"),
    };
    const r = rules[field]?.();
    if (r)
      setErrors((p) => ({ ...p, [field]: r.valid ? undefined : r.message }));
  };

  const validateAll = (): boolean => {
    const fields = [
      { key: "business_name", fn: () => validateRequired(form.business_name, "Business Name") },
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
      toast.success("Registration submitted! Awaiting admin verification.");
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
      <SEO title="Donor Partner Registration | NutriShare" />

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
              backgroundImage: "url('/images/donor_kitchen.jpg')",
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
            <ShieldCheck size={14} />
            <span>HoReKa Donor Partnership</span>
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-white leading-snug">
            Redirect Surplus Meals, Empower Communities.
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Register your business to distribute surplus food seamlessly, safely, and with automated ESG sustainability reporting.
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
              Register as Donor
            </h2>
            <p className="text-xs text-slate-500">
              Provide your commercial food facility details to begin dispatching surplus food batches.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="business_name">
                  Business / Hotel / Restaurant Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="business_name"
                    placeholder="e.g. Hotel Merapi Merbabu"
                    value={form.business_name}
                    onChange={(e) => update("business_name", e.target.value)}
                    onBlur={() => validateField("business_name", form.business_name)}
                    className={`w-full rounded-xl pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all ${getErrorClass(errors.business_name)}`}
                    required
                  />
                </div>
                {getErrorText(errors.business_name)}
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="business_type">
                  Business Sector
                </label>
                <select
                  id="business_type"
                  value={form.business_type}
                  onChange={(e) => update("business_type", e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-emerald-50/40 border border-emerald-200 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 outline-none transition-all cursor-pointer"
                >
                  <option value="hotel">Hotel &amp; Lodging</option>
                  <option value="restoran">Restaurant &amp; Dining</option>
                  <option value="kafe">Cafe &amp; Bakery</option>
                  <option value="katering">Catering Services</option>
                  <option value="lainnya">Supermarket / Retail / Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5 flex items-center justify-between" htmlFor="phone">
                  <span>Active WhatsApp <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <MessageCircle size={11} /> WA Dispatch
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="phone"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="email">
                  Account Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="email"
                    placeholder="contact@business.com"
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

              <div>
                <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
                  <input
                    id="password"
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
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-950 block mb-1.5" htmlFor="address">
                Full Pickup Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                placeholder="Jl. AM Sangaji No. xx, Jetis, Yogyakarta (or select pin below)"
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
                <MapPin size={15} className="text-emerald-700" /> Pickup Geographic Pin
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Position your pickup pin to allow exact distance calculations for the TOPSIS dispatch engine.
              </p>
              <LocationPicker
                lat={parseFloat(form.latitude) || -7.7956}
                lng={parseFloat(form.longitude) || 110.3695}
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
                  <span>Submit Donor Registration</span>
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

export default RegisterDonor;

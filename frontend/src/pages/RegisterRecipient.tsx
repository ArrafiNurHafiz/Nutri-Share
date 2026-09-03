import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { LocationPicker } from "../components/LocationPicker";
import { Building, Mail, Lock, Phone, MapPin, Users } from "lucide-react";
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
    resident_count: "",
    age_range: "Children",
    health_condition: "General",
    daily_protein_need: "",
    daily_calorie_need: "",
    daily_iron_need: "",
    daily_vitamin_c_need: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nav = useNavigate();

  const validateField = (field: string, value: string) => {
    const rules: Record<string, () => { valid: boolean; message?: string }> = {
      institution_name: () => validateRequired(value, "Institution Name"),
      email: () => validateEmail(value),
      password: () => validatePassword(value),
      address: () => validateRequired(value, "Address"),
      resident_count: () => validateNumber(value, "Resident Count"),
    };
    const r = rules[field]?.();
    if (r)
      setErrors((p) => ({ ...p, [field]: r.valid ? undefined : r.message }));
  };

  const validateAll = (): boolean => {
    const fields = [
      {
        key: "institution_name",
        fn: () => validateRequired(form.institution_name, "Institution Name"),
      },
      { key: "email", fn: () => validateEmail(form.email) },
      { key: "password", fn: () => validatePassword(form.password) },
      { key: "address", fn: () => validateRequired(form.address, "Address") },
      {
        key: "resident_count",
        fn: () => validateNumber(form.resident_count, "Resident Count"),
      },
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
      toast.success("Registration sent! Please wait for admin verification.");
      nav("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col md:flex-row">
      <SEO title="Register Recipient | NutriShare" />

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

        <div className="absolute bottom-8 left-8 right-8 p-6 md:p-8 backdrop-blur-md bg-white/15 rounded-2xl border border-white/20 z-10">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg bg-white/90 p-1"
            />
            <h1 className="font-heading text-2xl font-bold text-white">
              NutriShare
            </h1>
          </div>
          <p className="text-white/85 leading-relaxed max-w-lg text-sm">
            Orphanages, shelters, and social institutions can receive nutritious
            food donations daily.
          </p>
          <div className="mt-4">
            <span className="inline-block px-3 py-1 bg-accent/30 text-white text-xs font-bold rounded-full">
              Get Food Support for Your Institution
            </span>
          </div>
        </div>
      </motion.div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[520px]"
        >
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-dark transition-colors mb-6 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-xs font-semibold tracking-widest uppercase">
              Back to Login
            </span>
          </Link>

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-heading text-lg font-bold text-brand-dark">
              NutriShare
            </span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-brand-dark mb-1">
              Register as Recipient
            </h2>
            <p className="text-gray-500">
              Register your institution to start receiving food donations.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Institution Name
                </label>
                <div className="relative">
                  <Building
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    placeholder="e.g. Kasih Ibu Orphanage"
                    value={form.institution_name}
                    onChange={(e) => update("institution_name", e.target.value)}
                    onBlur={() =>
                      validateField("institution_name", form.institution_name)
                    }
                    className={`w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.institution_name)}`}
                    required
                  />
                </div>
                {getErrorText(errors.institution_name)}
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Institution Type
                </label>
                <select
                  value={form.institution_type}
                  onChange={(e) => update("institution_type", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                >
                  <option value="panti_asuhan">Orphanage</option>
                  <option value="rumah_singgah">Shelter</option>
                  <option value="lembaga_sosial">Social Institution</option>
                  <option value="lainnya">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Residents
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    placeholder="Number of residents"
                    value={form.resident_count}
                    onChange={(e) => update("resident_count", e.target.value)}
                    onBlur={() =>
                      validateField("resident_count", form.resident_count)
                    }
                    className={`w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.resident_count)}`}
                    required
                  />
                </div>
                {getErrorText(errors.resident_count)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    placeholder="email@institution.org"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => validateField("email", form.email)}
                    className={`w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.email)}`}
                    required
                  />
                </div>
                {getErrorText(errors.email)}
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    placeholder="Min. 6 chars"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    onBlur={() => validateField("password", form.password)}
                    className={`w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.password)}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {getErrorText(errors.password)}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                Address
              </label>
              <textarea
                placeholder="Institution address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                onBlur={() => validateField("address", form.address)}
                className={`w-full border border-gray-200 rounded-xl px-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all ${getErrorClass(errors.address)}`}
                rows={2}
                required
              />
              {getErrorText(errors.address)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Phone
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    placeholder="Phone number"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1.5 block">
                  Age Range
                </label>
                <select
                  value={form.age_range}
                  onChange={(e) => update("age_range", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-[#f8fafc] focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange outline-none transition-all"
                >
                  <option>Children</option>
                  <option>Teens</option>
                  <option>Adults</option>
                  <option>Elderly</option>
                  <option>All Ages</option>
                </select>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-brand-dark mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-brand-medium" /> Institution
                Location
              </h3>
              <div className="h-48 rounded-xl overflow-hidden border border-gray-200">
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
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary-orange text-white py-3.5 rounded-xl font-bold hover:bg-primary-orange-dark active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-orange/20"
            >
              {loading ? (
                <LoadingSpinner size={18} inline />
              ) : (
                <>
                  <span>Send Registration</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-primary-orange font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  Building2,
  Heart,
  Phone,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  Calculator,
  MessageCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { LocationPicker } from "./LocationPicker";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

export function ProfileModal({ user, profile, onClose, onUpdate }: any) {
  const [demographics, setDemographics] = useState(() => {
    try {
      if (profile?.age_range && profile.age_range.startsWith("{")) {
        return JSON.parse(profile.age_range);
      }
    } catch (e) {}
    return { infants: 0, children: Number(profile?.resident_count || 20), adults: 5, elderly: 0 };
  });

  const [form, setForm] = useState(() => ({
    name: user.name || "",
    email: user.email || "",
    password: "",
    business_name: profile?.business_name || "",
    business_type: profile?.business_type || "hotel",
    institution_name: profile?.institution_name || "",
    institution_type: profile?.institution_type || "panti_asuhan",
    address: profile?.address || "",
    phone: profile?.phone || "",
    logo_url: profile?.logo_url || profile?.document_url || "",
    latitude: String(profile?.latitude ?? "-7.7956"),
    longitude: String(profile?.longitude ?? "110.3695"),
    resident_count: String(profile?.resident_count ?? "30"),
    daily_protein_need: String(profile?.daily_protein_need ?? "1200"),
    daily_calorie_need: String(profile?.daily_calorie_need ?? "45000"),
    daily_iron_need: String(profile?.daily_iron_need ?? "250"),
    daily_vitamin_c_need: String(profile?.daily_vitamin_c_need ?? "1500"),
    age_range: profile?.age_range || "",
  }));

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "nutrition" | "location">("general");

  // Auto-calculate AKG for recipients based on demographics (Standar Kemenkes RI)
  useEffect(() => {
    if (user.role === "recipient") {
      const { infants = 0, children = 0, adults = 0, elderly = 0 } = demographics;
      const cal = infants * 1000 + children * 1600 + adults * 2100 + elderly * 1800;
      const prot = infants * 20 + children * 40 + adults * 60 + elderly * 55;
      const iron = infants * 8 + children * 10 + adults * 15 + elderly * 12;
      const vitc = infants * 40 + children * 45 + adults * 75 + elderly * 70;
      const totalCount = infants + children + adults + elderly;

      setForm((f) => ({
        ...f,
        daily_calorie_need: String(cal),
        daily_protein_need: String(prot),
        daily_iron_need: String(iron),
        daily_vitamin_c_need: String(vitc),
        resident_count: String(totalCount || 30),
        age_range: JSON.stringify(demographics),
      }));
    }
  }, [demographics, user.role]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      toast.error("Nomor WhatsApp wajib diisi untuk koordinasi");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {};
      for (const [key, val] of Object.entries(form)) {
        payload[key] = val == null ? "" : String(val);
      }
      const res = await api.fetchJSON(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success(res.message || "Profil berhasil diperbarui!");
      onUpdate();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  const isDonor = user.role === "donor";
  const isRecipient = user.role === "recipient";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative border border-stone-200 flex flex-col my-auto"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#2D7A4F] to-emerald-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20">
                {isDonor ? <Building2 size={20} /> : <Heart size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-heading">
                  {isDonor ? "Profil Usaha & Donatur" : "Profil Lembaga Penerima"}
                </h3>
                <p className="text-xs text-emerald-100">
                  {isDonor ? "Kelola data kontak WhatsApp dan titik lokasi pickup" : "Kelola target kebutuhan gizi AKG & titik panti"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-stone-100 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`pb-2.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "general"
                  ? "border-[#2D7A4F] text-[#2D7A4F]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Informasi Umum & Kontak
            </button>

            {isRecipient && (
              <button
                type="button"
                onClick={() => setActiveTab("nutrition")}
                className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === "nutrition"
                    ? "border-[#2D7A4F] text-[#2D7A4F]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Calculator size={13} />
                <span>Kalkulator AKG Warga</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("location")}
              className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "location"
                  ? "border-[#2D7A4F] text-[#2D7A4F]"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <MapPin size={13} />
              <span>Titik Lokasi Peta</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isDonor && (
                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-700 mb-1.5 block">Nama Usaha / Hotel / Resto</label>
                      <input
                        value={form.business_name}
                        onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                        className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none"
                        required
                      />
                    </div>
                  )}

                  {isRecipient && (
                    <div className="sm:col-span-2">
                      <label className="font-bold text-stone-700 mb-1.5 block">Nama Panti Asuhan / Lembaga</label>
                      <input
                        value={form.institution_name}
                        onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                        className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                      <span>Nomor WhatsApp Aktif <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                        <MessageCircle size={11} /> Koordinasi WA
                      </span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="0812xxxxxxxx"
                        className="w-full border border-stone-200 pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 mb-1.5 block">Email Akun</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-stone-200 pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 mb-1.5 block">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-stone-200 p-2.5 rounded-xl bg-stone-50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#2D7A4F]/30 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Nutrition Tab for Recipient */}
            {activeTab === "nutrition" && isRecipient && (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <Sparkles size={14} className="text-emerald-700" />
                    <span>Perhitungan Kebutuhan AKG Otomatis Berdasarkan Demografi</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Masukkan komposisi warga binaan di panti asuhan. Sistem menghitung target kalori, protein, dan mikronutrien harian sesuai standar Kemenkes RI untuk perankingan TOPSIS.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Balita (0-4 thn)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.infants}
                      onChange={(e) => setDemographics({ ...demographics, infants: parseInt(e.target.value) || 0 })}
                      className="w-full border border-stone-200 p-2 rounded-xl bg-stone-50 text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Anak (5-12 thn)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.children}
                      onChange={(e) => setDemographics({ ...demographics, children: parseInt(e.target.value) || 0 })}
                      className="w-full border border-stone-200 p-2 rounded-xl bg-stone-50 text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Remaja/Dewasa</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.adults}
                      onChange={(e) => setDemographics({ ...demographics, adults: parseInt(e.target.value) || 0 })}
                      className="w-full border border-stone-200 p-2 rounded-xl bg-stone-50 text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Lansia (60+ thn)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.elderly}
                      onChange={(e) => setDemographics({ ...demographics, elderly: parseInt(e.target.value) || 0 })}
                      className="w-full border border-stone-200 p-2 rounded-xl bg-stone-50 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">Total Warga</span>
                    <span className="text-base font-black text-stone-900">{form.resident_count} Orang</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">Target Kalori</span>
                    <span className="text-base font-black text-amber-700">{form.daily_calorie_need} kkal</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block uppercase">Target Protein</span>
                    <span className="text-base font-black text-blue-700">{form.daily_protein_need} gram</span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Location Tab */}
            {activeTab === "location" && (
              <div className="space-y-3">
                <p className="text-stone-500 text-[11px]">
                  Pindahkan pin pada peta untuk menyesuaikan titik koordinat penjemputan donasi secara presisi.
                </p>
                <div className="h-56 rounded-2xl overflow-hidden border border-stone-200">
                  <LocationPicker
                    lat={parseFloat(form.latitude) || -7.7956}
                    lng={parseFloat(form.longitude) || 110.3695}
                    onChange={(lat: number, lng: number) =>
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
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck size={15} />
                <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default ProfileModal;

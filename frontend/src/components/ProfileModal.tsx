import { useState, useEffect } from "react";
import { X, User, MapPin } from "lucide-react";
import { api } from "../lib/api";
import { LocationPicker } from "./LocationPicker";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

export function ProfileModal({ user, profile, onClose, onUpdate }: any) {
  const [demographics, setDemographics] = useState(() => {
    try {
      if (profile?.age_range && profile.age_range.startsWith('{')) {
        return JSON.parse(profile.age_range);
      }
    } catch (e) {}
    return { infants: 0, children: 0, adults: 0, elderly: 0 };
  });

  const [form, setForm] = useState(() => ({
    name: user.name || "",
    email: user.email || "",
    password: user.password || "",
    business_name: profile?.business_name || "",
    business_type: profile?.business_type || "",
    institution_name: profile?.institution_name || "",
    institution_type: profile?.institution_type || "",
    address: profile?.address || "",
    phone: profile?.phone || "",
    logo_url: profile?.logo_url || profile?.document_url || "",
    latitude: String(profile?.latitude ?? ""),
    longitude: String(profile?.longitude ?? ""),
    resident_count: String(profile?.resident_count ?? ""),
    daily_protein_need: String(profile?.daily_protein_need ?? ""),
    daily_calorie_need: String(profile?.daily_calorie_need ?? ""),
    daily_iron_need: String(profile?.daily_iron_need ?? ""),
    daily_vitamin_c_need: String(profile?.daily_vitamin_c_need ?? ""),
    age_range: profile?.age_range || "",
  }));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auto-calculate AKG for recipients based on demographics
  useEffect(() => {
    if (user.role === "recipient") {
      const { infants, children, adults, elderly } = demographics;
      const cal = infants * 1000 + children * 1600 + adults * 2200 + elderly * 1800;
      const prot = infants * 20 + children * 40 + adults * 60 + elderly * 55;
      const iron = infants * 8 + children * 10 + adults * 15 + elderly * 12;
      const vitc = infants * 40 + children * 45 + adults * 75 + elderly * 70;
      const totalCount = infants + children + adults + elderly;
      
      setForm(f => ({
        ...f,
        daily_calorie_need: String(cal),
        daily_protein_need: String(prot),
        daily_iron_need: String(iron),
        daily_vitamin_c_need: String(vitc),
        resident_count: String(totalCount),
        age_range: JSON.stringify(demographics)
      }));
    }
  }, [demographics, user.role]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait until the photo has finished uploading");
      return;
    }
    setLoading(true);
    try {
      // Ensure all values are strings (Pydantic str | None fields)
      const payload: Record<string, string> = {};
      for (const [key, val] of Object.entries(form)) {
        payload[key] = val == null ? "" : String(val);
      }
      const res = await api.fetchJSON(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success(res.message || "Profile updated successfully");
      onUpdate();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative border border-gray-100"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-black"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="text-[#2D7A4F]" /> My Profile
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Form content remains mostly the same, omitting unchanged long sections */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Profile Photo / Logo
              </label>
              <div className="flex gap-4 items-center">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <User size={32} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append("photo", file);
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        credentials: "include",
                        body: fd,
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        throw new Error(data.message || "Upload failed");
                      }
                      if (data.url) {
                        setForm((f: any) => ({ ...f, logo_url: data.url }));
                        toast.success("Profile photo uploaded successfully");
                      } else {
                        throw new Error("Photo URL not found");
                      }
                    } catch (err: any) {
                      toast.error(err.message || "Failed to upload photo");
                    } finally {
                      setUploading(false);
                    }
                  }}
                  className="flex-1 border p-2 rounded-xl focus:ring-2 focus:ring-[#2D7A4F] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#E8F5E9] file:text-[#2D7A4F] hover:file:bg-[#C8E6C9] disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {user.role === "admin" && (
                <div className="col-span-2">
                  <label
                    htmlFor="profile-name"
                    className="text-sm font-bold text-gray-700 mb-1 block"
                  >
                    Admin Name
                  </label>
                  <input
                    id="profile-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border p-3 rounded-xl"
                    required
                  />
                </div>
              )}

              {user.role === "donor" && (
                <>
                  <div>
                    <label
                      htmlFor="profile-business-name"
                      className="text-sm font-bold text-gray-700 mb-1 block"
                    >
                      Business Name
                    </label>
                    <input
                      id="profile-business-name"
                      value={form.business_name}
                      onChange={(e) =>
                        setForm({ ...form, business_name: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-business-type"
                      className="text-sm font-bold text-gray-700 mb-1 block"
                    >
                      Business Type
                    </label>
                    <select
                      id="profile-business-type"
                      value={form.business_type}
                      onChange={(e) =>
                        setForm({ ...form, business_type: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl bg-white"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="restoran">Restaurant</option>
                      <option value="kafe">Cafe</option>
                      <option value="lainnya">Other</option>
                    </select>
                  </div>
                </>
              )}

              {user.role === "recipient" && (
                <>
                  <div>
                    <label
                      htmlFor="profile-institution-name"
                      className="text-sm font-bold text-gray-700 mb-1 block"
                    >
                      Institution Name
                    </label>
                    <input
                      id="profile-institution-name"
                      value={form.institution_name}
                      onChange={(e) =>
                        setForm({ ...form, institution_name: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-institution-type"
                      className="text-sm font-bold text-gray-700 mb-1 block"
                    >
                      Institution Type
                    </label>
                    <select
                      id="profile-institution-type"
                      value={form.institution_type}
                      onChange={(e) =>
                        setForm({ ...form, institution_type: e.target.value })
                      }
                      className="w-full border p-3 rounded-xl bg-white"
                    >
                      <option value="panti_asuhan">Orphanage</option>
                      <option value="rumah_singgah">Shelter</option>
                      <option value="lembaga_sosial">
                        Other Social Institution
                      </option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="profile-email"
                  className="text-sm font-bold text-gray-700 mb-1 block"
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border p-3 rounded-xl"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="profile-password"
                  className="text-sm font-bold text-gray-700 mb-1 block"
                >
                  Password
                </label>
                <input
                  id="profile-password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full border p-3 rounded-xl"
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>

            {(user.role === "donor" || user.role === "recipient") && (
              <>
                <div>
                  <label
                    htmlFor="profile-address"
                    className="text-sm font-bold text-gray-700 mb-1 block"
                  >
                    Full Address
                  </label>
                  <textarea
                    id="profile-address"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl"
                    rows={2}
                    required
                  />
                </div>

                <div className="bg-gray-50 border p-4 rounded-2xl relative z-0">
                  <h3 className="font-bold mb-1 flex items-center gap-2">
                    <MapPin size={18} className="text-[#2D7A4F]" /> Select
                    Location on Map
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Click on the map or drag the red pin to mark your exact
                    location.
                  </p>
                  <LocationPicker
                    lat={parseFloat(form.latitude)}
                    lng={parseFloat(form.longitude)}
                    onChange={(lat: number, lng: number) =>
                      setForm({
                        ...form,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      })
                    }
                  />
                </div>
              </>
            )}

            {user.role === "recipient" && (
              <div className="border-t pt-4">
                <div className="bg-brand-medium/10 p-4 rounded-2xl mb-4 border border-brand-medium/20">
                  <h3 className="font-bold text-brand-dark flex items-center gap-2 mb-2">
                    <User size={18} /> Automated Nutrition Calculator (AKG)
                  </h3>
                  <p className="text-xs text-brand-dark/70">
                    Input the number of people in your institution. The system will automatically calculate your daily nutritional targets (AKG) based on WHO/Kemenkes standards.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Infants (0-4y)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.infants}
                      onChange={(e) => setDemographics({...demographics, infants: parseInt(e.target.value) || 0})}
                      className="w-full border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Children (5-12y)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.children}
                      onChange={(e) => setDemographics({...demographics, children: parseInt(e.target.value) || 0})}
                      className="w-full border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Adults (13-59y)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.adults}
                      onChange={(e) => setDemographics({...demographics, adults: parseInt(e.target.value) || 0})}
                      className="w-full border p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block">Elderly (60+)</label>
                    <input
                      type="number"
                      min="0"
                      value={demographics.elderly}
                      onChange={(e) => setDemographics({...demographics, elderly: parseInt(e.target.value) || 0})}
                      className="w-full border p-2 rounded-xl"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl flex flex-wrap gap-4 justify-between border">
                  <div>
                    <span className="block text-xs text-gray-500">Total Residents</span>
                    <strong className="text-lg text-brand-dark">{form.resident_count}</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Daily Calories</span>
                    <strong className="text-lg text-primary-orange">{form.daily_calorie_need} kcal</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Daily Protein</span>
                    <strong className="text-lg text-primary-orange">{form.daily_protein_need} g</strong>
                  </div>
                </div>
              </div>
            )}

            <button
              disabled={loading || uploading}
              type="submit"
              className="w-full bg-[#2D7A4F] text-white font-bold py-4 rounded-xl mt-4 hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 disabled:transform-none"
            >
              {uploading
                ? "Uploading photo..."
                : loading
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

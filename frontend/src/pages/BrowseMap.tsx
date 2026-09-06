import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  ArrowLeft,
  Building2,
  Heart,
  Package,
  MapPin,
  Phone,
  Filter,
  Users,
  Compass,
} from "lucide-react";
import { SEO } from "../components/SEO";
import { api } from "../lib/api";
import { donorIcon, recipientIcon, locationIcon } from "../lib/mapIcons";
import { LoadingSpinner } from "../components/LoadingSpinner";

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export function BrowseMap() {
  const navigate = useNavigate();
  const [mapData, setMapData] = useState<{
    donors: any[];
    recipients: any[];
    activeDonations: any[];
  }>({
    donors: [],
    recipients: [],
    activeDonations: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "donor" | "recipient" | "donation">("all");
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.fetchJSON("/api/map/data");
        setMapData({
          donors: res.donors || [],
          recipients: res.recipients || [],
          activeDonations: res.activeDonations || [],
        });
      } catch {
        /* fallback empty */
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const defaultCenter: [number, number] = [-7.797068, 110.370529]; // Yogyakarta center

  const validDonors = useMemo(() => {
    return (mapData.donors || [])
      .map((d: any) => d.DonorProfile || d)
      .filter((d: any) => d.latitude && d.longitude && Math.abs(Number(d.latitude)) > 0.1);
  }, [mapData.donors]);

  const validRecipients = useMemo(() => {
    return (mapData.recipients || [])
      .map((r: any) => r.RecipientProfile || r)
      .filter((r: any) => r.latitude && r.longitude && Math.abs(Number(r.latitude)) > 0.1);
  }, [mapData.recipients]);

  const validDonations = useMemo(() => {
    return (mapData.activeDonations || []).filter(
      (d: any) => d.pickup_latitude && d.pickup_longitude && Math.abs(Number(d.pickup_latitude)) > 0.1
    );
  }, [mapData.activeDonations]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const donorsList = validDonors
      .filter(() => filterType === "all" || filterType === "donor")
      .filter((d: any) => !q || d.business_name?.toLowerCase().includes(q) || d.address?.toLowerCase().includes(q))
      .map((d: any) => ({ ...d, kind: "donor" }));

    const recipientsList = validRecipients
      .filter(() => filterType === "all" || filterType === "recipient")
      .filter((r: any) => !q || r.institution_name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q))
      .map((r: any) => ({ ...r, kind: "recipient" }));

    const donationsList = validDonations
      .filter(() => filterType === "all" || filterType === "donation")
      .filter((d: any) => !q || d.food_name?.toLowerCase().includes(q))
      .map((d: any) => ({
        ...d,
        kind: "donation",
        title: d.food_name,
        latitude: d.pickup_latitude,
        longitude: d.pickup_longitude,
      }));

    return [...donationsList, ...donorsList, ...recipientsList];
  }, [validDonors, validRecipients, validDonations, filterType, searchQuery]);

  return (
    <div className="flex flex-col h-screen bg-[#F7F4EE] overflow-hidden">
      <SEO
        title="Peta Sebaran Mitra & Donasi | NutriShare"
        description="Jelajahi peta interaktif sebaran hotel, restoran, panti asuhan, dan donasi surplus pangan di Yogyakarta."
      />

      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <Link to="/" className="hidden sm:flex items-center gap-2">
            <img src="/images/logoterbaru.webp" alt="NutriShare" className="h-8 w-auto" />
          </Link>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
            <Compass size={18} className="text-[#2D7A4F]" /> Peta Sebaran Mitra & Donasi
          </h1>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#2D7A4F] font-bold border border-emerald-100">
            <Building2 size={13} /> {validDonors.length} Donatur
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
            <Heart size={13} /> {validRecipients.length} Penerima
          </span>
          {validDonations.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-100 animate-pulse">
              <Package size={13} /> {validDonations.length} Donasi Aktif
            </span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Sidebar Panel */}
        <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 shadow-sm max-h-[40vh] md:max-h-full">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hotel, resto, panti asuhan..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D7A4F]/30"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filterType === "all"
                    ? "bg-[#2D7A4F] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({validDonors.length + validRecipients.length + validDonations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("donor")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filterType === "donor"
                    ? "bg-[#2D7A4F] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Donatur ({validDonors.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("recipient")}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filterType === "recipient"
                    ? "bg-[#1565C0] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Penerima ({validRecipients.length})
              </button>
              {validDonations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType("donation")}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    filterType === "donation"
                      ? "bg-[#E53935] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Donasi ({validDonations.length})
                </button>
              )}
            </div>
          </div>

          {/* List of Locations */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {loading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size={28} label="Memuat data peta..." />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Tidak ada data lokasi yang sesuai.
              </div>
            ) : (
              filteredItems.map((item: any, idx: number) => {
                const isDonor = item.kind === "donor";
                const isRecip = item.kind === "recipient";
                const name = isDonor
                  ? item.business_name
                  : isRecip
                  ? item.institution_name
                  : item.food_name;
                const typeLabel = isDonor
                  ? (item.business_type || "Donatur").replace(/_/g, " ")
                  : isRecip
                  ? (item.institution_type || "Penerima").replace(/_/g, " ")
                  : `${item.portion_count || 0} Porsi`;

                return (
                  <div
                    key={`${item.kind}-${item.id || idx}`}
                    onClick={() => {
                      if (item.latitude && item.longitude) {
                        setSelectedLocation([Number(item.latitude), Number(item.longitude)]);
                      }
                    }}
                    className="p-3 bg-white border border-gray-100 rounded-xl hover:border-[#2D7A4F]/40 hover:shadow-xs cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isDonor ? "bg-[#2D7A4F]" : isRecip ? "bg-[#1565C0]" : "bg-[#E53935]"
                          }`}
                        />
                        <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#2D7A4F]">
                          {name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        {item.address || "D.I. Yogyakarta"}
                      </p>
                      {item.phone && (
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                          <Phone size={10} /> {item.phone}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize shrink-0">
                      {typeLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 h-full w-full relative">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={selectedLocation} />

            {/* Donors */}
            {(filterType === "all" || filterType === "donor") &&
              validDonors.map((donor: any) => (
                <Marker
                  key={`donor-${donor.id}`}
                  position={[Number(donor.latitude), Number(donor.longitude)]}
                  icon={donorIcon}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {donor.business_type || "Donor"}
                      </span>
                      <h4 className="font-bold text-sm text-gray-800 mt-1">
                        {donor.business_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {donor.address || "Yogyakarta"}
                      </p>
                      {donor.phone && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Phone size={12} /> {donor.phone}
                        </p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-600 font-semibold">
                        Total Donasi: {donor.total_donations || 0} kali
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Recipients */}
            {(filterType === "all" || filterType === "recipient") &&
              validRecipients.map((recip: any) => (
                <Marker
                  key={`recip-${recip.id}`}
                  position={[Number(recip.latitude), Number(recip.longitude)]}
                  icon={recipientIcon}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {(recip.institution_type || "Penerima").replace(/_/g, " ")}
                      </span>
                      <h4 className="font-bold text-sm text-gray-800 mt-1">
                        {recip.institution_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {recip.address || "Yogyakarta"}
                      </p>
                      {recip.resident_count && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Users size={12} /> {recip.resident_count} Warga / Anak Asuh
                        </p>
                      )}
                      {recip.phone && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Phone size={12} /> {recip.phone}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Active Donations */}
            {(filterType === "all" || filterType === "donation") &&
              validDonations.map((don: any) => (
                <Marker
                  key={`don-${don.id}`}
                  position={[Number(don.pickup_latitude), Number(don.pickup_longitude)]}
                  icon={locationIcon}
                >
                  <Popup>
                    <div className="p-1 min-w-[180px]">
                      <span className="text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                        Donasi Tersedia
                      </span>
                      <h4 className="font-bold text-sm text-gray-800 mt-1">
                        {don.food_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Jumlah: <strong>{don.portion_count} porsi</strong>
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Kalori: {don.calorie_per_portion} kkal · Protein: {don.protein_per_portion}g
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
export default BrowseMap;

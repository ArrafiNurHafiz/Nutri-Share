import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  Building2,
  Heart,
  Package,
  MapPin,
  Compass,
} from "lucide-react";
import { SEO } from "../components/SEO";
import { api } from "../lib/api";
import { MapCNContainer } from "../components/map/MapCNContainer";
import { createCustomMarkerElement } from "../components/map/mapcn-styles";
import { getMapLibre } from "../lib/maplibre";

export function BrowseMap() {
  const navigate = useNavigate();
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [mapData, setMapData] = useState<{
    donors: any[];
    recipients: any[];
    activeDonations: any[];
  }>({
    donors: [],
    recipients: [],
    activeDonations: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "donor" | "recipient" | "donation">("all");

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
      }
    }
    loadData();
  }, []);

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

  const [mapInstance, setMapInstance] = useState<any>(null);

  // Sync Markers to MapLibre Canvas
  const updateMapMarkers = useCallback(async () => {
    const map = mapInstance || mapInstanceRef.current;
    if (!map) return;

    const maplibregl = await getMapLibre();

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new filtered markers
    filteredItems.forEach((item: any) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      if (!lat || !lng) return;

      const isDonor = item.kind === "donor";
      const isRecip = item.kind === "recipient";

      const el = createCustomMarkerElement(
        isDonor ? "donor" : isRecip ? "recipient" : "donation"
      );

      const name = isDonor
        ? item.business_name
        : isRecip
        ? item.institution_name
        : item.food_name;

      const badge = isDonor
        ? `<span style="font-size:10px; font-weight:bold; color:#065f46; background:#ecfdf5; padding:2px 8px; border-radius:9999px; text-transform:uppercase;">${item.business_type || "Donatur"}</span>`
        : isRecip
        ? `<span style="font-size:10px; font-weight:bold; color:#1e40af; background:#eff6ff; padding:2px 8px; border-radius:9999px; text-transform:uppercase;">${(item.institution_type || "Penerima").replace(/_/g, " ")}</span>`
        : `<span style="font-size:10px; font-weight:bold; color:#991b1b; background:#fef2f2; padding:2px 8px; border-radius:9999px; text-transform:uppercase;">Donasi Aktif</span>`;

      const popupHtml = `
        <div style="padding:4px; font-family:inherit; min-width:180px;">
          ${badge}
          <h4 style="font-weight:700; font-size:13px; color:#1f2937; margin:6px 0 2px;">${name}</h4>
          <p style="font-size:11px; color:#6b7280; margin:0; line-height:1.4;">${item.address || "D.I. Yogyakarta"}</p>
          ${
            item.portion_count
              ? `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #f3f4f6; font-size:11px; font-weight:600; color:#059669;">Tersedia: ${item.portion_count} Porsi</div>`
              : ""
          }
          ${
            item.phone
              ? `<p style="font-size:10px; color:#9ca3af; margin-top:4px;">Telp: ${item.phone}</p>`
              : ""
          }
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredItems, mapInstance]);

  useEffect(() => {
    updateMapMarkers();
  }, [updateMapMarkers]);

  const handleFlyTo = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      pitch: 45,
      duration: 1500,
      essential: true,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4fbf7] overflow-hidden font-sans text-emerald-950">
      <SEO
        title="Peta Sebaran Mitra & Donasi | NutriShare"
        description="Jelajahi peta interaktif sebaran hotel, restoran, panti asuhan, dan donasi surplus pangan di Yogyakarta."
      />

      {/* Top Header */}
      <header className="h-16 bg-emerald-950 text-white border-b border-emerald-800 px-4 md:px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft size={16} /> <span>Kembali</span>
          </button>
          <Link to="/" className="hidden sm:flex items-center gap-2">
            <img
              src="/images/logoterbaru.webp"
              alt="NutriShare Logo"
              className="w-8 h-8 object-contain"
            />
          </Link>
          <div className="h-4 w-px bg-emerald-700 hidden sm:block" />
          <h1 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Compass size={18} className="text-[#e1fcad]" /> Peta Sebaran Distribusi (GIS)
          </h1>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-[#e1fcad] font-bold border border-emerald-400/30">
            <Building2 size={13} /> {validDonors.length} Donatur
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 font-bold border border-teal-400/30">
            <Heart size={13} /> {validRecipients.length} Penerima
          </span>
          {validDonations.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 font-bold border border-amber-400/30 animate-pulse">
              <Package size={13} /> {validDonations.length} Donasi Aktif
            </span>
          )}
        </div>
      </header>

      {/* Main Map + Sidebar Area */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Sidebar Panel */}
        <div className="w-full md:w-96 bg-white border-r border-emerald-100 flex flex-col shrink-0 z-10 shadow-lg max-h-[40vh] md:max-h-full">
          {/* Search & Filters */}
          <div className="p-4 border-b border-emerald-100 space-y-3 bg-[#f4fbf7]/60">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700/60"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hotel, resto, panti asuhan..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs text-emerald-950 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                }`}
              >
                Semua ({validDonors.length + validRecipients.length + validDonations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("donor")}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === "donor"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                }`}
              >
                Donatur ({validDonors.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("recipient")}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === "recipient"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50"
                }`}
              >
                Penerima ({validRecipients.length})
              </button>
              {validDonations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType("donation")}
                  className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filterType === "donation"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-white border border-amber-200 text-amber-900 hover:bg-amber-50"
                  }`}
                >
                  Donasi ({validDonations.length})
                </button>
              )}
            </div>
          </div>

          {/* List Results */}
          <div className="flex-1 overflow-y-auto divide-y divide-emerald-50 p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada titik lokasi ditemukan.
              </div>
            ) : (
              filteredItems.map((item: any, idx: number) => {
                const isDonor = item.kind === "donor";
                const isRecip = item.kind === "recipient";

                return (
                  <div
                    key={item.id ? `${item.kind}-${item.id}` : idx}
                    onClick={() => handleFlyTo(Number(item.latitude), Number(item.longitude))}
                    className="p-3.5 rounded-2xl hover:bg-emerald-50/70 transition-all cursor-pointer group border border-transparent hover:border-emerald-200/80"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isDonor
                            ? "bg-emerald-100 text-emerald-800"
                            : isRecip
                            ? "bg-teal-100 text-teal-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isDonor ? item.business_type || "Donatur" : isRecip ? "Penerima" : "Donasi Aktif"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                      {isDonor ? item.business_name : isRecip ? item.institution_name : item.food_name}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1 line-clamp-2">
                      <MapPin size={12} className="shrink-0 text-emerald-600 mt-0.5" />
                      <span>{item.address || "D.I. Yogyakarta"}</span>
                    </p>

                    {item.portion_count && (
                      <div className="mt-2 inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {item.portion_count} Porsi Tersedia
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapCNContainer
            onMapReady={(map) => {
              mapInstanceRef.current = map;
              setMapInstance(map);
            }}
          />
        </div>
      </div>
    </div>
  );
}
export default BrowseMap;

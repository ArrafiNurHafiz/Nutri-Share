import { memo, useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Layers, Box, RotateCcw } from "lucide-react";
import { createCustomMarkerElement } from "../map/mapcn-styles";
import { getMapLibre } from "../../lib/maplibre";
import { fetchRoadRoute } from "../../lib/roadRouting";

interface Props {
  mapData: { donors: any[]; recipients: any[] };
  profile: any;
  activeDonations: any[];
}

function safeNum(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? null : n;
}

function MapInner({ mapData, profile, activeDonations }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [is3D, setIs3D] = useState(false);

  const lat = safeNum(profile?.latitude);
  const lng = safeNum(profile?.longitude);
  const hasLocation =
    lat !== null &&
    lng !== null &&
    Math.abs(lat) > 0.01 &&
    Math.abs(lng) > 0.01;

  if (!hasLocation) return null;

  const validDonors = (mapData.donors || []).filter(
    (d: any) => safeNum(d.latitude) && safeNum(d.longitude)
  );

  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current || !lat || !lng) return;

    getMapLibre().then(async (maplibregl) => {
      if (cancelled || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [lng, lat],
        zoom: 13,
        pitch: 30,
        attributionControl: false,
      });

      map.on("load", async () => {
        mapRef.current = map;

        // Recipient Marker (Self)
        const recipEl = createCustomMarkerElement("recipient", profile?.institution_name || "Anda");
        const recipPopup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="padding:4px; font-family:inherit;">
            <span style="font-size:10px; font-weight:bold; color:#1e40af; background:#eff6ff; padding:2px 8px; border-radius:9999px;">Penerima</span>
            <h4 style="font-weight:700; font-size:13px; color:#1f2937; margin:4px 0 0;">${profile?.institution_name || "Lokasi Anda"}</h4>
          </div>
        `);
        new maplibregl.Marker({ element: recipEl })
          .setLngLat([lng, lat])
          .setPopup(recipPopup)
          .addTo(map);

        // Donors Markers
        validDonors.forEach((donor: any) => {
          const dLat = safeNum(donor.latitude);
          const dLng = safeNum(donor.longitude);
          if (dLat && dLng) {
            const donorEl = createCustomMarkerElement("donor", donor.business_name);
            const donorPopup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
              <div style="padding:4px; font-family:inherit;">
                <span style="font-size:10px; font-weight:bold; color:#065f46; background:#ecfdf5; padding:2px 8px; border-radius:9999px;">Donatur</span>
                <h4 style="font-weight:700; font-size:13px; color:#1f2937; margin:4px 0 0;">${donor.business_name}</h4>
                <p style="font-size:11px; color:#6b7280; margin:2px 0 0;">${donor.address || "Yogyakarta"}</p>
              </div>
            `);
            new maplibregl.Marker({ element: donorEl })
              .setLngLat([dLng, dLat])
              .setPopup(donorPopup)
              .addTo(map);
          }
        });

        // Connecting road routes for rank 1 top matches (OSRM Real Road Network)
        const topMatches = activeDonations.filter((d: any) => d.rank === 1);
        const routePromises = topMatches.map(async (d: any) => {
          const donorInfo = validDonors.find((p: any) => p.user_id === d.donor_id);
          if (!donorInfo) return null;
          const dl = safeNum(donorInfo.latitude);
          const dn = safeNum(donorInfo.longitude);
          if (dl && dn) {
            const route = await fetchRoadRoute([lat, lng], [dl, dn]);
            return {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route.coordinates,
              },
            };
          }
          return null;
        });

        const activeLines = (await Promise.all(routePromises)).filter(Boolean);

        if (activeLines.length > 0) {
          map.addSource("road-routes", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: activeLines,
            },
          });

          map.addLayer({
            id: "road-route-glow",
            type: "line",
            source: "road-routes",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#10b981",
              "line-width": 6,
              "line-opacity": 0.4,
              "line-blur": 3,
            },
          });

          map.addLayer({
            id: "road-route-lines",
            type: "line",
            source: "road-routes",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#10b981",
              "line-width": 3.5,
            },
          });
        }

        // Auto fit bounds
        if (validDonors.length > 0) {
          const bounds = new maplibregl.LngLatBounds([lng, lat], [lng, lat]);
          validDonors.forEach((d: any) => {
            const dLat = safeNum(d.latitude);
            const dLng = safeNum(d.longitude);
            if (dLat && dLng) bounds.extend([dLng, dLat]);
          });
          map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
      });
    }).catch(console.error);

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, validDonors.length]);

  const toggle3D = () => {
    if (!mapRef.current) return;
    const next = !is3D;
    setIs3D(next);
    mapRef.current.easeTo({
      pitch: next ? 50 : 0,
      duration: 800,
    });
  };

  const resetOrientation = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 600,
    });
    setIs3D(false);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Modern Control Overlay (MapCN) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={toggle3D}
          className={`p-2.5 rounded-xl shadow-md backdrop-blur-md border transition-all text-xs font-bold cursor-pointer ${
            is3D
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
              : "bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 border-white/60"
          }`}
          title="Toggle 3D View"
        >
          <Box size={16} />
        </button>
        <button
          type="button"
          onClick={resetOrientation}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 rounded-xl shadow-md backdrop-blur-md border border-white/60 transition-all text-xs font-bold cursor-pointer"
          title="Reset Orientasi"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 max-w-xs shadow-lg">
        <h4 className="font-bold text-gray-800 text-xs mb-0.5 flex items-center gap-1.5">
          <Layers size={14} className="text-emerald-700" /> Rute Jalan Realistis (OSRM)
        </h4>
        <p className="text-[11px] text-gray-500 mb-2">
          Jalur jalan nyata ke donatur terdekat di Yogyakarta.
        </p>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0]" />
            <span>Penerima</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D7A4F]" />
            <span>Donatur</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const MapInnerMemo = memo(MapInner);

export function MapView(props: Props) {
  const lat = safeNum(props.profile?.latitude);
  const lng = safeNum(props.profile?.longitude);
  const hasLocation =
    lat !== null &&
    lng !== null &&
    Math.abs(lat) > 0.01 &&
    Math.abs(lng) > 0.01;

  if (!hasLocation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[var(--border-primary)] h-[450px] flex items-center justify-center"
      >
        <div className="text-center text-[var(--text-tertiary)] p-6">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm">
            Atur lokasi di Profil Anda untuk melihat peta sebaran donatur.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="relative glass rounded-3xl overflow-hidden border border-white/40 shadow-orange group transition-shadow hover:shadow-orange-lg"
      style={{ height: "450px" }}
    >
      <MapInnerMemo {...props} />
    </div>
  );
}

export default MapView;

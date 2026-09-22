import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { getMapLibre } from "../lib/maplibre";
import { createCustomMarkerElement } from "./map/mapcn-styles";

interface LocationPickerProps {
  lat: number | string;
  lng: number | string;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);

  const numLat = Number(lat) || -7.7956;
  const numLng = Number(lng) || 110.3695;

  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current) return;

    getMapLibre()
      .then((maplibregl) => {
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: [numLng, numLat],
          zoom: 13,
          attributionControl: false,
        });

        map.on("load", () => {
          mapRef.current = map;

          const el = createCustomMarkerElement("donation", "Titik Lokasi");
          const marker = new maplibregl.Marker({ element: el, draggable: true })
            .setLngLat([numLng, numLat])
            .addTo(map);

          marker.on("dragend", () => {
            const lngLat = marker.getLngLat();
            onChange(Number(lngLat.lat.toFixed(6)), Number(lngLat.lng.toFixed(6)));
          });

          map.on("click", (e: any) => {
            marker.setLngLat(e.lngLat);
            onChange(Number(e.lngLat.lat.toFixed(6)), Number(e.lngLat.lng.toFixed(6)));
          });

          markerRef.current = marker;
        });
      })
      .catch((err) => {
        console.error("Gagal inisialisasi LocationPicker:", err);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when props change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLngLat([numLng, numLat]);
      mapRef.current.easeTo({ center: [numLng, numLat], duration: 400 });
    }
  }, [numLat, numLng]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cLat = Number(pos.coords.latitude.toFixed(6));
        const cLng = Number(pos.coords.longitude.toFixed(6));
        onChange(cLat, cLng);
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLngLat([cLng, cLat]);
          mapRef.current.flyTo({ center: [cLng, cLat], zoom: 15, duration: 1000 });
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true },
    );
  }, [onChange]);

  return (
    <div className="h-52 sm:h-64 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 z-0 relative bg-stone-100">
      <div ref={containerRef} className="w-full h-full" />
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-gray-100 text-xs font-bold text-gray-700 flex items-center gap-1.5 hover:bg-white transition-all disabled:opacity-60 cursor-pointer"
      >
        {locating ? (
          <Loader2 className="animate-spin text-[#2D7A4F]" size={14} />
        ) : (
          <MapPin size={14} className="text-[#2D7A4F]" />
        )}
        <span>{locating ? "Mencari Koordinat..." : "Gunakan Lokasi Saya"}</span>
      </button>
    </div>
  );
}
export default LocationPicker;

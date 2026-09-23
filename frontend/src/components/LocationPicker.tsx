import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Loader2, Compass } from "lucide-react";
import { getMapLibre } from "../lib/maplibre";
import { createCustomMarkerElement } from "./map/mapcn-styles";

interface LocationPickerProps {
  lat: number | string;
  lng: number | string;
  onChange: (lat: number, lng: number) => void;
  onAddressSelect?: (address: string) => void;
}

export function LocationPicker({
  lat,
  lng,
  onChange,
  onAddressSelect,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string>("");

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onAddressSelectRef = useRef(onAddressSelect);
  onAddressSelectRef.current = onAddressSelect;

  const numLat = Number(lat) || -7.7956;
  const numLng = Number(lng) || 110.3695;

  // Reverse geocode lat/lng to clean Indonesian address
  const reverseGeocode = useCallback(async (targetLat: number, targetLng: number) => {
    if (!onAddressSelectRef.current) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${targetLat}&lon=${targetLng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addr = data.address || {};
          const parts: string[] = [];

          if (addr.road || addr.street) parts.push(addr.road || addr.street);
          if (addr.suburb || addr.village || addr.neighbourhood) {
            parts.push(addr.suburb || addr.village || addr.neighbourhood);
          }
          if (addr.city || addr.town || addr.municipality || addr.county) {
            parts.push(addr.city || addr.town || addr.municipality || addr.county);
          }
          if (addr.state && !parts.some((p) => p.includes(addr.state))) {
            parts.push(addr.state);
          }

          const cleanAddress = parts.length >= 2 ? parts.join(", ") : data.display_name;
          setDetectedAddress(cleanAddress);
          onAddressSelectRef.current(cleanAddress);
        }
      }
    } catch (err) {
      console.warn("Reverse geocoding gagal:", err);
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handleCoordinatesChange = useCallback((newLat: number, newLng: number) => {
    onChangeRef.current(newLat, newLng);
    reverseGeocode(newLat, newLng);
  }, [reverseGeocode]);

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
            const roundedLat = Number(lngLat.lat.toFixed(6));
            const roundedLng = Number(lngLat.lng.toFixed(6));
            handleCoordinatesChange(roundedLat, roundedLng);
          });

          map.on("click", (e: any) => {
            marker.setLngLat(e.lngLat);
            const roundedLat = Number(e.lngLat.lat.toFixed(6));
            const roundedLng = Number(e.lngLat.lng.toFixed(6));
            handleCoordinatesChange(roundedLat, roundedLng);
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
  }, [handleCoordinatesChange]);

  // Update marker when props change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const currentPos = markerRef.current.getLngLat();
      if (
        Math.abs(currentPos.lat - numLat) > 0.0001 ||
        Math.abs(currentPos.lng - numLng) > 0.0001
      ) {
        markerRef.current.setLngLat([numLng, numLat]);
        mapRef.current.easeTo({ center: [numLng, numLat], duration: 400 });
      }
    }
  }, [numLat, numLng]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cLat = Number(pos.coords.latitude.toFixed(6));
        const cLng = Number(pos.coords.longitude.toFixed(6));
        handleCoordinatesChange(cLat, cLng);
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLngLat([cLng, cLat]);
          mapRef.current.flyTo({ center: [cLng, cLat], zoom: 15, duration: 1000 });
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true },
    );
  }, [handleCoordinatesChange]);

  return (
    <div className="space-y-2">
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

      {geocoding && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-pulse">
          <Loader2 size={13} className="animate-spin text-emerald-600" />
          <span>Mendeteksi alamat dari titik peta...</span>
        </div>
      )}

      {detectedAddress && !geocoding && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl">
          <Compass size={13} className="text-[#2D7A4F] shrink-0" />
          <span className="truncate">Terdeteksi: <strong>{detectedAddress}</strong></span>
        </div>
      )}
    </div>
  );
}
export default LocationPicker;

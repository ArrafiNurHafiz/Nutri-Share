import { useEffect, useRef, useState, type ReactNode } from "react";
import { Layers, Box, RotateCcw } from "lucide-react";
import { MAPCN_STYLES, type MapStyleKey } from "./mapcn-styles";
import { getMapLibre } from "../../lib/maplibre";

interface MapCNProps {
  center?: [number, number]; // [lat, lng] or [lng, lat]
  zoom?: number;
  pitch?: number;
  bearing?: number;
  className?: string;
  styleKey?: MapStyleKey;
  children?: ReactNode;
  onMapReady?: (map: any) => void;
  showControls?: boolean;
  showStylePicker?: boolean;
  show3DTilt?: boolean;
}

export function MapCNContainer({
  center = [-7.797068, 110.370529],
  zoom = 12,
  pitch = 0,
  bearing = 0,
  className = "w-full h-full",
  styleKey = "liberty",
  children,
  onMapReady,
  showControls = true,
  showStylePicker = true,
  show3DTilt = true,
}: MapCNProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>(styleKey);
  const [is3D, setIs3D] = useState(pitch > 0);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  // Initialize MapLibre via dynamic CDN loader
  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current) return;

    const lng = center[1] > 90 ? center[1] : center[0];
    const lat = center[1] > 90 ? center[0] : center[1];

    getMapLibre()
      .then((maplibregl) => {
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: MAPCN_STYLES[currentStyle].url,
          center: [lng, lat],
          zoom: zoom,
          pitch: pitch,
          bearing: bearing,
          attributionControl: false,
        });

        if (showControls) {
          map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
        }

        map.on("load", () => {
          mapRef.current = map;
          onMapReady?.(map);
        });

        // Trigger onMapReady immediately if map is already loaded or in idle state
        if (map.loaded()) {
          mapRef.current = map;
          onMapReady?.(map);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat MapLibre GL CDN:", err);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleStyleChange = (key: MapStyleKey) => {
    setCurrentStyle(key);
    setStylePickerOpen(false);
    if (mapRef.current) {
      mapRef.current.setStyle(MAPCN_STYLES[key].url);
    }
  };

  const toggle3D = () => {
    if (!mapRef.current) return;
    const next3D = !is3D;
    setIs3D(next3D);
    mapRef.current.easeTo({
      pitch: next3D ? 55 : 0,
      bearing: next3D ? -20 : 0,
      duration: 1000,
    });
  };

  const resetNorth = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 800,
    });
    setIs3D(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Modern Map Controls (MapCN Glass UI) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Style Switcher */}
        {showStylePicker && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setStylePickerOpen(!stylePickerOpen)}
              className="p-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 rounded-xl shadow-md backdrop-blur-md border border-white/60 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Ganti Gaya Peta"
            >
              <Layers size={16} />
              <span className="hidden sm:inline">{MAPCN_STYLES[currentStyle].name}</span>
            </button>

            {stylePickerOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-2 space-y-1 z-20 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Pilih Tema Peta
                </div>
                {(Object.keys(MAPCN_STYLES) as MapStyleKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStyleChange(key)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      currentStyle === key
                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{MAPCN_STYLES[key].name}</span>
                    {currentStyle === key && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3D Tilt Toggle */}
        {show3DTilt && (
          <button
            type="button"
            onClick={toggle3D}
            className={`p-2.5 rounded-xl shadow-md backdrop-blur-md border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              is3D
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-200"
                : "bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 border-white/60"
            }`}
            title="Toggle 3D View"
          >
            <Box size={16} />
            <span className="hidden sm:inline">{is3D ? "3D Aktif" : "3D View"}</span>
          </button>
        )}

        {/* Reset Compass */}
        <button
          type="button"
          onClick={resetNorth}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-emerald-700 rounded-xl shadow-md backdrop-blur-md border border-white/60 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Reset Orientasi Peta"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Reset Arah</span>
        </button>
      </div>

      {children}
    </div>
  );
}
export default MapCNContainer;

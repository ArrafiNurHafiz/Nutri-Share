import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "../lib/mapIcons";
import { locationIcon } from "../lib/mapIcons";

function LocationMarker({ position, setPosition }: any) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom(), { duration: 0.5 });
  }, [position]);

  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={locationIcon} draggable
      eventHandlers={{
        dragend: (e) => {
          const p = e.target.getLatLng();
          setPosition({ lat: p.lat, lng: p.lng });
        },
      }}
    />
  );
}

export function LocationPicker({ lat, lng, onChange }: any) {
  const [locating, setLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  }, [onChange]);

  return (
    <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0 relative">
      <MapContainer center={[lat || -7.7956, lng || 110.3695]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" referrerPolicy="origin" />
        <LocationMarker
          position={{ lat: lat || -7.7956, lng: lng || 110.3695 }}
          setPosition={(pos: any) => onChange(pos.lat, pos.lng)}
        />
      </MapContainer>
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-3 left-3 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-60"
      >
        {locating ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
        Gunakan lokasi saya
      </button>
    </div>
  );
}

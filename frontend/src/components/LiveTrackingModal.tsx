import { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  Clock,
  Building2,
  Heart,
  MessageCircle,
  ExternalLink,
  Navigation,
  ShieldCheck,
  Phone,
  Star,
  Layers,
  Milestone,
} from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { createCustomMarkerElement } from "./map/mapcn-styles";
import { getMapLibre } from "../lib/maplibre";
import { fetchRoadRoute, type RouteResult } from "../lib/roadRouting";

const SIMULATION_MS = 25000;

function safeNum(v: any, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

function cleanPhone(p?: string): string {
  if (!p) return "";
  let digits = p.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (digits.startsWith("622") || digits.length < 9) return "";
  return digits;
}

export function LiveTrackingModal({
  donation,
  user,
  profile,
  onClose,
  onComplete,
  onRate,
}: any) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const courierMarkerRef = useRef<any>(null);

  const [data, setData] = useState<any>(donation);
  const [progress, setProgress] = useState(0);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(Boolean(donation.arrived_at));
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(donation.status === "completed");
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);

  const isDonor = user?.role === "donor" || user?.id === data.donor_id;

  const donorLat = safeNum(data.donor_lat ?? data.pickup_latitude, -7.7828);
  const donorLon = safeNum(data.donor_lon ?? data.pickup_longitude, 110.367);
  const recipientLat = safeNum(
    data.recipient_lat ??
      data.recipient_info?.lat ??
      (!isDonor ? (profile?.latitude ?? user?.latitude) : null),
    -7.8012
  );
  const recipientLon = safeNum(
    data.recipient_lon ??
      data.recipient_info?.lon ??
      (!isDonor ? (profile?.longitude ?? user?.longitude) : null),
    110.364
  );

  // Fetch latest donation status
  useEffect(() => {
    let cancelled = false;
    api
      .fetchJSON(`/api/donations/${donation.id}`)
      .then((d: any) => {
        if (cancelled) return;
        setData((prev: any) => ({ ...prev, ...d }));
        if (d.status === "completed") {
          setDone(true);
        }
        if (d.arrived_at) {
          setArrivalConfirmed(true);
          setProgress(1);
        } else if (d.claimed_at) {
          const elapsed = Date.now() - new Date(d.claimed_at).getTime();
          if (elapsed >= SIMULATION_MS) setProgress(1);
          else setProgress(Math.max(0, elapsed / SIMULATION_MS));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [donation.id]);

  // Movement animation
  useEffect(() => {
    if (arrivalConfirmed || done) {
      setProgress(1);
      return;
    }
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          clearInterval(timer);
          return 1;
        }
        return p + 0.006;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [arrivalConfirmed, done]);

  // Polling for completion
  useEffect(() => {
    if (done) return;
    const poll = setInterval(async () => {
      try {
        const d = await api.fetchJSON(`/api/donations/${donation.id}`);
        setData((prev: any) => ({ ...prev, ...d }));
        if (d.status === "completed") {
          setDone(true);
          clearInterval(poll);
          toast.success("Serah terima donasi berhasil diselesaikan!");
          setTimeout(() => {
            onComplete?.();
            onClose();
          }, 2000);
        } else if (d.arrived_at && !arrivalConfirmed) {
          setArrivalConfirmed(true);
          setProgress(1);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [done, donation.id, arrivalConfirmed, onComplete, onClose]);

  // Initialize Realistic MapLibre with Real Road Routing (OSRM Network)
  useEffect(() => {
    let cancelled = false;
    if (!mapContainerRef.current) return;

    Promise.all([
      getMapLibre(),
      fetchRoadRoute([recipientLat, recipientLon], [donorLat, donorLon]),
    ])
      .then(([maplibregl, route]) => {
        if (cancelled || !mapContainerRef.current) return;
        setRouteInfo(route);

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: [(donorLon + recipientLon) / 2, (donorLat + recipientLat) / 2],
          zoom: 13,
          pitch: 45,
          bearing: -15,
          attributionControl: false,
        });

        map.on("load", () => {
          mapRef.current = map;

          // Fit bounds to entire road route
          const bounds = new maplibregl.LngLatBounds();
          route.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 60, duration: 1000 });

          // Add Real Road Polyline Source
          map.addSource("road-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route.coordinates,
              },
            },
          });

          // Glow Layer (Realistic MapCN look)
          map.addLayer({
            id: "road-route-glow",
            type: "line",
            source: "road-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#2D7A4F",
              "line-width": 8,
              "line-opacity": 0.35,
              "line-blur": 3,
            },
          });

          // Core Road Line (Smooth Highway style)
          map.addLayer({
            id: "road-route-core",
            type: "line",
            source: "road-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#2D7A4F",
              "line-width": 4.5,
            },
          });

          // Donor Marker
          const donorEl = createCustomMarkerElement("donor", "Donatur (Pickup)");
          new maplibregl.Marker({ element: donorEl })
            .setLngLat([donorLon, donorLat])
            .addTo(map);

          // Recipient Marker
          const recipEl = createCustomMarkerElement("recipient", "Penerima");
          new maplibregl.Marker({ element: recipEl })
            .setLngLat([recipientLon, recipientLat])
            .addTo(map);

          // Courier Marker
          const startCoord = route.coordinates[0] || [recipientLon, recipientLat];
          const courierEl = createCustomMarkerElement("courier", "Penjemput");
          const cMarker = new maplibregl.Marker({ element: courierEl })
            .setLngLat(startCoord)
            .addTo(map);

          courierMarkerRef.current = cMarker;
        });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [donorLat, donorLon, recipientLat, recipientLon]);

  // Interpolate courier along real road geometry
  useEffect(() => {
    if (!courierMarkerRef.current || !routeInfo || routeInfo.coordinates.length < 2) return;
    const coords = routeInfo.coordinates;
    const totalSegments = coords.length - 1;
    const targetIdx = Math.min(totalSegments, Math.floor(progress * totalSegments));
    const nextIdx = Math.min(totalSegments, targetIdx + 1);
    const segmentProgress = (progress * totalSegments) - targetIdx;

    const currentCoord = coords[targetIdx];
    const nextCoord = coords[nextIdx];

    const curLng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * segmentProgress;
    const curLat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * segmentProgress;

    courierMarkerRef.current.setLngLat([curLng, curLat]);
  }, [progress, routeInfo]);

  const handleConfirmArrival = async () => {
    setConfirming(true);
    try {
      await api.fetchJSON(`/api/donations/${donation.id}/arrived`, {
        method: "POST",
      });
      setArrivalConfirmed(true);
      setProgress(1);
      toast.success("Kedatangan di lokasi donatur berhasil dikonfirmasi!");
    } catch (err: any) {
      toast.error(err.message || "Gagal konfirmasi kedatangan");
    } finally {
      setConfirming(false);
    }
  };

  const handleCompleteHandover = async () => {
    setConfirming(true);
    try {
      await api.fetchJSON(`/api/donations/${donation.id}/complete`, {
        method: "POST",
      });
      setDone(true);
      toast.success("Serah terima makanan selesai dikonfirmasi!");
      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyelesaikan serah terima");
    } finally {
      setConfirming(false);
    }
  };

  const arrived = arrivalConfirmed || progress >= 1;
  const donorPhoneClean = cleanPhone(data.donor_phone);
  const recipientPhoneClean = cleanPhone(data.recipient_phone);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 my-auto">
        {/* Header */}
        <div
          className={`p-4 sm:p-5 flex justify-between items-center text-white transition-colors ${
            done ? "bg-[#2D7A4F]" : arrived ? "bg-[#1565C0]" : "bg-emerald-800"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/20">
                <Navigation size={16} />
              </span>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {done
                  ? "Donasi Selesai Diserahkan"
                  : arrived
                  ? "Penjemput Telah Tiba di Lokasi Donatur"
                  : "Pelacakan Rute Jalan Nyata (OSRM Road Network)"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/80">
              {data.food_name} • {data.portion_count || 0} Porsi • Metode: Penjemputan Langsung
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Coordination Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-stone-50 border-b border-stone-200 text-xs">
          {/* Donor Info (Pickup Point) */}
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Building2 size={13} className="text-emerald-600" /> Titik Penjemputan (Donatur)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                Pickup Location
              </span>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                {data.donor_name || "Donatur Mitra"}
              </h4>
              <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                {data.donor_address || "Alamat penjemputan tertera pada pin peta donatur."}
              </p>
            </div>
            {donorPhoneClean ? (
              <a
                href={`https://wa.me/${donorPhoneClean}?text=${encodeURIComponent(
                  `Halo ${data.donor_name || "Bapak/Ibu"}, kami dari pihak penerima ${data.recipient_name || ""} ingin berkoordinasi terkait jadwal penjemputan donasi "${data.food_name}" di NutriShare.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
              >
                <MessageCircle size={13} /> Chat Donatur via WhatsApp <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <Phone size={12} /> Kontak via hotline operasional NutriShare
              </span>
            )}
          </div>

          {/* Recipient Info */}
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Heart size={13} className="text-blue-600" /> Pihak Penjemput (Penerima)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                Self-Pickup Party
              </span>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                {data.recipient_name || "Lembaga Penerima Manfaat"}
              </h4>
              <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                {data.recipient_address || "Alamat panti asuhan/yayasan terdaftar."}
              </p>
            </div>
            {recipientPhoneClean ? (
              <a
                href={`https://wa.me/${recipientPhoneClean}?text=${encodeURIComponent(
                  `Halo pengurus ${data.recipient_name || ""}, kami dari pihak donatur ${data.donor_name || ""} menginfokan bahwa paket donasi "${data.food_name}" sudah siap untuk diambil.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
              >
                <MessageCircle size={13} /> Chat Penjemput via WhatsApp <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <ShieldCheck size={12} /> Terverifikasi Resmi oleh NutriShare
              </span>
            )}
          </div>
        </div>

        {/* Realistis Map Container (MapCN + OSRM Road Geometry) */}
        <div className="h-[45vh] sm:h-[50vh] w-full bg-stone-100 relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Road distance badge */}
          {routeInfo && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-200 shadow-md flex items-center gap-2 text-xs font-bold text-gray-800">
              <Milestone size={15} className="text-[#2D7A4F]" />
              <span>Jarak Jalan: {routeInfo.distanceKm} km (~{routeInfo.durationMin} mnt)</span>
            </div>
          )}

          {/* Map style badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/60 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
            <Layers size={13} className="text-emerald-700" /> MapCN 3D Vector Jalan
          </div>

          {/* Floating Progress Pill */}
          {!done && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-stone-200 flex items-center gap-3">
              <div className="bg-stone-200 w-28 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D7A4F] transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="font-bold text-[#2D7A4F] text-xs whitespace-nowrap">
                {arrived ? "Tiba di Lokasi" : `${(progress * 100).toFixed(0)}% Perjalanan`}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200">
          {!arrived && !done && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <div className="text-xs text-amber-900 space-y-0.5">
                <p className="font-bold text-sm">
                  {isDonor ? "Menunggu Penjemput Tiba di Lokasi" : "Sedang Menuju ke Lokasi Donatur"}
                </p>
                <p className="text-amber-800">
                  {isDonor
                    ? "Pihak penerima sedang bergerak mengikuti rute jalan menuju resto/hotel Anda."
                    : "Jika Anda sudah sampai di resto/hotel donatur, klik tombol konfirmasi di samping."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmArrival}
                disabled={confirming}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {confirming ? (
                  <>
                    <Clock size={15} className="animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} /> Konfirmasi Tiba di Lokasi
                  </>
                )}
              </button>
            </div>
          )}

          {arrived && !done && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div className="text-xs text-emerald-950 space-y-0.5">
                <p className="font-bold text-sm flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle size={16} className="text-emerald-600" />
                  Penjemput Telah Sampai di Titik Pickup!
                </p>
                <p className="text-emerald-800">
                  {isDonor
                    ? "Silakan serahkan makanan kepada penjemput dan klik tombol di samping untuk menyelesaikan donasi."
                    : "Pihak donatur akan menyerahkan makanan dan mengonfirmasi serah terima di aplikasi."}
                </p>
              </div>

              {isDonor ? (
                <button
                  type="button"
                  onClick={handleCompleteHandover}
                  disabled={confirming}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {confirming ? (
                    <>
                      <Clock size={15} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Konfirmasi Serah Terima Selesai
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[11px] font-bold text-emerald-700 px-3 py-1.5 rounded-xl bg-white border border-emerald-200">
                  Menunggu Donatur Mengonfirmasi Serah Terima...
                </div>
              )}
            </div>
          )}

          {done && (
            <div className="text-center py-2 space-y-2">
              <CheckCircle size={32} className="mx-auto text-[#2D7A4F]" />
              <h4 className="font-bold text-stone-900 text-sm">
                Serah Terima Selesai!
              </h4>
              <p className="text-xs text-stone-500">
                Makanan telah berhasil diserahkan kepada pihak {data.recipient_name || "penerima"}.
              </p>
              {!isDonor && onRate && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRate(data);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Star size={14} className="fill-white" /> Beri Penilaian & Ulasan untuk Donatur
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

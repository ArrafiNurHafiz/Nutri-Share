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
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { createCustomMarkerElement } from "./map/mapcn-styles";
import { getMapLibre } from "../lib/maplibre";
import { fetchRoundTripRoadRoute, type RoundTripRouteResult } from "../lib/roadRouting";

const SIMULATION_MS = 30000;

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
  const [routeInfo, setRouteInfo] = useState<RoundTripRouteResult | null>(null);

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
          setProgress(1);
        } else if (d.arrived_at) {
          setArrivalConfirmed(true);
          // When arrived_at is set, progress is at least 0.5 (at donor location)
          setProgress((prev) => Math.max(0.5, prev));
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

  // Movement animation along full round-trip route (Recipient -> Donor -> Recipient)
  useEffect(() => {
    if (done) {
      setProgress(1);
      return;
    }
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          clearInterval(timer);
          return 1;
        }
        return p + 0.005;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [done]);

  // Polling for completion and realtime updates
  useEffect(() => {
    if (done) return;
    const poll = setInterval(async () => {
      try {
        const d = await api.fetchJSON(`/api/donations/${donation.id}`);
        setData((prev: any) => ({ ...prev, ...d }));
        if (d.status === "completed") {
          setDone(true);
          setProgress(1);
          clearInterval(poll);
          toast.success("Donasi telah selesai dan makanan berhasil diterima!");
          setTimeout(() => {
            onComplete?.();
            onClose();
          }, 2000);
        } else if (d.arrived_at && !arrivalConfirmed) {
          setArrivalConfirmed(true);
          setProgress((prev) => Math.max(0.5, prev));
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [done, donation.id, arrivalConfirmed, onComplete, onClose]);

  // Initialize MapLibre with Round-Trip Road Geometry (OSRM Road Network)
  useEffect(() => {
    let cancelled = false;
    if (!mapContainerRef.current) return;

    Promise.all([
      getMapLibre(),
      fetchRoundTripRoadRoute([recipientLat, recipientLon], [donorLat, donorLon]),
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

          // Fit bounds to full round-trip route
          const bounds = new maplibregl.LngLatBounds();
          route.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 60, duration: 1000 });

          // Add Full Round-Trip Road Polyline Source
          map.addSource("round-trip-route", {
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

          // Glow Layer (Realistic Look)
          map.addLayer({
            id: "round-trip-glow",
            type: "line",
            source: "round-trip-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#2D7A4F",
              "line-width": 9,
              "line-opacity": 0.3,
              "line-blur": 3,
            },
          });

          // Core Road Line
          map.addLayer({
            id: "round-trip-core",
            type: "line",
            source: "round-trip-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#2D7A4F",
              "line-width": 4.5,
            },
          });

          // Donor Marker (Pickup Point)
          const donorEl = createCustomMarkerElement("donor", "Donor (Titik Ambil Makanan)");
          new maplibregl.Marker({ element: donorEl })
            .setLngLat([donorLon, donorLat])
            .addTo(map);

          // Recipient Marker (Origin & Destination)
          const recipEl = createCustomMarkerElement("recipient", "Penerima (Titik Awal & Tujuan Akhir)");
          new maplibregl.Marker({ element: recipEl })
            .setLngLat([recipientLon, recipientLat])
            .addTo(map);

          // Courier Marker (Moving Agent)
          const startCoord = route.coordinates[0] || [recipientLon, recipientLat];
          const courierEl = createCustomMarkerElement("courier", "Kurir Penjemput");
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

  // Interpolate courier along full round trip geometry
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

  // Recipient confirms arrival at donor pickup point
  const handleConfirmArrival = async () => {
    setConfirming(true);
    try {
      await api.fetchJSON(`/api/donations/${donation.id}/arrived`, {
        method: "POST",
      });
      setArrivalConfirmed(true);
      setProgress((p) => Math.max(0.5, p));
      toast.success("Konfirmasi tiba di lokasi donor berhasil!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengonfirmasi kedatangan di donor");
    } finally {
      setConfirming(false);
    }
  };

  // Recipient confirms delivery complete (food safely arrived at recipient)
  const handleCompleteDelivery = async () => {
    setConfirming(true);
    try {
      await api.fetchJSON(`/api/donations/${donation.id}/complete`, {
        method: "POST",
      });
      setDone(true);
      setProgress(1);
      toast.success("Donasi berhasil diselesaikan! Makanan telah diterima.");
      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyelesaikan donasi");
    } finally {
      setConfirming(false);
    }
  };

  // Calculate current stage
  const isOutbound = progress < 0.5 && !arrivalConfirmed;
  const isAtDonor = (arrivalConfirmed || Math.abs(progress - 0.5) < 0.05) && progress < 0.85;
  const isReturning = progress >= 0.5 && progress < 1.0;
  const isArrivedBack = progress >= 1.0 || done;

  const donorPhoneClean = cleanPhone(data.donor_phone);
  const recipientPhoneClean = cleanPhone(data.recipient_phone);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 my-auto">
        {/* Header with Phase Color */}
        <div
          className={`p-4 sm:p-5 flex justify-between items-center text-white transition-colors ${
            done
              ? "bg-[#2D7A4F]"
              : isArrivedBack
              ? "bg-emerald-700"
              : isReturning
              ? "bg-indigo-700"
              : isAtDonor
              ? "bg-blue-700"
              : "bg-amber-700"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/20">
                <Navigation size={16} />
              </span>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {done
                  ? "Donasi Selesai — Makanan Diterima di Penerima"
                  : isArrivedBack
                  ? "Kurir Tiba Kembali di Lokasi Penerima"
                  : isReturning
                  ? "Kurir Sedang Membawa Makanan Kembali ke Penerima"
                  : isAtDonor
                  ? "Kurir Tiba di Lokasi Donor (Serah Terima Makanan)"
                  : "Kurir Berangkat dari Penerima Menuju Lokasi Donor"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2 flex-wrap">
              <span>{data.food_name} • {data.portion_count || 0} Porsi</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold">
                <RotateCcw size={13} /> Rute PP: Penerima ➔ Donor ➔ Penerima
              </span>
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

        {/* Journey Step Indicator */}
        <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-200 grid grid-cols-3 gap-2 text-[11px] font-semibold">
          <div
            className={`flex items-center gap-1.5 p-2 rounded-xl transition-all ${
              isOutbound
                ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                : progress >= 0.5 || arrivalConfirmed
                ? "bg-emerald-50 text-emerald-800"
                : "text-stone-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0">1</span>
            <span className="truncate">Berangkat ke Donor</span>
          </div>

          <div
            className={`flex items-center gap-1.5 p-2 rounded-xl transition-all ${
              isAtDonor && !done
                ? "bg-blue-100 text-blue-900 border border-blue-300 font-bold"
                : progress > 0.6 || done
                ? "bg-emerald-50 text-emerald-800"
                : "text-stone-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0">2</span>
            <span className="truncate">Ambil di Donor</span>
          </div>

          <div
            className={`flex items-center gap-1.5 p-2 rounded-xl transition-all ${
              (isReturning || isArrivedBack) && !done
                ? "bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold"
                : done
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold"
                : "text-stone-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0">3</span>
            <span className="truncate">Kembali ke Penerima</span>
          </div>
        </div>

        {/* Coordination Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-stone-50 border-b border-stone-200 text-xs">
          {/* Recipient Info (Origin & Final Destination) */}
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Heart size={13} className="text-blue-600" /> Pihak Penerima (Titik Awal & Akhir)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                Kurir / Penjemput
              </span>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                {data.recipient_name || "Panti Asuhan / Shelter Penerima"}
              </h4>
              <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                {data.recipient_address || "Alamat shelter terdaftar penerima."}
              </p>
            </div>
            {recipientPhoneClean ? (
              <a
                href={`https://wa.me/${recipientPhoneClean}?text=${encodeURIComponent(
                  `Halo tim ${data.recipient_name || ""}, ini dari pihak donor ${data.donor_name || ""}. Paket donasi "${data.food_name}" siap diambil.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
              >
                <MessageCircle size={13} /> Chat WhatsApp Penerima <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <ShieldCheck size={12} /> Terverifikasi oleh NutriShare
              </span>
            )}
          </div>

          {/* Donor Info (Pickup Point) */}
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Building2 size={13} className="text-emerald-600" /> Lokasi Donor (Titik Ambil)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                Titik Ambil Makanan
              </span>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm">
                {data.donor_name || "Mitra Donor"}
              </h4>
              <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                {data.donor_address || "Alamat pengambilan makanan donor."}
              </p>
            </div>
            {donorPhoneClean ? (
              <a
                href={`https://wa.me/${donorPhoneClean}?text=${encodeURIComponent(
                  `Halo ${data.donor_name || "Mitra"}, kami dari ${data.recipient_name || "Penerima"} sedang melakukan penjemputan donasi "${data.food_name}".`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
              >
                <MessageCircle size={13} /> Chat WhatsApp Donor <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <Phone size={12} /> Hubungi via Bantuan NutriShare
              </span>
            )}
          </div>
        </div>

        {/* Map Container (MapLibre + OSRM Real Road Geometry) */}
        <div className="h-[42vh] sm:h-[48vh] w-full bg-stone-100 relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Road Distance & Round-Trip Info Badge */}
          {routeInfo && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-200 shadow-md flex items-center gap-2 text-xs font-bold text-gray-800">
              <Milestone size={15} className="text-[#2D7A4F]" />
              <span>
                Total Rute PP: {routeInfo.totalDistanceKm} km (~{routeInfo.totalDurationMin} menit)
              </span>
            </div>
          )}

          {/* Map Style Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/60 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
            <Layers size={13} className="text-emerald-700" /> Rute Pulang-Pergi 3D
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
                {isArrivedBack
                  ? "Tiba Kembali di Penerima (100%)"
                  : isReturning
                  ? `Perjalanan Pulang (${(progress * 100).toFixed(0)}%)`
                  : isAtDonor
                  ? "Tiba di Lokasi Donor (50%)"
                  : `Menuju Donor (${(progress * 100).toFixed(0)}%)`}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200">
          {/* Phase 1: Courier heading to donor */}
          {isOutbound && !done && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <div className="text-xs text-amber-900 space-y-0.5">
                <p className="font-bold text-sm">
                  {isDonor ? "Kurir Penerima Sedang Menuju ke Lokasi Anda" : "Kurir Sedang Menuju ke Lokasi Donor"}
                </p>
                <p className="text-amber-800">
                  {isDonor
                    ? "Kurir penjemput berangkat dari panti asuhan/shelter menuju lokasi Anda untuk mengambil donasi."
                    : "Jika kurir telah sampai di lokasi donor, klik tombol untuk mengonfirmasi tiba di titik penjemputan."}
                </p>
              </div>

              {!isDonor && (
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
                      <CheckCircle size={15} /> Konfirmasi Tiba di Donor
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Phase 2: At Donor Pickup */}
          {isAtDonor && !done && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <div className="text-xs text-blue-950 space-y-0.5">
                <p className="font-bold text-sm flex items-center gap-1.5 text-blue-900">
                  <CheckCircle size={16} className="text-blue-600" />
                  Kurir Telah Tiba di Lokasi Donor!
                </p>
                <p className="text-blue-800">
                  {isDonor
                    ? "Kurir telah tiba. Silakan serahkan paket makanan surplus kepada kurir penjemput."
                    : "Makanan diambil dari donor. Kurir membawa makanan kembali ke lokasi panti asuhan/shelter."}
                </p>
              </div>

              {!isDonor && (
                <button
                  type="button"
                  onClick={handleCompleteDelivery}
                  disabled={confirming}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {confirming ? (
                    <>
                      <Clock size={15} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Konfirmasi Selesai & Diterima
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Phase 3 & 4: Returning to Shelter / Arrived at Recipient */}
          {(isReturning || isArrivedBack) && !done && !isAtDonor && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <div className="text-xs text-emerald-950 space-y-0.5">
                <p className="font-bold text-sm flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle size={16} className="text-emerald-600" />
                  {isArrivedBack
                    ? "Makanan Telah Tiba di Lokasi Penerima!"
                    : "Kurir Membawa Makanan Kembali Menuju Penerima"}
                </p>
                <p className="text-emerald-800">
                  {isDonor
                    ? "Kurir sedang membawa makanan kembali ke shelter. Menunggu konfirmasi penerimaan oleh penerima."
                    : "Pastikan kondisi dan porsi makanan sesuai, lalu klik konfirmasi untuk menyelesaikan donasi."}
                </p>
              </div>

              {!isDonor ? (
                <button
                  type="button"
                  onClick={handleCompleteDelivery}
                  disabled={confirming}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D7A4F] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {confirming ? (
                    <>
                      <Clock size={15} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Konfirmasi Makanan Diterima & Selesai
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[11px] font-bold text-emerald-700 px-3 py-1.5 rounded-xl bg-white border border-emerald-200">
                  Menunggu Konfirmasi Selesai oleh Penerima...
                </div>
              )}
            </div>
          )}

          {/* Phase 5: Completed */}
          {done && (
            <div className="text-center py-2 space-y-2">
              <CheckCircle size={32} className="mx-auto text-[#2D7A4F]" />
              <h4 className="font-bold text-stone-900 text-sm">
                Donasi Selesai & Berhasil Didistribusikan!
              </h4>
              <p className="text-xs text-stone-500">
                Makanan surplus telah diterima oleh {data.recipient_name || "penerima"} dan tercatat di riwayat nutrisi.
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
                    <Star size={14} className="fill-white" /> Beri Ulasan & Rating Donor
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

import { useState, useEffect, Component, type ReactNode } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import {
  X,
  CheckCircle,
  Clock,
  MapPin,
  Building2,
  Heart,
  MessageCircle,
  ExternalLink,
  Navigation,
  ShieldCheck,
  Phone,
  Star,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "../lib/mapIcons";
import { donorIcon, recipientIcon, courierIcon } from "../lib/mapIcons";
import { api } from "../lib/api";
import toast from "react-hot-toast";

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
  return digits;
}

export function LiveTrackingModal({
  donation,
  user,
  onClose,
  onComplete,
  onRate,
}: any) {
  const [data, setData] = useState<any>(donation);
  const [progress, setProgress] = useState(0);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(Boolean(donation.arrived_at));
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(donation.status === "completed");
  const [hasMapError, setHasMapError] = useState(false);

  const isDonor = user?.id === data.donor_id;

  const donorLat = safeNum(
    data.donor_lat || data.pickup_latitude,
    -7.797068,
  );
  const donorLon = safeNum(
    data.donor_lon || data.pickup_longitude,
    110.370529,
  );
  const recipientLat = safeNum(data.recipient_lat, donorLat + 0.015);
  const recipientLon = safeNum(data.recipient_lon, donorLon + 0.015);

  // Fetch latest donation info with enriched profiles
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

  // Smooth movement animation
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

  // Polling for status updates
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

  const getLat = () => donorLat + (recipientLat - donorLat) * progress;
  const getLon = () => donorLon + (recipientLon - donorLon) * progress;

  const center: [number, number] = [
    (donorLat + recipientLat) / 2,
    (donorLon + recipientLon) / 2,
  ];

  // Action: Confirm arrival at donor pickup point
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

  // Action: Donor confirms complete handover
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
            done
              ? "bg-[#2D7A4F]"
              : arrived
                ? "bg-[#1565C0]"
                : "bg-emerald-800"
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
                    : "Proses Penjemputan Mandiri (Self-Pickup)"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/80">
              {data.food_name} • {data.portion_count || 0} Porsi • Metode: Penjemputan Langsung oleh Penerima
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

        {/* Coordination & Contact Details Card */}
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

          {/* Recipient Info (Picking-up Party) */}
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

        {/* Map Container */}
        <div className="h-[45vh] sm:h-[50vh] w-full bg-stone-100 relative">
          {hasMapError ? (
            <div className="h-full w-full flex items-center justify-center text-center p-6 bg-slate-50">
              <div>
                <MapPin className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="font-bold text-slate-700">Peta koordinat sedang disegarkan</p>
              </div>
            </div>
          ) : (
            <ErrorBoundaryWrapper onError={() => setHasMapError(true)}>
              <MapContainer
                center={center}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  referrerPolicy="origin"
                />

                <Marker position={[donorLat, donorLon]} icon={donorIcon}>
                  <Popup>
                    <div className="text-xs">
                      <b className="text-emerald-800">{data.donor_name || "Lokasi Donatur"}</b>
                      <p className="text-gray-600 mt-0.5">Titik Penjemputan Makanan</p>
                    </div>
                  </Popup>
                </Marker>

                <Marker
                  position={[recipientLat, recipientLon]}
                  icon={recipientIcon}
                >
                  <Popup>
                    <div className="text-xs">
                      <b className="text-blue-800">{data.recipient_name || "Lokasi Penerima"}</b>
                      <p className="text-gray-600 mt-0.5">Tujuan Distribusi Panti/Yayasan</p>
                    </div>
                  </Popup>
                </Marker>

                <Polyline
                  positions={[
                    [donorLat, donorLon],
                    [recipientLat, recipientLon],
                  ]}
                  color="#2D7A4F"
                  weight={4}
                  dashArray="6, 8"
                  opacity={0.7}
                />

                {!done && (
                  <Marker
                    position={[getLat(), getLon()]}
                    icon={courierIcon}
                    zIndexOffset={1000}
                  >
                    <Popup>
                      <div className="text-xs">
                        <b>Penjemput: {data.recipient_name || "Perwakilan Panti"}</b>
                        <br />
                        {(progress * 100).toFixed(0)}% Perjalanan
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </ErrorBoundaryWrapper>
          )}

          {/* Floating Progress Pill */}
          {!done && !hasMapError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-stone-200 flex items-center gap-3">
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

        {/* Action Footer Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200">
          {!arrived && !done && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <div className="text-xs text-amber-900 space-y-0.5">
                <p className="font-bold text-sm">
                  {isDonor ? "Menunggu Penjemput Tiba di Lokasi" : "Sedang Menuju ke Lokasi Donatur"}
                </p>
                <p className="text-amber-800">
                  {isDonor
                    ? "Pihak penerima sedang menuju ke tempat Anda untuk mengambil makanan."
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

class ErrorBoundaryWrapper extends Component<{
  children: ReactNode;
  onError: () => void;
}> {
  componentDidCatch() {
    (this as any).props.onError();
  }
  render() {
    return (this as any).props.children;
  }
}

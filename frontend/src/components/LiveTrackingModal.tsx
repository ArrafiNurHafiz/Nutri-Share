import { useState, useEffect, Component, type ReactNode } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { X, CheckCircle, Clock, MapPin, Hand } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "../lib/mapIcons";
import { donorIcon, recipientIcon, courierIcon } from "../lib/mapIcons";
import { api } from "../lib/api";
import toast from "react-hot-toast";

const SIMULATION_MS = 30000;

function safeNum(v: any, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

export function LiveTrackingModal({
  donation,
  user,
  onClose,
  onComplete,
}: any) {
  const [progress, setProgress] = useState(0);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);

  const isDonor = user?.id === donation.donor_id;

  const donorLat = safeNum(
    donation.donor_lat || donation.pickup_latitude,
    -7.797068,
  );
  const donorLon = safeNum(
    donation.donor_lon || donation.pickup_longitude,
    110.370529,
  );
  const recipientLat = safeNum(donation.recipient_lat, donorLat + 0.015);
  const recipientLon = safeNum(donation.recipient_lon, donorLon + 0.015);

  useEffect(() => {
    let cancelled = false;
    api
      .fetchJSON(`/api/donations/${donation.id}`)
      .then((d: any) => {
        if (cancelled) return;
        if (d.status === "completed") {
          setDone(true);
          return;
        }
        if (d.claimed_at) {
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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (isDonor || done) return;
    const poll = setInterval(async () => {
      try {
        const d = await api.fetchJSON(`/api/donations/${donation.id}`);
        if (d.status === "completed") {
          setDone(true);
          clearInterval(poll);
          toast.success("Donor has confirmed the handover!");
          setTimeout(() => {
            onComplete?.();
            onClose();
          }, 2000);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [isDonor, done, donation.id, onComplete, onClose]);

  const getLat = () => donorLat + (recipientLat - donorLat) * progress;
  const getLon = () => donorLon + (recipientLon - donorLon) * progress;

  const center: [number, number] = [
    (donorLat + recipientLat) / 2,
    (donorLon + recipientLon) / 2,
  ];

  const handleConfirmArrival = async () => {
    setConfirming(true);
    try {
      await api.fetchJSON(`/api/donations/${donation.id}/complete`, {
        method: "POST",
      });
      setDone(true);
      toast.success("Handover successfully confirmed!");
      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  const arrived = progress >= 1;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        <div
          className={`p-5 border-b flex justify-between items-center ${
            done
              ? "bg-[#2D7A4F]"
              : arrived && !arrivalConfirmed
                ? "bg-[#E65100]"
                : arrived
                  ? "bg-[#1565C0]"
                  : "bg-[#2D7A4F]"
          } text-white`}
        >
          <div>
            <div className="flex items-center gap-2">
              {done ? (
                <CheckCircle size={20} />
              ) : (
                <span
                  className={`w-2 h-2 ${arrived ? "bg-green-400" : "bg-red-400"} rounded-full ${!arrived ? "animate-pulse" : ""}`}
                ></span>
              )}
              <h3 className="font-bold text-lg leading-tight">
                {done
                  ? "Delivery Complete"
                  : arrived && !arrivalConfirmed
                    ? "Courier Has Arrived"
                    : arrived
                      ? "Awaiting Handover Confirmation"
                      : "Live Tracking Delivery"}
              </h3>
            </div>
            <p className="text-sm opacity-80 mt-1">{donation.food_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="h-[60vh] w-full bg-gray-100 relative">
          {hasMapError ? (
            <div className="h-full w-full flex items-center justify-center text-center p-6 bg-slate-50">
              <div>
                <MapPin className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="font-bold text-slate-700">Map unavailable</p>
                <p className="text-xs text-slate-500 mt-1">
                  Location coordinates are currently being refreshed.
                </p>
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
                    <b>{donation.donor_name || "Donor Location"}</b>
                    <br />
                    Pickup Point
                  </Popup>
                </Marker>

                <Marker
                  position={[recipientLat, recipientLon]}
                  icon={recipientIcon}
                >
                  <Popup>
                    <b>{donation.recipient_name || "Recipient Location"}</b>
                    <br />
                    Destination
                  </Popup>
                </Marker>

                <Polyline
                  positions={[
                    [donorLat, donorLon],
                    [recipientLat, recipientLon],
                  ]}
                  color="#2D7A4F"
                  weight={4}
                  dashArray="8, 8"
                  opacity={0.6}
                />

                {!done && (
                  <Marker
                    position={[getLat(), getLon()]}
                    icon={courierIcon}
                    zIndexOffset={1000}
                  >
                    <Popup>
                      NUTRI-SHARE Courier
                      <br />
                      {(progress * 100).toFixed(0)}% Journey Complete
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </ErrorBoundaryWrapper>
          )}

          {!done && !hasMapError && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100 flex items-center gap-4">
              <div className="bg-gray-100 w-32 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D7A4F]"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              <span className="font-bold text-[#2D7A4F] text-sm whitespace-nowrap">
                {(progress * 100).toFixed(0)}% Complete
              </span>
            </div>
          )}
        </div>

        {arrived && !done && !arrivalConfirmed && (
          <div className="p-5 bg-[#FFF3E0] border-t border-[#FFB74D]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#E65100] mt-1 shrink-0" size={24} />
                <div>
                  <p className="font-bold text-[#E65100] text-lg">
                    Courier has arrived at destination
                  </p>
                  <p className="text-sm text-gray-600">
                    {donation.recipient_name || "Recipient"}
                  </p>
                  {isDonor ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Confirm that the courier has arrived
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Waiting for donor to confirm courier arrival...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {isDonor && (
                  <button
                    onClick={async () => {
                      try {
                        await api.fetchJSON(
                          `/api/donations/${donation.id}/arrived`,
                          { method: "POST" },
                        );
                        setArrivalConfirmed(true);
                      } catch (err: any) {
                        toast.error(err.message || "Failed to confirm arrival");
                      }
                    }}
                    className="bg-[#E65100] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-md transition-all"
                  >
                    <Hand size={18} /> Confirm Arrival
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {arrived && arrivalConfirmed && !done && (
          <div className="p-5 bg-[#F0F8FF] border-t border-[#90CAF9]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="text-[#2D7A4F] mt-1 shrink-0"
                  size={24}
                />
                <div>
                  <p className="font-bold text-[#1565C0] text-lg">
                    Arrival has been confirmed
                  </p>
                  <p className="text-sm text-gray-600">
                    {donation.recipient_name || "Recipient"}
                  </p>
                  {isDonor ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Confirm to complete the delivery
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Waiting for donor to confirm handover...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {isDonor && (
                  <button
                    onClick={handleConfirmArrival}
                    disabled={confirming}
                    className="bg-[#2D7A4F] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-md transition-all disabled:opacity-50"
                  >
                    {confirming ? (
                      <>
                        <Clock size={18} className="animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Confirm Complete
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {done && (
          <div className="p-5 bg-[#E8F5E9] border-t border-[#52C77F] text-center">
            <CheckCircle size={40} className="mx-auto text-[#2D7A4F] mb-2" />
            <p className="font-bold text-[#2D7A4F] text-lg">
              Handover successful!
            </p>
            <p className="text-sm text-gray-600">
              Donation has been successfully delivered to{" "}
              {donation.recipient_name}
            </p>
          </div>
        )}
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

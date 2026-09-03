import { memo, useState, useEffect, Component, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { recipientIcon, donorIcon } from "../../lib/mapIcons";

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
  const lat = safeNum(profile?.latitude);
  const lng = safeNum(profile?.longitude);
  const hasLocation =
    lat !== null &&
    lng !== null &&
    Math.abs(lat) > 0.01 &&
    Math.abs(lng) > 0.01;

  if (!hasLocation) return null;

  const validDonors = mapData.donors.filter(
    (d: any) => safeNum(d.latitude) && safeNum(d.longitude),
  );

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        referrerPolicy="origin"
      />
      <Marker position={[lat, lng]} icon={recipientIcon}>
        <Popup>
          <b>{profile?.institution_name || "You"}</b>
        </Popup>
      </Marker>
      {validDonors.map((donor: any) => (
        <Marker
          key={donor.id}
          position={[Number(donor.latitude), Number(donor.longitude)]}
          icon={donorIcon}
        >
          <Popup>
            <b>{donor.business_name}</b>
          </Popup>
        </Marker>
      ))}
      {activeDonations
        .filter((d: any) => d.rank === 1)
        .map((d: any) => {
          const donorInfo = validDonors.find(
            (p: any) => p.user_id === d.donor_id,
          );
          if (!donorInfo) return null;
          const dl = safeNum(donorInfo.latitude);
          const dn = safeNum(donorInfo.longitude);
          return dl !== null && dn !== null ? (
            <Polyline
              key={`l-${d.id}`}
              positions={[
                [lat, lng],
                [dl, dn],
              ]}
              color="#10b981"
              weight={3}
              dashArray="5, 10"
            />
          ) : null;
        })}
    </MapContainer>
  );
}

const MapInnerMemo = memo(MapInner);

export function MapView(props: Props) {
  const [hasError, setHasError] = useState(false);
  const lat = safeNum(props.profile?.latitude);
  const lng = safeNum(props.profile?.longitude);
  const hasLocation =
    lat !== null &&
    lng !== null &&
    Math.abs(lat) > 0.01 &&
    Math.abs(lng) > 0.01;

  useEffect(() => {
    setHasError(false);
  }, [lat, lng]);

  if (!hasLocation || hasError) {
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
            Set your location in Profile to see the map.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="relative bg-white rounded-2xl overflow-hidden border border-[var(--border-primary)]"
      style={{ height: "450px" }}
    >
      <ErrorBoundaryWrapper onError={() => setHasError(true)}>
        <MapInnerMemo {...props} />
      </ErrorBoundaryWrapper>
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md hover:bg-white transition-colors border border-white/50">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md hover:bg-white transition-colors border border-white/50">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 12H4"
            />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 max-w-xs shadow-xl">
        <h4 className="font-bold text-brand-dark mb-1 text-sm">
          Nearby Donations
        </h4>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          {
            props.mapData.donors.filter(
              (d: any) => safeNum(d.latitude) && safeNum(d.longitude),
            ).length
          }{" "}
          active pickups available.
        </p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-medium" />
          <span className="text-xs font-medium text-brand-dark">
            Recipients
          </span>
          <div className="w-3 h-3 rounded-full bg-brand-dark ml-4" />
          <span className="text-xs font-medium text-brand-dark">Donors</span>
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

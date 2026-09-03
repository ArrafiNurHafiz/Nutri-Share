import { motion } from "motion/react";
import { Truck, MapPin, CheckCircle } from "lucide-react";

interface Props {
  transitDonations: any[];
  onArrived: (id: number) => void;
}

export function TransitSection({ transitDonations, onArrived }: Props) {
  const arrived = transitDonations.filter((d: any) => d.arrived_at);
  const pending = transitDonations.filter((d: any) => !d.arrived_at);

  if (transitDonations.length === 0) return null;

  return (
    <div className="space-y-4">
      {arrived.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-accent/30 overflow-hidden shadow-sm"
        >
          <div className="p-4 bg-gradient-to-r from-accent/5 to-white flex items-center justify-between">
            <h3 className="font-bold text-accent flex items-center gap-2 text-sm">
              <MapPin size={16} /> Courier Has Arrived
            </h3>
            <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
              {arrived.length}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {arrived.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-brand-dark">
                    {d.food_name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    From: {d.donor_name}
                  </p>
                </div>
                <span className="bg-brand-medium/10 text-brand-medium text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <CheckCircle size={14} /> Confirmed
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {pending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-brand-medium/20 overflow-hidden shadow-sm"
        >
          <div className="p-4 bg-gradient-to-r from-brand-medium/5 to-white flex items-center justify-between">
            <h3 className="font-bold text-brand-medium flex items-center gap-2 text-sm">
              <Truck size={16} /> In Transit
            </h3>
            <span className="bg-brand-medium/10 text-brand-medium text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {pending.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-brand-dark">
                    {d.food_name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    From: {d.donor_name}
                  </p>
                </div>
                <button
                  onClick={() => onArrived(d.id)}
                  className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-600 transition-all"
                >
                  Confirm Arrival
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

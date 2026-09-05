import { motion } from "motion/react";
import { Truck, MapPin, CheckCircle, Navigation, Clock } from "lucide-react";

interface Props {
  transitDonations: any[];
  onArrived: (id: number) => void;
}

export function TransitSection({ transitDonations, onArrived }: Props) {
  const arrived = transitDonations.filter((d: any) => d.arrived_at);
  const pending = transitDonations.filter((d: any) => !d.arrived_at);

  if (transitDonations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-gradient-to-r from-surface-container-low to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Truck size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
              Logistics Activity Feed
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              {transitDonations.length} active delivery events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* Vertical Activity Feed with Max Height & Internal Scroll */}
      <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
        {/* Arrived Couriers */}
        {arrived.map((d: any) => (
          <motion.div
            key={`arrived-${d.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white flex flex-col gap-2.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-brand-dark truncate">
                    {d.food_name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    From: <span className="font-semibold">{d.donor_name}</span>
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle size={11} /> Courier Arrived
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-[11px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Clock size={12} /> Ready for Pickup / Handover
              </span>
              <span className="font-bold text-brand-dark">
                Donation #{d.id}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Pending In-Transit */}
        {pending.map((d: any) => (
          <motion.div
            key={`pending-${d.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-white hover:border-brand-medium/40 transition-colors flex flex-col gap-2.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-brand-medium/10 text-brand-medium flex items-center justify-center shrink-0">
                  <Navigation size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-brand-dark truncate">
                    {d.food_name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    From: <span className="font-semibold">{d.donor_name}</span>
                  </p>
                </div>
              </div>
              <span className="bg-brand-medium/10 text-brand-medium text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                En Route
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Donation #{d.id}
              </span>
              <button
                onClick={() => onArrived(d.id)}
                className="bg-accent hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
              >
                <CheckCircle size={12} /> Confirm Arrival
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { Truck, MapPin, CheckCircle, Navigation, Clock, Building2, MessageCircle } from "lucide-react";

interface Props {
  transitDonations: any[];
  onArrived: (id: number) => void;
}

function cleanPhone(p?: string): string {
  if (!p) return "";
  let digits = p.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits;
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
              Penjemputan Mandiri (Self-Pickup)
            </h3>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              {transitDonations.length} donasi siap diambil di lokasi donatur
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Siap Diambil
          </span>
        </div>
      </div>

      {/* Vertical Activity Feed */}
      <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
        {/* Arrived */}
        {arrived.map((d: any) => (
          <motion.div
            key={`arrived-${d.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-white flex flex-col gap-2.5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-brand-dark truncate">
                    {d.food_name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate">
                    Titik Ambil: <span className="font-semibold">{d.donor_name}</span>
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle size={11} /> Tiba di Lokasi
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-[11px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <Clock size={12} /> Menunggu Donatur Menyerahkan Makanan
              </span>
              <span className="font-bold text-brand-dark">
                #{d.id}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Pending In-Transit */}
        {pending.map((d: any) => {
          const donorPhone = cleanPhone(d.donor_phone);
          return (
            <motion.div
              key={`pending-${d.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-white hover:border-brand-medium/40 transition-colors flex flex-col gap-2.5 shadow-xs"
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
                    <p className="text-[11px] text-[var(--text-secondary)] truncate flex items-center gap-1">
                      <Building2 size={11} /> Donatur: <span className="font-semibold">{d.donor_name}</span>
                    </p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  Perjalanan Jemput
                </span>
              </div>

              {d.donor_address && (
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  📍 {d.donor_address}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                {donorPhone ? (
                  <a
                    href={`https://wa.me/${donorPhone}?text=${encodeURIComponent(
                      `Halo ${d.donor_name}, kami dari penerima donasi NutriShare ingin mengonfirmasi jadwal penjemputan donasi #${d.id} "${d.food_name}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <MessageCircle size={12} /> Chat Donatur
                  </a>
                ) : (
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    Donasi #{d.id}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onArrived(d.id)}
                  className="bg-accent hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle size={12} /> Saya Sudah Tiba di Lokasi
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

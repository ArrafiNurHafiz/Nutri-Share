import { Truck, Navigation } from "lucide-react";

interface Props {
  inTransitCount?: number;
  onTrack?: () => void;
}

export function LogisticsMap({ inTransitCount = 0, onTrack }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] overflow-hidden shadow-sm h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-medium/70 flex items-center justify-center p-6">
        <div className="text-center text-white/90">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary-orange">
            <Truck size={24} />
          </div>
          <p className="text-sm font-bold text-white">Peta Penjemputan Mandiri</p>
          <p className="text-xs text-white/70 mt-1">
            {inTransitCount > 0
              ? `${inTransitCount} donasi siap dijemput pihak penerima`
              : "Belum ada penjemputan aktif"}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-dark to-transparent">
        <button
          type="button"
          onClick={onTrack}
          className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
        >
          <Navigation size={14} /> Koordinasi & Pantau Penjemputan
        </button>
      </div>
    </div>
  );
}

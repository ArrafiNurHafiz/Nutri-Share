import { motion } from "motion/react";

export function LogisticsMap() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border-primary)] overflow-hidden shadow-sm h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 to-brand-dark/40 flex items-center justify-center">
        <div className="text-center text-white/80">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m0 0l2 1m-2-1v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-sm font-bold">Live Logistics Map</p>
          <p className="text-xs text-white/60 mt-1">
            2 pickups currently in transit
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-dark to-transparent">
        <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 rounded-xl text-xs font-bold hover:bg-white/30 transition-colors">
          Track Deliveries
        </button>
      </div>
    </div>
  );
}

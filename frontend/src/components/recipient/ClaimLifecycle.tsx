import { motion } from "motion/react";

interface Props {
  transitDonations: any[];
  onArrived: (id: number) => void;
}

export function ClaimLifecycle({ transitDonations, onArrived }: Props) {
  const hasActive = transitDonations.some((d: any) => !d.arrived_at);

  if (!hasActive) return null;

  const pending = transitDonations.filter((d: any) => !d.arrived_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[var(--border-primary)] p-5 shadow-sm"
    >
      <h3 className="font-bold mb-6 flex items-center gap-2 text-brand-dark">
        <svg
          className="w-5 h-5 text-brand-medium"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Active Claim Lifecycle
      </h3>

      <div className="space-y-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border-secondary)]" />

          <div className="relative flex gap-6 pb-6">
            <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-white z-10 shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-dark">
                Claim Confirmed
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Donation ID: #{pending[0]?.id || "N/A"}
              </p>
            </div>
          </div>

          <div className="relative flex gap-6 pb-6">
            <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-white z-10 shrink-0">
              <svg
                className="w-4 h-4"
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
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-dark">In Transit</h4>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Courier: NutriShare Logistics Hub
              </p>
              <div className="p-2 bg-brand-medium/5 rounded-lg border border-brand-medium/20 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-brand-medium"
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
                <span className="text-[10px] font-bold text-brand-medium uppercase">
                  Live Tracking Enabled
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex gap-6">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] z-10 shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-brand-dark opacity-50">
                Handover Complete
              </h4>
              <p className="text-xs text-[var(--text-secondary)] opacity-50">
                Awaiting arrival at destination
              </p>
            </div>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onArrived(pending[0].id)}
              className="flex-1 border border-primary-orange text-primary-orange py-3 rounded-xl font-bold text-sm hover:bg-primary-orange-bg transition-all"
            >
              Confirm Arrival
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

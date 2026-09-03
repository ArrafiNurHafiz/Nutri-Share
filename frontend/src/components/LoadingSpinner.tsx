import { motion } from "motion/react";

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  inline?: boolean;
}

export function LoadingSpinner({
  size = 24,
  label,
  inline,
}: LoadingSpinnerProps) {
  const ring = (inner: number) => (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Breathing core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="loader-core rounded-full bg-primary/30"
          style={{ width: size * 0.42, height: size * 0.42 }}
        />
      </div>
      {/* Outer ring (clockwise) */}
      <div className="loader-ring-outer absolute inset-0 rounded-full" />
      {/* Inner ring (counter-clockwise) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="loader-ring-inner rounded-full"
          style={{ width: inner, height: inner }}
        />
      </div>
    </div>
  );

  const labelEl = label ? (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-sm text-on-surface-variant font-medium loader-dots"
    >
      {label}
    </motion.span>
  ) : null;

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2.5">
        {ring(size * 0.72)}
        {labelEl}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {ring(size * 0.8)}
      {labelEl}
    </div>
  );
}

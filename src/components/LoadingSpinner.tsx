import { motion } from "motion/react";

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  inline?: boolean;
}

export function LoadingSpinner({ size = 24, label, inline }: LoadingSpinnerProps) {
  const spinner = (
    <motion.div
      className="border-2 border-[#2D7A4F] border-t-transparent rounded-full shrink-0"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );

  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        {label && <span className="text-sm text-gray-500">{label}</span>}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      {spinner}
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

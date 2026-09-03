import { ReactNode } from "react";
import { motion } from "motion/react";

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-gray-500 my-6"
    >
      <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-400 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, title, message,
  confirmLabel = "Yakin", cancelLabel = "Batal",
  variant = "danger",
  onConfirm, onCancel
}: ConfirmDialogProps) {
  const confirmColor =
    variant === "danger" ? "bg-[#E53935] hover:bg-red-700" :
    variant === "warning" ? "bg-[#F9A825] hover:bg-yellow-600" :
    "bg-[#2D7A4F] hover:bg-opacity-90";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-full ${variant === "danger" ? "bg-red-100" : variant === "warning" ? "bg-yellow-100" : "bg-green-100"}`}>
                <AlertTriangle size={28} className={
                  variant === "danger" ? "text-[#E53935]" :
                  variant === "warning" ? "text-[#F9A825]" :
                  "text-[#2D7A4F]"
                } />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-gray-500">{message}</p>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={onCancel} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                  {cancelLabel}
                </button>
                <button onClick={onConfirm} className={`flex-1 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${confirmColor}`}>
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

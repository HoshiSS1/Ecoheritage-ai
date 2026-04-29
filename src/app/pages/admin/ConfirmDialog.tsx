import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Xóa vĩnh viễn",
  cancelLabel = "Hủy",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${isDanger ? "bg-rose-50" : "bg-amber-50"}`}>
            {isDanger ? (
              <Trash2 className="h-7 w-7 text-rose-500" />
            ) : (
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            )}
          </div>

          {/* Content */}
          <h3 className="text-center text-xl font-semibold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            {message}
          </p>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium text-white transition ${
                isDanger
                  ? "bg-rose-500 hover:bg-rose-600 shadow-[0_8px_24px_-8px_rgba(244,63,94,0.5)]"
                  : "bg-amber-500 hover:bg-amber-600 shadow-[0_8px_24px_-8px_rgba(245,158,11,0.5)]"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

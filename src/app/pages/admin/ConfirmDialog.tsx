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
          className="absolute inset-0 bg-[#051a11]/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md rounded-[2.5rem] bg-[#0a2e1f] border border-white/10 p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
          
          {/* Close */}
          <button
            onClick={onCancel}
            className="absolute right-6 top-6 rounded-2xl border border-white/5 p-2.5 text-emerald-100/30 hover:bg-white/5 hover:text-white transition-all shadow-lg"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Icon */}
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl border ${isDanger ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
            {isDanger ? (
              <Trash2 className="h-9 w-9 text-rose-400" />
            ) : (
              <AlertTriangle className="h-9 w-9 text-amber-400" />
            )}
          </div>

          {/* Content */}
          <h3 className="text-center text-2xl font-black text-white tracking-tighter uppercase">
            {title}
          </h3>
          <p className="mt-4 text-center text-sm leading-relaxed text-emerald-100/50 font-medium">
            {message}
          </p>

          {/* Actions */}
          <div className="mt-10 flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 rounded-[1.5rem] border border-white/10 bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest text-emerald-100/60 transition hover:bg-white/10 hover:text-white shadow-lg"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest text-[#051a11] transition shadow-2xl ${
                isDanger
                  ? "bg-rose-500 hover:bg-rose-400 shadow-[0_15px_30px_rgba(244,63,94,0.3)]"
                  : "bg-emerald-500 hover:bg-emerald-400 shadow-[0_15px_30px_rgba(16,185,129,0.3)]"
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

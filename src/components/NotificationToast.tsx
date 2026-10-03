import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Sparkles, ShieldAlert } from "lucide-react";
import {
  useToastNotifications,
  TOAST_DURATION_MS,
  type ToastNotif,
} from "@/hooks/useToastNotifications";

/* ─── Per-type icon ────────────────────────────────────────────────────── */
const TypeIcon = ({ type }: { type: ToastNotif["type"] }) => {
  switch (type) {
    case "match":
      return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
    case "like":
      return <Heart className="w-3.5 h-3.5 text-rose-500" fill="currentColor" />;
    case "message_request":
    case "message":
      return <MessageCircle className="w-3.5 h-3.5 text-primary" />;
    case "admin":
      return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
  }
};

/* ─── Single toast card ────────────────────────────────────────────────── */
function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastNotif;
  onDismiss: () => void;
}) {
  const navigate = useNavigate();

  // Navigate and dismiss when clicked
  const handleClick = () => {
    navigate(toast.navigateTo);
    onDismiss();
  };

  // Play vibration on mobile if supported
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(60);
    }
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.93, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden cursor-pointer select-none"
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      {/* Content row */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Avatar / Icon */}
        <div className="relative shrink-0">
          {toast.type === "admin" ? (
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
          ) : toast.avatarUrl ? (
            <img
              src={toast.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
              {toast.avatarInitial ?? "?"}
            </div>
          )}
          {/* Type badge */}
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
            <TypeIcon type={toast.type} />
          </span>
        </div>

        {/* Message */}
        <p className="flex-1 text-sm font-medium text-foreground leading-snug line-clamp-2 min-w-0">
          {toast.message}
        </p>

        {/* Dismiss */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="h-[2px] bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: TOAST_DURATION_MS / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

/* ─── Toast stack — rendered globally in TopNav ────────────────────────── */
export default function NotificationToast() {
  const { toasts, dismiss } = useToastNotifications();

  return (
    /* Positioned below the sticky header (top-[3.75rem] ≈ 60px header height) */
    <div
      className="fixed top-[3.75rem] right-3 sm:right-4 z-[70] flex flex-col gap-2 items-end pointer-events-none"
      aria-label="Live notifications"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-full max-w-sm"
          >
            <ToastCard toast={toast} onDismiss={() => dismiss(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

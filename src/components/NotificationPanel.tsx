import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, CheckCircle2, Bell, CheckCheck, ShieldAlert } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";

interface Props {
  open: boolean;
  onClose: () => void;
}

const typeIcon = (type: Notification["type"]) => {
  if (type === "match") return <CheckCircle2 className="w-4 h-4 text-secondary" />;
  if (type === "message_request") return <MessageCircle className="w-4 h-4 text-primary" />;
  if (type === "admin") return <ShieldAlert className="w-4 h-4 text-amber-400" />;
  return <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />;
};

const typeBg = (type: Notification["type"]) => {
  if (type === "match") return "bg-yellow-500/10 border-yellow-400/20";
  if (type === "message_request") return "bg-primary/10 border-primary/20";
  if (type === "admin") return "bg-amber-500/10 border-amber-400/20";
  return "bg-rose-500/10 border-rose-400/20";
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationPanel({ open, onClose }: Props) {
  const { notifications, loading, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotifClick = (notif: Notification) => {
    if (notif.type === "match" || notif.type === "message_request") {
      navigate("/messages");
    } else if (notif.type === "admin") {
      navigate("/profile");
    } else {
      navigate("/likes");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed top-[3.6rem] right-2 sm:right-4 z-[61] w-[340px] max-h-[80vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-foreground" />
                <span className="font-bold text-sm text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded-lg hover:bg-primary/10 transition"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    All read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col gap-2 p-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground">New matches and likes will appear here.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1 p-2">
                  {notifications.map(notif => (
                    <motion.li
                      key={notif.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button
                        onClick={() => handleNotifClick(notif)}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border transition text-left hover:scale-[1.01] ${
                          notif.read
                            ? "bg-transparent border-transparent hover:bg-muted"
                            : `${typeBg(notif.type)} hover:opacity-90`
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {notif.profile?.avatar_url || notif.profile?.photos?.[0] ? (
                            <img
                              src={notif.profile.photos?.[0] ?? notif.profile.avatar_url!}
                              alt={notif.profile.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                              {notif.profile?.full_name?.charAt(0) ?? "?"}
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                            {typeIcon(notif.type)}
                          </span>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notif.read && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

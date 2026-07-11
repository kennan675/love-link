import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Bell, ChevronRight, Shield, Heart, AlertCircle, Settings, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { ATTConsentModal, useATTConsent } from "@/components/ConsentModals";

type PermStep = "location" | "notifications" | "done";
type PermState = "idle" | "requesting" | "granted" | "denied" | "blocked";

/* ─── Helpers ─────────────────────────────────────────────── */

/** Try to open native app settings. Works on Capacitor (Android / iOS). Falls back to a guide on web. */
const openAppSettings = () => {
  if (Capacitor.isNativePlatform()) {
    // On native, show alert with instructions (NativeSettings plugin can be added later)
    alert("Please go to Settings → Apps → BlackLoveLink and enable the permission.");
  }
  // Web: instructions shown in the UI card below
};

const LS_KEY = "bll_permissions";
const getSavedPerms = (): { location?: string; notifications?: string } => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
};
const savePerm = (key: "location" | "notifications", value: string) => {
  const perms = getSavedPerms();
  localStorage.setItem(LS_KEY, JSON.stringify({ ...perms, [key]: value }));
};

/* ─── Sub-components ──────────────────────────────────────── */

const GrantedBadge = ({ label }: { label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-2 rounded-full px-4 py-2 bg-green-500/10 text-green-600 text-sm font-semibold"
  >
    <CheckCircle2 className="w-4 h-4" />
    {label}
  </motion.div>
);

const WhySection = ({ items }: { items: string[] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-muted/60 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        Why we need this
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {items.map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BlockedCard = ({ permName, onOpenSettings }: { permName: string; onOpenSettings: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-6 text-center space-y-4"
  >
    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
    <div>
      <h3 className="font-bold text-foreground">{permName} is blocked</h3>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
        It looks like you've denied this permission before. To enable it, open your phone's Settings and allow BlackLoveLink to access {permName.toLowerCase()}.
      </p>
    </div>
    <button
      onClick={onOpenSettings}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm shadow-lg hover:bg-amber-600 transition-colors"
    >
      <Settings className="w-4 h-4" />
      Open Settings
    </button>
    <p className="text-xs text-muted-foreground">
      On Android: Settings → Apps → BlackLoveLink → Permissions<br />
      On iOS: Settings → Privacy → scroll to find BlackLoveLink
    </p>
  </motion.div>
);

/* ─── Main Page ────────────────────────────────────────────── */

const PermissionsPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PermStep>("location");
  const [locState, setLocState] = useState<PermState>("idle");
  const [notifState, setNotifState] = useState<PermState>("idle");
  const [showATT, setShowATT] = useState(!useATTConsent());

  // Check if permissions were already granted previously — skip straight through
  useEffect(() => {
    const saved = getSavedPerms();
    if (saved.location === "granted" && saved.notifications === "granted") {
      navigate("/swipe", { replace: true });
    }
  }, [navigate]);

  /* ─── Location ─── */
  const handleLocationAllow = async () => {
    setLocState("requesting");
    try {
      await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      setLocState("granted");
      savePerm("location", "granted");
      setTimeout(() => setStep("notifications"), 800);
    } catch (err: unknown) {
      const code = (err as GeolocationPositionError)?.code;
      if (code === 1) {
        // PERMISSION_DENIED
        setLocState("blocked");
      } else {
        // Timeout or unavailable — treat as denied gracefully
        setLocState("denied");
        savePerm("location", "denied");
        setTimeout(() => setStep("notifications"), 800);
      }
    }
  };

  const handleLocationSkip = () => {
    savePerm("location", "skipped");
    setStep("notifications");
  };

  /* ─── Notifications ─── */
  const handleNotificationsAllow = async () => {
    setNotifState("requesting");
    if (!("Notification" in window)) {
      setNotifState("denied");
      savePerm("notifications", "unavailable");
      setTimeout(() => setStep("done"), 600);
      return;
    }
    const result = await Notification.requestPermission();
    if (result === "granted") {
      setNotifState("granted");
      savePerm("notifications", "granted");
      setTimeout(() => setStep("done"), 800);
    } else if (result === "denied") {
      setNotifState("blocked");
    } else {
      // "default" — dismissed without choosing
      setNotifState("denied");
      savePerm("notifications", "dismissed");
      setTimeout(() => setStep("done"), 600);
    }
  };

  const handleNotificationsSkip = () => {
    savePerm("notifications", "skipped");
    setStep("done");
  };

  // Auto-navigate when done step shows
  useEffect(() => {
    if (step === "done") {
      const t = setTimeout(() => navigate("/swipe"), 1100);
      return () => clearTimeout(t);
    }
  }, [step, navigate]);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.18 } },
  };

  const stepIndex = step === "location" ? 0 : step === "notifications" ? 1 : 2;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16 font-display safe-top pb-safe">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-brand mb-5 shadow-glow">
            <Heart className="w-8 h-8 text-primary-foreground" fill="currentColor" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Almost there</p>
          <h1 className="text-3xl font-black text-foreground mt-1">
            One last <span className="text-gradient-brand">step</span>
          </h1>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-8 h-2.5 bg-primary" : i < stepIndex ? "w-2.5 h-2.5 bg-primary/50" : "w-2.5 h-2.5 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ─── Location ─── */}
          {step === "location" && (
            <motion.div key="location" {...fadeUp} className="space-y-4">
              {locState === "granted" && <GrantedBadge label="📍 Location access granted" />}

              {locState !== "blocked" ? (
                <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-5">
                  <motion.div
                    animate={locState === "requesting" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                  >
                    <MapPin className={`w-10 h-10 ${locState === "requesting" ? "text-primary animate-pulse" : "text-primary"}`} />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Enable Location</h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      BlackLoveLink uses your location to suggest nearby matches — so you can meet people who are actually close to you.
                    </p>
                  </div>
                  <WhySection items={[
                    "Find matches in your area",
                    "Distance shown on profile cards",
                    "City-level accuracy only — never stored on our servers",
                    "You can disable this anytime in Settings",
                  ]} />
                </div>
              ) : (
                <BlockedCard permName="Location" onOpenSettings={openAppSettings} />
              )}

              {locState !== "blocked" && (
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleLocationAllow}
                    disabled={locState === "requesting" || locState === "granted"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-bold text-base shadow-button hover:opacity-90 transition disabled:opacity-60"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {locState === "requesting" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : locState === "granted" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                    {locState === "requesting" ? "Requesting…" : locState === "granted" ? "Granted!" : "Allow Location Access"}
                    {locState === "idle" && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </motion.button>
                  <button
                    onClick={handleLocationSkip}
                    disabled={locState === "requesting"}
                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    Skip for now
                  </button>
                </div>
              )}

              {locState === "blocked" && (
                <button
                  onClick={handleLocationSkip}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue without location
                </button>
              )}
            </motion.div>
          )}

          {/* ─── Notifications ─── */}
          {step === "notifications" && (
            <motion.div key="notifications" {...fadeUp} className="space-y-4">
              {notifState === "granted" && <GrantedBadge label="🔔 Notifications enabled" />}

              {notifState !== "blocked" ? (
                <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-5">
                  <motion.div
                    animate={notifState === "requesting" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                  >
                    <Bell className={`w-10 h-10 text-primary ${notifState === "requesting" ? "animate-pulse" : ""}`} />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Stay in the Loop</h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Never miss a spark. Get instant alerts for new matches, messages, and profile likes.
                    </p>
                  </div>
                  <WhySection items={[
                    "New match alerts",
                    "Incoming messages",
                    "Profile likes and super-likes",
                    "Match suggestions curated for you",
                    "You can customise what you receive in Settings",
                  ]} />
                </div>
              ) : (
                <BlockedCard permName="Notifications" onOpenSettings={openAppSettings} />
              )}

              {notifState !== "blocked" && (
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleNotificationsAllow}
                    disabled={notifState === "requesting" || notifState === "granted"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-bold text-base shadow-button hover:opacity-90 transition disabled:opacity-60"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {notifState === "requesting" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : notifState === "granted" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                    {notifState === "requesting" ? "Requesting…" : notifState === "granted" ? "Enabled!" : "Enable Notifications"}
                    {notifState === "idle" && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </motion.button>
                  <button
                    onClick={handleNotificationsSkip}
                    disabled={notifState === "requesting"}
                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    Skip for now
                  </button>
                </div>
              )}

              {notifState === "blocked" && (
                <button
                  onClick={handleNotificationsSkip}
                  className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue without notifications
                </button>
              )}
            </motion.div>
          )}

          {/* ─── Done ─── */}
          {step === "done" && (
            <motion.div
              key="done"
              {...fadeUp}
              className="flex flex-col items-center gap-6 py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } }}
                className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center shadow-glow"
              >
                <Heart className="w-12 h-12 text-primary-foreground" fill="currentColor" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-foreground">You're all set! 🎉</h2>
                <p className="mt-2 text-muted-foreground">Taking you to your matches…</p>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Screen C — ATT tracking pre-prompt (shown once, before system ATT) */}
      {showATT && (
        <ATTConsentModal
          onContinue={() => setShowATT(false)}
          onSkip={() => setShowATT(false)}
        />
      )}
    </div>
  );
};

export default PermissionsPage;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "bll_cookie_consent";
const POLICY_VERSION = "1.0";

export type CookieChoice = "all" | "essential" | null;

interface Preferences {
  essential: boolean;   // always true, can't be turned off
  analytics: boolean;
  ads: boolean;
  preferences: boolean;
}

const DEFAULT_ALL: Preferences   = { essential: true, analytics: true,  ads: true,  preferences: true  };
const DEFAULT_NONE: Preferences  = { essential: true, analytics: false, ads: false, preferences: false };

export function useCookieConsent() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored) as { choice: CookieChoice; prefs: Preferences; version: string }; }
  catch { return null; }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_ALL);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so banner doesn't collide with splash screen
      const t = setTimeout(() => setVisible(true), 3200);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (choice: CookieChoice, finalPrefs: Preferences) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, prefs: finalPrefs, version: POLICY_VERSION, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  const Toggle = ({ label, desc, checked, onChange, disabled = false }: {
    label: string; desc: string; checked: boolean; onChange: () => void; disabled?: boolean;
  }) => (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop for customize panel on mobile */}
          {customizing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
              onClick={() => setCustomizing(false)}
            />
          )}

          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed bottom-0 inset-x-0 z-[9999] md:bottom-5 md:right-5 md:left-auto md:max-w-sm"
          >
            <div className="bg-card border border-border shadow-2xl shadow-black/20 md:rounded-2xl overflow-hidden">

              {/* Main banner */}
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground">Your Privacy Choices</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Black Love Link · Version {POLICY_VERSION}</p>
                  </div>
                  <button
                    onClick={() => save("essential", DEFAULT_NONE)}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    aria-label="Reject non-essential and close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  We use cookies for essential app functions, analytics, and ads that help keep BlackLoveLink free. You choose what to allow.
                </p>

                {/* Customize panel */}
                <AnimatePresence>
                  {customizing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="rounded-xl border border-border bg-muted/30 px-4 divide-y divide-border">
                        <Toggle
                          label="Essential"
                          desc="Required for the app to function. Cannot be disabled."
                          checked={true}
                          onChange={() => {}}
                          disabled
                        />
                        <Toggle
                          label="Analytics"
                          desc="Help us understand how the app is used so we can improve it."
                          checked={prefs.analytics}
                          onChange={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                        />
                        <Toggle
                          label="Ads & Personalisation"
                          desc="Show relevant ads to keep core features free. We never use sensitive data for ads."
                          checked={prefs.ads}
                          onChange={() => setPrefs(p => ({ ...p, ads: !p.ads }))}
                        />
                        <Toggle
                          label="Preferences"
                          desc="Remember your settings, language, and theme across sessions."
                          checked={prefs.preferences}
                          onChange={() => setPrefs(p => ({ ...p, preferences: !p.preferences }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => save("all", DEFAULT_ALL)}
                      className="flex-1 h-10 rounded-xl gradient-brand text-primary-foreground text-sm font-bold shadow-button hover:opacity-90 transition-opacity"
                    >
                      Accept All
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => save("essential", DEFAULT_NONE)}
                      className="flex-1 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors"
                    >
                      Reject Non-Essential
                    </motion.button>
                  </div>

                  {customizing ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => save(
                        prefs.analytics || prefs.ads ? "all" : "essential",
                        prefs
                      )}
                      className="w-full h-10 rounded-xl border border-primary/40 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Shield className="w-4 h-4" />
                      Save My Choices
                    </motion.button>
                  ) : (
                    <button
                      onClick={() => setCustomizing(true)}
                      className="w-full h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                    >
                      Customize <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Footer links */}
                <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/70">
                  <Link to="/privacy-policy" className="hover:text-primary transition-colors hover:underline">Privacy Policy</Link>
                  <span>·</span>
                  <Link to="/cookie-policy" className="hover:text-primary transition-colors hover:underline">Cookie Policy</Link>
                  <span>·</span>
                  <Link to="/privacy-policy#do-not-share" className="hover:text-primary transition-colors hover:underline">Do Not Share My Info</Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

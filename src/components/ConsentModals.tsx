/**
 * ConsentModals.tsx
 * All in-app consent screens (A–F) as required by the legal team.
 * Compliant with iOS ATT, GDPR, CCPA, and NDPR.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Image, Zap, Heart, X, Shield, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY_LOC  = "bll_consent_location";
const STORAGE_KEY_PHOTO = "bll_consent_photos";
const STORAGE_KEY_ATT  = "bll_consent_att";
const STORAGE_KEY_SENSITIVE = "bll_consent_sensitive";

/* ── Shared backdrop + card shell ─────────────────────────────────────────── */
const ModalShell = ({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9990] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const IconCircle = ({ icon: Icon, color }: { icon: any; color: string }) => (
  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
    <Icon className="w-8 h-8" />
  </div>
);

const Btn = ({ label, onClick, variant = "primary" }: { label: string; onClick: () => void; variant?: "primary" | "secondary" | "ghost" | "danger" }) => {
  const styles = {
    primary:   "gradient-brand text-primary-foreground shadow-button hover:opacity-90",
    secondary: "bg-muted border border-border text-foreground hover:bg-muted/70",
    ghost:     "text-muted-foreground hover:text-foreground hover:bg-muted/50",
    danger:    "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  };
  return (
    <button onClick={onClick} className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${styles[variant]}`}>
      {label}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN A — Location (Just-In-Time)
   Trigger: first time user sees "nearby" feed
════════════════════════════════════════════════════════════════════════════ */
interface LocationConsentProps {
  onAllow: (mode: "once" | "always") => void;
  onDeny: () => void;
}

export function LocationConsentModal({ onAllow, onDeny }: LocationConsentProps) {
  const save = (choice: string) => localStorage.setItem(STORAGE_KEY_LOC, choice);
  return (
    <ModalShell>
      <div className="p-6">
        <IconCircle icon={MapPin} color="bg-blue-500/15 text-blue-500" />
        <h2 className="text-xl font-black text-foreground text-center mb-2">Enable Location</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
          Black Love Link uses your location to show you members nearby and improve matches.
          We <strong>never</strong> share your exact location with other users — only distance.
        </p>
        <div className="space-y-2">
          <Btn label="Allow Once" variant="secondary" onClick={() => { save("once"); onAllow("once"); }} />
          <Btn label="Allow While Using App" variant="primary" onClick={() => { save("always"); onAllow("always"); }} />
          <Btn label="Don't Allow" variant="ghost" onClick={() => { save("denied"); onDeny(); }} />
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          <Link to="/privacy-policy" className="hover:text-primary underline">Learn more in Privacy Policy</Link>
        </p>
      </div>
    </ModalShell>
  );
}

export function useLocationConsent() {
  return localStorage.getItem(STORAGE_KEY_LOC);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN B — Photos / Camera (Just-In-Time)
   Trigger: user taps "Add Photo"
════════════════════════════════════════════════════════════════════════════ */
interface PhotoConsentProps {
  onAllow: (mode: "all" | "select") => void;
  onDeny: () => void;
}

export function PhotoConsentModal({ onAllow, onDeny }: PhotoConsentProps) {
  const save = (choice: string) => localStorage.setItem(STORAGE_KEY_PHOTO, choice);
  return (
    <ModalShell>
      <div className="p-6">
        <IconCircle icon={Image} color="bg-violet-500/15 text-violet-500" />
        <h2 className="text-xl font-black text-foreground text-center mb-2">Access Your Photos</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
          Add photos to complete your profile. You control which photos are public.
          We scan images automatically to keep the community safe.
        </p>
        <div className="space-y-2">
          <Btn label="Allow Access to All Photos" variant="primary" onClick={() => { save("all"); onAllow("all"); }} />
          <Btn label="Select Photos..." variant="secondary" onClick={() => { save("select"); onAllow("select"); }} />
          <Btn label="Don't Allow" variant="ghost" onClick={() => { save("denied"); onDeny(); }} />
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          <Link to="/privacy-policy" className="hover:text-primary underline">Privacy Policy</Link>
        </p>
      </div>
    </ModalShell>
  );
}

export function usePhotoConsent() {
  return localStorage.getItem(STORAGE_KEY_PHOTO);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN C — Tracking / iOS ATT Pre-Prompt
   Trigger: after onboarding, before home screen (PermissionsPage)
════════════════════════════════════════════════════════════════════════════ */
interface ATTConsentProps {
  onContinue: () => void;
  onSkip: () => void;
}

export function ATTConsentModal({ onContinue, onSkip }: ATTConsentProps) {
  const save = (choice: string) => localStorage.setItem(STORAGE_KEY_ATT, choice);
  return (
    <ModalShell>
      <div className="p-6">
        <IconCircle icon={Zap} color="bg-amber-500/15 text-amber-500" />
        <h2 className="text-xl font-black text-foreground text-center mb-2">Help Keep Black Love Link Free</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-3">
          We use your device ID to show relevant ads and measure them.
          This helps us keep core features <strong>free forever</strong>.
          We never sell your data or use sensitive info for ads.
        </p>
        <div className="mb-5 rounded-2xl bg-muted/50 border border-border p-4 space-y-1.5 text-[13px] text-muted-foreground">
          <p>✅ We never sell personal information</p>
          <p>✅ Sensitive data is never used for ads</p>
          <p>✅ You can opt out anytime in Settings › Privacy</p>
        </div>
        <div className="space-y-2">
          <Btn label="Continue" variant="primary" onClick={() => { save("allowed"); onContinue(); }} />
          <Btn label="Skip for Now" variant="ghost" onClick={() => { save("skipped"); onSkip(); }} />
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          On iOS, you'll see a system prompt next. You can change this anytime in your device Settings.
        </p>
      </div>
    </ModalShell>
  );
}

export function useATTConsent() {
  return localStorage.getItem(STORAGE_KEY_ATT);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN D — Sensitive Data Consent (Onboarding)
   Trigger: profile setup — consent gate before saving sensitive fields
════════════════════════════════════════════════════════════════════════════ */
interface SensitiveConsentProps {
  onSave: () => void;
  onSkip: () => void;
}

export function SensitiveDataConsentModal({ onSave, onSkip }: SensitiveConsentProps) {
  const [checked, setChecked] = useState(false);
  const save = (choice: string) => localStorage.setItem(STORAGE_KEY_SENSITIVE, choice);
  return (
    <ModalShell>
      <div className="p-6">
        <IconCircle icon={Heart} color="bg-rose-500/15 text-rose-500" />
        <h2 className="text-xl font-black text-foreground text-center mb-2">Tell Us About You</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4">
          These details help us find better matches. All fields are optional.
          We'll <strong>never</strong> use them for ads or share them with ad partners.
          You can change or remove them anytime in Settings.
        </p>

        {/* Consent checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-muted/40 cursor-pointer mb-5 group">
          <div
            onClick={() => setChecked(v => !v)}
            className={`mt-0.5 w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
              checked ? "bg-primary border-primary" : "border-border bg-card group-hover:border-primary/50"
            }`}
          >
            {checked && <X className="w-3 h-3 text-white rotate-45 scale-0 data-[checked=true]:scale-100" style={{ transform: checked ? "rotate(0deg) scale(1)" : "scale(0)" }} />}
          </div>
          <span className="text-sm text-foreground leading-relaxed">
            I consent to Black Love Link processing my sensitive personal data (such as orientation, ethnicity, and religion) to provide matches.
          </span>
        </label>

        <div className="space-y-2">
          <Btn
            label="Save & Continue"
            variant={checked ? "primary" : "secondary"}
            onClick={() => { if (checked) { save("consented"); onSave(); } }}
          />
          <Btn label="Skip (don't add sensitive info)" variant="ghost" onClick={() => { save("skipped"); onSkip(); }} />
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          <Link to="/privacy-policy" className="hover:text-primary underline">Privacy Policy</Link>
          {" · "}
          <span>You must check the box if you've entered sensitive data above.</span>
        </p>
      </div>
    </ModalShell>
  );
}

export function useSensitiveConsent() {
  return localStorage.getItem(STORAGE_KEY_SENSITIVE);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN F — Account Deletion Confirmation
   Trigger: Settings > Delete Account (final confirmation step)
   Note: Screen E (Cookies) is already handled in CookieConsent.tsx
════════════════════════════════════════════════════════════════════════════ */
interface DeleteConsentProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteAccountConsentModal({ onConfirm, onCancel, isLoading }: DeleteConsentProps) {
  const [checked, setChecked] = useState(false);
  return (
    <ModalShell onClose={onCancel}>
      <div className="p-6">
        {/* Warning header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-foreground text-center mb-2">Delete Account?</h2>

        {/* What gets deleted */}
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 p-4 mb-4">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> What will be deleted
          </p>
          {[
            "Your profile, photos, and bio",
            "All your matches and connections",
            "All messages and conversations",
          ].map(item => (
            <p key={item} className="text-sm text-muted-foreground flex items-center gap-2 py-0.5">
              <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
              {item}
            </p>
          ))}
        </div>

        {/* Timeline info */}
        <div className="rounded-2xl bg-muted/50 border border-border p-4 mb-5 space-y-1.5 text-[13px] text-muted-foreground">
          <p>⏱️ Data erased from our servers in <strong>30 days</strong></p>
          <p>🔒 We keep minimal info for <strong>90 days</strong> to investigate safety reports, as required by law</p>
          <p>↩️ You can cancel by logging back in within 30 days</p>
        </div>

        {/* Consent checkbox */}
        <label className="flex items-start gap-3 p-3 rounded-2xl border border-red-200/60 bg-red-50/50 dark:bg-red-950/10 cursor-pointer mb-5 group">
          <div
            onClick={() => setChecked(v => !v)}
            className={`mt-0.5 w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
              checked ? "bg-red-500 border-red-500" : "border-border bg-card group-hover:border-red-300"
            }`}
          >
            {checked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-foreground leading-relaxed">
            I understand my data will be permanently deleted after 30 days and this cannot be undone.
          </span>
        </label>

        <div className="space-y-2">
          <button
            onClick={onConfirm}
            disabled={!checked || isLoading}
            className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? "Processing…" : "Delete My Account"}
          </button>
          <Btn label="Cancel — Keep My Account" variant="secondary" onClick={onCancel} />
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          Questions?{" "}
          <a href="mailto:legal@blacklovelink.com" className="hover:text-primary underline">legal@blacklovelink.com</a>
          {" · "}
          <Link to="/privacy-policy" className="hover:text-primary underline">Privacy Policy</Link>
        </p>
      </div>
    </ModalShell>
  );
}

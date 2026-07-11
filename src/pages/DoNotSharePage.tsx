import React, { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle2, XCircle, ToggleLeft, ToggleRight,
  AlertCircle, ExternalLink, Mail, Globe,
} from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const LS_KEY = "bll_sharing_opt_out";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getOptOut = (): boolean => {
  try {
    return localStorage.getItem(LS_KEY) === "true";
  } catch {
    return false;
  }
};
const setOptOut = (value: boolean) => {
  try {
    localStorage.setItem(LS_KEY, value ? "true" : "false");
  } catch {
    // ignore
  }
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; visible: boolean }> = ({ message, visible }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-semibold px-6 py-3 rounded-full shadow-2xl pointer-events-none select-none"
  >
    {message}
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const DoNotSharePage: React.FC = () => {
  const [optedOut, setOptedOut] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    setOptedOut(getOptOut());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  const handleToggle = () => {
    const next = !optedOut;
    setOptedOut(next);
    setOptOut(next);
    showToast(
      next
        ? "✓ You have opted out of sharing. Takes effect within 15 days."
        : "Sharing preferences updated. You are now allowing ad-related sharing."
    );
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="min-h-screen font-display bg-background text-foreground">
      <SEO
        title="Do Not Share My Personal Information | BlackLoveLink"
        description="California & US state residents can opt out of cross-context behavioral advertising data sharing here. CCPA/CPRA compliant."
        path="/privacy/do-not-share"
        ogType="website"
      />
      <SharedNavbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-14 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-primary/3 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl relative"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">CCPA/CPRA · Your Rights</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Do Not Share My <span className="text-gradient-brand">Personal Information</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            For California &amp; other US state residents
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-3xl px-6 pb-24 space-y-10">

        {/* ── Section 1: What Sharing Means ── */}
        <motion.section {...fadeUp()} className="rounded-3xl border border-border bg-card p-8 space-y-4">
          <h2 className="text-xl font-black text-foreground">What "Sharing" Means</h2>
          <p className="text-[15px] text-foreground/75 leading-relaxed">
            Under the California Consumer Privacy Act (CCPA/CPRA), <strong>"sharing"</strong> means
            disclosing personal information to a third party for cross-context behavioral advertising —
            even without payment.
          </p>
          <div className="flex gap-3 p-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">
              <strong>Black Love Link does NOT sell your personal information for money.</strong>
            </p>
          </div>
          <div className="flex gap-3 p-4 rounded-2xl border border-border bg-muted/30">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <p className="text-sm leading-relaxed text-foreground/75">
              We do share <strong>device ID + app activity</strong> with Google and Meta to show you
              relevant ads and measure ad performance. This is considered <em>"sharing"</em> under CCPA.
            </p>
          </div>
          <div className="flex gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary">
            <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">
              We <strong>NEVER</strong> share sensitive info — sexual orientation, ethnicity, religion,
              or precise location — with ad partners. These are used only to improve your matches.
            </p>
          </div>
        </motion.section>

        {/* ── Section 2: Your Current Choice ── */}
        <motion.section {...fadeUp(0.08)} className="rounded-3xl border border-border bg-card p-8 space-y-5">
          <h2 className="text-xl font-black text-foreground">Your Current Choice</h2>
          <div
            className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-colors ${
              optedOut
                ? "border-emerald-400/30 bg-emerald-400/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex-1 space-y-1">
              {optedOut ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      You have opted out of sharing
                    </p>
                  </div>
                  <p className="text-sm text-foreground/60 pl-7">
                    We will stop sharing your device ID and activity with ad partners within 15 days.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ToggleRight className="w-5 h-5 text-muted-foreground" />
                    <p className="font-bold text-foreground">
                      You are currently allowing sharing for ads
                    </p>
                  </div>
                  <p className="text-sm text-foreground/60 pl-7">
                    This helps keep Black Love Link free.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={handleToggle}
              className={`flex-shrink-0 rounded-full px-7 py-3 text-sm font-bold transition-all hover:scale-105 ${
                optedOut
                  ? "bg-muted border border-border text-foreground hover:bg-accent"
                  : "gradient-brand text-primary-foreground shadow-button hover:opacity-90"
              }`}
            >
              {optedOut ? "Opt Back In" : "Opt Out of Sharing"}
            </button>
          </div>
        </motion.section>

        {/* ── Section 3: What Changes ── */}
        <motion.section {...fadeUp(0.12)} className="rounded-3xl border border-border bg-card p-8 space-y-5">
          <h2 className="text-xl font-black text-foreground">What Changes When You Opt Out</h2>
          <ol className="space-y-4">
            {[
              "We stop sending your device ID + app activity to ad partners for targeting.",
              "You may still see ads, but they won't be based on your activity in other apps.",
              "It may take up to 15 days for all partners to process this choice.",
              "This doesn't affect essential ads, like showing Premium offers in the app.",
            ].map((item, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full gradient-brand text-primary-foreground text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-[15px] text-foreground/75 leading-relaxed pt-0.5">{item}</p>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* ── Section 4: Other Ways to Opt Out ── */}
        <motion.section {...fadeUp(0.16)} className="rounded-3xl border border-border bg-card p-8 space-y-5">
          <h2 className="text-xl font-black text-foreground">Other Ways to Opt Out</h2>
          <ul className="space-y-3">
            {[
              { label: "Global Privacy Control (GPC)", desc: "If your browser sends a GPC signal, we honour it automatically." },
              { label: "iOS Settings › Privacy › Tracking › Off", desc: "Disable cross-app tracking system-wide on your iPhone." },
              { label: "Android Settings › Privacy › Ads › Delete Ad ID", desc: "Reset or delete your advertising ID on Android." },
              {
                label: "optout.aboutads.info",
                href: "https://optout.aboutads.info",
                desc: "Industry-wide opt-out tool by the Digital Advertising Alliance.",
              },
              {
                label: "optout.networkadvertising.org",
                href: "https://optout.networkadvertising.org",
                desc: "Network Advertising Initiative opt-out tool.",
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {item.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="font-semibold text-foreground">{item.label}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ── Section 5: More Rights ── */}
        <motion.section {...fadeUp(0.2)} className="rounded-3xl border border-border bg-card p-8 space-y-4">
          <h2 className="text-xl font-black text-foreground">More Privacy Rights</h2>
          <p className="text-[15px] text-foreground/75 leading-relaxed">
            If you are a resident of <strong>California, Virginia, Colorado, Connecticut, Utah,
            Texas, Oregon, or Montana</strong>, you have additional rights including access,
            correction, deletion, and portability of your data.
          </p>
          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Read the full Privacy Policy for your complete rights
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </motion.section>

        {/* ── Footer bar ── */}
        <motion.div
          {...fadeUp(0.24)}
          className="rounded-2xl border border-border bg-muted/40 p-6 space-y-2 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <strong>Last Updated:</strong> July 2026
          </p>
          <p className="text-sm text-muted-foreground">
            Questions?{" "}
            <a href="mailto:legal@blacklovelink.com" className="text-primary underline inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              legal@blacklovelink.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Opt-out processed within 15 days per CCPA §1798.135
          </p>
        </motion.div>
      </div>

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />

      <SiteFooter />
    </div>
  );
};

export default DoNotSharePage;

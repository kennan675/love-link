import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Flag, PhoneCall, Scale, AlertTriangle, Eye, Lock } from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const ChildSafetyPage = () => {
  return (
    <div className="min-h-screen font-display bg-background text-foreground">
      <SEO
        title="Child Safety & CSAE Standards | BlackLoveLink"
        description="BlackLoveLink's published standards and zero-tolerance policy against Child Sexual Abuse and Exploitation (CSAE) and Child Sexual Abuse Material (CSAM)."
        path="/child-safety"
        ogType="article"
      />
      <SharedNavbar />

      <main className="pt-28 pb-20 px-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold mb-4">
              <ShieldAlert className="w-4 h-4" />
              <span>Safety & Legal Compliance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
              Standards Against Child Sexual Abuse and Exploitation (CSAE)
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              BlackLoveLink maintains an uncompromising zero-tolerance policy against child sexual abuse material (CSAM)
              and child sexual exploitation and abuse (CSAE).
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Last updated: September 18, 2026 • Published pursuant to Google Play Child Safety Standards
            </p>
          </motion.div>

          {/* Zero Tolerance Banner */}
          <div className="p-6 rounded-2xl bg-destructive/5 border-2 border-destructive/20 mb-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-destructive text-destructive-foreground shrink-0 mt-1">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">Zero-Tolerance Policy</h2>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  BlackLoveLink strictly prohibits any form of Child Sexual Abuse Material (CSAM), Child Sexual
                  Exploitation and Abuse (CSAE), grooming, child endangerment, or sexual solicitation of minors.
                  Any violation results in immediate account termination, permanent device-level banning, and
                  mandatory reporting to the <strong>National Center for Missing & Exploited Children (NCMEC)</strong> and
                  appropriate domestic and international law enforcement agencies.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="space-y-8 text-sm leading-relaxed text-foreground/85">
            {/* Section 1: Age Gating & Platform Scope */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">1. Strictly Adults Only (18+)</h2>
              </div>
              <p>
                BlackLoveLink is an exclusive platform designed strictly for adults aged 18 and older. Minors (individuals under
                18 years of age) are explicitly barred from registering, accessing, or interacting on our platform.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Age verification checks are enforced during profile onboarding.</li>
                <li>Any account found to belong to, depict, or target a minor is immediately deactivated and removed.</li>
                <li>Users may not misrepresent their age or create accounts on behalf of minors.</li>
              </ul>
            </section>

            {/* Section 2: Prohibited Content & Conduct */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">2. Prohibited Content and Behaviors</h2>
              </div>
              <p>The following are unequivocally forbidden on BlackLoveLink across all profiles, messages, media, and communications:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Child Sexual Abuse Material (CSAM):</strong> Generating, uploading, sharing,
                  transmitting, hosting, requesting, or possessing any visual, textual, audio, or synthetic media depicting minors in sexually suggestive or explicit contexts.
                </li>
                <li>
                  <strong className="text-foreground">Child Sexual Exploitation and Abuse (CSAE):</strong> Any activity that facilitates,
                  threatens, or promotes sexual exploitation, trafficking, coercion, extortion, or abuse of children.
                </li>
                <li>
                  <strong className="text-foreground">Grooming & Inappropriate Contact:</strong> Any attempt by any user to establish contact
                  with, solicit, groom, or arrange meetings involving minors.
                </li>
                <li>
                  <strong className="text-foreground">AI-Generated or Synthetic Media:</strong> Any artificial or digitally manipulated
                  depictions of minors in sexually explicit or suggestive postures.
                </li>
              </ul>
            </section>

            {/* Section 3: Detection, Moderation & Prevention */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">3. Proactive Detection and Moderation</h2>
              </div>
              <p>BlackLoveLink deploys multi-layered technological and human measures to detect and prevent CSAE:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Automated Hash Matching & Image Screening:</strong> Integration with industry-standard
                  perceptual hashing technology to identify and block known CSAM before it can be transmitted or stored.
                </li>
                <li>
                  <strong className="text-foreground">Text & Keyword Filtering:</strong> Real-time linguistic analysis to detect and flag
                  grooming patterns, illegal solicitations, and inappropriate language involving minors.
                </li>
                <li>
                  <strong className="text-foreground">24/7 Human Moderation:</strong> Trained Trust & Safety specialists who review flagged
                  content on an urgent priority basis.
                </li>
                <li>
                  <strong className="text-foreground">Profile Verification:</strong> Mandatory selfie and photo verification to verify user identities.
                </li>
              </ul>
            </section>

            {/* Section 4: Reporting Mechanisms */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Flag className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">4. How to Report Suspected CSAE / CSAM</h2>
              </div>
              <p>
                We provide immediate, prominent reporting tools accessible to all users across every profile and chat thread:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Flag className="w-4 h-4 text-primary" /> In-App Reporting
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tap the <strong>Report</strong> icon on any profile or within any message thread. Select "Child Safety / Underage Concern" to trigger immediate highest-priority review by our safety team.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border space-y-1.5">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-primary" /> Direct Safety Email
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Email our dedicated Trust & Safety compliance team directly at{" "}
                    <a href="mailto:safety@blacklovelink.com" className="text-primary font-medium underline">
                      safety@blacklovelink.com
                    </a>{" "}
                    or{" "}
                    <a href="mailto:legal@blacklovelink.com" className="text-primary font-medium underline">
                      legal@blacklovelink.com
                    </a>
                    . Reports are monitored around the clock.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Cooperation with Law Enforcement & NCMEC */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">5. Mandatory Law Enforcement & NCMEC Reporting</h2>
              </div>
              <p>
                In compliance with federal law (18 U.S.C. § 2258A) and international child protection statutes, BlackLoveLink promptly reports all instances of apparent CSAM/CSAE to the:
              </p>
              <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2">
                <div className="font-bold text-foreground">National Center for Missing & Exploited Children (NCMEC)</div>
                <p className="text-xs text-muted-foreground">
                  Reports are filed through NCMEC's official <strong>CyberTipline</strong>, including all relevant IP logs, timestamps, account identifiers, and metadata permitted by law to assist in identification and prosecution.
                </p>
                <div className="text-xs font-semibold text-primary">
                  Website: <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="underline">report.cybertip.org</a> • Hotline: 1-800-843-5678
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                We also cooperate fully with local law enforcement, federal agencies (FBI, Homeland Security Investigations), and international entities (Interpol, Europol) investigating child exploitation crimes.
              </p>
            </section>

            {/* Section 6: Enforcement, Evidence Retention & Penalties */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">6. Enforcement Actions & Account Sanctions</h2>
              </div>
              <p>Upon identifying or receiving a credible report of child sexual exploitation or abuse:</p>
              <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground">
                <li><strong className="text-foreground">Immediate Termination:</strong> The associated account is immediately suspended and permanently banned.</li>
                <li><strong className="text-foreground">Hardware & Device Ban:</strong> Associated device IDs, phone numbers, email addresses, and network identifiers are blacklisted to prevent re-registration.</li>
                <li><strong className="text-foreground">Content Purge:</strong> The offending content is permanently quarantined and deleted from public visibility while evidence is preserved for legal reporting.</li>
                <li><strong className="text-foreground">Evidentiary Preservation:</strong> Relevant digital records are secured in encrypted, restricted-access storage for subpoena and official law enforcement processing.</li>
              </ol>
            </section>

            {/* Section 7: External Support & Emergency Helplines */}
            <section className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h2 className="text-xl font-bold text-foreground">7. External Helplines & Resources</h2>
              <p className="text-muted-foreground">
                If you or someone you know is in immediate danger or requires urgent assistance, please contact:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="font-bold text-foreground mb-1">NCMEC CyberTipline (USA & Global)</div>
                  <div className="text-muted-foreground mb-2">Available 24/7 for reporting child exploitation and abuse.</div>
                  <a href="tel:18008435678" className="text-primary font-bold hover:underline">1-800-843-5678</a> • <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">report.cybertip.org</a>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="font-bold text-foreground mb-1">Internet Watch Foundation (IWF)</div>
                  <div className="text-muted-foreground mb-2">Anonymous international reporting of child sexual abuse online.</div>
                  <a href="https://report.iwf.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">report.iwf.org.uk</a>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="font-bold text-foreground mb-1">Childline (UK / International)</div>
                  <div className="text-muted-foreground mb-2">Confidential counseling and support for young people.</div>
                  <a href="tel:08001111" className="text-primary font-bold hover:underline">0800 1111</a> • <a href="https://childline.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">childline.org.uk</a>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="font-bold text-foreground mb-1">Emergency Services</div>
                  <div className="text-muted-foreground mb-2">If a child is in immediate physical danger, call local emergency services:</div>
                  <span className="font-bold text-destructive">911 (US/Canada) • 999 (UK) • 112 (Europe/International)</span>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom navigation links */}
          <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4 text-sm">
            <Link to="/trust-safety" className="text-primary font-semibold hover:underline">
              ← Back to Trust & Safety
            </Link>
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <Link to="/terms-of-service" className="hover:text-foreground">Terms of Service</Link>
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-foreground">Contact Safety Team</Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ChildSafetyPage;

import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Mail, ChevronDown, ChevronUp,
  Lock, Eye, Trash2, Download, AlertCircle, CheckCircle2
} from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

// ── Reusable components ───────────────────────────────────────────────────────

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="py-10 border-b border-border last:border-0">
    <h2 className="text-2xl font-black text-foreground mb-5">{title}</h2>
    <div className="space-y-4 text-foreground/80 leading-relaxed text-[15px]">{children}</div>
  </section>
);

const BulletList = ({ items }: { items: (string | React.ReactNode)[] }) => (
  <ul className="space-y-2 ml-1">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoBox = ({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) => (
  <div className={`flex gap-3 p-4 rounded-2xl border ${color}`}>
    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
    <div className="text-sm leading-relaxed">{children}</div>
  </div>
);

const FAQ = ({ q, a }: { q: string; a: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-[15px] text-foreground/75 leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

const ConsentScreen = ({ letter, title, trigger, body, buttons, footer }: {
  letter: string; title: string; trigger: string; body: string;
  buttons: string[]; footer?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="px-5 py-3 bg-muted/50 border-b border-border flex items-center gap-3">
      <span className="w-7 h-7 rounded-full gradient-brand text-primary-foreground text-xs font-black flex items-center justify-center flex-shrink-0">{letter}</span>
      <div>
        <p className="font-bold text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">Trigger: {trigger}</p>
      </div>
    </div>
    <div className="p-5 space-y-3">
      <p className="text-sm text-foreground/80 leading-relaxed">{body}</p>
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn, i) => (
          <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>{btn}</span>
        ))}
      </div>
      {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
    </div>
  </div>
);

// ── Table of Contents ─────────────────────────────────────────────────────────
const TOC_ITEMS = [
  { id: "scope", label: "1. Scope & Controller" },
  { id: "collected", label: "2. Information We Collect" },
  { id: "consent-screens", label: "3. In-App Consent Screens" },
  { id: "rights", label: "4. Your Privacy Rights" },
  { id: "do-not-share", label: "5. Do Not Share My Personal Information" },
  { id: "my-requests", label: "6. My Privacy Requests" },
  { id: "faq", label: "7. Privacy FAQ" },
  { id: "contact", label: "8. Contact & DPO" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen font-display bg-background text-foreground">
      <SEO
        title="Privacy Policy | BlackLoveLink"
        description="How Black Love Link, Inc. collects, uses, and protects your personal information. Full GDPR, CCPA, and NDPR compliant privacy policy."
        path="/privacy-policy"
        ogType="website"
      />
      <SharedNavbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-12 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl relative"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Legal · Effective July 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Privacy <span className="text-gradient-brand">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Black Love Link, Inc. is committed to protecting your personal data. This policy explains exactly what we collect, why, and how you can control it.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last Updated: <strong>July 2026</strong> · Version 1.0
          </p>
        </motion.div>
      </section>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl px-6 pb-24 flex flex-col lg:flex-row gap-12">

        {/* Sticky TOC */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Table of Contents</p>
            <nav className="space-y-1">
              {TOC_ITEMS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-foreground/70 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* 1. Scope */}
          <Section id="scope" title="1. Scope & Controller">
            <p>
              This Privacy Policy covers <strong>Black Love Link, Inc.</strong> ("Black Love Link," "we," "us," "our") and applies to our mobile application, website, and all related services.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoBox icon={Mail} color="border-primary/20 bg-primary/5 text-primary">
                <strong>Legal Contact</strong><br />
                <a href="mailto:legal@blacklovelink.com" className="underline">legal@blacklovelink.com</a>
              </InfoBox>
              <InfoBox icon={Shield} color="border-border bg-muted/30 text-foreground">
                <strong>Registered Address</strong><br />
                6 Abayeteye Street, East Legon Hills, Accra, Ghana
              </InfoBox>
            </div>
            <InfoBox icon={AlertCircle} color="border-amber-400/30 bg-amber-400/5 text-amber-700 dark:text-amber-400">
              <strong>Age Restriction:</strong> We do NOT knowingly collect data from anyone under 18. If we discover an underage account it will be terminated immediately.
            </InfoBox>
          </Section>

          {/* 2. Information We Collect */}
          <Section id="collected" title="2. Information We Collect">
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-bold text-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-bold text-foreground">Examples</th>
                    <th className="text-left px-4 py-3 font-bold text-foreground">Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Identifiers", "Name, email, phone, user ID", "Contract & Interest"],
                    ["Account Info", "Date of birth, gender (18+ verified)", "Contract & Legal Obligation"],
                    ["Sensitive Data", "Sexual orientation, ethnicity, religion, precise geolocation, selfie verification images", "Your Consent — skip/change anytime"],
                    ["Profile Content", "Photos, bio, interests, preferences", "Contract & Consent"],
                    ["Communications", "Messages, chats, reports you file", "Contract, Interest & Safety"],
                    ["Commercial Info", "Subscription plan, last 4 card digits, transaction history (Stripe/Apple/Google/Mobile Payment)", "Contract"],
                    ["Usage Data", "Swipes, matches, features used, IP, device ID, crash logs, cookie IDs", "Legitimate Interest; Consent for cookies"],
                    ["Inferences", "General preferences inferred to improve matching", "Legitimate Interest; Consent where required"],
                  ].map(([cat, ex, basis], i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground align-top">{cat}</td>
                      <td className="px-4 py-3 text-foreground/70 align-top">{ex}</td>
                      <td className="px-4 py-3 text-foreground/70 align-top">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <InfoBox icon={Trash2} color="border-rose-400/20 bg-rose-400/5 text-rose-600 dark:text-rose-400">
              <strong>Data Deletion:</strong> Account deletion is available in <em>Settings › Account › Delete Account</em>. Data is erased within 30 days, except a 90-day safety hold for fraud/safety investigations as required by law.
            </InfoBox>
          </Section>

          {/* 3. Consent Screens */}
          <Section id="consent-screens" title="3. In-App Consent Screens">
            <p>The following screens keep us compliant with <strong>iOS ATT, GDPR, CCPA, and NDPR</strong>. Each is triggered at the right moment — not upfront.</p>
            <div className="space-y-4">
              <ConsentScreen
                letter="A"
                title="Location — Just-In-Time"
                trigger="First time user taps 'See People Nearby'"
                body="Black Love Link uses your location to show you members nearby and improve matches. We never share your exact location with other users — only distance."
                buttons={["Allow Once", "Allow While Using App", "Don't Allow"]}
                footer="Footer link: Learn more in Privacy Policy"
              />
              <ConsentScreen
                letter="B"
                title="Photos / Camera — Just-In-Time"
                trigger="User taps 'Add Photo'"
                body="Add photos to complete your profile. You control which photos are public. We scan images automatically to keep the community safe."
                buttons={["Allow Access to All Photos", "Select Photos...", "Don't Allow"]}
              />
              <ConsentScreen
                letter="C"
                title="Tracking — iOS ATT Prompt"
                trigger="After onboarding, before home screen"
                body="We use your device ID to show relevant ads and measure them. This helps us keep core features free. We never sell your data or use sensitive info for ads."
                buttons={["Continue → triggers system ATT"]}
                footer="System prompt: 'Allow Black Love Link to track your activity across other companies' apps and websites?'"
              />
              <ConsentScreen
                letter="D"
                title="Sensitive Data — Onboarding"
                trigger="Profile setup when asking orientation / ethnicity / religion"
                body="These details help us find better matches. All fields are optional. We'll never use them for ads or share them with ad partners. You can change or remove them anytime in Settings."
                buttons={["☐ I consent to Black Love Link processing my sensitive data", "Save", "Skip"]}
                footer="Note: User cannot proceed without checking the box if they enter sensitive data."
              />
              <ConsentScreen
                letter="E"
                title="Cookie / Ads Consent — First Launch"
                trigger="First app open or web version"
                body="We use cookies for essential app functions, analytics, and to show ads that keep Black Love Link free. You can opt out of non-essential cookies."
                buttons={["Accept All", "Reject Non-Essential", "Customize"]}
                footer="Links: Cookie Policy | Do Not Share My Personal Information"
              />
              <ConsentScreen
                letter="F"
                title="Account Deletion Confirmation"
                trigger="Settings › Delete Account"
                body="This will permanently delete your profile, photos, and messages. Your data will be erased from our servers in 30 days. We keep some info for 90 days to investigate safety reports, as required by law."
                buttons={["☐ I understand my data will be deleted", "Cancel", "Delete My Account"]}
                footer="'Delete My Account' button displays in red."
              />
            </div>
          </Section>

          {/* 4. Your Rights */}
          <Section id="rights" title="4. Your Privacy Rights">
            <p>Depending on where you live, you have the following rights over your personal data:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Eye,         title: "Right to Know",    desc: "Request a copy of the data we hold about you." },
                { icon: Trash2,      title: "Right to Delete",  desc: "Ask us to erase your personal information." },
                { icon: CheckCircle2,title: "Right to Correct", desc: "Fix inaccurate data in your profile." },
                { icon: Download,    title: "Right to Export",  desc: "Download your data as a JSON + media ZIP." },
                { icon: Lock,        title: "Right to Opt Out", desc: "Stop sharing of your data for cross-context ads." },
                { icon: Shield,      title: "Right to Appeal",  desc: "Challenge our decisions regarding your requests." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl border border-border bg-card">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p>To submit a request, go to <strong>Settings › Privacy › My Requests</strong> in the app, or email <a href="mailto:legal@blacklovelink.com" className="text-primary underline">legal@blacklovelink.com</a>.</p>
            <p className="text-sm text-muted-foreground">Response timelines: 45 days for California, Virginia, Colorado, Connecticut, and Utah residents. Identity verified via OTP or active session.</p>
          </Section>

          {/* 5. Do Not Share */}
          <Section id="do-not-share" title="5. Do Not Share My Personal Information">
            <p className="font-semibold text-foreground">Required by CCPA/CPRA — for California & other US state residents.</p>
            <p>Under laws like the California Consumer Privacy Act, <strong>"sharing"</strong> means disclosing personal information to third parties for cross-context behavioral advertising.</p>
            <InfoBox icon={CheckCircle2} color="border-emerald-400/20 bg-emerald-400/5 text-emerald-700 dark:text-emerald-400">
              <strong>Black Love Link does NOT sell your personal information for money.</strong><br />
              We do share identifiers like device ID and ad activity with partners (Google, Meta) to show relevant ads. This is considered "sharing" under CCPA.
            </InfoBox>
            <InfoBox icon={Shield} color="border-primary/20 bg-primary/5 text-primary">
              We <strong>NEVER</strong> share sensitive data — sexual orientation, ethnicity, religion, or precise location — for advertising purposes.
            </InfoBox>
            <p>To opt out:</p>
            <BulletList items={[
              <><strong>In-App:</strong> Settings › Privacy › Do Not Share My Information</>,
              <><strong>Global Privacy Control:</strong> If your browser sends a GPC signal, we honour it automatically.</>,
              <><strong>iOS:</strong> Settings › Privacy › Tracking › Off</>,
              <><strong>Android:</strong> Settings › Privacy › Ads › Delete Ad ID</>,
              <>Industry opt-out tools: <a href="https://optout.aboutads.info" className="text-primary underline" target="_blank" rel="noreferrer">optout.aboutads.info</a></>,
            ]} />
            <p className="text-sm text-muted-foreground">Opt-outs are processed within <strong>15 days</strong> per CCPA §1798.135. A footer link reading exactly "Do Not Share My Personal Information" (12pt+) is available on our web footer.</p>
          </Section>

          {/* 6. My Requests */}
          <Section id="my-requests" title="6. My Privacy Requests">
            <p>Track your data access, deletion, and opt-out requests at <strong>Settings › Privacy › My Requests</strong>.</p>
            <div className="space-y-3">
              {[
                {
                  title: "Data Download",
                  statuses: ["In Progress (yellow)", "Ready (green)", "Expired (gray)", "Denied (red)"],
                  detail: "We'll email you when your data export is ready. The download link expires after a set period — you can request again if needed.",
                },
                {
                  title: "Account Deletion",
                  statuses: ["Scheduled (yellow)", "Complete (green)", "Cancelled (gray)"],
                  detail: "Your profile is hidden immediately. Full deletion completes within 30 days. You may cancel within 48 hours of the request.",
                },
                {
                  title: "Opt-Out of Sharing",
                  statuses: ["Active (green)"],
                  detail: "We no longer share your data for cross-context ads once opted out. Change your choice at any time.",
                },
              ].map(({ title, statuses, detail }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-5 space-y-2">
                  <p className="font-bold text-foreground">{title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {statuses.map(s => (
                      <span key={s} className="text-[11px] font-semibold bg-muted px-2.5 py-1 rounded-full border border-border text-muted-foreground">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70">{detail}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">We keep request records for <strong>24 months</strong> to comply with US state laws. Questions? <a href="mailto:legal@blacklovelink.com" className="text-primary underline">legal@blacklovelink.com</a></p>
          </Section>

          {/* 7. FAQ */}
          <Section id="faq" title="7. Privacy FAQ">
            <div className="space-y-3">
              <FAQ
                q="What information does Black Love Link collect?"
                a={<BulletList items={["Identifiers (name, email, phone)", "Sensitive profile data (orientation, ethnicity, religion) — only with your consent", "Photos, bio, interests", "Usage data (swipes, matches, device info)", "Commercial info if you subscribe"]} />}
              />
              <FAQ
                q="Does Black Love Link sell my data?"
                a="No. We do not sell your personal information for money. We share certain identifiers with ad partners (Google, Meta) to show relevant ads — this is considered 'sharing' under CCPA, and you can opt out at any time."
              />
              <FAQ
                q="How do I delete my account and data?"
                a="Go to Settings › Account › Delete Account. Your profile is removed instantly. All personal data is erased within 30 days, except a 90-day safety hold for active investigations."
              />
              <FAQ
                q="Is my sexual orientation or ethnicity shared with advertisers?"
                a="Never. Sensitive data — including sexual orientation, ethnicity, religion, and precise location — is never shared with ad partners. It is used solely to improve your matches."
              />
              <FAQ
                q="What happens to my data if I'm in the EU or UK?"
                a="Non-essential cookies and SDKs are blocked until you give consent. You have full GDPR rights: access, correction, erasure, portability, and the right to object to processing."
              />
              <FAQ
                q="How do I download a copy of my data?"
                a="Go to Settings › Privacy › My Requests › Request Data Download. We'll prepare your data as a JSON + media ZIP and email you a secure download link."
              />
              <FAQ
                q="Can I use the app without allowing location access?"
                a="Yes. Location is optional. Without it, distance-based matching won't work, but you can still browse profiles and connect with people."
              />
              <FAQ
                q="How long do you keep my data after I delete my account?"
                a="Most data is erased within 30 days. We retain a minimal safety record for 90 days to investigate any pending safety reports, after which it is permanently purged."
              />
            </div>
          </Section>

          {/* 8. Contact */}
          <Section id="contact" title="8. Contact & Data Protection Officer">
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoBox icon={Mail} color="border-primary/20 bg-primary/5 text-primary">
                <strong>Privacy / Legal Team</strong><br />
                <a href="mailto:legal@blacklovelink.com" className="underline">legal@blacklovelink.com</a>
              </InfoBox>
              <InfoBox icon={Shield} color="border-border bg-muted/30 text-foreground">
                <strong>Registered Office</strong><br />
                6 Abayeteye Street, East Legon Hills<br />
                Accra, Ghana, West Africa
              </InfoBox>
            </div>
            <p>For privacy requests, complaints, or questions about this policy, contact our legal team. We aim to respond within <strong>5 business days</strong> for general queries and within the statutory timeframe for formal data rights requests.</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="mailto:legal@blacklovelink.com"
                className="rounded-full gradient-brand px-8 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all text-center"
              >
                Email Legal Team
              </a>
              <Link
                to="/contact"
                className="rounded-full bg-muted border border-border px-8 py-3 text-sm font-bold text-foreground hover:bg-accent transition-all text-center"
              >
                Contact Form
              </Link>
            </div>
          </Section>

        </main>
      </div>

      <SiteFooter />
    </div>
  );
};

export default PrivacyPolicyPage;

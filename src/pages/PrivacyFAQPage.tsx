import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ChevronDown, ChevronUp, Mail, ExternalLink,
  HelpCircle, Lock, Trash2, Eye, Download, Globe, Cookie, BellOff,
} from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FAQItem {
  id: number;
  icon: React.FC<{ className?: string }>;
  question: string;
  answer: React.ReactNode;
}

// ── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    icon: Eye,
    question: "What info does Black Love Link collect?",
    answer: (
      <p>
        We collect <strong>identifiers</strong> (name, email, phone),{" "}
        <strong>account info</strong> (date of birth, gender),{" "}
        <strong>sensitive data</strong> (sexual orientation, ethnicity, religion,
        geolocation, selfie images — <em>only with your consent</em>),{" "}
        <strong>profile content</strong> (photos, bio, interests),{" "}
        <strong>messages</strong>, <strong>commercial info</strong> (subscription,
        transaction history), <strong>usage data</strong> (swipes, matches, device
        info), and <strong>inferences</strong> to improve matching.
      </p>
    ),
  },
  {
    id: 2,
    icon: Shield,
    question: "Does Black Love Link sell my data?",
    answer: (
      <p>
        <strong>No.</strong> We do not sell your personal information for money. We
        share certain identifiers with ad partners (Google, Meta) to show relevant
        ads — this is considered <em>'sharing'</em> under CCPA, and you can opt out
        at any time in{" "}
        <strong>Settings › Privacy</strong>.
      </p>
    ),
  },
  {
    id: 3,
    icon: Trash2,
    question: "How do I delete my account and data?",
    answer: (
      <p>
        Go to <strong>Settings › Account › Delete Account</strong>. Your profile is
        removed instantly. All personal data is erased within <strong>30 days</strong>,
        except a <strong>90-day safety hold</strong> for active investigations.
      </p>
    ),
  },
  {
    id: 4,
    icon: Lock,
    question: "Is my sexual orientation or ethnicity shared with advertisers?",
    answer: (
      <p>
        <strong>Never.</strong> Sensitive data — including sexual orientation,
        ethnicity, religion, and precise location — is <em>never</em> shared with ad
        partners. It is used solely to improve your matches.
      </p>
    ),
  },
  {
    id: 5,
    icon: Globe,
    question: "What happens to my data if I'm in the EU or UK?",
    answer: (
      <p>
        Non-essential cookies and SDKs are <strong>blocked until you give consent</strong>.
        You have full GDPR rights: access, correction, erasure, portability, and the
        right to object to processing.
      </p>
    ),
  },
  {
    id: 6,
    icon: Download,
    question: "How do I download a copy of my data?",
    answer: (
      <p>
        Go to <strong>Settings › Privacy › My Requests › Request Data Download</strong>.
        We'll prepare your data as a <strong>JSON + media ZIP</strong> and email you a
        secure download link.
      </p>
    ),
  },
  {
    id: 7,
    icon: Globe,
    question: "Can I use the app without allowing location access?",
    answer: (
      <p>
        <strong>Yes.</strong> Location is optional. Without it, distance-based matching
        won't work, but you can still browse profiles and connect with people.
      </p>
    ),
  },
  {
    id: 8,
    icon: Trash2,
    question: "How long do you keep my data after I delete my account?",
    answer: (
      <p>
        Most data is erased within <strong>30 days</strong>. We retain a minimal safety
        record for <strong>90 days</strong> to investigate any pending safety reports,
        after which it is permanently purged.
      </p>
    ),
  },
  {
    id: 9,
    icon: Cookie,
    question: "What cookies do you use?",
    answer: (
      <p>
        We use <strong>essential cookies</strong> (required for the app to work),{" "}
        <strong>analytics cookies</strong> (to understand usage),{" "}
        <strong>ad/personalisation cookies</strong> (to show relevant ads), and{" "}
        <strong>preference cookies</strong> (to remember your settings). You can manage
        these in <strong>Settings › Privacy</strong>.
      </p>
    ),
  },
  {
    id: 10,
    icon: BellOff,
    question: "How do I opt out of personalised ads?",
    answer: (
      <p>
        Go to <strong>Settings › Privacy › Do Not Share My Information</strong>, or use
        the cookie banner on first launch. You can also use your device settings:{" "}
        <strong>iOS Settings › Privacy › Tracking</strong>, or{" "}
        <strong>Android Settings › Privacy › Ads</strong>.
      </p>
    ),
  },
];

// ── Accordion Card ─────────────────────────────────────────────────────────────
const AccordionCard: React.FC<{ item: FAQItem; index: number }> = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start gap-4 px-5 py-5 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </span>
        <span className="flex-1 font-semibold text-foreground text-[15px] leading-snug">
          {item.question}
        </span>
        <span className="flex-shrink-0 mt-0.5 text-muted-foreground">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border text-[15px] text-foreground/75 leading-relaxed pl-[4.25rem]">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const PrivacyFAQPage: React.FC = () => {
  return (
    <div className="min-h-screen font-display bg-background text-foreground">
      <SEO
        title="Privacy FAQ | BlackLoveLink"
        description="Quick answers to the most common questions about how Black Love Link collects, uses, and protects your personal information."
        path="/privacy/faq"
        ogType="website"
      />
      <SharedNavbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-14 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/3 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl relative"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Privacy · Quick Answers</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5">
            Privacy <span className="text-gradient-brand">FAQ</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Quick answers to your most common privacy questions. Tap any card to expand.
          </p>
        </motion.div>
      </section>

      {/* ── FAQ Grid ── */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border bg-card p-8 md:p-10 text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Need more detail?</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Read the full Privacy Policy
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Our complete policy covers every aspect of data collection, processing, and
            your rights in detail — GDPR, CCPA, and NDPR compliant.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center justify-center gap-2 gradient-brand rounded-full px-8 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all hover:scale-105"
            >
              Full Privacy Policy
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <a
              href="mailto:legal@blacklovelink.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-muted border border-border px-8 py-3 text-sm font-bold text-foreground hover:bg-accent transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              legal@blacklovelink.com
            </a>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default PrivacyFAQPage;

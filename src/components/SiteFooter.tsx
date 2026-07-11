import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, MessageCircle, Shield, ArrowUpRight } from "lucide-react";
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";

const footerLinks = {
  platform: [
    { label: "How It Works", to: "/how-it-works" },
    { label: "Connections", to: "/connections" },
    { label: "Success Stories", to: "/success-stories" },
    { label: "Relationship Hub", to: "/education" },
  ],
  support: [
    { label: "Help Center", to: "/support" },
    { label: "Trust & Safety", to: "/trust-safety" },
    { label: "Report a Concern", to: "/contact" },
    { label: "Contact Us", to: "/contact" },
  ],
  legal: [
    { label: "Privacy FAQ", to: "/privacy/faq" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-of-service" },
    { label: "Cookie Policy", to: "/cookie-policy" },
    { label: "Intellectual Property", to: "/intellectual-property" },
    { label: "Accessibility", to: "/accessibility" },
  ],
};

const contactItems = [
  { icon: Mail, label: "support@blacklovelink.com", href: "mailto:support@blacklovelink.com" },
  { icon: MessageCircle, label: "Live Chat", href: "/support" },
];

const SiteFooter: React.FC = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute -top-32 right-1/4 h-64 w-64 rounded-full bg-secondary/5 blur-[120px]" />

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-8">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="inline-block mb-6">
              <img src={blackLovelinkLogo} alt="BlackLoveLink" className="h-12 w-auto" />
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A premium matchmaking platform for Black professionals aged 25+. We build spaces where love can grow without compromise.
            </p>

            {/* Contact */}
            <ul className="space-y-3">
              {contactItems.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground group"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Platform Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/40">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/40">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-0.5 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/40">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand">
                <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Ready to find your person?
              </p>
            </div>
            <Link
              to="/auth"
              className="gradient-brand rounded-full px-8 py-3 text-sm font-bold text-primary-foreground shadow-button transition-all hover:scale-105 hover:opacity-90"
            >
              Join BlackLoveLink
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} BlackLoveLink. All rights reserved.
            </p>
            <Link
              to="/privacy/do-not-share"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Do Not Share My Personal Information
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-secondary" />
              <span>Verified profiles · Safe messaging · 24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

import React from "react";
import SEO from "@/components/SEO";
import { Flame, ChevronDown, Globe, Heart, GraduationCap, Handshake, Instagram, Youtube, Facebook, ArrowUpRight, Smartphone, Download, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import { motion, AnimatePresence } from "framer-motion";
import coupleHero from "@/assets/couple-hero.png";
import appPromoArtwork from "@/assets/blacklovelink-app-promo.png";
import profile1 from "@/assets/profile-1.png";
import profile2 from "@/assets/profile-2.png";
import profile3 from "@/assets/profile-3.png";
import ConnectionCards from "@/components/ConnectionCards";
import HeroChatbot from "@/components/HeroChatbot";
// import PricingSection from "@/components/PricingSection"; // Hidden for free launch
import BrandName from "@/components/BrandName";
import { useTranslation } from "@/hooks/useTranslation";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Language, languageNames } from "@/contexts/LanguageContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useToast } from "@/hooks/use-toast";
import InstallPrompt from "@/components/InstallPrompt";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.2v12.55a3.04 3.04 0 0 1-3.04 2.86 3.04 3.04 0 0 1-3.04-3.04 3.04 3.04 0 0 1 3.04-3.04c.3 0 .6.04.88.13V8.3a6.4 6.4 0 0 0-.88-.06A6.25 6.25 0 0 0 3.33 14.5a6.25 6.25 0 0 0 6.25 6.25 6.25 6.25 0 0 0 6.25-6.25V8.66a8.03 8.03 0 0 0 4.7 1.51V6.98a4.85 4.85 0 0 1-.94-.29z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const homeSocialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/blacklove.link/" },
  { icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@blacklove.link" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@blacklovelink" },
  { icon: Facebook, label: "Facebook", href: "https://web.facebook.com/people/Black-Love-Link/61594268287175/" },
  { icon: XIcon, label: "X", href: "https://www.x.com/blacklovelimit" },
];



const Index = () => {
  const { t, language, setLanguage } = useTranslation();
  const { stats, loading, formatStat } = usePlatformStats();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const langRef = React.useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = React.useState(false);
  
  const handleInstallClick = async () => {
    if (isStandalone) {
      toast({
        title: "App Already Installed",
        description: "You're already running BlackLoveLink as an installed app on this device.",
      });
      return;
    }
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }
    if (isInstallable) {
      await promptInstall();
    } else {
      toast({
        title: "Direct App Download",
        description: "Tap your browser menu (⋮ or Share) and select 'Install app' or 'Add to Home screen' for the instant app experience.",
      });
    }
  };

  const handleComingSoonClick = () => {
    toast({
      title: "Coming Soon on Play Store",
      description: "Our official Google Play release is currently on the way! You can install the full app right now using the 'Download App' button.",
    });
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background font-display">
      <SEO title={"BlackLoveLink – Where Black Love Begins"} description={"Verified Black professionals building authentic, marriage-minded connections. Join the premier Black dating community today."} path="/" ogType="website" />
      {/* ── ULTRA PREMIUM NAVBAR ── */}
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-2xl bg-background/90 border-b border-border shadow-sm"
            : "backdrop-blur-md bg-background/50 border-b border-border/30"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:pr-10 h-16 lg:h-18">
          {/* Logo — always visible on any background */}
          <Link to="/" className="group relative z-50 flex shrink-0 items-center rounded-full px-4 py-2 transition-all duration-300">
            <span className="font-serif italic text-lg font-semibold leading-none tracking-tight whitespace-nowrap">
              <span className="text-black dark:text-foreground">black</span>
              <span className="text-primary">love</span>
              <span className="text-secondary">link</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-0.5 rounded-full border border-border/80 bg-background/80 p-1 backdrop-blur-md shadow-xs xl:flex">
            {[
              { label: t.nav.home, to: "/" },
              { label: t.nav.howItWorks, to: "/how-it-works" },
              { label: t.nav.successStories, to: "/success-stories" },
              { label: t.nav.trustSafety, to: "/trust-safety" },
              { label: t.nav.support, to: "/support" },
              { label: "Relationship Hub", to: "/education" },
              { label: "Contact", to: "/contact" },
            ].map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link
                  to={link.to}
                  className="relative block whitespace-nowrap rounded-full px-2.5 2xl:px-3.5 py-1.5 2xl:py-2 text-xs 2xl:text-[13px] font-semibold text-foreground/80 transition-all duration-300 hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>


          {/* Right Side - Socials & Language */}
          <div className="flex shrink-0 items-center gap-1.5 xl:gap-2">
            {/* Social Icons — desktop only */}
            <div className="hidden lg:flex items-center gap-0.5">
              {homeSocialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-7 w-7 xl:h-8 xl:w-8 items-center justify-center rounded-lg text-foreground/70 transition-all duration-200 hover:text-foreground hover:bg-muted/60"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-4 bg-border/80 mx-1" />

            {/* Language Dropdown */}
            <div ref={langRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 bg-background/80 backdrop-blur-md border border-border/80 shadow-xs transition-all duration-200 hover:bg-muted hover:text-foreground"
                aria-label="Change language"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium whitespace-nowrap">{languageNames[language]}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 max-h-80 overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl z-50 p-1.5"
                  >
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguage(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs font-medium rounded-xl transition-all duration-150 ${
                          language === lang
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-accent/60"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="xl:hidden p-2 rounded-xl bg-background/80 backdrop-blur-md border border-border/80 text-foreground hover:bg-muted transition-all shadow-xs"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={mobileMenuOpen ? "open" : "closed"}
                className="w-6 h-5 flex flex-col justify-between"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 8 }
                  }}
                  className="w-full h-0.5 bg-foreground rounded-full"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  className="w-full h-0.5 bg-foreground rounded-full"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -8 }
                  }}
                  className="w-full h-0.5 bg-foreground rounded-full"
                />
              </motion.div>
            </motion.button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden border-t border-border bg-background/95 backdrop-blur-2xl overflow-hidden shadow-xl"
            >
              <div className="px-6 py-6 space-y-2">
                {[
                  { label: t.nav.home, to: "/" },
                  { label: t.nav.howItWorks, to: "/how-it-works" },
                  { label: t.nav.successStories, to: "/success-stories" },
                  { label: t.nav.trustSafety, to: "/trust-safety" },
                  { label: t.nav.support, to: "/support" },
                ].map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-foreground/80 rounded-xl hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/education"
                    className="block px-4 py-3 text-sm font-medium text-foreground/80 rounded-xl hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Relationship Hub
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link
                    to="/contact"
                    className="block px-4 py-3 text-sm font-medium text-foreground/80 rounded-xl hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </motion.div>

                {/* Mobile Language Selector */}
                <div className="pt-4 border-t border-border/60">
                  <p className="text-xs font-semibold text-muted-foreground px-4 mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" /> {t.nav.language}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 px-2">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setLanguage(lang);
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-2 text-left text-xs font-medium rounded-lg transition-colors ${
                          language === lang
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground/80 hover:bg-muted"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Sign In Button */}
                <div className="pt-3 px-2">
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-bold rounded-xl gradient-brand text-primary-foreground shadow-button"
                  >
                    Sign In / Sign Up
                  </Link>
                </div>

                {/* Social icons in mobile menu */}
                <div className="flex items-center gap-2 pt-4 px-2">
                  {homeSocialLinks.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        {/* Hero image with refined clarity */}
        <img
          src={coupleHero}
          alt="Black couple celebrating together in a sunlit field"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Overlay — identical to the stats section below */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Hero heading */}
            <h1 className="relative leading-none flex flex-col items-center gap-3">
              {/* "Welcome to" — italic, same family, with decorative flanking lines */}
              <span className="flex items-center justify-center gap-3">
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/50 to-white/50 max-w-[80px] sm:max-w-[120px]" />
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black italic text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.9)] tracking-tight">
                  Welcome to
                </span>
                <span className="flex-1 h-px bg-gradient-to-l from-transparent via-white/50 to-white/50 max-w-[80px] sm:max-w-[120px]" />
              </span>

              {/* BlackLoveLink — text logo */}
              <BrandName className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] mx-auto" />
            </h1>
            <p className="mt-5 text-xl sm:text-2xl lg:text-3xl font-semibold text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)] tracking-wide">
              Where Intentional Love Begins
            </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/auth"
              className="gradient-brand inline-block rounded-full px-10 py-4 text-lg font-bold text-primary-foreground shadow-button transition-transform hover:scale-105"
            >
              Sign In / Sign Up
            </Link>
            <a
              href="#mission"
              className="inline-block rounded-full border-2 border-primary-foreground/60 px-10 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-muted/30/10"
            >
              {t.hero.learnMore}
            </a>
            {/* PWA download button — hidden once installed */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/30 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-white/20 hover:scale-105"
              >
                <Download className="h-5 w-5" />
                Download App
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── GOOGLE PLAY APP PROMOTION ── */}
      <section className="relative overflow-hidden bg-card px-6 py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
        <div className="absolute top-0 left-0 w-[520px] h-[520px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className="max-w-xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 border-b border-secondary/60 pb-2 text-xs font-bold uppercase tracking-wider text-secondary">
              <Smartphone className="h-4 w-4" />
              BlackLoveLink Mobile App
            </div>
            <h2 className="text-4xl font-black leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
              Your next meaningful connection, now closer.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover intentional Black love, continue conversations and stay connected wherever life takes you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2.5 rounded-full gradient-brand px-7 py-3.5 text-sm font-extrabold text-primary-foreground shadow-button transition-transform hover:scale-[1.03] active:scale-[0.98]"
                aria-label="Download BlackLoveLink App directly"
              >
                <Download className="h-4 w-4" />
                Download App
              </button>

              <button
                type="button"
                onClick={handleComingSoonClick}
                className="inline-flex items-center gap-2.5 rounded-full border border-secondary/40 bg-secondary/10 px-6 py-3.5 text-sm font-bold text-secondary transition-all hover:bg-secondary/20 hover:border-secondary/60 cursor-pointer"
                aria-label="Coming soon on Play Store"
              >
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Coming Soon on Play Store
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/90">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                Direct web install
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span>Instant access, zero wait</span>
              <span className="text-muted-foreground/30">•</span>
              <span>Works seamlessly on Android & iOS</span>
            </div>
          </motion.div>

          <motion.div
            onClick={handleComingSoonClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleComingSoonClick(); }}
            aria-label="BlackLoveLink on Google Play (Coming Soon)"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-border shadow-glow bg-card/60"
          >
            <img
              src={appPromoArtwork}
              alt="BlackLoveLink mobile app preview"
              className="w-full h-auto aspect-square object-cover transition-transform duration-700 group-hover:scale-[1.015]"
              loading="eager"
            />
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-bold text-foreground backdrop-blur-md border border-border/60 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              Coming Soon on Play Store
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── AI CHATBOT (Floating Bubble) ── */}
      <HeroChatbot />

      {/* ── MISSION SECTION ── */}
      <section id="mission" className="relative px-6 py-28 lg:py-36 overflow-hidden bg-dot-matrix scroll-mt-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left - Heading & Action */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-widest">Our Vision</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-foreground">
                  {t.mission.title}{" "}
                  <span className="text-gradient-brand block mt-1">{t.mission.titleHighlight}</span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
              </motion.div>

              <motion.p
                className="text-lg leading-relaxed text-foreground/80 font-medium"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {t.mission.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="pt-2"
              >
                <Link
                  to="/auth"
                  className="gradient-brand inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold text-primary-foreground shadow-button transition-transform hover:scale-105 shimmer-gold"
                >
                  {t.mission.cta}
                </Link>
              </motion.div>
            </div>

            {/* Right - Premium Value Proposition Cards */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  title: "Cultural Alignment",
                  desc: t.mission.subDescription,
                  badge: "Tailored Experience",
                  Icon: Heart,
                },
                {
                  title: "Vetted Professionals Only",
                  desc: "We screen profiles for active professional backgrounds, establishing a community of accomplished individuals focused on serious commitments.",
                  badge: "Elite Verification",
                  Icon: GraduationCap,
                },
                {
                  title: "Intentional Spaces",
                  desc: "Designed to overcome superficial swiping fatigue. We focus on genuine compatibility, deep conversation, and real-life connections.",
                  badge: "No Compromise",
                  Icon: Handshake,
                }
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 px-6 py-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:bg-card/70"
                >
                  {/* Left accent rail that grows on hover */}
                  <span className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-gradient-to-b from-primary via-primary/40 to-secondary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Oversized editorial index number */}
                  <span className="pointer-events-none absolute right-5 top-3 select-none font-serif text-6xl font-black leading-none text-foreground/[0.05] transition-colors duration-500 group-hover:text-primary/10">
                    0{i + 1}
                  </span>

                  <div className="relative z-10 flex gap-5">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-primary transition-all duration-500 group-hover:border-primary/40 group-hover:bg-primary/10">
                      <card.Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0 space-y-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                        {card.badge}
                      </span>
                      <h3 className="font-serif text-xl font-black tracking-tight text-foreground">
                        {card.title}
                      </h3>
                      <div className="h-px w-10 bg-border transition-all duration-500 group-hover:w-16 group-hover:bg-primary/50" />
                      <p className="pr-6 text-sm leading-relaxed text-foreground/70">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* ── CINEMATIC SOCIAL PROOF ── */}
      <section className="relative overflow-hidden">
        {/* Full-bleed background image */}
        <img
          src={coupleHero}
          alt="Happy couple"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Rich layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />

        <div className="relative z-10 py-28 lg:py-40 px-6">
          <div className="mx-auto max-w-6xl">
            {/* Animated headline */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                {t.stats.line1.split(' ').slice(0, 3).join(' ')}{" "}
                <span className="text-gradient-brand">{t.stats.line1.split(' ').slice(3).join(' ')}</span>
              </h2>
              <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
                {t.stats.line2} <span className="font-bold text-white">{t.stats.highlight}</span> {t.stats.line3}
              </p>
            </motion.div>

            {/* Frosted glass stats bar */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {[
                {
                  value: loading ? "—" : formatStat(stats.matchSuccessRate, true),
                  label: t.mission.matchSuccess,
                  gradient: "from-primary to-primary/60",
                },
                {
                  value: loading ? "—" : formatStat(stats.activeUsers),
                  label: t.mission.verifiedProfiles,
                  gradient: "from-secondary to-secondary/60",
                },
                {
                  value: loading ? "—" : formatStat(stats.matchesDaily),
                  label: "Matches Made",
                  gradient: "from-primary to-secondary",
                },
                {
                  value: loading ? "—" : formatStat(stats.satisfactionRate, true),
                  label: "Satisfaction",
                  gradient: "from-secondary to-primary",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden"
                >
                  {/* Glass background */}
                  <div className="absolute inset-0 bg-white/[0.07] backdrop-blur-xl border border-white/[0.1]" />

                  {/* Hover accent */}
                  <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 p-6 sm:p-8 text-center">
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-white/50 font-medium tracking-wide uppercase">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Social proof text */}
            <motion.p
              className="mt-14 text-white/60 text-sm sm:text-base text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Join <span className="font-bold text-white">Black professionals</span> finding love <span className="font-bold text-primary">every single day</span>
            </motion.p>
          </div>
        </div>
      </section>


      {/* ── LOVE STORIES SECTION ── */}
      <section className="relative bg-muted/30 px-6 py-28 lg:py-36 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
            {/* Left – Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block mb-4 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                Real Stories
              </span>
              <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4rem]">
                {t.connection.title.split('\n').map((line, i) => (<span key={i}>{line}{i === 0 && <br />}</span>))}
              </h2>
              <p className="mt-6 max-w-md text-lg text-muted-foreground leading-relaxed">
                {t.connection.description}
              </p>
              <Link
                to="/auth?mode=signup"
                className="mt-10 inline-block rounded-full gradient-brand px-10 py-4 text-base font-bold text-primary-foreground shadow-button transition-all hover:scale-105"
              >
                {t.connection.cta}
              </Link>
            </motion.div>

            {/* Right – 3D rotating connection cards */}
            <ConnectionCards />
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── Hidden for free launch — restore when ready */}
      {/* <PricingSection /> */}

      <SiteFooter />

      {/* iOS PWA install instructions modal */}
      <InstallPrompt isOpen={showIOSPrompt} onClose={() => setShowIOSPrompt(false)} />
    </div>
  );
};

export default Index;

import React from "react";
import SEO from "@/components/SEO";
import { Flame, ChevronDown, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import { motion, AnimatePresence } from "framer-motion";
import heroBg from "@/assets/hero-bg.png";
import coupleHero from "@/assets/couple-hero.png";
import profile1 from "@/assets/profile-1.png";
import profile2 from "@/assets/profile-2.png";
import profile3 from "@/assets/profile-3.png";
import ConnectionCards from "@/components/ConnectionCards";
import HeroChatbot from "@/components/HeroChatbot";
// import PricingSection from "@/components/PricingSection"; // Hidden for free launch
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";
import BrandName from "@/components/BrandName";
import { useTranslation } from "@/hooks/useTranslation";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Language, languageNames } from "@/contexts/LanguageContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import InstallPrompt from "@/components/InstallPrompt";


const Index = () => {
  const { t, language, setLanguage } = useTranslation();
  const { stats, loading, formatStat } = usePlatformStats();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = React.useState(false);
  
  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      promptInstall();
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background font-display">
      <SEO title={"BlackLoveLink – Where Black Love Begins"} description={"Verified Black professionals building authentic, marriage-minded connections. Join the premier Black dating community today."} path="/" ogType="website" />
      {/* ── ULTRA PREMIUM NAVBAR ── */}
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
          ? 'backdrop-blur-2xl bg-black/40 border-b border-white/20 shadow-2xl shadow-black/20'
          : 'backdrop-blur-xl bg-black/20 border-b border-white/10'
          }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center group relative z-50">
            <motion.img
              src={blackLovelinkLogo}
              alt="BlackLoveLink"
              className="h-12 w-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 lg:flex">
            <motion.a
              href="/"
              className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.5 }}
            >
              <span className="relative z-10">{t.nav.home}</span>
              <motion.span
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Link
                to="/how-it-works"
                className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                <span className="relative z-10">{t.nav.howItWorks}</span>
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>



            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                to="/success-stories"
                className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                <span className="relative z-10">{t.nav.successStories}</span>
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link
                to="/trust-safety"
                className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                <span className="relative z-10">{t.nav.trustSafety}</span>
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                to="/support"
                className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                <span className="relative z-10">{t.nav.support}</span>
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                to="/education"
                className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                <span className="relative z-10">Relationship Hub</span>
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link
                to="/contact"
                className="group relative px-4 py-2.5 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                <span className="relative z-10">Contact</span>
                <motion.span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Language & CTA */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative group hidden md:block">
              <motion.button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground/90 bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-primary/10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden lg:inline font-medium">{t.nav.language}</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </motion.button>

              {/* Dropdown Menu */}
              <motion.div
                className="absolute right-0 top-full mt-3 w-52 rounded-2xl bg-background/98 backdrop-blur-2xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden"
                initial={{ y: -10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
              >
                <div className="p-2">
                  {(Object.keys(languageNames) as Language[]).map((lang, i) => (
                    <motion.button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-200 ${language === lang
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                        : 'text-foreground hover:bg-accent/50'
                        }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      {languageNames[lang]}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            >
              <Link
                to="/auth"
                className="group relative overflow-hidden rounded-full gradient-brand px-8 py-3 text-sm font-bold text-white shadow-button transition-all duration-300 hover:opacity-90 hover:scale-105"
              >
                <span className="relative z-10">{t.nav.signIn}</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-primary-foreground hover:bg-white/10 transition-all"
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
                  className="w-full h-0.5 bg-white/80 rounded-full"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  className="w-full h-0.5 bg-white/80 rounded-full"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -8 }
                  }}
                  className="w-full h-0.5 bg-white/80 rounded-full"
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
              className="lg:hidden border-t border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-6 py-6 space-y-2">
                {[t.nav.home, t.nav.howItWorks, t.nav.successStories, t.nav.trustSafety, t.nav.support].map((l, i) => (
                  <motion.a
                    key={l}
                    href="#"
                    className="block px-4 py-3 text-sm font-medium text-primary-foreground/90 rounded-xl hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {l}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/education"
                    className="block px-4 py-3 text-sm font-medium text-primary-foreground/90 rounded-xl hover:bg-white/5 transition-colors"
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
                    className="block px-4 py-3 text-sm font-medium text-primary-foreground/90 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Contact
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
        {/* Hero image with reduced opacity for premium feel */}
        <img
          src={heroBg}
          alt="Black professionals connecting on BlackLoveLink"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        {/* Premium layered overlays */}
        {/* Base dark scrim */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Vignette — darkens edges, keeps center visible */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />
        {/* Brand color tint — gives it that signature warm-gold/red glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/15" />
        {/* Bottom fade so hero text is always crisp. We keep it dark in light mode to avoid a milky white wash over the dark image. */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 dark:from-background/80 to-transparent" />

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
              <BrandName dark stacked className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] mx-auto" />
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
              {t.hero.startJourney}
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
                📲 Download App
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── AI CHATBOT (Floating Bubble) ── */}
      <HeroChatbot />

      {/* ── MISSION SECTION ── */}
      <section id="mission" className="relative bg-muted/30 px-6 py-28 lg:py-36 overflow-hidden scroll-mt-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.h2
            className="text-4xl font-black leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {t.mission.title}{" "}
            <span className="text-gradient-brand">{t.mission.titleHighlight}</span>
          </motion.h2>

          <motion.p
            className="mt-8 max-w-2xl mx-auto text-lg leading-relaxed text-foreground/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.mission.description}
          </motion.p>

          <motion.p
            className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-foreground/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {t.mission.subDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10"
          >
            <Link
              to="/auth"
              className="gradient-brand inline-block rounded-full px-10 py-4 text-lg font-bold text-primary-foreground shadow-button transition-transform hover:scale-105"
            >
              {t.mission.cta}
            </Link>
          </motion.div>
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
                to="/auth"
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

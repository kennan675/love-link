import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, Instagram, Youtube, Facebook } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Language, languageNames } from "@/contexts/LanguageContext";

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

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/blacklove.link/" },
  { icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@blacklove.link" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@blacklovelink" },
  { icon: Facebook, label: "Facebook", href: "https://web.facebook.com/people/Black-Love-Link/61594268287175/" },
  { icon: XIcon, label: "X", href: "https://www.x.com/blacklovelimit" },
];


const SharedNavbar = () => {
    const { t, language, setLanguage } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [langOpen, setLangOpen] = React.useState(false);
    const langRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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

    const navLinks = [
        { label: t.nav.home, to: "/" },
        { label: t.nav.howItWorks, to: "/how-it-works" },
        { label: t.nav.successStories, to: "/success-stories" },
        { label: t.nav.trustSafety, to: "/trust-safety" },
        { label: t.nav.support, to: "/support" },
        { label: "Relationship Hub", to: "/education" },
    ];

    return (
        <motion.header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
                ? "backdrop-blur-2xl bg-background/80 border-b border-border shadow-lg"
                : "backdrop-blur-xl bg-background/60 border-b border-border/50"
                }`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:pr-10 h-16">
                {/* Logo */}
                <Link to="/" className="group relative z-50 flex shrink-0 items-center rounded-full px-4 py-2 transition-all duration-300">
                    <span className="font-serif italic text-lg font-semibold leading-none tracking-tight whitespace-nowrap">
                        <span className="text-foreground">black</span>
                        <span className="text-primary">love</span>
                        <span className="text-secondary">link</span>
                    </span>
                </Link>


                {/* Desktop Nav Links */}
                <div className="hidden items-center gap-1 xl:flex">
                    {navLinks.map((link, i) => (
                        <motion.div
                            key={link.to}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.5 }}
                        >
                            <Link
                                to={link.to}
                                className="group relative px-2.5 2xl:px-4 py-2 text-xs 2xl:text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                            >
                                <span className="relative z-10">{link.label}</span>
                                <motion.span
                                    className="absolute inset-0 rounded-xl bg-primary/5"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Right Side */}
                <div className="flex shrink-0 items-center gap-1.5 xl:gap-2">
                    {/* Social Icons — desktop only */}
                    <div className="hidden lg:flex items-center gap-1">
                        {socialLinks.map(({ icon: Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-7 w-7 xl:h-8 xl:w-8 items-center justify-center rounded-xl bg-muted/60 border border-border text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary"
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
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground/80 bg-muted/40 backdrop-blur-md border border-border/60 transition-all duration-200 hover:bg-muted hover:text-foreground"
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
                        className="xl:hidden p-2 rounded-xl bg-muted/50 backdrop-blur-md border border-border text-foreground hover:bg-muted transition-all"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            animate={mobileMenuOpen ? "open" : "closed"}
                            className="w-6 h-5 flex flex-col justify-between"
                        >
                            <motion.span
                                variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 8 } }}
                                className="w-full h-0.5 bg-foreground rounded-full"
                            />
                            <motion.span
                                variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
                                className="w-full h-0.5 bg-foreground rounded-full"
                            />
                            <motion.span
                                variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -8 } }}
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
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="xl:hidden border-t border-border bg-background/95 backdrop-blur-2xl overflow-hidden"
                    >
                        <div className="px-6 py-6 space-y-2">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-medium text-foreground/80 rounded-xl hover:bg-muted transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

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
                                {socialLinks.map(({ icon: Icon, label, href }) => (
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
    );
};

export default SharedNavbar;

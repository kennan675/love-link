import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";
import { useTranslation } from "@/hooks/useTranslation";
import { Language, languageNames } from "@/contexts/LanguageContext";

const SharedNavbar = () => {
    const { t, language, setLanguage } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 h-16">
                {/* Logo */}
                <Link to="/" className="group relative z-50 flex shrink-0 items-center gap-2.5 rounded-full bg-white/95 pl-1.5 pr-3 py-1.5 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl">
                    <motion.img
                        src={blackLovelinkLogo}
                        alt="BlackLoveLink"
                        className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                        whileHover={{ rotate: -6, scale: 1.06 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    />
                    <span className="hidden sm:block font-serif text-base font-black leading-none tracking-tight">
                        <span className="text-neutral-900">black</span>
                        <span className="text-primary">love</span>
                        <span className="text-secondary">link</span>
                    </span>
                </Link>


                {/* Desktop Nav Links */}
                <div className="hidden items-center gap-1 lg:flex">
                    {navLinks.map((link, i) => (
                        <motion.div
                            key={link.to}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.5 }}
                        >
                            <Link
                                to={link.to}
                                className="group relative px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
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
                <div className="flex shrink-0 items-center gap-3">
                    {/* Language Dropdown */}
                    <div className="relative group hidden md:block">
                        <motion.button
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground/80 bg-muted/50 backdrop-blur-md border border-border transition-all duration-300 hover:bg-muted hover:border-border"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Globe className="h-4 w-4" />
                            <span className="hidden lg:inline font-medium">{t.nav.language}</span>
                            <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                        </motion.button>

                        <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl bg-card backdrop-blur-2xl border border-border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                            <div className="p-2">
                                {(Object.keys(languageNames) as Language[]).map((lang, i) => (
                                    <motion.button
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        className={`w-full px-4 py-3 text-left text-sm font-medium rounded-xl transition-all duration-200 ${language === lang
                                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                                            : "text-foreground hover:bg-accent/50"
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
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    >
                        <Link
                            to="/auth"
                            className="group relative overflow-hidden rounded-full gradient-brand px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-button transition-all duration-300 hover:opacity-90 hover:scale-105 whitespace-nowrap"
                        >
                            <span className="relative z-10">{t.nav.signIn}</span>
                            <motion.span
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.6 }}
                            />
                        </Link>
                    </motion.div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        className="lg:hidden p-2 rounded-xl bg-muted/50 backdrop-blur-md border border-border text-foreground hover:bg-muted transition-all"
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
                        className="lg:hidden border-t border-border bg-background/95 backdrop-blur-2xl overflow-hidden"
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default SharedNavbar;

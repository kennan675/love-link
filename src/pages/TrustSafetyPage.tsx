import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, UserCheck, Lock, Eye, AlertCircle, MessageSquare, ShieldAlert } from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const TrustSafetyPage = () => {
    const features = [
        {
            icon: UserCheck,
            title: "Profile Verification",
            description: "Every member goes through our verification process. We use photo verification and document checks to ensure you're connecting with real people, not bots or fake profiles."
        },
        {
            icon: Lock,
            title: "Data Encryption",
            description: "Your data is protected with bank-level encryption. We use industry-standard SSL/TLS protocols to keep your personal information and conversations secure."
        },
        {
            icon: Eye,
            title: "Privacy Controls",
            description: "You control what you share and when. Hide your profile, block users, control who can message you, and manage your visibility with granular privacy settings."
        },
        {
            icon: Shield,
            title: "Safety Guidelines",
            description: "Our community guidelines keep BlackLoveLink a respectful space. We have zero tolerance for harassment, hate speech, or inappropriate behavior."
        },
        {
            icon: AlertCircle,
            title: "24/7 Moderation",
            description: "Our dedicated safety team reviews reports around the clock. If you encounter concerning behavior, we investigate and take action quickly."
        },
        {
            icon: MessageSquare,
            title: "Safe Messaging",
            description: "Connect on your terms. Share your contact information only when you're ready. Report or block anyone who makes you uncomfortable with a single tap."
        }
    ];

    const safetyTips = [
        "Take your time getting to know someone before meeting in person",
        "Meet in public places for your first few dates",
        "Tell a friend or family member about your plans",
        "Trust your instincts – if something feels off, it probably is",
        "Never share financial information or send money",
        "Report suspicious behavior immediately",
        "Keep conversations on the platform until you feel comfortable",
        "Video chat before meeting to verify identity"
    ];

    return (
        <div className="min-h-screen font-display bg-background text-foreground">
      <SEO title={"Trust & Safety | BlackLoveLink"} description={"How BlackLoveLink keeps Black professionals safe — verification, encryption, privacy controls, and 24/7 moderation."} path="/trust-safety" ogType="website" />
            <SharedNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                            <Shield className="w-5 h-5 text-primary" />
                            <span className="text-primary font-semibold">Your Safety is Our Priority</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6">
                            Trust & <span className="text-gradient-brand">Safety</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            We're committed to creating a safe, respectful space where Black professionals can build authentic connections with confidence.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-3xl bg-card border border-border hover:bg-muted transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety Tips Section */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                            Dating Safety Tips
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Stay safe while finding your perfect match
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {safetyTips.map((tip, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-primary-foreground text-sm font-bold">
                                    ✓
                                </div>
                                <p className="text-foreground/90">{tip}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Child Safety & CSAE Standards Section */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-4xl">
                    <div className="p-8 rounded-3xl bg-destructive/5 border-2 border-destructive/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-wider">
                                <ShieldAlert className="w-3.5 h-3.5" /> Child Safety Standards
                            </div>
                            <h2 className="text-2xl font-black text-foreground">
                                Zero Tolerance for Child Sexual Abuse & Exploitation (CSAE)
                            </h2>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                BlackLoveLink is strictly 18+. We enforce comprehensive published standards, proactive detection, immediate termination, and mandatory reporting to the National Center for Missing & Exploited Children (NCMEC).
                            </p>
                        </div>
                        <Link
                            to="/child-safety"
                            className="shrink-0 px-6 py-3 rounded-full bg-destructive text-destructive-foreground font-bold text-sm hover:bg-destructive/90 transition-all hover:scale-105"
                        >
                            Read CSAE Standards →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Report Section */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                    >
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                                See Something Concerning?
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                Report it immediately. Our safety team investigates all reports within 24 hours.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/support"
                                    className="rounded-full gradient-brand px-8 py-3 text-sm font-bold text-primary-foreground hover:scale-105 transition-all"
                                >
                                    Report a Concern
                                </Link>
                                <a
                                    href="mailto:safety@blacklovelink.com"
                                    className="rounded-full bg-muted border border-border px-8 py-3 text-sm font-bold text-foreground hover:bg-accent transition-all"
                                >
                                    Email Safety Team
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
};

export default TrustSafetyPage;

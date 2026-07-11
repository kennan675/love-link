import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    UserCheck, Heart, MessageCircle, Sparkles, Shield, CheckCircle,
    Star, Users, Lock, Award, Target, Gem
} from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const HowItWorksPage = () => {

    /* ── About / Values ─────────────────────────────────────── */
    const values = [
        {
            icon: Heart,
            title: "Authentic Love",
            description: "We believe every Black professional deserves a partner who truly sees, understands, and celebrates them. We build spaces where love can grow without compromise.",
            color: "from-primary to-secondary",
        },
        {
            icon: Shield,
            title: "Safety & Trust",
            description: "All members are verified through Google OAuth and active profile screening. Your privacy and security are non-negotiable.",
            color: "from-secondary to-primary",
        },
        {
            icon: Users,
            title: "Community First",
            description: "Built for and by the Black professional community. We celebrate diversity of background, culture, and career while honouring shared identity.",
            color: "from-primary to-secondary",
        },
        {
            icon: Star,
            title: "Serious Intent",
            description: "Our platform is for people who are ready for meaningful, lasting relationships — not casual scrolling. Every feature is designed with long-term love in mind.",
            color: "from-secondary to-primary",
        },
        {
            icon: Target,
            title: "Quality Over Quantity",
            description: "We enforce minimum profile completeness, verified photos, and occupation checks so every person you see is someone worth your time.",
            color: "from-primary to-secondary",
        },
        {
            icon: Gem,
            title: "Excellence",
            description: "From our premium UI to our AI-powered matching, BlackLoveLink holds itself to the same standard of excellence our members hold themselves to professionally.",
            color: "from-secondary to-primary",
        },
    ];

    /* ── How It Works steps ─────────────────────────────────── */
    const steps = [
        {
            icon: UserCheck,
            title: "Create Your Verified Profile",
            description: "Sign up with Google or Email. Complete your profile with photos (minimum 2), occupation details, date of birth, relationship intent, and interests. Your profile is your brand.",
            color: "from-primary to-secondary",
        },
        {
            icon: Shield,
            title: "Multi-Factor Verification",
            description: "Every member completes Google OAuth or secure email registration. Occupation and profile details are verified through our internal checks to ensure authenticity.",
            color: "from-secondary to-primary",
        },
        {
            icon: Target,
            title: "Grant Location & Notifications",
            description: "After joining, allow location access so we can show you matches near you, and enable notifications so you never miss a connection. Both are optional but improve your experience.",
            color: "from-primary to-secondary",
        },
        {
            icon: Heart,
            title: "Discover Smart Matches",
            description: "Browse verified profiles filtered by age range, distance, relationship intent, and shared interests. Our matchmaking surfaces people who align with what you're actually looking for.",
            color: "from-secondary to-primary",
        },
        {
            icon: MessageCircle,
            title: "Connect & Converse",
            description: "Mutual interest unlocks messaging. Start the conversation with our ice-breaker prompts or go straight in. Real connections begin with real conversations.",
            color: "from-primary to-secondary",
        },
        {
            icon: Sparkles,
            title: "Build Something Real",
            description: "Take your time. From video profile intros to event-based meetups, BlackLoveLink gives you tools to nurture a connection that can last a lifetime.",
            color: "from-secondary to-primary",
        },
    ];

    const features = [
        { icon: CheckCircle, text: "100% verified profiles" },
        { icon: CheckCircle, text: "Occupation verification" },
        { icon: CheckCircle, text: "Safe & secure messaging" },
        { icon: CheckCircle, text: "Location-based matching" },
        { icon: CheckCircle, text: "Smart interest filters" },
        { icon: CheckCircle, text: "25+ age verified members" },
        { icon: CheckCircle, text: "Privacy controls" },
        { icon: CheckCircle, text: "24/7 support team" },
        // { icon: CheckCircle, text: "Premium Gold tier available" }, // Hidden for free launch
    ];

    const fadeUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 },
    };

    return (
        <div className="min-h-screen font-display bg-background text-foreground">
      <SEO title={"How It Works | BlackLoveLink"} description={"Learn how BlackLoveLink verifies members, matches Black professionals, and helps you build authentic, lasting relationships."} path="/how-it-works" ogType="website" />
            <SharedNavbar />

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-4xl relative"
                >
                    <span className="inline-block mb-4 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                        About BlackLoveLink
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        Love That <span className="text-gradient-brand">Reflects You</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        BlackLoveLink is a premium matchmaking platform built specifically for Black professionals aged 25+, where verified identity, serious intent, and cultural pride create the foundation for lasting love.
                    </p>
                </motion.div>
            </section>

            {/* ── WHAT WE ARE ─────────────────────────────────────────── */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-6xl">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            What Is <span className="text-gradient-brand">BlackLoveLink?</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            We are not just another dating app. BlackLoveLink is a curated community for ambitious, career-driven Black men and women who are ready to invest in a serious relationship. Every member is verified, every profile is intentional, and every connection is built on mutual respect and shared values.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { label: "25+", sub: "Age verified members" },
                            { label: "100%", sub: "Verified profiles" },
                            { label: "3-Step", sub: "Authentication process" },
                        ].map((stat) => (
                            <motion.div
                                key={stat.label}
                                {...fadeUp}
                                className="rounded-3xl border border-border bg-background p-8"
                            >
                                <p className="text-5xl font-black text-gradient-brand">{stat.label}</p>
                                <p className="mt-2 text-muted-foreground font-medium">{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OUR VALUES ──────────────────────────────────────────── */}
            <section className="py-24 px-6">
                <div className="mx-auto max-w-6xl">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Our <span className="text-gradient-brand">Values</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything we build is guided by these principles.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((v, i) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="rounded-3xl border border-border bg-card p-8 hover:border-primary/30 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${v.color} p-0.5 mb-5`}>
                                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                                        <v.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">{v.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">{v.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHO WE'RE FOR ────────────────────────────────────────── */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div {...fadeUp}>
                        <Award className="w-12 h-12 mx-auto mb-6 text-primary" strokeWidth={1.5} />
                        <h2 className="text-4xl md:text-5xl font-black mb-6">
                            Built for <span className="text-gradient-brand">Black Professionals</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                            Whether you're a doctor, engineer, entrepreneur, lawyer, artist, or educator — BlackLoveLink is for Black professionals aged 25 and above who have worked hard to build their lives and are now ready to share it with someone equally driven and equally extraordinary. We require profile and background checks because authenticity matters here.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {["25+ age verified", "Occupation verified", "Real photos", "Serious intent", "Secure auth"].map((tag) => (
                                <span key={tag} className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <section className="py-24 px-6">
                <div className="mx-auto max-w-6xl">
                    <motion.div {...fadeUp} className="text-center mb-20">
                        <span className="inline-block mb-4 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                            Step by Step
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            How It <span className="text-gradient-brand">Works</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Finding authentic love shouldn't be complicated. Here's your journey on BlackLoveLink.
                        </p>
                    </motion.div>

                    <div className="space-y-28">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.08 }}
                                className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}
                            >
                                <div className="flex-shrink-0 relative">
                                    <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} p-1`}>
                                        <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center">
                                            <step.icon className="w-16 h-16 text-foreground" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-black text-lg">
                                        {index + 1}
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-3xl md:text-4xl font-black mb-4">{step.title}</h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES GRID ────────────────────────────────────────── */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-6xl">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Everything You Need</h2>
                        <p className="text-xl text-muted-foreground">Built with your safety and success in mind</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all"
                            >
                                <feature.icon className="w-6 h-6 text-primary flex-shrink-0" />
                                <span className="text-foreground font-semibold">{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────────── */}
            <section className="py-32 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div {...fadeUp}>
                        <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Find Your Person?</h2>
                        <p className="text-xl text-muted-foreground mb-12">
                            Join a growing community of Black professionals building real love.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block gradient-brand rounded-full px-12 py-4 text-lg font-bold text-primary-foreground shadow-button transition-all hover:scale-105"
                        >
                            Create Your Profile
                        </Link>
                    </motion.div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
};

export default HowItWorksPage;

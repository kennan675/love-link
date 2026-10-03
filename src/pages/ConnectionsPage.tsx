import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Flame, Zap, Target, Users, TrendingUp } from "lucide-react";
import profile1 from "@/assets/profile-1.png";
import profile2 from "@/assets/profile-2.png";
import profile3 from "@/assets/profile-3.png";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";

const ConnectionsPage = () => {
    const { stats: platformStats, loading, formatStat } = usePlatformStats();
    const features = [
        {
            icon: Target,
            title: "Smart Matching",
            description: "Our algorithm learns your preferences and suggests compatible matches based on shared values, interests, and relationship goals."
        },
        {
            icon: Heart,
            title: "Mutual Interest",
            description: "See who likes you and match instantly when the feeling is mutual. No guessing games—just genuine connections."
        },
        {
            icon: Flame,
            title: "Super Like",
            description: "Stand out from the crowd. Show someone you're really interested with a Super Like and jump to the top of their match queue."
        },
        {
            icon: Zap,
            title: "Instant Messaging",
            description: "Once matched, start chatting immediately. Share photos, voice notes, and build a connection at your own pace."
        },
        {
            icon: Users,
            title: "Community Events",
            description: "Join virtual and in-person events to meet other Black professionals in your area. From happy hours to cultural celebrations."
        },
        {
            icon: TrendingUp,
            title: "Profile Boost",
            description: "Increase your visibility and get more matches. Boost your profile to be seen by more compatible users in your area."
        }
    ];

    const stats = [
        { number: loading ? "..." : formatStat(platformStats.activeUsers), label: "Active Users", description: "Verified Black professionals" },
        { number: loading ? "..." : formatStat(platformStats.matchesDaily), label: "Matches Daily", description: "Real connections happening now" },
        { number: loading ? "..." : formatStat(platformStats.matchSuccessRate, true), label: "Match Success", description: "Lead to conversations" }
    ];

    return (
        <div className="min-h-screen font-display bg-background text-foreground">
            <SharedNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                                <Heart className="w-5 h-5 text-primary fill-primary" />
                                <span className="text-primary font-semibold">Making Meaningful Connections</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6">
                                Find Your <span className="text-gradient-brand">Connection</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                                Connect with verified Black professionals who share your values, ambitions, and vision for the future. Every swipe brings you closer to something real.
                            </p>
                            <Link
                                to="/auth"
                                className="inline-block rounded-full gradient-brand px-10 py-4 text-lg font-bold text-primary-foreground shadow-button hover:scale-105 transition-all"
                            >
                                Start Matching
                            </Link>
                        </motion.div>

                        {/* Profile Stack Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative h-[500px] flex items-center justify-center">
                                {[profile1, profile2, profile3].map((img, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ rotate: 0, x: 0, y: 0 }}
                                        animate={{
                                            rotate: [0, (index - 1) * 5, 0],
                                            x: [(index - 1) * 30, (index - 1) * 40, (index - 1) * 30],
                                            y: [index * 20, index * 30, index * 20],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: index * 0.2,
                                        }}
                                        className="absolute w-72 h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-border"
                                        style={{ zIndex: 3 - index }}
                                    >
                                        <img src={img} alt="Profile" className="w-full h-full object-cover" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                            Connection Features
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Everything you need to find meaningful connections
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-3xl bg-muted/50 border border-border hover:bg-muted transition-all group"
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

            {/* Stats Section */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
                            >
                                <div className="text-6xl font-black text-primary mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-2xl font-bold text-foreground mb-2">
                                    {stat.label}
                                </div>
                                <div className="text-muted-foreground">
                                    {stat.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                            It's Simple
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Start connecting in three easy steps
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Browse", description: "Explore profiles of verified Black professionals in your area" },
                            { step: "02", title: "Match", description: "Like profiles that interest you. When it's mutual, you match!" },
                            { step: "03", title: "Connect", description: "Start chatting and build something meaningful" }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-6xl font-black text-primary/20 mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6">
                            Your Next Connection Awaits
                        </h2>
                        <p className="text-xl text-muted-foreground mb-12">
                            Join thousands finding meaningful relationships
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block rounded-full gradient-brand px-12 py-4 text-lg font-bold text-primary-foreground shadow-button transition-all hover:scale-105"
                        >
                            Start Swiping
                        </Link>
                    </motion.div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
};

export default ConnectionsPage;

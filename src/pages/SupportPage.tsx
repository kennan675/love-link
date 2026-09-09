import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle, HelpCircle, Send } from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";
import HeroChatbot from "@/components/HeroChatbot";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SupportPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const faqs = [
        {
            question: "How do I verify my profile?",
            answer: "After creating your account, navigate to Settings > Verification. You'll be asked to take a selfie that matches your profile photos and provide a valid ID. Verification typically takes 24-48 hours."
        },

        {
            question: "How does matching work?",
            answer: "Our algorithm considers your preferences, location, interests, and values. When you both show interest (like/super like), it's a match! You'll be notified and can start chatting."
        },
        {
            question: "Can I hide my profile?",
            answer: "Absolutely. Go to Settings > Privacy and toggle 'Hide Profile.' You'll be invisible to other users but can still browse. You can also pause your account temporarily."
        },
        {
            question: "What if I encounter inappropriate behavior?",
            answer: "Tap the three dots on any profile or conversation and select 'Report.' Our safety team reviews all reports within 24 hours. You can also block users directly."
        },
        {
            question: "How do I suspend my account?",
            answer: "Go to Settings > Account > Suspend Account. Your profile will be hidden from other users and your matches will be preserved. You can reactivate your account at any time simply by logging back in. Suspending is ideal if you're taking a break but plan to return."
        },
        {
            question: "How do I delete my account?",
            answer: "Go to Settings > Account > Delete Account. Please note this action is permanent and cannot be undone. Your data will be deleted according to our privacy policy. We recommend placing your account in suspend status instead of deleting it, in case you want to come back. Suspending preserves your profile, matches, and conversations so you can pick up right where you left off."
        }
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Us",
            description: "Get a response within 24 hours",
            action: "support@blacklovelink.com",
            color: "from-primary to-secondary",
            href: "mailto:support@blacklovelink.com"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Available Mon-Fri, 9AM-6PM ET",
            action: "Start Chat",
            color: "from-secondary to-primary",
            onClick: () => window.dispatchEvent(new CustomEvent("open-chatbot"))
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Speak with our team directly",
            action: "+233 550 425 321",
            color: "from-primary to-secondary",
            href: "tel:+233550425321"
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const { error } = await (supabase as any).from('support_tickets').insert({
                sender_name: formData.name,
                sender_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                status: 'open'
            });

            if (error) throw error;
            
            toast.success("Message sent successfully! We will get back to you soon.");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (err) {
            console.error("Error submitting ticket:", err);
            toast.error("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="min-h-screen font-display bg-background text-foreground">
            <SEO
                title="Support Center | BlackLoveLink"
                description="Get help with your BlackLoveLink account — FAQs, contact options, and live support for our Black professional dating community."
                path="/support"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: faqs.map(f => ({
                        "@type": "Question",
                        name: f.question,
                        acceptedAnswer: { "@type": "Answer", text: f.answer },
                    })),
                }}
            />
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
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <span className="text-primary font-semibold">We're Here to Help</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6">
                            Support <span className="text-gradient-brand">Center</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Have questions? Need help? Our dedicated support team is here for you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {contactMethods.map((method, index) => {
                            const CardContent = (
                                <>
                                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <method.icon className="w-8 h-8 text-primary-foreground" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-2">
                                        {method.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        {method.description}
                                    </p>
                                    <div className="text-primary font-bold text-lg">
                                        {method.action}
                                    </div>
                                </>
                            );

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-8 rounded-3xl bg-card border border-border transition-all text-center group ${method.onClick || method.href ? 'cursor-pointer hover:bg-muted' : 'hover:bg-muted'}`}
                                >
                                    {method.href ? (
                                        <a href={method.href} className="block w-full h-full">
                                            {CardContent}
                                        </a>
                                    ) : method.onClick ? (
                                        <div onClick={method.onClick} className="block w-full h-full">
                                            {CardContent}
                                        </div>
                                    ) : (
                                        CardContent
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-20 px-6 bg-card">
                <div className="mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                            Send Us a Message
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            We'll get back to you within 24 hours
                        </p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={handleSubmit}
                        className="p-8 rounded-3xl bg-muted/50 border border-border space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
                                placeholder="How can we help?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-muted-foreground"
                                rows={6}
                                placeholder="Tell us more about your question or concern..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full gradient-brand text-primary-foreground font-bold hover:scale-105 transition-all"
                        >
                            <Send className="w-5 h-5" />
                            Send Message
                        </button>
                    </motion.form>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Quick answers to common questions
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.details
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 rounded-2xl bg-card border border-border group"
                            >
                                <summary className="text-lg font-bold text-foreground cursor-pointer list-none flex items-center justify-between">
                                    {faq.question}
                                    <span className="text-2xl text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                                </summary>
                                <p className="mt-4 text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </motion.details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chatbot Bubble overlay for this page */}
            <HeroChatbot />

            <SiteFooter />
        </div>
    );
};

export default SupportPage;

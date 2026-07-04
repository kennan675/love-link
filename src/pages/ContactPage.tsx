import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const firstName = (form.querySelector('#firstName') as HTMLInputElement).value;
    const lastName = (form.querySelector('#lastName') as HTMLInputElement).value;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const subject = (form.querySelector('#subject') as HTMLInputElement).value;
    const message = (form.querySelector('#message') as HTMLTextAreaElement).value;

    try {
        const { error } = await supabase.from('support_tickets').insert({
            sender_name: `${firstName} ${lastName}`,
            sender_email: email,
            subject,
            message,
            status: 'open'
        });

        if (error) throw error;

        toast.success("Message sent successfully! We will get back to you soon.");
        form.reset();
    } catch (err) {
        console.error("Error submitting ticket:", err);
        toast.error("Failed to send message. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-display flex flex-col pt-[88px]">
      <SEO title={"Contact Us | BlackLoveLink"} description={"Get in touch with the BlackLoveLink team. Reach our Accra head office by phone, email, or contact form."} path="/contact" ogType="website" />
      {/* ── SIMPLE NAVBAR ── */}
      <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-black tracking-tight">
            Black<span className="text-primary">Love</span><span className="text-secondary">Link</span>
          </Link>
          <div className="flex gap-4">
            <Link to="/auth" className="text-sm font-semibold hover:text-primary transition-colors">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative px-6 py-20 lg:py-32 overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-black tracking-tight sm:text-6xl mb-6">
                Get in <span className="text-gradient-brand">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you have a question about features, your account, or anything else, our team is ready to answer all your questions.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-10"
            >
              <div>
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-muted-foreground mt-1">support@blacklovelink.com</p>
                      <p className="text-muted-foreground">press@blacklovelink.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <p className="text-muted-foreground mt-1">+233 550 425 321</p>
                      <p className="text-sm text-foreground/50 mt-0.5">Mon-Fri from 8am to 5pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Head Office Annex</p>
                      <p className="text-muted-foreground mt-1">48 IPS Road – East Legon</p>
                      <p className="text-muted-foreground">Accra, Ghana</p>
                      <p className="text-muted-foreground">West Africa</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-card border border-border/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <MessageSquare className="w-8 h-8 text-primary mb-4" />
                <h4 className="text-xl font-bold mb-2">Need immediate help?</h4>
                <p className="text-muted-foreground text-sm mb-6">
                  Check out our Help Center for quick answers to common questions about matchmaking, safety, and your account.
                </p>
                <Link to="/support">
                  <Button variant="outline" className="rounded-full w-full">
                    Visit Support Center
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-[2.5rem] bg-card border border-border/50 shadow-xl shadow-black/5">
                <h3 className="text-2xl font-bold mb-8">Send us a message</h3>
                
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-semibold">First Name</label>
                      <Input id="firstName" required className="rounded-xl h-12 bg-background" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-semibold">Last Name</label>
                      <Input id="lastName" required className="rounded-xl h-12 bg-background" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email Address</label>
                    <Input id="email" type="email" required className="rounded-xl h-12 bg-background" placeholder="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                    <Input id="subject" required className="rounded-xl h-12 bg-background" placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold">Message</label>
                    <Textarea 
                      id="message" 
                      required 
                      className="rounded-xl min-h-[150px] bg-background resize-y" 
                      placeholder="Please describe your issue or inquiry in detail..." 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl text-base font-bold gradient-brand shadow-button hover:opacity-90 transition-all"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ContactPage;

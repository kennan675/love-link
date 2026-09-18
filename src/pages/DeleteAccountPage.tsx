import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Mail, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import SharedNavbar from "@/components/SharedNavbar";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DeleteAccountPage = () => {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user exists and flag for deletion
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email.trim().toLowerCase())
        .limit(1);

      if (profiles && profiles.length > 0) {
        const scheduledDeletion = new Date();
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

        await supabase.from("profiles").update({
          is_public: false,
          // @ts-ignore
          deactivated_at: new Date().toISOString(),
          // @ts-ignore
          scheduled_deletion_at: scheduledDeletion.toISOString(),
          // @ts-ignore
          deletion_requested: true,
          // @ts-ignore
          leave_reason: reason || "Requested via account deletion page",
        }).eq("user_id", profiles[0].user_id);
      }

      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again or contact support@blacklovelink.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Delete Account | BlackLoveLink"
        description="Request deletion of your BlackLoveLink account and all associated data."
        path="/delete-account"
      />
      <SharedNavbar />

      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-3xl font-black text-foreground">Delete Your Account</h1>
              <p className="text-foreground/70 max-w-md mx-auto">
                Request permanent deletion of your BlackLoveLink account and all associated personal data.
              </p>
            </div>

            {!isSubmitted ? (
              <>
                {/* What happens section */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    What happens when you delete your account
                  </h2>
                  <ul className="space-y-3 text-foreground/80 text-sm">
                    <li className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                      <span>Your profile is <strong>immediately hidden</strong> from other users.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                      <span>All personal data is <strong>permanently erased within 30 days</strong>.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                      <span>Matches, messages, and connections will be <strong>permanently deleted</strong>.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                      <span>A 90-day safety hold applies for active fraud/safety investigations as required by law.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                      <span>This action <strong>cannot be undone</strong> after the 30-day grace period.</span>
                    </li>
                  </ul>
                </div>

                {/* In-app option note */}
                <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Prefer to do it in the app?
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    If you're logged in, you can delete your account directly from{" "}
                    <strong>Settings → Account → Delete Account</strong>. You can also choose to{" "}
                    <strong>suspend</strong> your account instead, which preserves your data in case you want to come back.
                  </p>
                </div>

                {/* Deletion request form */}
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <h2 className="text-lg font-bold text-foreground">Request Account Deletion</h2>
                  <p className="text-foreground/70 text-sm">
                    Enter the email address associated with your BlackLoveLink account.
                  </p>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reason" className="text-sm font-medium text-foreground">
                      Reason for leaving (optional)
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="We'd love to know how we can improve..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Processing..." : "Request Account Deletion"}
                  </button>
                </form>

                {/* Contact fallback */}
                <p className="text-center text-foreground/60 text-sm">
                  Need help? Contact us at{" "}
                  <a href="mailto:support@blacklovelink.com" className="text-primary hover:underline">
                    support@blacklovelink.com
                  </a>
                </p>
              </>
            ) : (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl border border-border p-8 text-center space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Deletion Request Received</h2>
                <p className="text-foreground/70 text-sm max-w-md mx-auto">
                  If an account exists with that email address, it has been scheduled for deletion.
                  Your profile has been hidden immediately, and all data will be permanently erased within <strong>30 days</strong>.
                </p>
                <p className="text-foreground/70 text-sm">
                  If you change your mind, log in within 30 days to cancel the deletion.
                </p>
                <div className="pt-4">
                  <Link
                    to="/"
                    className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Return to Home
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
};

export default DeleteAccountPage;

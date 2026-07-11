import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Heart, LogOut, Trash2, ChevronRight, ChevronLeft,
    PauseCircle, AlertTriangle, Loader2, CheckCircle2, MessageSquare, X,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteAccountConsentModal } from "@/components/ConsentModals";

/* ─── types ─── */
type View = "main" | "leave-flow";
type LeaveStep = "why" | "what-to-improve" | "deactivate-confirm" | "delete-confirm" | "farewell";

const LEAVE_REASONS = [
    "I found someone 💕",
    "Not enough matches for me",
    "Taking a break",
    "App feels too complicated",
    "Privacy concerns",
    "Found another platform",
    "Other",
];

const IMPROVE_OPTIONS = [
    "Better matching algorithm",
    "More members in my area",
    "Easier navigation",
    "More features",
    "Better profiles",
    "Faster performance",
    "Other",
];

/* ─── Helper row ─── */
const Row = ({ icon: Icon, title, subtitle, onClick, danger = false }: any) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 bg-card active:bg-muted/50 transition-colors border-b border-border/50 last:border-0 group"
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${danger ? "bg-red-100 dark:bg-red-950/30 text-red-500" : "bg-primary/10 text-primary"}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
                <p className={`font-semibold text-[15px] ${danger ? "text-red-500" : "text-foreground"}`}>{title}</p>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
    </button>
);

/* ─── Main component ─── */
const SettingsPage = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [view, setView] = useState<View>("main");
    const [step, setStep] = useState<LeaveStep>("why");

    /* Leave flow state */
    const [leaveReason, setLeaveReason] = useState("");
    const [improvements, setImprovements] = useState<string[]>([]);
    const [freeText, setFreeText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [leaveChoice, setLeaveChoice] = useState<"deactivate" | "delete" | null>(null);

    const toggleImprovement = (item: string) =>
        setImprovements(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );

    /* ─── Deactivate account (soft delete — 30 day hold) ─── */
    const handleDeactivate = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Not authenticated");

            // Mark account as deactivated with a scheduled deletion date 30 days out
            const scheduledDeletion = new Date();
            scheduledDeletion.setDate(scheduledDeletion.getDate() + 30);

            await supabase.from("profiles").update({
                is_public: false,
                // @ts-ignore – column may not be in generated types yet
                deactivated_at: new Date().toISOString(),
                // @ts-ignore
                scheduled_deletion_at: scheduledDeletion.toISOString(),
                // @ts-ignore
                leave_reason: leaveReason,
                // @ts-ignore
                leave_feedback: [
                    ...improvements,
                    ...(freeText.trim() ? [`Comment: ${freeText.trim()}`] : []),
                ].join(" | "),
            }).eq("user_id", session.user.id);

            setStep("farewell");
            setLeaveChoice("deactivate");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Delete account (hard delete — after 30-day grace) ─── */
    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Not authenticated");

            // Same as deactivate but flagged for permanent deletion
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
                leave_reason: leaveReason,
                // @ts-ignore
                leave_feedback: [
                    ...improvements,
                    ...(freeText.trim() ? [`Comment: ${freeText.trim()}`] : []),
                ].join(" | "),
            }).eq("user_id", session.user.id);

            setStep("farewell");
            setLeaveChoice("delete");
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Sign out and redirect after farewell ─── */
    const handleFarewellExit = async () => {
        await signOut();
        navigate("/", { replace: true });
    };

    const slideIn = {
        initial: { x: 60, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -60, opacity: 0 },
        transition: { type: "spring" as const, damping: 28, stiffness: 220 },
    };

    return (
        <div className="flex bg-[#f8f9fc] dark:bg-background min-h-[100dvh] flex-col">
            {view === "main" && <TopNav />}

            <main className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>

                    {/* ─── MAIN SETTINGS ─── */}
                    {view === "main" && (
                        <motion.div
                            key="main"
                            {...slideIn}
                            className="absolute inset-0 overflow-y-auto pb-24"
                        >
                            <div className="mx-auto w-full max-w-md px-4 pt-6 space-y-8">
                                <h1 className="text-3xl font-black text-foreground">Settings</h1>

                                {/* Support */}
                                <section>
                                    <p className="px-1 text-[13px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                                        Support & Safety
                                    </p>
                                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-card shadow-sm border border-border/50">
                                        <Row
                                            icon={Shield}
                                            title="Safety Center"
                                            subtitle="Community guidelines & trust"
                                            onClick={() => navigate("/trust-safety")}
                                        />
                                        <Row
                                            icon={Heart}
                                            title="Help & Support"
                                            subtitle="FAQs, contact us"
                                            onClick={() => navigate("/support")}
                                        />
                                    </div>
                                </section>

                                {/* Account actions */}
                                <section>
                                    <p className="px-1 text-[13px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                                        Account
                                    </p>
                                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-card shadow-sm border border-border/50">
                                        <Row
                                            icon={LogOut}
                                            title="Log Out"
                                            subtitle="Sign out of this device"
                                            onClick={async () => { await signOut(); navigate("/auth"); }}
                                        />
                                    </div>
                                </section>

                                {/* Account Management */}
                                <section className="mb-12">
                                    <p className="px-1 text-[13px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                                        Account Management
                                    </p>
                                    <div className="overflow-hidden rounded-2xl bg-white dark:bg-card shadow-sm border border-border/50">
                                        <Row
                                            icon={PauseCircle}
                                            title="Deactivate or Delete Account"
                                            onClick={() => { setView("leave-flow"); setStep("why"); }}
                                            danger
                                        />
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── LEAVE FLOW ─── */}
                    {view === "leave-flow" && (
                        <motion.div
                            key="leave"
                            {...slideIn}
                            className="absolute inset-0 overflow-y-auto pb-24 bg-background"
                        >
                            <div className="mx-auto w-full max-w-md px-4 pt-6">

                                {/* Header */}
                                {step !== "farewell" && (
                                    <div className="flex items-center gap-2 mb-8">
                                        <button
                                            onClick={() => {
                                                if (step === "why") setView("main");
                                                else if (step === "what-to-improve") setStep("why");
                                                else if (step === "deactivate-confirm" || step === "delete-confirm") setStep("what-to-improve");
                                            }}
                                            className="p-2 rounded-full hover:bg-muted transition-colors -ml-2 text-foreground"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <div>
                                            <h1 className="text-xl font-black text-foreground">
                                                {step === "why" && "Why are you leaving?"}
                                                {step === "what-to-improve" && "Help us improve"}
                                                {step === "deactivate-confirm" && "Deactivate Account"}
                                                {step === "delete-confirm" && "Delete Account"}
                                            </h1>
                                            {/* Step dots */}
                                            <div className="flex gap-1.5 mt-1.5">
                                                {["why", "what-to-improve", "deactivate-confirm"].map((s, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${step === s || (step === "delete-confirm" && i === 2) ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <AnimatePresence mode="wait">

                                    {/* STEP 1 — Why */}
                                    {step === "why" && (
                                        <motion.div key="why" {...slideIn} className="space-y-4">
                                            <p className="text-muted-foreground text-sm">
                                                We're sorry to see you go. Your feedback helps us build a better BlackLoveLink for everyone. ❤️
                                            </p>
                                            <div className="space-y-2">
                                                {LEAVE_REASONS.map(reason => (
                                                    <button
                                                        key={reason}
                                                        onClick={() => setLeaveReason(reason)}
                                                        className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 font-medium text-[15px] transition-all ${leaveReason === reason
                                                            ? "border-primary bg-primary/10 text-primary"
                                                            : "border-border bg-card text-foreground hover:border-primary/40"
                                                            }`}
                                                    >
                                                        {reason}
                                                    </button>
                                                ))}
                                            </div>
                                            <motion.button
                                                disabled={!leaveReason}
                                                onClick={() => setStep("what-to-improve")}
                                                className="w-full mt-4 py-4 rounded-2xl gradient-brand text-primary-foreground font-bold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-30"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Continue →
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    {/* STEP 2 — What to improve */}
                                    {step === "what-to-improve" && (
                                        <motion.div key="improve" {...slideIn} className="space-y-4">
                                            <p className="text-muted-foreground text-sm">
                                                What would have made your experience better? Select all that apply.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {IMPROVE_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => toggleImprovement(opt)}
                                                        className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition-all ${improvements.includes(opt)
                                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                            : "border-border bg-card text-foreground hover:border-primary/40"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                    <MessageSquare className="w-4 h-4 text-primary" />
                                                    Anything else? (optional)
                                                </label>
                                                <textarea
                                                    value={freeText}
                                                    onChange={e => setFreeText(e.target.value)}
                                                    placeholder="Tell us what you'd like us to know…"
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none placeholder:text-muted-foreground/60"
                                                />
                                            </div>

                                            {/* Choose action */}
                                            <p className="text-sm font-bold text-foreground pt-2">What would you like to do?</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    onClick={() => setStep("deactivate-confirm")}
                                                    className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all text-left group"
                                                >
                                                    <PauseCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold text-foreground">Deactivate my account</p>
                                                        <p className="text-sm text-muted-foreground mt-0.5">
                                                            Hide your profile for up to 30 days. Come back anytime — everything stays intact.
                                                        </p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setStep("delete-confirm")}
                                                    className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left group"
                                                >
                                                    <Trash2 className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold text-red-500">Delete my account</p>
                                                        <p className="text-sm text-muted-foreground mt-0.5">
                                                            Permanently delete everything after a 30-day grace period. Cannot be undone.
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3a — Deactivate confirm */}
                                    {step === "deactivate-confirm" && (
                                        <motion.div key="deactivate" {...slideIn} className="space-y-6">
                                            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-5 flex gap-4">
                                                <PauseCircle className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-foreground">Account will be paused</p>
                                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                        Your profile will be hidden from all users. Your matches, messages, and photos stay safe.
                                                        You can reactivate anytime within 30 days — just log back in.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
                                                <p className="text-sm font-semibold text-foreground">During deactivation:</p>
                                                {[
                                                    "✅ Your matches and messages are preserved",
                                                    "✅ You can reactivate by logging in",
                                                    "⏸️ You won't appear in anyone's feed",
                                                    "⏸️ New likes won't come in",
                                                ].map(item => (
                                                    <p key={item} className="text-sm text-muted-foreground">{item}</p>
                                                ))}
                                            </div>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={handleDeactivate}
                                                    disabled={isLoading}
                                                    className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PauseCircle className="w-5 h-5" />}
                                                    {isLoading ? "Processing…" : "Yes, Deactivate My Account"}
                                                </button>
                                                <button
                                                    onClick={() => { setView("main"); setStep("why"); }}
                                                    className="w-full py-4 rounded-2xl bg-muted text-foreground font-bold text-base hover:bg-muted/80 transition-colors"
                                                >
                                                    Keep My Account
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3b — Delete confirm (Screen F — legal compliant) */}
                                    {step === "delete-confirm" && (
                                        <motion.div key="delete" {...slideIn}>
                                            <DeleteAccountConsentModal
                                                isLoading={isLoading}
                                                onConfirm={handleDelete}
                                                onCancel={() => { setView("main"); setStep("why"); }}
                                            />
                                        </motion.div>
                                    )}

                                    {/* STEP 4 — Farewell */}
                                    {step === "farewell" && (
                                        <motion.div
                                            key="farewell"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4 }}
                                            className="flex flex-col items-center text-center py-12 px-4 space-y-6"
                                        >
                                            <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center shadow-glow">
                                                <Heart className="w-12 h-12 text-primary-foreground" fill="currentColor" />
                                            </div>

                                            {leaveChoice === "deactivate" ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <h2 className="text-2xl font-black text-foreground">See you soon 💛</h2>
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            Your account is now paused. Everything is safely waiting for you.
                                                            Whenever you're ready — we'll be here.
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 p-4 w-full">
                                                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                                                            💡 Log back in anytime within 30 days to reactivate your profile instantly.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <h2 className="text-2xl font-black text-foreground">Thank you 🙏</h2>
                                                        <p className="text-muted-foreground leading-relaxed">
                                                            We're grateful you were part of BlackLoveLink. Your feedback will help us
                                                            build something even better. Deletion takes effect in <strong>30 days</strong> —
                                                            log back in before then to cancel.
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 w-full">
                                                        <p className="text-sm text-primary font-medium">
                                                            💌 We hope life brings you the love you deserve. We hope to see you back one day. ❤️
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span>Your feedback has been recorded. Thank you.</span>
                                            </div>

                                            <button
                                                onClick={handleFarewellExit}
                                                className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-bold text-base shadow-button hover:opacity-90 transition-all"
                                            >
                                                Sign Out & Close
                                            </button>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default SettingsPage;

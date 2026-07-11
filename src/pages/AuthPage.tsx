import { useState, useRef, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Phone, ArrowRight, ChevronLeft, Loader2,
    Eye, EyeOff, Lock, CheckCircle2, Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";
import { useToast } from "@/hooks/use-toast";
import PhoneInput, { COUNTRY_CODES, type CountryCode } from "@/components/PhoneInput";
import BrandName from "@/components/BrandName";

/* ─── Step types ─────────────────────────────────────────────── */
/* ─── Step types ─────────────────────────────────────────────── */
type Step =
    | "landing"       // Choose Google, Phone, or Email
    | "phone-signin"  // Existing: phone + password
    | "phone-signup"  // New: phone + password + confirm
    | "otp"           // OTP after phone sign-up
    | "google-otp"    // Phone collection for brand-new Google users
    | "email-signin"  // Email + password
    | "email-signup"; // Email + password + confirm

/* ─── Password strength ──────────────────────────────────────── */
function passwordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: "", color: "bg-border" },
        { label: "Weak", color: "bg-red-500" },
        { label: "Fair", color: "bg-amber-500" },
        { label: "Good", color: "bg-yellow-400" },
        { label: "Strong", color: "bg-green-500" },
    ];
    return { score, ...map[score] };
}

/* ─── Helper: check if user has completed profile in DB ──────── */
async function getUserProfileStatus(userId: string): Promise<"complete" | "incomplete" | "none"> {
    const { data, error } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", userId)
        .maybeSingle();
    if (error || !data) return "none";
    return data.profile_completed ? "complete" : "incomplete";
}

/* ─── Component ──────────────────────────────────────────────── */
const AuthPage = () => {
    const [step, setStep] = useState<Step>("landing");
    const [loading, setLoading] = useState<string | null>(null);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Full E.164 number for Supabase
    const fullPhone = `${country.code}${phone}`;
    const { toast } = useToast();
    const navigate = useNavigate();

    const pwStrength = passwordStrength(password);

    // Only handle already-active sessions (e.g. page refresh while logged in).
    // OAuth redirect processing is handled entirely by /auth/callback.
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                getUserProfileStatus(session.user.id).then((status) => {
                    navigate(status === "complete" ? "/swipe" : "/create-profile", { replace: true });
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fadeUp = {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.38 } },
        exit: { opacity: 0, y: -16, transition: { duration: 0.18 } },
    };

    /* ─── Google OAuth ───────────────────────────────────────────── */
    const handleGoogle = async () => {
        setLoading("google");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                // Redirect to the dedicated callback handler — not back to /auth
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            // browser navigates away — loading state persists until redirect
        } catch {
            toast({ title: "Sign in failed", description: "Something went wrong. Please try again.", variant: "destructive" });
            setLoading(null);
        }
    };

    /* ─── Phone Sign-In: send OTP ────────────────────────────────── */
    // Supabase phone auth uses OTP (not phone+password). We send a code
    // and verify it — same flow for both new and returning users.
    const handlePhoneSignIn = async () => {
        if (!phone || phone.length < 4) return;
        setLoading("signin");
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
            if (error) throw error;
            toast({ title: "Code sent! 📲", description: `A verification code was sent to ${fullPhone}.` });
            setStep("otp");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            if (msg.toLowerCase().includes("sms") || msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("provider")) {
                toast({
                    title: "SMS not configured",
                    description: "Phone sign-in requires SMS to be enabled in Supabase. Please use Google or Email instead.",
                    variant: "destructive",
                });
            } else {
                toast({ title: "Failed to send code", description: msg || "Please check your number and try again.", variant: "destructive" });
            }
        } finally {
            setLoading(null);
        }
    };

    /* ─── Email Sign-In (existing user) ─────────────────────────── */
    const handleEmailSignIn = async () => {
        if (!email || !password) return;
        setLoading("signin");
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");
            const status = await getUserProfileStatus(session.user.id);
            navigate(status === "complete" ? "/swipe" : "/create-profile");
        } catch {
            toast({ title: "Sign in failed", description: "Incorrect email or password.", variant: "destructive" });
        } finally {
            setLoading(null);
        }
    };

    /* ─── Phone Sign-Up (new user) ───────────────────────────────── */
    const handlePhoneSignUp = async () => {
        if (!phone || !password || password !== confirm) return;
        if (pwStrength.score < 2) {
            toast({ title: "Weak password", description: "Please use at least 8 characters and a number.", variant: "destructive" });
            return;
        }
        setLoading("signup");
        try {
            const { error } = await supabase.auth.signUp({ phone: fullPhone, password });
            if (error) {
                // If phone auth is not configured, show a helpful error
                if (error.message.toLowerCase().includes("phone") || error.message.toLowerCase().includes("provider")) {
                    toast({
                        title: "Phone sign-up unavailable",
                        description: "SMS verification is not yet configured. Please sign in with Google.",
                        variant: "destructive",
                    });
                    return;
                }
                throw error;
            }
            toast({ title: "Code sent! 📲", description: `A verification code was sent to ${fullPhone}.` });
            setStep("otp");
        } catch (err: unknown) {
            toast({
                title: "Sign-up failed",
                description: err instanceof Error ? err.message : "Could not create account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    /* ─── Email Sign-Up (new user) ───────────────────────────────── */
    const handleEmailSignUp = async () => {
        if (!email || !password || password !== confirm) return;
        if (pwStrength.score < 2) {
            toast({ title: "Weak password", description: "Please use at least 8 characters and a number.", variant: "destructive" });
            return;
        }
        setLoading("signup");
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            toast({ title: "Welcome! 🎉", description: "Please check your email to verify (or sign in if already verified)." });
            setStep("email-signin");
        } catch (err: unknown) {
            toast({
                title: "Sign-up failed",
                description: err instanceof Error ? err.message : "Could not create account. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    /* ─── Send OTP for Google new users ─────────────────────────── */
    const handleSendGoogleOtp = async () => {
        if (!phone || phone.length < 7) {
            toast({ title: "Invalid number", description: "Please enter a valid phone number.", variant: "destructive" });
            return;
        }
        setLoading("send-otp");
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
            if (error) throw error;
            toast({ title: "Code sent! 📲", description: `Verification code sent to ${fullPhone}.` });
            setStep("otp");
        } catch {
            toast({ title: "Failed to send code", description: "SMS is not configured. Please sign in with Google.", variant: "destructive" });
        } finally {
            setLoading(null);
        }
    };

    /* ─── Verify OTP ─────────────────────────────────────────────── */
    const handleVerifyOtp = async () => {
        const code = otp.join("");
        if (code.length < 6) return;
        setLoading("otp");
        try {
            const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: "sms" });
            if (error) throw error;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session after OTP");
            const status = await getUserProfileStatus(session.user.id);
            toast({ title: "Verified! 🎉", description: status === "complete" ? "Welcome back!" : "Let's set up your profile." });
            navigate(status === "complete" ? "/swipe" : "/create-profile");
        } catch {
            toast({ title: "Invalid code", description: "Please check the code and try again.", variant: "destructive" });
        } finally {
            setLoading(null);
        }
    };

    /* ─── OTP digit handlers ─────────────────────────────────────── */
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    /* ─── Shared input style ─────────────────────────────────────── */
    const inputCls = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/60";

    /* ─── Step subtitle map ──────────────────────────────────────── */
    const subtitle: Record<Step, string> = {
        landing: "Sign in to find your authentic connection",
        "phone-signin": "Welcome back — enter your credentials",
        "phone-signup": "Create your account with a phone number",
        "email-signin": "Welcome back — enter your credentials",
        "email-signup": "Create your account with an email address",
        otp: "Enter the 6-digit code we sent you",
        "google-otp": "One more step — verify your phone number",
    };

    return (
        <div className="min-h-[100dvh] bg-background font-display flex flex-col">
      <SEO title={"Sign In | BlackLoveLink"} description={"Sign in or create your BlackLoveLink account to start meeting verified Black professionals."} path="/auth" ogType="website" />
            {/* Header */}
            <header className="border-b border-border px-6 py-4">
                <nav className="mx-auto flex max-w-7xl items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <img src={blackLovelinkLogo} alt="BlackLoveLink" className="h-10 w-auto" />
                    </Link>
                    {step !== "landing" ? (
                        <button
                            onClick={() => setStep("landing")}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                    ) : (
                        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Home
                        </Link>
                    )}
                </nav>
            </header>

            <main className="flex-1 overflow-y-auto flex items-center justify-center px-6 py-8 sm:py-16">
                <div className="w-full max-w-md">
                    {/* Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-brand mb-5 shadow-glow">
                            <Heart className="w-8 h-8 text-primary-foreground" fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground mb-1">
                            Welcome to <BrandName />
                        </h1>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={step}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-muted-foreground text-sm"
                            >
                                {subtitle[step]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ── LANDING ── */}
                        {step === "landing" && (
                            <motion.div key="landing" {...fadeUp} className="space-y-4">
                                {/* Google */}
                                <motion.button
                                    onClick={handleGoogle}
                                    disabled={!!loading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-base hover:bg-muted transition-all disabled:opacity-50"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "google"
                                        ? <Loader2 className="w-5 h-5 animate-spin" />
                                        : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                        )
                                    }
                                    {loading === "google" ? "Signing in…" : "Continue with Google"}
                                </motion.button>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">or</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>



                                {/* Email */}
                                <motion.button
                                    onClick={() => setStep("email-signin")}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-base hover:bg-muted transition-all"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    <Mail className="w-5 h-5 text-primary" />
                                    Continue with Email
                                </motion.button>

                                <p className="text-center text-xs text-muted-foreground leading-relaxed pt-2">
                                    By continuing, you agree to BlackLoveLink's{" "}
                                    <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                                </p>
                            </motion.div>
                        )}

                        {/* ── PHONE SIGN-IN (OTP) ── */}
                        {step === "phone-signin" && (
                            <motion.div key="phone-signin" {...fadeUp} className="space-y-4">
                                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                                    <div className="flex items-center gap-3 pb-1">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">Sign in with your phone</p>
                                            <p className="text-xs text-muted-foreground">We'll send a one-time verification code</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Phone Number</label>
                                        <PhoneInput
                                            value={phone}
                                            onChange={setPhone}
                                            selectedCountry={country}
                                            onCountryChange={setCountry}
                                            onKeyDown={(e) => e.key === "Enter" && handlePhoneSignIn()}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handlePhoneSignIn}
                                    disabled={!!loading || phone.length < 4}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "signin" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    {loading === "signin" ? "Sending code…" : "Send Verification Code"}
                                </motion.button>

                                <p className="text-center text-sm text-muted-foreground">
                                    New to BlackLoveLink?{" "}
                                    <button onClick={() => setStep("phone-signup")} className="text-primary font-semibold hover:underline">
                                        Create account
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* ── PHONE SIGN-UP ── */}
                        {step === "phone-signup" && (
                            <motion.div key="phone-signup" {...fadeUp} className="space-y-4">
                                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Phone Number</label>
                                        <PhoneInput
                                            value={phone}
                                            onChange={setPhone}
                                            selectedCountry={country}
                                            onCountryChange={setCountry}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5 text-primary" /> Create Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? "text" : "password"}
                                                placeholder="Choose a strong password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputCls} pr-11`}
                                            />
                                            <button type="button" onClick={() => setShowPw(!showPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {password.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : "bg-border"}`} />
                                                    ))}
                                                </div>
                                                <p className={`text-xs font-medium ${pwStrength.score < 2 ? "text-red-500" : pwStrength.score < 4 ? "text-amber-500" : "text-green-500"}`}>
                                                    {pwStrength.label}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? "text" : "password"}
                                                placeholder="Repeat your password"
                                                value={confirm}
                                                onChange={(e) => setConfirm(e.target.value)}
                                                className={`${inputCls} pr-11`}
                                            />
                                            {confirm.length > 0 && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <CheckCircle2 className={`w-4 h-4 ${confirm === password ? "text-green-500" : "text-red-400"}`} />
                                                </div>
                                            )}
                                        </div>
                                        {confirm.length > 0 && confirm !== password && (
                                            <p className="text-xs text-red-500">Passwords don't match</p>
                                        )}
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handlePhoneSignUp}
                                    disabled={!!loading || !phone || !password || password !== confirm}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "signup" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    {loading === "signup" ? "Creating account…" : "Create Account & Verify Phone"}
                                </motion.button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <button onClick={() => setStep("phone-signin")} className="text-primary font-semibold hover:underline">
                                        Sign in
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* ── EMAIL SIGN-IN ── */}
                        {step === "email-signin" && (
                            <motion.div key="email-signin" {...fadeUp} className="space-y-4">
                                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={inputCls}
                                            onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputCls} pr-11`}
                                                onKeyDown={(e) => e.key === "Enter" && handleEmailSignIn()}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw(!showPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handleEmailSignIn}
                                    disabled={!!loading || !email || !password}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "signin" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    {loading === "signin" ? "Signing in…" : "Sign In"}
                                </motion.button>

                                <p className="text-center text-sm text-muted-foreground">
                                    New to BlackLoveLink?{" "}
                                    <button onClick={() => setStep("email-signup")} className="text-primary font-semibold hover:underline">
                                        Create account
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* ── EMAIL SIGN-UP ── */}
                        {step === "email-signup" && (
                            <motion.div key="email-signup" {...fadeUp} className="space-y-4">
                                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5 text-primary" /> Create Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? "text" : "password"}
                                                placeholder="Choose a strong password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputCls} pr-11`}
                                            />
                                            <button type="button" onClick={() => setShowPw(!showPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {password.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : "bg-border"}`} />
                                                    ))}
                                                </div>
                                                <p className={`text-xs font-medium ${pwStrength.score < 2 ? "text-red-500" : pwStrength.score < 4 ? "text-amber-500" : "text-green-500"}`}>
                                                    {pwStrength.label}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? "text" : "password"}
                                                placeholder="Repeat your password"
                                                value={confirm}
                                                onChange={(e) => setConfirm(e.target.value)}
                                                className={`${inputCls} pr-11`}
                                            />
                                            {confirm.length > 0 && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <CheckCircle2 className={`w-4 h-4 ${confirm === password ? "text-green-500" : "text-red-400"}`} />
                                                </div>
                                            )}
                                        </div>
                                        {confirm.length > 0 && confirm !== password && (
                                            <p className="text-xs text-red-500">Passwords don't match</p>
                                        )}
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handleEmailSignUp}
                                    disabled={!!loading || !email || !password || password !== confirm}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "signup" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    {loading === "signup" ? "Creating account…" : "Create Account"}
                                </motion.button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <button onClick={() => setStep("email-signin")} className="text-primary font-semibold hover:underline">
                                        Sign in
                                    </button>
                                </p>
                            </motion.div>
                        )}

                        {/* ── GOOGLE NEW USER: PHONE COLLECTION ── */}
                        {step === "google-otp" && (
                            <motion.div key="google-otp" {...fadeUp} className="space-y-5">
                                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">Add your phone number</p>
                                            <p className="text-xs text-muted-foreground">Required for account security & 2FA</p>
                                        </div>
                                    </div>
                                    <PhoneInput
                                        value={phone}
                                        onChange={setPhone}
                                        selectedCountry={country}
                                        onCountryChange={setCountry}
                                    />
                                </div>
                                <motion.button
                                    onClick={handleSendGoogleOtp}
                                    disabled={!!loading || phone.length < 7}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "send-otp" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                    {loading === "send-otp" ? "Sending code…" : "Send Verification Code"}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* ── OTP ── */}
                        {step === "otp" && (
                            <motion.div key="otp" {...fadeUp} className="space-y-6">
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-muted-foreground">Code sent to</p>
                                    <p className="font-semibold text-foreground">{fullPhone}</p>
                                </div>

                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { inputRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-card border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground transition"
                                        />
                                    ))}
                                </div>

                                <motion.button
                                    onClick={handleVerifyOtp}
                                    disabled={!!loading || otp.join("").length < 6}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                >
                                    {loading === "otp" ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {loading === "otp" ? "Verifying…" : "Verify & Continue →"}
                                </motion.button>

                                <div className="text-center space-y-2">
                                    <button
                                        onClick={() => { setOtp(["", "", "", "", "", ""]); handleSendGoogleOtp(); }}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Resend code
                                    </button>
                                    <br />
                                    <button onClick={() => setStep("landing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        ← Back to sign in
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AuthPage;

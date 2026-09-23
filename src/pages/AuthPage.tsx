import { useState, useRef, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ArrowRight, ChevronLeft, Loader2,
  Eye, EyeOff, Lock, CheckCircle2, Mail, Phone,
  User, Briefcase, Camera, X, Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";
import { useToast } from "@/hooks/use-toast";
import BrandName from "@/components/BrandName";

/* ─── Step types ─────────────────────────────────────────────── */
type Step =
  | "landing"
  | "email-signin"
  | "email-signup"
  | "otp"
  | "onboard-you"     // Name · DOB · Gender
  | "onboard-work"    // Occupation · Intent
  | "onboard-photos"; // Photos

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

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function getProfileStatus(userId: string): Promise<"complete" | "incomplete"> {
  const { data } = await supabase
    .from("profiles")
    .select("profile_completed")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.profile_completed ? "complete" : "incomplete";
}

interface PhotoSlot { file: File | null; preview: string | null; }

const GENDERS = ["Male", "Female"];
const INTENTS = ["Long-term relationship", "Marriage", "Networking only", "Open to explore"];

/* ─── Component ──────────────────────────────────────────────── */
const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "signup" | "signin" | null
  const urlStep = searchParams.get("step") as Step | null;

  const initialStep: Step = urlStep ?? (mode === "signup" ? "email-signup" : "landing");

  const [step, setStep] = useState<Step>(initialStep);
  const [loading, setLoading] = useState<string | null>(null);

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Onboarding fields
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [occTitle, setOccTitle] = useState("");
  const [occCompany, setOccCompany] = useState("");
  const [intent, setIntent] = useState("");
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    Array(5).fill(null).map(() => ({ file: null, preview: null }))
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const pwStrength = passwordStrength(password);
  const age = calculateAge(dob);
  const ageValid = age >= 18;
  const photoCount = photos.filter(p => p.preview !== null).length;

  /* ─── Redirect already-logged-in users ───────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getProfileStatus(session.user.id).then(status => {
          navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you", { replace: true });
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      toast({ title: "Sign in failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      setLoading(null);
    }
  };

  /* ─── Phone — coming soon ────────────────────────────────────── */
  const handlePhoneComingSoon = () => {
    toast({
      title: "Phone sign-in coming soon",
      description: "We apologise — phone number authentication is not yet available. Please sign in with Google or Email for now. We'll notify you when it's ready!",
      duration: 6000,
    });
  };

  /* ─── Email Sign-In ──────────────────────────────────────────── */
  const handleEmailSignIn = async () => {
    if (!email || !password) return;
    setLoading("signin");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const status = await getProfileStatus(session.user.id);
      navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you");
    } catch {
      toast({ title: "Sign in failed", description: "Incorrect email or password.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  /* ─── Email Sign-Up ──────────────────────────────────────────── */
  const handleEmailSignUp = async () => {
    if (!email || !password || password !== confirm) return;
    if (pwStrength.score < 2) {
      toast({ title: "Weak password", description: "Use at least 8 characters with a number.", variant: "destructive" });
      return;
    }
    setLoading("signup");
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({ title: "Account created! 🎉", description: "Let's set up your profile." });
      setStep("onboard-you");
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

  /* ─── Photo handlers ─────────────────────────────────────────── */
  const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos(prev => {
        const next = [...prev];
        next[index] = { file, preview: reader.result as string };
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => {
      const next = [...prev];
      next[index] = { file: null, preview: null };
      return next;
    });
    if (fileInputRefs.current[index]) fileInputRefs.current[index]!.value = "";
  };

  /* ─── Save full profile ──────────────────────────────────────── */
  const handleSaveProfile = async () => {
    setLoading("save");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");
      const userId = session.user.id;

      const uploadedUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const slot = photos[i];
        if (!slot.file) continue;
        const ext = slot.file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(path, slot.file, { upsert: true });
        if (uploadError) { console.warn("Photo upload failed:", uploadError.message); continue; }
        const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      const birthDate = new Date(dob);
      const today = new Date();
      let ageCalc = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageCalc--;

      const { data: existing } = await supabase
        .from("profiles").select("id").eq("user_id", userId).maybeSingle();

      const profilePayload = {
        user_id: userId,
        full_name: fullName.trim(),
        occupation_title: occTitle.trim(),
        occupation_company: occCompany.trim(),
        verified: true,
        dob,
        age: ageCalc,
        gender,
        intent,
        photos: uploadedUrls,
        avatar_url: uploadedUrls[0] ?? null,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };

      let dbError;
      if (existing) {
        ({ error: dbError } = await supabase.from("profiles").update(profilePayload).eq("user_id", userId));
      } else {
        ({ error: dbError } = await supabase.from("profiles").insert(profilePayload));
      }
      if (dbError) throw dbError;

      toast({ title: "Welcome to BlackLoveLink! 🎉", description: "Your profile is ready." });
      navigate("/swipe", { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  /* ─── Shared styles ──────────────────────────────────────────── */
  const inputCls = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/60";

  const isSignUp = mode === "signup" || ["email-signup", "onboard-you", "onboard-work", "onboard-photos"].includes(step);

  /* ─── Progress for onboarding steps ─────────────────────────── */
  const onboardSteps: Step[] = ["onboard-you", "onboard-work", "onboard-photos"];
  const onboardIndex = onboardSteps.indexOf(step);
  const isOnboarding = onboardIndex >= 0;

  /* ─── Back behaviour ─────────────────────────────────────────── */
  const handleBack = () => {
    if (step === "email-signin" || step === "email-signup") setStep("landing");
    else if (step === "onboard-work") setStep("onboard-you");
    else if (step === "onboard-photos") setStep("onboard-work");
    else setStep("landing");
  };

  return (
    <div className="min-h-[100dvh] bg-background font-display flex flex-col">
      <SEO
        title={isSignUp ? "Sign Up | BlackLoveLink" : "Sign In | BlackLoveLink"}
        description={"Sign in or create your BlackLoveLink account to start meeting verified Black professionals."}
        path="/auth"
        ogType="website"
      />

      {/* Header */}
      <header className="border-b border-border px-6 py-4 shrink-0">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={blackLovelinkLogo} alt="BlackLoveLink" className="h-10 w-auto" />
          </Link>

          {/* Onboarding progress */}
          {isOnboarding && (
            <div className="flex items-center gap-2">
              {onboardSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= onboardIndex ? "w-8 gradient-brand" : "w-4 bg-muted"
                  }`}
                />
              ))}
            </div>
          )}

          {step !== "landing" ? (
            <button
              onClick={handleBack}
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

          {/* Brand header — hidden during photo step to save space */}
          {step !== "onboard-photos" && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-brand mb-5 shadow-glow">
                <Heart className="w-8 h-8 text-primary-foreground" fill="currentColor" />
              </div>
              <h1 className="text-3xl font-black text-foreground mb-1">
                {isOnboarding ? "One last thing…" : isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-muted-foreground text-sm"
                >
                  {step === "landing" && !isSignUp && "Sign in to find your authentic connection"}
                  {step === "landing" && isSignUp && "Join thousands of Black professionals"}
                  {step === "email-signin" && "Enter your credentials to continue"}
                  {step === "email-signup" && "Create your account — it only takes a minute"}
                  {step === "onboard-you" && "Tell us a little about yourself"}
                  {step === "onboard-work" && "Your professional background helps us find better matches"}
                  {step === "onboard-photos" && ""}
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── LANDING ── */}
            {step === "landing" && (
              <motion.div key="landing" {...fadeUp} className="space-y-3">

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

                {/* Email */}
                <motion.button
                  onClick={() => setStep(mode === "signup" ? "email-signup" : "email-signin")}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-base hover:bg-muted transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                >
                  <Mail className="w-5 h-5 text-primary" />
                  Continue with Email
                </motion.button>

                {/* Phone — coming soon */}
                <motion.button
                  onClick={handlePhoneComingSoon}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 text-foreground/50 font-semibold text-base hover:bg-muted/50 transition-all cursor-pointer"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                >
                  <Phone className="w-5 h-5" />
                  <span>Continue with Phone</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-secondary/70 bg-secondary/10 px-2 py-0.5 rounded-full">Soon</span>
                </motion.button>

                <div className="pt-2 text-center">
                  {mode === "signup" ? (
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button onClick={() => { setStep("email-signin"); }} className="text-primary font-semibold hover:underline">Sign in</button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      New to BlackLoveLink?{" "}
                      <button onClick={() => setStep("email-signup")} className="text-primary font-semibold hover:underline">Create account</button>
                    </p>
                  )}
                </div>

                <p className="text-center text-xs text-muted-foreground leading-relaxed pt-1">
                  By continuing, you agree to BlackLoveLink's{" "}
                  <Link to="/terms-of-service" className="text-primary hover:underline">Terms</Link> and{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </motion.div>
            )}

            {/* ── EMAIL SIGN-IN ── */}
            {step === "email-signin" && (
              <motion.div key="email-signin" {...fadeUp} className="space-y-4">
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" /> Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email}
                      onChange={e => setEmail(e.target.value)} className={inputCls}
                      onKeyDown={e => e.key === "Enter" && handleEmailSignIn()} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} placeholder="Enter your password" value={password}
                        onChange={e => setPassword(e.target.value)} className={`${inputCls} pr-11`}
                        onKeyDown={e => e.key === "Enter" && handleEmailSignIn()} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <motion.button onClick={handleEmailSignIn} disabled={!!loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  {loading === "signin" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  {loading === "signin" ? "Signing in…" : "Sign In"}
                </motion.button>
                <p className="text-center text-sm text-muted-foreground">
                  New to BlackLoveLink?{" "}
                  <button onClick={() => setStep("email-signup")} className="text-primary font-semibold hover:underline">Create account</button>
                </p>
              </motion.div>
            )}

            {/* ── EMAIL SIGN-UP ── */}
            {step === "email-signup" && (
              <motion.div key="email-signup" {...fadeUp} className="space-y-4">
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" /> Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email}
                      onChange={e => setEmail(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> Create Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} placeholder="Choose a strong password" value={password}
                        onChange={e => setPassword(e.target.value)} className={`${inputCls} pr-11`} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : "bg-border"}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${pwStrength.score < 2 ? "text-red-500" : pwStrength.score < 4 ? "text-amber-500" : "text-green-500"}`}>{pwStrength.label}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} placeholder="Repeat your password" value={confirm}
                        onChange={e => setConfirm(e.target.value)} className={`${inputCls} pr-11`} />
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
                <motion.button onClick={handleEmailSignUp}
                  disabled={!!loading || !email || !password || password !== confirm}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  {loading === "signup" ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  {loading === "signup" ? "Creating account…" : "Create Account & Continue"}
                </motion.button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setStep("email-signin")} className="text-primary font-semibold hover:underline">Sign in</button>
                </p>
              </motion.div>
            )}

            {/* ── ONBOARD: YOU ── */}
            {step === "onboard-you" && (
              <motion.div key="onboard-you" {...fadeUp} className="space-y-4">
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary" /> Full Name</label>
                    <input type="text" placeholder="Your full name" value={fullName}
                      onChange={e => setFullName(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Date of Birth</label>
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                      className={inputCls} />
                    {dob && !ageValid && <p className="text-xs text-red-500">You must be at least 18 years old.</p>}
                    {dob && ageValid && <p className="text-xs text-green-500">Age: {age} years old ✓</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Gender</label>
                    <div className="flex gap-3">
                      {GENDERS.map(g => (
                        <button key={g} type="button" onClick={() => setGender(g)}
                          className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${gender === g ? "gradient-brand text-primary-foreground border-transparent shadow-button" : "bg-muted border-border text-foreground hover:border-primary/50"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setStep("onboard-work")}
                  disabled={!fullName.trim() || !dob || !ageValid || !gender}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <ArrowRight className="w-5 h-5" /> Continue
                </motion.button>
              </motion.div>
            )}

            {/* ── ONBOARD: WORK ── */}
            {step === "onboard-work" && (
              <motion.div key="onboard-work" {...fadeUp} className="space-y-4">
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" /> Job Title</label>
                    <input type="text" placeholder="e.g. Software Engineer" value={occTitle}
                      onChange={e => setOccTitle(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Company / Organisation</label>
                    <input type="text" placeholder="e.g. Google, Self-employed…" value={occCompany}
                      onChange={e => setOccCompany(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">What are you looking for?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {INTENTS.map(i => (
                        <button key={i} type="button" onClick={() => setIntent(i)}
                          className={`py-3 px-3 rounded-xl border text-xs font-semibold text-left transition-all leading-tight ${intent === i ? "gradient-brand text-primary-foreground border-transparent shadow-button" : "bg-muted border-border text-foreground hover:border-primary/50"}`}>
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setStep("onboard-photos")}
                  disabled={!occTitle.trim() || !occCompany.trim() || !intent}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <ArrowRight className="w-5 h-5" /> Continue
                </motion.button>
              </motion.div>
            )}

            {/* ── ONBOARD: PHOTOS ── */}
            {step === "onboard-photos" && (
              <motion.div key="onboard-photos" {...fadeUp} className="space-y-5">
                <div className="text-center mb-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-brand mb-3 shadow-glow">
                    <Camera className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h1 className="text-2xl font-black text-foreground">Add your photos</h1>
                  <p className="text-sm text-muted-foreground mt-1">Upload at least 2 photos — profiles with photos get 5× more connections</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {photos.slice(0, 5).map((slot, i) => (
                    <div key={i} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${slot.preview ? "border-primary/40" : "border-dashed border-border hover:border-primary/40"} ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                      {slot.preview ? (
                        <>
                          <img src={slot.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => handleRemovePhoto(i)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {i === 0 && <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-widest bg-black/50 text-white px-2 py-0.5 rounded-full">Main</span>}
                        </>
                      ) : (
                        <button type="button"
                          onClick={() => fileInputRefs.current[i]?.click()}
                          className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                          <Upload className="w-5 h-5" />
                          <span className="text-[10px] font-medium">{i === 0 ? "Main photo" : `Photo ${i + 1}`}</span>
                        </button>
                      )}
                      <input
                        ref={el => { fileInputRefs.current[i] = el; }}
                        type="file" accept="image/*" className="hidden"
                        onChange={e => handlePhotoChange(i, e)}
                      />
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">{photoCount}/5 photos added · minimum 2 required</p>

                <motion.button onClick={handleSaveProfile} disabled={!!loading || photoCount < 2}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-40"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  {loading === "save" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" fill="currentColor" />}
                  {loading === "save" ? "Saving your profile…" : "Complete & Find Matches →"}
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;

import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Upload,
    X,
    Camera,
    Calendar,
    User,
    Heart,
    Briefcase,
    ChevronLeft,
    Loader2,
    Star,
} from "lucide-react";
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PhotoConsentModal, SensitiveDataConsentModal, usePhotoConsent, useSensitiveConsent } from "@/components/ConsentModals";

const GENDERS = ["Male", "Female"];
const INTENTS = [
    "Long-term relationship",
    "Marriage",
    "Networking only",
    "Open to explore",
];
const ALL_INTERESTS = [
    "Travel", "Fitness", "Tech", "Entrepreneurship", "Faith",
    "Music", "Art", "Reading", "Nature", "Food & Dining",
    "Sports", "Fashion", "Business", "Wellness", "Photography",
    "Film & TV", "Gaming", "Cooking", "Dance", "Volunteering",
];

interface PhotoSlot {
    file: File | null;
    preview: string | null;
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

const ProfileCreationPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Form state
    const [fullName, setFullName] = useState("");
    const [occTitle, setOccTitle] = useState("");
    const [occCompany, setOccCompany] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [intent, setIntent] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [photos, setPhotos] = useState<PhotoSlot[]>(
        Array(5).fill(null).map(() => ({ file: null, preview: null }))
    );
    const [saving, setSaving] = useState(false);
    const [showPhotoConsent, setShowPhotoConsent] = useState(false);
    const [pendingPhotoIndex, setPendingPhotoIndex] = useState<number | null>(null);
    const [showSensitiveConsent, setShowSensitiveConsent] = useState(false);

    // Occupation is "verified" (complete) once both fields are filled
    const occVerified = occTitle.trim().length > 0 && occCompany.trim().length > 0;

    // Computed
    const age = calculateAge(dob);
    const ageValid = age >= 18;
    const photoCount = photos.filter((p) => p.preview !== null).length;
    const canContinue =
        fullName.trim().length > 0 &&
        occVerified &&
        dob !== "" &&
        ageValid &&
        gender !== "" &&
        intent !== "" &&
        photoCount >= 2;

    // Completion percentage for the visual bar
    const steps = [
        !!fullName.trim(),
        occVerified,
        dob !== "" && ageValid,
        gender !== "",
        intent !== "",
        photoCount >= 2,
    ];
    const completionPct = Math.round((steps.filter(Boolean).length / steps.length) * 100);

    /* ─── Photo handlers ─── */
    const handlePhotoChange = useCallback(
        (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos((prev) => {
                    const next = [...prev];
                    next[index] = { file, preview: reader.result as string };
                    return next;
                });
            };
            reader.readAsDataURL(file);
        },
        []
    );

    const handleRemovePhoto = useCallback((index: number) => {
        setPhotos((prev) => {
            const next = [...prev];
            next[index] = { file: null, preview: null };
            return next;
        });
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index]!.value = "";
        }
    }, []);

    /* ─── Interest toggle ─── */
    const toggleInterest = (interest: string) => {
        setInterests((prev) =>
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
        );
    };

    /* ─── Photo slot click — show consent first if not yet given ─── */
    const handlePhotoSlotClick = (index: number) => {
        if (!usePhotoConsent()) {
            setPendingPhotoIndex(index);
            setShowPhotoConsent(true);
        } else {
            fileInputRefs.current[index]?.click();
        }
    };


    /* ─── Continue — gate sensitive data consent ─── */
    const handleContinue = async () => {
        if (!canContinue) return;
        // If user hasn't consented to sensitive data processing, show Screen D first
        if (!useSensitiveConsent()) {
            setShowSensitiveConsent(true);
            return;
        }
        await doSave();
    };

    const doSave = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Not authenticated");

            const userId = session.user.id;
            const uploadedUrls: string[] = [];

            // Upload each photo to Supabase Storage
            for (let i = 0; i < photos.length; i++) {
                const slot = photos[i];
                if (!slot.file) continue;
                const ext = slot.file.name.split(".").pop() ?? "jpg";
                const path = `${userId}/${Date.now()}_${i}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("profile-photos")
                    .upload(path, slot.file, { upsert: true });
                if (uploadError) {
                    console.warn("Photo upload failed:", uploadError.message);
                    continue;
                }
                const { data: urlData } = supabase.storage
                    .from("profile-photos")
                    .getPublicUrl(path);
                uploadedUrls.push(urlData.publicUrl);
            }

            const avatarUrl = uploadedUrls[0] ?? null;

            // Calculate age from DOB
            const birthDate = new Date(dob);
            const today = new Date();
            let ageCalc = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageCalc--;

            // Check if this user already has a profile row
            const { data: existing } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();

            let dbError;
            if (existing) {
                // Row exists → UPDATE it
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        full_name: fullName.trim(),
                        occupation_title: occTitle.trim(),
                        occupation_company: occCompany.trim(),
                        verified: true,
                        dob,
                        age: ageCalc,
                        gender,
                        intent,
                        interests,
                        photos: uploadedUrls,
                        avatar_url: avatarUrl,
                        profile_completed: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("user_id", userId);
                dbError = error;
            } else {
                // No row yet → INSERT
                const { error } = await supabase
                    .from("profiles")
                    .insert({
                        user_id: userId,
                        full_name: fullName.trim(),
                        occupation_title: occTitle.trim(),
                        occupation_company: occCompany.trim(),
                        verified: true,
                        dob,
                        age: ageCalc,
                        gender,
                        intent,
                        interests,
                        photos: uploadedUrls,
                        avatar_url: avatarUrl,
                        profile_completed: true,
                        updated_at: new Date().toISOString(),
                    });
                dbError = error;
            }

            if (dbError) throw dbError;

            toast({ title: "Profile saved! 🎉", description: "Your profile is live." });
            navigate("/permissions");
        } catch (err: unknown) {
            console.error("Profile save error:", err);
            toast({
                title: "Error saving profile",
                description: err instanceof Error ? err.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-muted-foreground/60";

    return (
        <>
            <div className="min-h-screen bg-background font-display flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
                <nav className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <img src={blackLovelinkLogo} alt="BlackLoveLink" className="h-9 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* Completion bar */}
                        <div className="hidden sm:flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground">Profile {completionPct}%</span>
                            <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                    className="h-full gradient-brand rounded-full"
                                    initial={false}
                                    animate={{ width: `${completionPct}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                        <Link
                            to="/auth"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Page heading */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-foreground">
                            Create your <span className="text-gradient-brand">profile</span>
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Tell us about yourself so we can find your perfect match.
                        </p>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* ─── Left: Form ─── */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Full Name */}
                            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                                <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                    <User className="w-4 h-4 text-primary" /> Full Name
                                    <span className="text-destructive ml-0.5">*</span>
                                </h2>
                                <input
                                    type="text"
                                    id="fullName"
                                    placeholder="Your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={inputClass}
                                />
                                {fullName.trim() && (
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Looks good
                                    </p>
                                )}
                            </div>

                            {/* Occupation */}
                            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                                <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                    <Briefcase className="w-4 h-4 text-primary" /> Occupation
                                    <span className="text-destructive ml-0.5">*</span>
                                </h2>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title</label>
                                        <input
                                            type="text"
                                            id="occTitle"
                                            placeholder="e.g. Software Engineer"
                                            value={occTitle}
                                            onChange={(e) => setOccTitle(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company / Organisation</label>
                                        <input
                                            type="text"
                                            id="occCompany"
                                            placeholder="e.g. Google"
                                            value={occCompany}
                                            onChange={(e) => setOccCompany(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    {occVerified && (
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Occupation added
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                                <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                    <Calendar className="w-4 h-4 text-primary" /> Date of Birth
                                    <span className="text-destructive ml-0.5">*</span>
                                </h2>
                                <input
                                    type="date"
                                    id="dob"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                                    className={inputClass}
                                />
                                {dob && !ageValid && (
                                    <p className="text-xs text-destructive">You must be at least 18 years old to join.</p>
                                )}
                                {dob && ageValid && (
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Age verified – {age} years old
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                                <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                    <User className="w-4 h-4 text-primary" /> Gender
                                    <span className="text-destructive ml-0.5">*</span>
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {GENDERS.map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setGender(g)}
                                            className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${gender === g
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-muted text-foreground hover:border-primary/40"
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Relationship Intent */}
                            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                                <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                    <Heart className="w-4 h-4 text-primary" /> Relationship Intent
                                    <span className="text-destructive ml-0.5">*</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {INTENTS.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setIntent(opt)}
                                            className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${intent === opt
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-muted text-foreground hover:border-primary/40"
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Interests (optional) */}
                            <div className="rounded-2xl bg-card border border-border p-6 space-y-3">
                                <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                    <Star className="w-4 h-4 text-primary" /> Interests
                                    <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Select what you're passionate about — helps us find compatible matches.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_INTERESTS.map((interest) => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${interests.includes(interest)
                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                : "border-border bg-muted text-foreground hover:border-primary/40"
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                                {interests.length > 0 && (
                                    <p className="text-xs text-muted-foreground">{interests.length} selected</p>
                                )}
                            </div>
                        </div>

                        {/* ─── Right: Photo Upload ─── */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-28 rounded-2xl bg-card border border-border p-6 space-y-4">
                                <div>
                                    <h2 className="flex items-center gap-2 font-semibold text-foreground text-base">
                                        <Camera className="w-4 h-4 text-primary" /> Profile Photos
                                        <span className="text-destructive ml-0.5">*</span>
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload 2–5 photos. At least 2 required to continue.
                                    </p>

                                    {/* Photo count indicator */}
                                    <div className="mt-3 flex items-center gap-2">
                                        {Array(5).fill(null).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${i < photoCount ? "bg-primary" : "bg-border"
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-xs text-muted-foreground ml-1">{photoCount}/5</span>
                                    </div>
                                </div>

                            {/* Photo slots */}
                                <div className="grid grid-cols-2 gap-3">
                                    {photos.map((slot, index) => (
                                        <div key={index} className={`relative ${index === 0 ? "col-span-2" : ""}`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={(el) => { fileInputRefs.current[index] = el; }}
                                                onChange={(e) => handlePhotoChange(index, e)}
                                                className="hidden"
                                                id={`photo-slot-${index}`}
                                            />

                                            {slot.preview ? (
                                                <div className={`relative overflow-hidden rounded-xl border-2 border-primary ${index === 0 ? "aspect-[4/3]" : "aspect-square"}`}>
                                                    <img
                                                        src={slot.preview}
                                                        alt={`Photo ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => handleRemovePhoto(index)}
                                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                                                            Main Photo
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handlePhotoSlotClick(index)}
                                                    className={`w-full flex flex-col items-center justify-center rounded-xl bg-muted border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group ${index === 0 ? "aspect-[4/3]" : "aspect-square"} ${index < 2 ? "border-primary/40" : ""}`}
                                                >
                                                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    <span className="mt-1 text-xs text-muted-foreground group-hover:text-primary transition-colors font-medium">
                                                        {index === 0 ? "Main photo" : `Photo ${index + 1}`}
                                                    </span>
                                                    {index < 2 && (
                                                        <span className="mt-0.5 text-xs text-primary/70">Required</span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {photoCount < 2 && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        {2 - photoCount} more photo{2 - photoCount > 1 ? "s" : ""} needed to continue
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Continue Button ─── */}
                    <div className="mt-8 pb-12">
                        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">
                                {canContinue ? (
                                    <span className="text-green-500 font-medium flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Profile ready! Click Continue to proceed.
                                    </span>
                                ) : (
                                    <span>
                                        Complete all required fields to enable the Continue button.
                                    </span>
                                )}
                            </div>
                            <motion.button
                                onClick={handleContinue}
                                disabled={!canContinue || saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-brand text-primary-foreground font-bold text-base shadow-button hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                whileHover={canContinue ? { scale: 1.02 } : {}}
                                whileTap={canContinue ? { scale: 0.98 } : {}}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    "Continue →"
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </main>


        </div>

        {/* Screen B — Photo consent modal */}
        {showPhotoConsent && (
            <PhotoConsentModal
                onAllow={() => {
                    setShowPhotoConsent(false);
                    if (pendingPhotoIndex !== null) {
                        fileInputRefs.current[pendingPhotoIndex]?.click();
                        setPendingPhotoIndex(null);
                    }
                }}
                onDeny={() => { setShowPhotoConsent(false); setPendingPhotoIndex(null); }}
            />
        )}

        {/* Screen D — Sensitive data consent modal */}
        {showSensitiveConsent && (
            <SensitiveDataConsentModal
                onSave={async () => { setShowSensitiveConsent(false); await doSave(); }}
                onSkip={() => { setShowSensitiveConsent(false); }}
            />
        )}
        </>
    );
};

export default ProfileCreationPage;

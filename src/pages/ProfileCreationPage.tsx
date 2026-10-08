import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    ArrowRight,
    Loader2,
    ShieldAlert,
    Info,
    Sparkles,
} from "lucide-react";
import blackLovelinkLogo from "@/assets/blacklovelink-logo-icon.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    PhotoConsentModal,
    SensitiveDataConsentModal,
    usePhotoConsent,
    useSensitiveConsent,
} from "@/components/ConsentModals";

const GENDERS = [
    { label: "Male", emoji: "👨🏾" },
    { label: "Female", emoji: "👩🏾" },
];

const INTENT_OPTIONS = [
    {
        title: "Get married",
        intentKey: "Marriage",
        emoji: "💍",
        desc: "Find a person to get married to and build a joint future",
    },
    {
        title: "Find a relationship",
        intentKey: "Long-term relationship",
        emoji: "💖",
        desc: "Meet a soulmate, start a relationship, and then we'll see",
    },
    {
        title: "Chat and meet friends",
        intentKey: "Networking only",
        emoji: "💬",
        desc: "Chat with people on different topics without serious plans yet",
    },
    {
        title: "Networking & Career",
        intentKey: "Networking only",
        emoji: "💼",
        desc: "Connect with ambitious Black professionals and expand your network",
    },
    {
        title: "Open to explore",
        intentKey: "Open to explore",
        emoji: "✨",
        desc: "Keep an open mind and see where the journey takes us",
    },
];

const INTEREST_CATEGORIES = [
    {
        category: "Going out",
        items: [
            "🎨 Galleries", "🪩 Nightclubs", "🎤 Karaoke", "🍲 Restaurants", "🍷 Bars",
            "🎭 Theatres", "💨 Lounges", "🎙️ Concerts", "🏛️ Museums", "☕ Cafes",
        ],
    },
    {
        category: "Travels",
        items: [
            "🏖️ Beaches", "✈️ Abroad", "🏙️ City Trips", "🌲 Nature", "🧳 Road trips", "⛺ Camping",
        ],
    },
    {
        category: "Lifestyle & Passions",
        items: [
            "🏋️ Fitness", "🧘 Wellness", "📚 Reading", "🍳 Cooking", "💃 Dancing",
            "🎮 Gaming", "📸 Photography", "💻 Tech", "💼 Business", "🙏 Faith",
        ],
    },
    {
        category: "Pets & Animals",
        items: [
            "🐕 Dogs", "🐈 Cats", "🦜 Birds", "🐠 Fish", "🐾 Animals",
        ],
    },
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

const TOTAL_STEPS = 6;

const ProfileCreationPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [currentStep, setCurrentStep] = useState(0);

    // Form state
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState("");
    const [ageInput, setAgeInput] = useState("");
    const [useExactDob, setUseExactDob] = useState(true);
    const [gender, setGender] = useState("");
    const [intent, setIntent] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [occTitle, setOccTitle] = useState("");
    const [occCompany, setOccCompany] = useState("");
    const [bio, setBio] = useState("");

    const [photos, setPhotos] = useState<PhotoSlot[]>(
        Array(5).fill(null).map(() => ({ file: null, preview: null }))
    );

    const [saving, setSaving] = useState(false);
    const [loadingExisting, setLoadingExisting] = useState(true);
    const [showPhotoConsent, setShowPhotoConsent] = useState(false);
    const [pendingPhotoIndex, setPendingPhotoIndex] = useState<number | null>(null);
    const [showSensitiveConsent, setShowSensitiveConsent] = useState(false);
    const [showPhotoRulesModal, setShowPhotoRulesModal] = useState(false);

    // Load existing profile if user is editing
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    setLoadingExisting(false);
                    return;
                }
                const { data: existing } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                if (existing) {
                    if (existing.full_name) setFullName(existing.full_name);
                    if (existing.dob) {
                        setDob(existing.dob);
                        const calculated = calculateAge(existing.dob);
                        setAgeInput(calculated > 0 ? String(calculated) : "");
                    } else if (existing.age) {
                        setAgeInput(String(existing.age));
                        const birthYear = new Date().getFullYear() - existing.age;
                        setDob(`${birthYear}-01-01`);
                    }
                    if (existing.gender) setGender(existing.gender);
                    if (existing.intent) setIntent(existing.intent);
                    if (existing.interests && Array.isArray(existing.interests)) {
                        setInterests(existing.interests);
                    }
                    if (existing.occupation_title) setOccTitle(existing.occupation_title);
                    if (existing.occupation_company) setOccCompany(existing.occupation_company);
                    if (existing.bio) setBio(existing.bio);

                    const existingPhotos: string[] = existing.photos?.length
                        ? existing.photos
                        : existing.avatar_url
                        ? [existing.avatar_url]
                        : [];

                    if (existingPhotos.length > 0) {
                        setPhotos(
                            Array(5).fill(null).map((_, i) => ({
                                file: null,
                                preview: existingPhotos[i] || null,
                            }))
                        );
                    }
                }
            } catch (e) {
                console.error("Error loading profile:", e);
            } finally {
                setLoadingExisting(false);
            }
        };
        loadProfile();
    }, []);

    // Computed
    const age = useExactDob
        ? calculateAge(dob)
        : (parseInt(ageInput, 10) || (dob ? calculateAge(dob) : 0));
    const ageValid = age >= 21 && age <= 100;
    const photoCount = photos.filter((p) => p.preview !== null).length;

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

    const handlePhotoSlotClick = (index: number) => {
        if (!usePhotoConsent()) {
            setPendingPhotoIndex(index);
            setShowPhotoConsent(true);
        } else {
            fileInputRefs.current[index]?.click();
        }
    };

    /* ─── Interest toggle ─── */
    const toggleInterest = (cleanName: string) => {
        setInterests((prev) => {
            if (prev.includes(cleanName)) {
                return prev.filter((i) => i !== cleanName);
            }
            if (prev.length >= 15) {
                toast({
                    title: "Limit reached",
                    description: "You can select up to 15 interests.",
                });
                return prev;
            }
            return [...prev, cleanName];
        });
    };

    /* ─── Navigation validations ─── */
    const canAdvanceStep = () => {
        switch (currentStep) {
            case 0: // Name & DOB
                return fullName.trim().length > 0 && ageValid;
            case 1: // Gender
                return gender !== "";
            case 2: // Goal / Intent
                return intent !== "";
            case 3: // Interests
                return true; // Optional / can skip
            case 4: // Career & Bio
                return true; // Optional / can skip
            case 5: // Photos
                return photoCount >= 1; // Exactly 1 mandatory photo!
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!fullName.trim()) {
                toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
                return;
            }
            if (!ageValid) {
                toast({ title: "Age required", description: "You must be at least 21 years old to join.", variant: "destructive" });
                return;
            }
        }
        if (currentStep === 1 && !gender) {
            toast({ title: "Gender required", description: "Please select your gender.", variant: "destructive" });
            return;
        }
        if (currentStep === 2 && !intent) {
            toast({ title: "Goal required", description: "Please select your goal.", variant: "destructive" });
            return;
        }

        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleFinalSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        } else {
            navigate("/auth");
        }
    };

    /* ─── Final Submit ─── */
    const handleFinalSubmit = async () => {
        if (photoCount < 1) {
            toast({
                title: "Photo required",
                description: "Please upload at least 1 real photo of yourself.",
                variant: "destructive",
            });
            return;
        }

        if (!useSensitiveConsent()) {
            setShowSensitiveConsent(true);
            return;
        }

        await doSave();
    };

    const doSave = async () => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Not authenticated");

            const userId = session.user.id;
            const uploadedUrls: string[] = [];

            // Upload newly selected photos to Supabase Storage
            for (let i = 0; i < photos.length; i++) {
                const slot = photos[i];
                if (slot.file) {
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
                } else if (slot.preview && slot.preview.startsWith("http")) {
                    // Retain existing URL
                    uploadedUrls.push(slot.preview);
                }
            }

            const avatarUrl = uploadedUrls[0] ?? null;
            const finalAge = ageValid ? age : calculateAge(dob);
            const finalDob = dob || (ageValid ? `${new Date().getFullYear() - age}-01-01` : "");

            const { data: existing } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", userId)
                .maybeSingle();

            const profileData = {
                user_id: userId,
                full_name: fullName.trim(),
                occupation_title: occTitle.trim(),
                occupation_company: occCompany.trim(),
                bio: bio.trim(),
                verified: true,
                dob: finalDob,
                age: finalAge,
                gender,
                intent,
                interests,
                photos: uploadedUrls,
                avatar_url: avatarUrl,
                profile_completed: true,
                updated_at: new Date().toISOString(),
            };

            let dbError;
            if (existing) {
                const { error } = await supabase
                    .from("profiles")
                    .update(profileData)
                    .eq("user_id", userId);
                dbError = error;
            } else {
                const { error } = await supabase
                    .from("profiles")
                    .insert(profileData);
                dbError = error;
            }

            if (dbError) throw dbError;

            toast({ title: "Profile completed! 🎉", description: "Welcome to BlackLoveLink." });
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

    if (loadingExisting) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const progressPercentage = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

    return (
        <div className="min-h-screen bg-background font-display flex flex-col justify-between select-none">
            {/* ─── Top Bar with Segmented Progress Bar (Bumpy style) ─── */}
            <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md px-4 pt-4 pb-2 border-b border-border/40">
                <div className="max-w-md mx-auto w-full">
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                        <motion.div
                            className="h-full gradient-brand rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <img src={blackLovelinkLogo} alt="BlackLoveLink" className="h-7 w-auto" />

                        <span className="text-xs font-semibold text-muted-foreground">
                            {currentStep + 1} / {TOTAL_STEPS}
                        </span>
                    </div>
                </div>
            </header>

            {/* ─── Main Content Area ─── */}
            <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full">
                <AnimatePresence mode="wait">
                    {/* ─── STEP 0: Full Name & Date of Birth (Screenshot 2) ─── */}
                    {currentStep === 0 && (
                        <motion.div
                            key="step-dob"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                    Enter your date of birth
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Others will see only your age
                                </p>
                            </div>

                            {/* Full Name field */}
                            <div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-primary" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your real name"
                                    className="w-full px-3 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground font-medium text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    autoFocus
                                />
                            </div>

                            {/* DOB Card (Bumpy style) */}
                            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-primary" /> Birth Date
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setUseExactDob(!useExactDob)}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        {useExactDob ? "Type age manually" : "Use date picker"}
                                    </button>
                                </div>

                                {useExactDob ? (
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => {
                                            setDob(e.target.value);
                                            if (e.target.value) {
                                                const calculated = calculateAge(e.target.value);
                                                setAgeInput(calculated > 0 ? String(calculated) : "");
                                            }
                                        }}
                                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split("T")[0]}
                                        className="w-full px-4 py-3.5 rounded-xl bg-muted/60 border border-border text-foreground text-center text-lg font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="21"
                                        max="99"
                                        placeholder="Enter your age (e.g. 23)"
                                        value={ageInput}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                                            setAgeInput(val);
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num) && num >= 21 && num <= 100) {
                                                const birthYear = new Date().getFullYear() - num;
                                                setDob(`${birthYear}-01-01`);
                                            } else {
                                                setDob("");
                                            }
                                        }}
                                        className="w-full px-4 py-3.5 rounded-xl bg-muted/60 border border-border text-foreground text-center text-lg font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                )}

                                {ageInput && !ageValid && (
                                    <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                                        <ShieldAlert className="w-3.5 h-3.5" /> You must be at least 21 years old to join BlackLoveLink.
                                    </p>
                                )}

                                {ageValid && (
                                    <p className="text-xs font-bold text-green-500 flex items-center justify-center gap-1.5 bg-green-500/10 py-2 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4" /> Age verified – {age} years old
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 1: Gender (Screenshot 3) ─── */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step-gender"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                    What is your gender?
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    It'll help us to find people for you
                                </p>
                            </div>

                            <div className="space-y-3">
                                {GENDERS.map((g) => {
                                    const isSelected = gender === g.label;
                                    return (
                                        <button
                                            key={g.label}
                                            type="button"
                                            onClick={() => setGender(g.label)}
                                            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left shadow-sm ${
                                                isSelected
                                                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                                                    : "border-border bg-card hover:bg-muted text-foreground"
                                            }`}
                                        >
                                            <span className="text-base font-bold flex items-center gap-2">
                                                <span>{g.emoji}</span> {g.label}
                                            </span>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                                                }`}
                                            >
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 2: Goal / Intent (Screenshot 4) ─── */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step-goal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                    What is your goal?
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    You can change your goal at any time
                                </p>
                            </div>

                            <div className="space-y-3">
                                {INTENT_OPTIONS.map((opt) => {
                                    const isSelected = intent === opt.intentKey;
                                    return (
                                        <button
                                            key={opt.title}
                                            type="button"
                                            onClick={() => setIntent(opt.intentKey)}
                                            className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all text-left shadow-sm ${
                                                isSelected
                                                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                                                    : "border-border bg-card hover:bg-muted text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3.5 pr-2">
                                                <span className="text-2xl">{opt.emoji}</span>
                                                <div>
                                                    <p className="font-bold text-base text-foreground">{opt.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.desc}</p>
                                                </div>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                                                }`}
                                            >
                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 3: Interests (Screenshot 5) ─── */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step-interests"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                        Your Interests
                                    </h1>
                                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                        Pick up to 15 things you love to match faster.
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/30 shrink-0">
                                    {interests.length}/15
                                </span>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4">
                                {INTEREST_CATEGORIES.map((cat) => (
                                    <div key={cat.category} className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {cat.category}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.items.map((item) => {
                                                const clean = item.replace(/^[\p{Emoji}\s]+/u, "").trim() || item;
                                                const isSelected = interests.includes(clean);
                                                return (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => toggleInterest(clean)}
                                                        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                                                            isSelected
                                                                ? "gradient-brand text-primary-foreground border-transparent shadow-sm"
                                                                : "bg-card border-border text-foreground hover:bg-muted"
                                                        }`}
                                                    >
                                                        {item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 4: Career & Bio (Optional) ─── */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step-career"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                    Career & About You
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Highlight your professional accomplishments (optional)
                                </p>
                            </div>

                            <div className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-sm">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-primary" /> Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={occTitle}
                                        onChange={(e) => setOccTitle(e.target.value)}
                                        placeholder="e.g. Architect, Consultant, Founder"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Company / Business
                                    </label>
                                    <input
                                        type="text"
                                        value={occCompany}
                                        onChange={(e) => setOccCompany(e.target.value)}
                                        placeholder="e.g. Apex Global, Self-employed"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-muted/60 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Short Bio
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Share what makes you unique, what drives you, or what you enjoy..."
                                        rows={3}
                                        maxLength={250}
                                        className="w-full p-3 rounded-xl bg-muted/60 border border-border text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                    <p className="text-[11px] text-right text-muted-foreground">{bio.length}/250</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 5: Photo Upload (Screenshot 6 + Strict Rules) ─── */}
                    {currentStep === 5 && (
                        <motion.div
                            key="step-photo"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-5"
                        >
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                    Add your profile photo
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Pick a real photo that shows who you are (1 required, up to 5)
                                </p>
                            </div>

                            {/* Photo Slots Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((slot, index) => (
                                    <div
                                        key={index}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                                            slot.preview
                                                ? "border-primary/50"
                                                : "border-dashed border-border hover:border-primary/50"
                                        } ${index === 0 ? "col-span-2 row-span-2 aspect-auto h-52 sm:h-60" : ""}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={(el) => { fileInputRefs.current[index] = el; }}
                                            onChange={(e) => handlePhotoChange(index, e)}
                                            className="hidden"
                                        />

                                        {slot.preview ? (
                                            <>
                                                <img
                                                    src={slot.preview}
                                                    alt={`Photo ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePhoto(index)}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-black/90 transition shadow-md"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full gradient-brand text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                        Main Photo
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handlePhotoSlotClick(index)}
                                                className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 text-muted-foreground hover:text-primary transition-colors bg-card/60 hover:bg-primary/5"
                                            >
                                                <Upload className="w-5 h-5" />
                                                <span className="text-xs font-semibold text-center leading-tight">
                                                    {index === 0 ? "Select Main Photo +" : `Photo ${index + 1}`}
                                                </span>
                                                {index === 0 && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                        Mandatory
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ── Strict Photo Rules Box ── */}
                            <div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                                        <ShieldAlert className="w-4 h-4 text-primary" />
                                        <span>Photo Rules & Standards</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPhotoRulesModal(true)}
                                        className="text-xs font-semibold text-primary underline underline-offset-2"
                                    >
                                        See photo tips
                                    </button>
                                </div>

                                <ul className="text-xs text-muted-foreground space-y-1.5 pl-1 leading-relaxed">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 font-bold">✓</span>
                                        <span>Must be a genuine, clear photo of yourself where your face is visible.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-rose-500 font-bold">✗</span>
                                        <span><strong>No celebrity or public figure photos</strong> (impersonation results in an immediate ban).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-rose-500 font-bold">✗</span>
                                        <span><strong>No non-person images</strong> (no memes, cars, landscapes, pets only, or objects).</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-rose-500 font-bold">✗</span>
                                        <span><strong>Strictly ZERO tolerance for nudity</strong> even in the slightest, provocative nudity, or pornography.</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ─── Bottom Navigation Button ─── */}
            <footer className="sticky bottom-0 z-20 bg-background/90 backdrop-blur-md px-4 py-4 border-t border-border/40">
                <div className="max-w-md mx-auto w-full flex items-center justify-between gap-4">
                    {/* Skip button for optional steps */}
                    {currentStep === 3 || currentStep === 4 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep((prev) => prev + 1)}
                            className="text-sm font-semibold text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
                        >
                            Skip
                        </button>
                    ) : (
                        <div />
                    )}

                    {/* Next / Complete Button (Bumpy circle arrow style or brand pill) */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        type="button"
                        onClick={handleNext}
                        disabled={saving || !canAdvanceStep()}
                        className={`flex items-center justify-center gap-2 rounded-full gradient-brand text-primary-foreground font-bold shadow-button transition-all disabled:opacity-40 cursor-pointer ${
                            currentStep === TOTAL_STEPS - 1
                                ? "px-8 py-3.5 text-base w-full sm:w-auto"
                                : "w-14 h-14"
                        }`}
                        aria-label={currentStep === TOTAL_STEPS - 1 ? "Complete Profile" : "Next Step"}
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : currentStep === TOTAL_STEPS - 1 ? (
                            <>
                                <span>Complete Profile 🎉</span>
                            </>
                        ) : (
                            <ArrowRight className="w-6 h-6 stroke-[2.5]" />
                        )}
                    </motion.button>
                </div>
            </footer>

            {/* ─── Photo Rules Modal ─── */}
            <AnimatePresence>
                {showPhotoRulesModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-5"
                        onClick={() => setShowPhotoRulesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 15 }}
                            className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground">Photo Guidelines</h3>
                                </div>
                                <button
                                    onClick={() => setShowPhotoRulesModal(false)}
                                    className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                <p>
                                    To maintain an authentic, high-standard community for Black professionals, every photo uploaded must adhere to our standards:
                                </p>
                                <div className="bg-muted/50 p-3.5 rounded-2xl border border-border/60 space-y-2 text-foreground">
                                    <p className="font-semibold text-xs text-primary">What we require:</p>
                                    <p className="text-xs text-muted-foreground">• At least 1 clear photo showing your real face</p>
                                    <p className="text-xs text-muted-foreground">• Good lighting and clear resolution</p>
                                </div>
                                <div className="bg-destructive/10 p-3.5 rounded-2xl border border-destructive/20 space-y-1.5 text-destructive">
                                    <p className="font-semibold text-xs">Strictly Prohibited:</p>
                                    <p className="text-xs">• <strong>No celebrity or stock images</strong></p>
                                    <p className="text-xs">• <strong>No non-person photos (memes, objects, cars)</strong></p>
                                    <p className="text-xs">• <strong>No nudity even in the slightest or pornographic content</strong></p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPhotoRulesModal(false)}
                                className="w-full py-3 rounded-full gradient-brand text-primary-foreground font-bold text-sm shadow-button"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo Consent Modal */}
            {showPhotoConsent && (
                <PhotoConsentModal
                    onAllow={() => {
                        setShowPhotoConsent(false);
                        if (pendingPhotoIndex !== null) {
                            fileInputRefs.current[pendingPhotoIndex]?.click();
                            setPendingPhotoIndex(null);
                        }
                    }}
                    onDeny={() => {
                        setShowPhotoConsent(false);
                        setPendingPhotoIndex(null);
                    }}
                />
            )}

            {/* Sensitive Data Consent Modal */}
            {showSensitiveConsent && (
                <SensitiveDataConsentModal
                    onSave={async () => {
                        setShowSensitiveConsent(false);
                        await doSave();
                    }}
                    onSkip={() => {
                        setShowSensitiveConsent(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProfileCreationPage;

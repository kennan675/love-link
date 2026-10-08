import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, ChevronLeft, ChevronRight,
    Briefcase, CheckCircle2, MessageCircle, Heart, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import type { UserProfile } from "@/hooks/useProfileData";

interface FeedProfileCardProps {
    profile: UserProfile;
    isLiked?: boolean;
    onLike: () => void;
    onPass: () => void;
    onMessage: (introText: string) => void;
    onMatch?: () => void;
    onRewind?: () => void;
}

export default function FeedProfileCard({
    profile,
    isLiked = false,
    onLike,
    onPass,
    onMessage,
    onRewind,
}: FeedProfileCardProps) {
    const photos = profile.photos?.filter(Boolean).length
        ? profile.photos.filter(Boolean)
        : profile.avatar_url
        ? [profile.avatar_url]
        : ["/placeholder.svg"];
    const [photoIndex, setPhotoIndex] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [reaction, setReaction] = useState<"like" | "pass" | "message" | "hello" | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showHelloModal, setShowHelloModal] = useState(false);
    const [introText, setIntroText] = useState("");

    const firstName = profile.full_name?.split(" ")[0] || "them";

    const nextPhoto = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setImgLoaded(false);
        setPhotoIndex((i) => (i + 1) % photos.length);
    }, [photos.length]);

    const prevPhoto = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setImgLoaded(false);
        setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
    }, [photos.length]);

    const handleAction = (type: "like" | "pass" | "message" | "hello") => {
        if (isLiked) return;
        setReaction(type);
        setTimeout(() => {
            setReaction(null);
            if (type === "like") {
                onLike();
            } else if (type === "pass") {
                onPass();
            } else if (type === "hello") {
                onMessage("👋 Hello! I'm interested in connecting with you.");
            } else {
                onMessage(introText);
            }
        }, 420);
    };

    const handleSendHello = () => {
        setShowHelloModal(false);
        toast.success(`Sent a Hello to ${firstName}! 👋`);
        handleAction("hello");
    };

    // Goal bubble formatter
    const getGoalBadge = (intent?: string | null) => {
        if (!intent) return null;
        const map: Record<string, { emoji: string; label: string }> = {
            "Marriage": { emoji: "💍", label: "Get married" },
            "Long-term relationship": { emoji: "💖", label: "Find a relationship" },
            "Networking only": { emoji: "💬", label: "Chat & meet friends" },
            "Open to explore": { emoji: "✨", label: "Open to explore" },
        };
        return map[intent] || { emoji: "💫", label: intent };
    };

    const goal = getGoalBadge(profile.intent);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl shadow-2xl bg-card border border-border"
        >
            {/* ── Photo area ── */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {/* Skeleton shimmer */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/60 to-muted animate-pulse transition-opacity duration-300 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}
                    aria-hidden
                />

                <AnimatePresence mode="wait">
                    <motion.img
                        key={photos[photoIndex]}
                        src={photos[photoIndex]}
                        alt={profile.full_name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setImgLoaded(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imgLoaded ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                </AnimatePresence>

                {/* Photo dots */}
                {photos.length > 1 && (
                    <div className="absolute top-3 inset-x-3 flex gap-1 z-10">
                        {photos.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${i === photoIndex ? "bg-white" : "bg-white/40"}`}
                            />
                        ))}
                    </div>
                )}

                {/* Photo nav */}
                {photos.length > 1 && (
                    <>
                        <button
                            onClick={prevPhoto}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={nextPhoto}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10"
                            aria-label="Next photo"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </>
                )}

                {/* Reaction flash overlay */}
                <AnimatePresence>
                    {reaction && (
                        <motion.div
                            key="reaction"
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                        >
                            <div className={`rounded-full p-6 shadow-2xl ${
                                reaction === "like"
                                    ? "bg-gradient-to-br from-[#fd1d1d] to-[#833ab4]"
                                    : reaction === "pass"
                                    ? "bg-gradient-to-br from-slate-400 to-slate-600"
                                    : reaction === "hello"
                                    ? "bg-gradient-to-br from-amber-400 to-amber-600"
                                    : "bg-gradient-to-br from-[#c8973a] to-[#b0822d]"
                            }`}>
                                {reaction === "like" && <Heart className="w-14 h-14 text-white fill-white" />}
                                {reaction === "pass" && <X className="w-14 h-14 text-white" />}
                                {reaction === "hello" && <span className="text-5xl">👋</span>}
                                {reaction === "message" && <MessageCircle className="w-14 h-14 text-white" />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Name / age / goal overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                    <div className="flex items-end justify-between">
                        <div>
                            {/* Goal pill over photo */}
                            {goal && (
                                <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
                                    <span>{goal.emoji}</span>
                                    <span>{goal.label}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <h2 className="text-white text-2xl font-black drop-shadow-sm">
                                    {profile.full_name}{profile.age ? `, ${profile.age}` : ""}
                                </h2>
                                {profile.verified && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" fill="currentColor" />
                                )}
                            </div>

                            {(profile.occupation_title || profile.occupation_company) && (
                                <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {profile.occupation_title}
                                    {profile.occupation_company && ` · ${profile.occupation_company}`}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="text-xs font-semibold text-white/90 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3.5 py-1.5 hover:bg-white/25 transition active:scale-95"
                        >
                            {expanded ? "Less" : "Profile"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Expanded Profile Details (Bumpy style) ── */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 py-5 space-y-4 border-t border-border bg-card/50">
                            {/* Goal section */}
                            {goal && (
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">My Goal</p>
                                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                                        <span>{goal.emoji}</span>
                                        <span>{goal.label}</span>
                                    </div>
                                </div>
                            )}

                            {/* About me */}
                            {profile.bio && (
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">About Me</p>
                                    <p className="text-sm text-foreground/85 leading-relaxed bg-muted/40 p-3.5 rounded-xl border border-border/50">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}

                            {/* Basics */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">My Basics</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.gender && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
                                            👤 {profile.gender}
                                        </span>
                                    )}
                                    {profile.age && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
                                            🎂 {profile.age} years old
                                        </span>
                                    )}
                                    {(profile.occupation_title || profile.occupation_company) && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
                                            💼 {profile.occupation_title || profile.occupation_company}
                                        </span>
                                    )}
                                    {profile.verified && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Interests */}
                            {profile.interests && profile.interests.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">My Interests</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.interests.map((interest) => (
                                            <span
                                                key={interest}
                                                className="px-3 py-1.5 bg-secondary/15 text-secondary text-xs font-semibold rounded-full border border-secondary/25"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── 5 Action Buttons Row (Bumpy style in BlackLoveLink brand colors) ── */}
            <div className="px-4 py-4">
                {isLiked ? (
                    /* Already connected state */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 h-14 rounded-full bg-secondary/15 border border-secondary/20"
                    >
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                        <span className="font-bold text-secondary">Connection Requested</span>
                    </motion.div>
                ) : (
                    <div className="flex items-center justify-center gap-3 sm:gap-4">

                        {/* 1. Rewind / Reset button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.08 }}
                            onClick={() => {
                                if (onRewind) onRewind();
                                else toast("No previous profile to rewind");
                            }}
                            className="w-11 h-11 rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center shadow-md transition-colors"
                            aria-label="Rewind"
                            title="Rewind"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </motion.button>

                        {/* 2. Pass button (X) */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.08 }}
                            onClick={() => handleAction("pass")}
                            className="w-14 h-14 rounded-full border-2 border-rose-500/30 bg-card hover:bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg transition-colors"
                            aria-label="Pass"
                            title="Pass"
                        >
                            <X className="w-6 h-6 stroke-[2.5]" />
                        </motion.button>

                        {/* 3. Like button (Heart) - Center prominent */}
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.06 }}
                            onClick={() => handleAction("like")}
                            className="w-16 h-16 rounded-full gradient-brand text-white flex items-center justify-center shadow-xl relative overflow-hidden"
                            aria-label="Like"
                            title="Like"
                        >
                            <Heart className="w-7 h-7 fill-white stroke-white" />
                        </motion.button>

                        {/* 4. Say Hello button (Wave 👋) */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.08 }}
                            onClick={() => setShowHelloModal(true)}
                            className="w-14 h-14 rounded-full border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg transition-colors text-2xl"
                            aria-label="Say Hello"
                            title="Say Hello"
                        >
                            👋
                        </motion.button>

                        {/* 5. Custom Spark / Message button (💬) */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.08 }}
                            onClick={() => setShowMessageModal(true)}
                            className="w-11 h-11 rounded-full border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 flex items-center justify-center shadow-md transition-colors"
                            aria-label="Send Spark Message"
                            title="Send Spark Message"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </motion.button>

                    </div>
                )}
            </div>

            {/* ── "Interested in [Name]?" Popup Dialog (Screenshot 9) ── */}
            <AnimatePresence>
                {showHelloModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 rounded-3xl bg-black/75 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 20 }}
                            className="bg-card w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-border text-center flex flex-col items-center"
                        >
                            {/* Circle avatar with waving hand badge */}
                            <div className="relative mb-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40 shadow-md">
                                    <img
                                        src={photos[0] || "/placeholder.svg"}
                                        alt={firstName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-foreground flex items-center justify-center text-lg shadow-lg border-2 border-card">
                                    👋
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-foreground">
                                Interested in {firstName}?
                            </h3>

                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[220px]">
                                Send {firstName} a Hello. If it's mutual, you will be able to start a chat.
                            </p>

                            {/* Hello button in brand gradient */}
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={handleSendHello}
                                className="mt-6 w-full py-3.5 rounded-full gradient-brand text-primary-foreground font-bold text-base shadow-button hover:opacity-90 transition-opacity"
                            >
                                Hello
                            </motion.button>

                            {/* Later link */}
                            <button
                                onClick={() => setShowHelloModal(false)}
                                className="mt-3 text-xs font-semibold text-muted-foreground hover:text-foreground py-1.5 transition-colors"
                            >
                                Later
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Spark / Custom Message Modal ── */}
            <AnimatePresence>
                {showMessageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 rounded-3xl bg-black/75 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card w-full rounded-2xl p-5 shadow-2xl relative border border-border"
                        >
                            <button
                                onClick={() => setShowMessageModal(false)}
                                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1 rounded-full bg-muted/50"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground leading-tight">
                                        Start a Conversation
                                    </h3>
                                    <p className="text-xs text-muted-foreground">with {firstName}</p>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 mt-2 leading-relaxed">
                                Send a thoughtful intro message to connect directly with them.
                            </p>

                            <textarea
                                value={introText}
                                onChange={(e) => setIntroText(e.target.value)}
                                placeholder={`What would you love ${firstName} to know about you?`}
                                className="w-full h-24 p-3 rounded-xl bg-muted border border-border resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/60"
                                maxLength={200}
                                autoFocus
                            />

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-muted-foreground">{introText.length}/200</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setShowMessageModal(false);
                                        handleAction("message");
                                    }}
                                    disabled={!introText.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-full gradient-brand text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity shadow-button"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Send Spark
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

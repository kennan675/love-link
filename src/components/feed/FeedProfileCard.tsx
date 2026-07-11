import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Link2, X, ChevronLeft, ChevronRight,
    Briefcase, CheckCircle2, MessageCircle, Sparkles, Heart
} from "lucide-react";
import type { UserProfile } from "@/hooks/useProfileData";

interface FeedProfileCardProps {
    profile: UserProfile;
    isLiked?: boolean;
    onLike: () => void;
    onPass: () => void;
    onMessage: (introText: string) => void;
    onMatch?: () => void;
}

export default function FeedProfileCard({
    profile,
    isLiked = false,
    onLike,
    onPass,
    onMessage,
}: FeedProfileCardProps) {
    const photos = profile.photos?.filter(Boolean).length
        ? profile.photos.filter(Boolean)
        : profile.avatar_url
        ? [profile.avatar_url]
        : ["/placeholder.svg"];
    const [photoIndex, setPhotoIndex] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [reaction, setReaction] = useState<"like" | "pass" | "message" | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [introText, setIntroText] = useState("");

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

    const handleAction = (type: "like" | "pass" | "message") => {
        if (isLiked) return;
        setReaction(type);
        setTimeout(() => {
            setReaction(null);
            if (type === "like") onLike();
            else if (type === "pass") onPass();
            else onMessage(introText);
        }, 420);
    };

    return (
        <motion.div
            layout
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
                        loading="eager"
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
                    <div className="absolute top-3 inset-x-3 flex gap-1">
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
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={nextPhoto}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
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
                                    : "bg-gradient-to-br from-[#c8973a] to-[#b0822d]"
                            }`}>
                                {reaction === "like" && <Heart className="w-14 h-14 text-white fill-white" />}
                                {reaction === "pass" && <X className="w-14 h-14 text-white" />}
                                {reaction === "message" && <MessageCircle className="w-14 h-14 text-white" />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Name / age / occupation overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-white text-2xl font-black">
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
                            {profile.intent && (
                                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-white px-2.5 py-0.5 rounded-full">
                                    <Heart className="w-3 h-3" />
                                    {profile.intent}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="text-xs text-white/70 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 hover:bg-white/20 transition"
                        >
                            {expanded ? "Less" : "More"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Expanded info ── */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 py-4 space-y-3 border-t border-border">
                            {profile.bio && (
                                <p className="text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>
                            )}
                            {profile.interests?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests.slice(0, 6).map((interest) => (
                                        <span
                                            key={interest}
                                            className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Action Bar — BlackLoveLink unique design ── */}
            <div className="px-5 py-4">
                {isLiked ? (
                    /* ── Already connected state ── */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 h-14 rounded-full bg-secondary/15 border border-secondary/20"
                    >
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                        <span className="font-bold text-secondary">Connection Requested</span>
                    </motion.div>
                ) : (
                    /* ── 3-action row ── */
                    <div className="flex items-center gap-4">

                        {/* PASS — Sleek circular floating button */}
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleAction("pass")}
                            className="w-14 h-14 rounded-full border border-border bg-card hover:bg-muted/80 flex items-center justify-center shadow-md transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Pass"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>

                        {/* LIKE (Instagram style) — Center primary heart button */}
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleAction("like")}
                            className="flex-1 relative flex items-center justify-center gap-2 h-14 rounded-full overflow-hidden font-bold text-white shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #fd1d1d 0%, #dd2a7b 50%, #833ab4 100%)", // Instagram-like gradient
                                boxShadow: "0 8px 24px -4px rgba(221,42,123,0.35)"
                            }}
                        >
                            {/* Pulsing ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{ boxShadow: ["0 0 0 0px rgba(221,42,123,0.4)", "0 0 0 8px rgba(221,42,123,0)"] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                            />
                            <Heart className="relative w-5 h-5 fill-white" />
                            <span className="relative text-sm tracking-wide uppercase">Like</span>
                        </motion.button>

                        {/* CONNECT (Messaging flow) — Sleek circular button */}
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => { if (!isLiked) setShowMessageModal(true); }}
                            className="w-14 h-14 rounded-full border border-secondary/25 bg-secondary/5 hover:bg-secondary/10 flex items-center justify-center shadow-md transition-colors text-secondary"
                            aria-label="Connect"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </motion.button>

                    </div>
                )}
            </div>

            {/* ── Spark / Message Modal ── */}
            <AnimatePresence>
                {showMessageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 rounded-3xl bg-black/65 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card w-full rounded-2xl p-5 shadow-2xl relative"
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
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground leading-tight">
                                        Spark a Convo
                                    </h3>
                                    <p className="text-xs text-muted-foreground">with {profile.full_name.split(' ')[0]}</p>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 mt-2 leading-relaxed">
                                Send one thoughtful message. They'll decide if the spark is mutual ✨
                            </p>

                            <textarea
                                value={introText}
                                onChange={(e) => setIntroText(e.target.value)}
                                placeholder={`What would you love ${profile.full_name.split(' ')[0]} to know about you?`}
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

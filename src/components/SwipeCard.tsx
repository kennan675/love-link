import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Briefcase, CheckCircle2, Heart, X } from "lucide-react";
import type { UserProfile } from "@/hooks/useProfileData";
import { useState } from "react";

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop: boolean;
}

const intentColors: Record<string, string> = {
  "Long-term relationship": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "Marriage": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Open to explore": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Networking only": "bg-sky-500/20 text-sky-300 border-sky-500/30",
};

const SwipeCard = ({ profile, onSwipe, isTop }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);
  const likeScale = useTransform(x, [20, 120], [0.5, 1]);
  const nopeScale = useTransform(x, [-120, -20], [1, 0.5]);
  const [imgIndex, setImgIndex] = useState(0);

  const photos = [
    ...(profile.photos?.filter(Boolean) ?? []),
    ...(profile.avatar_url ? [profile.avatar_url] : []),
  ].filter(Boolean);
  const currentPhoto = photos[imgIndex] || "/placeholder.svg";
  const totalPhotos = Math.max(photos.length, 1);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 80;
    const velocityThreshold = 500;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      animate(x, 600, { duration: 0.3 });
      setTimeout(() => onSwipe("right"), 200);
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      animate(x, -600, { duration: 0.3 });
      setTimeout(() => onSwipe("left"), 200);
    } else {
      animate(x, 0, { duration: 0.5, type: "spring", stiffness: 300, damping: 25 });
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    if (!isTop || totalPhotos <= 1) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    if (tapX > rect.width / 2) {
      setImgIndex((prev) => Math.min(prev + 1, totalPhotos - 1));
    } else {
      setImgIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const intentClass = intentColors[profile.intent ?? ""] ?? "bg-muted/20 text-muted-foreground border-muted/30";

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{ x, rotate, zIndex: isTop ? 10 : 5 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 8, opacity: isTop ? 1 : 0.6 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 8, opacity: isTop ? 1 : 0.6 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div
        className="relative w-full h-full rounded-[28px] overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
        onClick={handleTap}
      >
        {/* Photo */}
        <motion.img
          key={currentPhoto}
          src={currentPhoto}
          alt={profile.full_name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Photo indicator dots */}
        {totalPhotos > 1 && (
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
            {Array.from({ length: totalPhotos }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                  i === imgIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* LIKE stamp */}
        <motion.div
          className="absolute top-16 left-6 z-30 flex items-center gap-2 rounded-xl border-[3px] border-emerald-400 bg-emerald-400/10 backdrop-blur-sm px-5 py-2"
          style={{ opacity: likeOpacity, scale: likeScale }}
        >
          <Heart className="w-6 h-6 text-emerald-400" fill="currentColor" />
          <span className="text-emerald-400 font-black text-xl tracking-wider">LIKE</span>
        </motion.div>

        {/* NOPE stamp */}
        <motion.div
          className="absolute top-16 right-6 z-30 flex items-center gap-2 rounded-xl border-[3px] border-rose-400 bg-rose-400/10 backdrop-blur-sm px-5 py-2"
          style={{ opacity: nopeOpacity, scale: nopeScale }}
        >
          <X className="w-6 h-6 text-rose-400" />
          <span className="text-rose-400 font-black text-xl tracking-wider">NOPE</span>
        </motion.div>

        {/* Bottom profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-6 z-20">
          {/* Name row */}
          <div className="flex items-end gap-2 mb-1.5">
            <h3 className="text-[28px] font-black text-white leading-tight tracking-tight">
              {profile.full_name.split(" ")[0]}
            </h3>
            <span className="text-2xl font-light text-white/80 mb-0.5">{profile.age ?? ""}</span>
            {profile.verified && (
              <CheckCircle2 className="w-5 h-5 text-sky-400 mb-1 flex-shrink-0" fill="currentColor" />
            )}
          </div>

          {/* Occupation */}
          <div className="flex items-center gap-1.5 text-white/70 text-[13px] mb-3">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{profile.occupation_title}{profile.occupation_company ? ` at ${profile.occupation_company}` : ""}</span>
          </div>

          {/* Intent badge */}
          {profile.intent && (
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm ${intentClass}`}>
                <Heart className="w-3 h-3" fill="currentColor" />
                {profile.intent}
              </span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-[13px] text-white/75 leading-relaxed line-clamp-2 mb-3">
              {profile.bio}
            </p>
          )}

          {/* Interest tags */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {profile.interests.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium bg-white/10 text-white/90 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10"
                >
                  {tag}
                </span>
              ))}
              {profile.interests.length > 4 && (
                <span className="text-[11px] font-medium text-white/50 px-2 py-1">
                  +{profile.interests.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;

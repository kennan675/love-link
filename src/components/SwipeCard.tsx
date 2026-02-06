import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Profile } from "@/data/profiles";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop: boolean;
}

const SwipeCard = ({ profile, onSwipe, isTop }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const superlikeOpacity = useTransform(y, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    } else if (info.offset.y < -threshold) {
      onSwipe("up");
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{ 
        x: 500, 
        opacity: 0, 
        transition: { duration: 0.3 } 
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-card">
        {/* Profile image */}
        <img
          src={profile.image}
          alt={profile.name}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* LIKE stamp */}
        <motion.div
          className="absolute left-8 top-20 rotate-[-20deg] rounded-lg border-4 border-green-500 px-4 py-2"
          style={{ opacity: likeOpacity }}
        >
          <span className="text-4xl font-black tracking-wider text-green-500">LIKE</span>
        </motion.div>

        {/* NOPE stamp */}
        <motion.div
          className="absolute right-8 top-20 rotate-[20deg] rounded-lg border-4 border-red-500 px-4 py-2"
          style={{ opacity: nopeOpacity }}
        >
          <span className="text-4xl font-black tracking-wider text-red-500">NOPE</span>
        </motion.div>

        {/* SUPER LIKE stamp */}
        <motion.div
          className="absolute bottom-40 left-1/2 -translate-x-1/2 rounded-lg border-4 border-blue-400 px-4 py-2"
          style={{ opacity: superlikeOpacity }}
        >
          <span className="text-3xl font-black tracking-wider text-blue-400">SUPER LIKE</span>
        </motion.div>

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-3">
            <h2 className="text-3xl font-bold text-foreground">{profile.name}</h2>
            <span className="mb-1 text-2xl font-light text-foreground/80">{profile.age}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-foreground/70">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{profile.distance}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/80">{profile.bio}</p>
          <div className="mt-3 flex gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-foreground/30 px-3 py-1 text-xs text-foreground/80"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;

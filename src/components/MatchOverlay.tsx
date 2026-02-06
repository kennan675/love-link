import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/data/profiles";

interface MatchOverlayProps {
  profile: Profile | null;
  onClose: () => void;
}

const MatchOverlay = ({ profile, onClose }: MatchOverlayProps) => {
  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <h1 className="text-gradient-brand mb-8 text-center text-6xl font-black tracking-tight">
              It's a Match!
            </h1>
          </motion.div>

          <motion.p
            className="mb-8 text-center text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            You and {profile.name} liked each other
          </motion.p>

          <motion.div
            className="mb-10 h-32 w-32 overflow-hidden rounded-full border-4 border-primary shadow-glow"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={onClose}
              className="rounded-full border border-foreground/20 px-8 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Keep Swiping
            </button>
            <button
              onClick={onClose}
              className="gradient-brand rounded-full px-8 py-3 font-semibold text-primary-foreground shadow-button transition-opacity hover:opacity-90"
            >
              Send a Message
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchOverlay;

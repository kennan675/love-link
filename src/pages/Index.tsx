import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-brand shadow-glow animate-pulse-glow">
          <Flame className="h-14 w-14 text-primary-foreground" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-gradient-brand text-5xl font-black tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        tinder
      </motion.h1>

      <motion.p
        className="mt-4 max-w-xs text-center text-lg text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Swipe right to make the first move. Matching starts here.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="mt-10 flex w-full max-w-xs flex-col gap-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Link
          to="/swipe"
          className="gradient-brand flex items-center justify-center rounded-full py-4 text-lg font-bold text-primary-foreground shadow-button transition-opacity hover:opacity-90"
        >
          Create Account
        </Link>
        <Link
          to="/swipe"
          className="flex items-center justify-center rounded-full border-2 border-foreground/20 py-4 text-lg font-bold text-foreground transition-colors hover:bg-muted"
        >
          Log In
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="mt-auto pb-8 pt-12 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        By tapping "Create Account" you agree to our Terms.
      </motion.p>
    </div>
  );
};

export default Index;

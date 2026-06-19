import { useEffect } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/blacklovelink-logo-icon.png";
import BrandName from "@/components/BrandName";

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  // Total splash duration: 2.4s visible + 0.5s exit fade = onFinished at 2.9s
  useEffect(() => {
    const t = setTimeout(onFinished, 2900);
    return () => clearTimeout(t);
  }, [onFinished]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Smooth cinematic exit: fade out + very slight scale up
      transition={{ duration: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Wrap everything so we can fade the whole scene out at t=2.4s */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: [1, 1, 1, 0], scale: [1, 1, 1, 1.06] }}
        transition={{
          duration: 2.9,
          times: [0, 0.55, 0.75, 1],
          ease: "easeInOut",
        }}
      >
        {/* Soft ambient glow — pulses gently */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 420,
            height: 420,
            background: "radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Logo — springs in from below */}
        <motion.img
          src={logo}
          alt="BlackLoveLink"
          className="relative z-10 h-28 w-28 object-contain"
          initial={{ opacity: 0, y: 28, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Brand name — fades in after logo lands */}
        <motion.div
          className="relative z-10 mt-5 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-3xl tracking-tight">
            <BrandName />
          </h1>
          <p className="mt-1.5 text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Where intentional love begins
          </p>
        </motion.div>

        {/* Progress bar — fills linearly from 0 → 100% over 1.8s */}
        <motion.div
          className="relative z-10 mt-10 h-[3px] w-44 rounded-full overflow-hidden"
          style={{ background: "hsl(var(--muted))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full gradient-brand"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.65, duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;

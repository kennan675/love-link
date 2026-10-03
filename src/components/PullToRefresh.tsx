import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowDown, Check } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  pullThreshold?: number;
  maxPull?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = "",
  pullThreshold = 65,
  maxPull = 100,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const vibrationFiredRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    // Only engage if at the very top of the scroll container
    if (!container || container.scrollTop > 2) return;

    startYRef.current = e.touches[0].clientY;
    startXRef.current = e.touches[0].clientX;
    vibrationFiredRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing || startYRef.current === null || startXRef.current === null) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 2) {
      if (isPullingRef.current) {
        isPullingRef.current = false;
        setPullDistance(0);
        setIsReady(false);
      }
      return;
    }

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - startYRef.current;
    const diffX = currentX - startXRef.current;

    // If pulling downwards and vertical dominates horizontal movement
    if (diffY > 10 && Math.abs(diffY) > Math.abs(diffX) * 1.3) {
      isPullingRef.current = true;
      // Damped rubber-band easing
      const distance = Math.min(maxPull, Math.pow(diffY, 0.82) * 1.6);
      setPullDistance(distance);

      const ready = distance >= pullThreshold;
      setIsReady(ready);

      if (ready && !vibrationFiredRef.current) {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(25);
        }
        vibrationFiredRef.current = true;
      } else if (!ready) {
        vibrationFiredRef.current = false;
      }
    } else if (diffY <= 0) {
      isPullingRef.current = false;
      setPullDistance(0);
      setIsReady(false);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) {
      startYRef.current = null;
      startXRef.current = null;
      return;
    }

    isPullingRef.current = false;
    startYRef.current = null;
    startXRef.current = null;

    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true);
      setPullDistance(pullThreshold); // hold at threshold height while refreshing

      try {
        await Promise.resolve(onRefresh());
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 900);
      } catch (err) {
        console.error("Pull to refresh error:", err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsReady(false);
        }, 400);
      }
    } else {
      setPullDistance(0);
      setIsReady(false);
    }
  };

  const progress = Math.min(1, pullDistance / pullThreshold);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative overflow-y-auto overscroll-y-contain ${className}`}
    >
      {/* ── Pull Down Indicator Banner ── */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: pullDistance,
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 350,
            }}
            className="w-full flex items-center justify-center overflow-hidden pointer-events-none select-none"
            aria-live="polite"
          >
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/90 border border-secondary/30 backdrop-blur-md shadow-lg text-foreground text-xs font-semibold">
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-secondary animate-spin" />
                  <span className="text-secondary font-bold">Discovering new profiles…</span>
                </>
              ) : justCompleted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Profiles refreshed!</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: isReady ? 180 : progress * 180 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ArrowDown
                      className={`w-3.5 h-3.5 transition-colors ${
                        isReady ? "text-secondary" : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                  <span className={isReady ? "text-secondary font-bold" : "text-muted-foreground"}>
                    {isReady ? "Release for new profiles" : "Pull down to refresh"}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <motion.div
        animate={{ y: isRefreshing ? 0 : 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;

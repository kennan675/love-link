import React, { useState, useRef, useEffect } from "react";
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
  pullThreshold = 70,
  maxPull = 110,
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
  const rafIdRef = useRef<number | null>(null);

  const getScrollTop = () => {
    if (containerRef.current && containerRef.current.scrollTop > 0) {
      return containerRef.current.scrollTop;
    }
    return typeof window !== "undefined" ? window.scrollY || document.documentElement.scrollTop || 0 : 0;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    // Strictly only engage if at the absolute top of the scroll container
    if (getScrollTop() > 2) {
      startYRef.current = null;
      startXRef.current = null;
      isPullingRef.current = false;
      return;
    }

    startYRef.current = e.touches[0].clientY;
    startXRef.current = e.touches[0].clientX;
    vibrationFiredRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing || startYRef.current === null || startXRef.current === null) return;

    // If user scrolled down or is not at top, abort pull-to-refresh
    if (getScrollTop() > 2) {
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

    // Only engage if pulling DOWN and vertical movement strictly dominates horizontal movement
    if (diffY > 15 && diffY > Math.abs(diffX) * 1.6) {
      isPullingRef.current = true;
      // Damped rubber-band easing
      const distance = Math.min(maxPull, Math.pow(diffY, 0.8) * 1.5);

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          setPullDistance(distance);
          const ready = distance >= pullThreshold;
          setIsReady(ready);

          if (ready && !vibrationFiredRef.current) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(20);
            }
            vibrationFiredRef.current = true;
          } else if (!ready) {
            vibrationFiredRef.current = false;
          }
          rafIdRef.current = null;
        });
      }
    } else if (diffY <= 0) {
      // Normal upward scroll down into the feed: immediately release
      if (isPullingRef.current) {
        isPullingRef.current = false;
        setPullDistance(0);
        setIsReady(false);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

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
        }, 300);
      }
    } else {
      setPullDistance(0);
      setIsReady(false);
    }
  };

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const showIndicator = pullDistance > 10 || isRefreshing || justCompleted;
  const progress = Math.min(1, pullDistance / pullThreshold);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative overflow-y-auto overscroll-y-contain ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ── GPU-Accelerated Floating Pill Indicator (0 layout reflow) ── */}
      {showIndicator && (
        <div
          className="sticky top-2 z-40 w-full flex items-center justify-center pointer-events-none select-none transition-transform duration-75"
          style={{
            transform: `translate3d(0, ${Math.min(pullDistance * 0.45, 32)}px, 0)`,
            opacity: isRefreshing || justCompleted ? 1 : Math.min(1, pullDistance / 25),
          }}
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/95 border border-primary/30 backdrop-blur-md shadow-2xl text-foreground text-xs font-semibold">
            {isRefreshing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                <span className="text-primary font-bold">Discovering new profiles…</span>
              </>
            ) : justCompleted ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Profiles refreshed!</span>
              </>
            ) : (
              <>
                <div
                  style={{
                    transform: `rotate(${isReady ? 180 : progress * 180}deg)`,
                    transition: "transform 0.15s ease",
                  }}
                >
                  <ArrowDown
                    className={`w-3.5 h-3.5 transition-colors ${
                      isReady ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span className={isReady ? "text-primary font-bold" : "text-muted-foreground"}>
                  {isReady ? "Release to refresh" : "Pull down to refresh"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Content (Direct render, 0 animation wrapper overhead) ── */}
      {children}
    </div>
  );
};

export default PullToRefresh;

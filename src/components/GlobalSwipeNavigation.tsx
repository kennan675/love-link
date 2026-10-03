import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Exact 5-tab sequence matching the bottom navigation bar from left to right:
// [Discover / Swipe] ↔ [Likes] ↔ [Community] ↔ [Messages] ↔ [Profile]
const TAB_SEQUENCE = ["/swipe", "/likes", "/community", "/messages", "/profile"];

export const GlobalSwipeNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    // Only apply logic if we are on one of the 5 primary tabs
    if (!TAB_SEQUENCE.includes(location.pathname)) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept multi-touch (e.g. pinch to zoom)
      if (e.touches.length !== 1) return;

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const timeDiff = Date.now() - touchStartRef.current.time;

      const deltaX = touchEndX - touchStartRef.current.x;
      const deltaY = touchEndY - touchStartRef.current.y;

      // Reset
      touchStartRef.current = null;

      // Comfortable swipe window up to 800ms
      if (timeDiff > 800) return;

      // ── SAFEGUARDS ──
      // 1. If currently inside an open chat conversation, do not switch tabs
      if (document.querySelector('[data-in-chat="true"]')) return;

      // 2. Ignore if touch originated inside inputs, textareas, sliders, or elements marked no-swipe
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable="true"], .no-swipe, [data-no-swipe="true"]')
      ) {
        return;
      }

      // 3. If touch originated inside an active horizontal scroll container (e.g. story rail or filter chips)
      const horizontalScroller = target?.closest('.overflow-x-auto, .overflow-x-scroll, [data-horizontal-scroll="true"]') as HTMLElement | null;
      if (horizontalScroller && horizontalScroller.scrollWidth > horizontalScroller.clientWidth + 8) {
        return;
      }

      // ── ERGONOMIC HORIZONTAL SWIPE GATE ──
      // 1. Minimum 35px horizontal travel (light, effortless natural swipe)
      if (Math.abs(deltaX) < 35) return;

      // 2. Horizontal movement must exceed vertical movement (accommodates natural thumb arc)
      if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.1) return;

      const currentIndex = TAB_SEQUENCE.indexOf(location.pathname);
      if (currentIndex === -1) return;

      if (deltaX < -35 && currentIndex < TAB_SEQUENCE.length - 1) {
        // Swiped Left → Navigate Forward to Next Tab
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(15);
        }
        navigate(TAB_SEQUENCE[currentIndex + 1]);
      } else if (deltaX > 35 && currentIndex > 0) {
        // Swiped Right → Navigate Backward to Previous Tab
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(15);
        }
        navigate(TAB_SEQUENCE[currentIndex - 1]);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default GlobalSwipeNavigation;

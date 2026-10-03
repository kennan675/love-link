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

      // Must be a deliberate swipe under 600ms
      if (timeDiff > 600) return;

      // ── SAFEGUARDS ──
      // 1. If currently inside an open chat conversation, do not switch tabs
      if (document.querySelector('[data-in-chat="true"]')) return;

      // 2. Ignore if touch originated inside inputs, textareas, sliders, or modals
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.getAttribute("contenteditable") === "true" ||
          target.classList.contains("no-swipe")
        ) {
          return;
        }

        // Horizontal scroll container (e.g. carousel, story rail, or pills row)
        const style = window.getComputedStyle(target);
        if (
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
          target.scrollWidth > target.clientWidth
        ) {
          return;
        }

        target = target.parentElement;
      }

      // ── ERGONOMIC HORIZONTAL SWIPE GATE ──
      // 1. Minimum 45px horizontal travel (comfortable natural thumb flick)
      if (Math.abs(deltaX) < 45) return;

      // 2. Must be predominantly horizontal rather than vertical scroll
      if (Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;

      const currentIndex = TAB_SEQUENCE.indexOf(location.pathname);
      if (currentIndex === -1) return;

      if (deltaX < -45 && currentIndex < TAB_SEQUENCE.length - 1) {
        // Swiped Left → Navigate Forward to Next Tab
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(15);
        }
        navigate(TAB_SEQUENCE[currentIndex + 1]);
      } else if (deltaX > 45 && currentIndex > 0) {
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

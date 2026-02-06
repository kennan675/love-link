import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import ActionButtons from "@/components/ActionButtons";
import MatchOverlay from "@/components/MatchOverlay";
import TopNav from "@/components/TopNav";
import { profiles, type Profile } from "@/data/profiles";

const SwipePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  const handleSwipe = useCallback(
    (direction: "left" | "right" | "up") => {
      const current = profiles[currentIndex];
      if (!current) return;

      // 30% chance of match on right swipe
      if (direction === "right" && Math.random() < 0.3) {
        setMatchedProfile(current);
      }

      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex]
  );

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 2);
  const allSwiped = currentIndex >= profiles.length;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <TopNav />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-4">
        {allSwiped ? (
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">No more profiles</p>
            <p className="mt-2 text-muted-foreground">Check back later for more people</p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="gradient-brand mt-6 rounded-full px-8 py-3 font-semibold text-primary-foreground shadow-button"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="relative h-[65vh] w-full max-w-sm">
            <AnimatePresence>
              {visibleProfiles
                .slice()
                .reverse()
                .map((profile, i) => (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    onSwipe={handleSwipe}
                    isTop={i === visibleProfiles.length - 1}
                  />
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {!allSwiped && (
        <ActionButtons
          onNope={() => handleSwipe("left")}
          onLike={() => handleSwipe("right")}
          onSuperLike={() => handleSwipe("up")}
          onRewind={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          onBoost={() => {}}
        />
      )}

      <MatchOverlay profile={matchedProfile} onClose={() => setMatchedProfile(null)} />
    </div>
  );
};

export default SwipePage;

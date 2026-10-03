import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import TopNav from "@/components/TopNav";
import MatchOverlay from "@/components/MatchOverlay";
import FeedProfileCard from "@/components/feed/FeedProfileCard";
import PullToRefresh from "@/components/PullToRefresh";
import { useProfiles, type UserProfile } from "@/hooks/useProfileData";
import { useSwipe } from "@/hooks/useSwipe";
import { Loader2, SearchX, ArrowLeft, Home, Compass, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { LocationConsentModal, useLocationConsent } from "@/components/ConsentModals";

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const LS_PASSED = "bll_passed_profiles";
const LS_LIKED = "bll_liked_profiles";
const loadSet = (key: string): Set<string> => new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
const saveSet = (key: string, set: Set<string>) => localStorage.setItem(key, JSON.stringify([...set]));

const SwipePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetProfileId = searchParams.get("profileId");
  const { t } = useTranslation();
  const { profiles, likedIds, loading, refreshing, refetch } = useProfiles();
  const { recordSwipe } = useSwipe();
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set());
  const [isResetting, setIsResetting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(!useLocationConsent());

  const handlePullRefresh = async () => {
    try {
      // If all profiles were passed in the current session, clear them so they can be re-discovered
      if (visibleProfiles.length === 0) {
        setPassedProfiles(new Set());
        saveSet(LS_PASSED, new Set());
      }
      await refetch(true);
      toast.success("Profiles refreshed with new recommendations ✨");
    } catch (e) {
      console.error("Refresh error:", e);
    }
  };

  // Initialize likedProfiles with data from server ONCE when it loads
  useMemo(() => {
    if (likedIds && likedIds.length > 0) {
      setLikedProfiles(prev => new Set([...prev, ...likedIds]));
    }
  }, [likedIds]);

  const visibleProfiles = useMemo(() => {
    // If targetProfileId is requested, allow it even if previously passed
    const filtered = profiles.filter(p => p.user_id === targetProfileId || !passedProfiles.has(p.user_id));
    if (targetProfileId) {
      const targetIdx = filtered.findIndex(p => p.user_id === targetProfileId);
      if (targetIdx > -1) {
        const target = filtered[targetIdx];
        const rest = filtered.filter(p => p.user_id !== targetProfileId);
        return [target, ...rest];
      }
    }
    return filtered;
  }, [profiles, passedProfiles, targetProfileId]);

  const handleLike = async (profile: UserProfile) => {
    const next = new Set(likedProfiles).add(profile.user_id);
    setLikedProfiles(next); saveSet(LS_LIKED, next);
    const { matched } = await recordSwipe(profile, "right");
    if (matched) setMatchedProfile(profile);
  };

  const handlePass = async (profile: UserProfile) => {
    const next = new Set(passedProfiles).add(profile.user_id);
    setPassedProfiles(next); saveSet(LS_PASSED, next);
    await recordSwipe(profile, "left");
  };

  const handleMessage = async (profile: UserProfile, introText: string) => {
    const next = new Set(likedProfiles).add(profile.user_id);
    setLikedProfiles(next); saveSet(LS_LIKED, next);
    const { matched } = await recordSwipe(profile, "message", introText);
    if (matched) setMatchedProfile(profile);
  };

  const handleStartOver = async () => {
    try {
      setIsResetting(true);
      // Temporarily bypass backend reset, just reset local state to show all profiles again
      // const { error } = await supabase.rpc('reset_user_swipes');
      // if (error) throw error;
      
      // Clear local records
      setLikedProfiles(new Set()); 
      setPassedProfiles(new Set()); 
      saveSet(LS_LIKED, new Set()); 
      saveSet(LS_PASSED, new Set());
      
      // Let the react state update visibleProfiles instantly
      setIsResetting(false);
    } catch (e) {
      console.error("Failed to reset swipes:", e);
      setIsResetting(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-b from-background via-background to-primary/5 overflow-hidden">
      <TopNav />

      {/* Sleek compact discover sub-bar */}
      <div className="w-full max-w-md mx-auto px-4 pt-3 pb-1 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5 text-primary" />
          <span>{t.app.discover}</span>
        </div>
        <div className="flex items-center gap-2">
          {!loading && visibleProfiles.length > 0 && (
            <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              {visibleProfiles.length} {visibleProfiles.length === 1 ? "Profile" : "Profiles"}
            </span>
          )}
          <button
            type="button"
            onClick={handlePullRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            title="Refresh profiles"
            aria-label="Refresh profiles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-secondary" : ""}`} />
          </button>
        </div>
      </div>

      <PullToRefresh onRefresh={handlePullRefresh} className="flex-1 min-h-0 pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
              <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">{t.app.loading}</p>
          </div>
        ) : visibleProfiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[60vh] gap-4 px-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative w-24 h-24 rounded-full gradient-brand flex items-center justify-center shadow-xl">
                <SearchX className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground">{t.swipe.noProfilesTitle}</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              {t.swipe.noProfilesDesc}
            </p>
            <button
              onClick={handleStartOver}
              disabled={isResetting}
              className="mt-2 px-8 py-3 flex items-center gap-2 rounded-full gradient-brand text-primary-foreground font-bold shadow-button hover:opacity-90 transition disabled:opacity-50"
            >
              {isResetting ? <Loader2 className="w-5 h-5 animate-spin" /> : t.swipe.startOver}
            </button>
            <Link
              to="/"
              className="mt-1 text-sm text-muted-foreground hover:text-primary transition font-medium underline-offset-4 hover:underline"
            >
              {t.nav.home}
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-5 px-4 pt-5 max-w-md mx-auto">
            <AnimatePresence>
              {visibleProfiles.map(profile => (
                <FeedProfileCard
                  key={profile.user_id}
                  profile={profile}
                  isLiked={likedProfiles.has(profile.user_id)}
                  onLike={() => handleLike(profile)}
                  onPass={() => handlePass(profile)}
                  onMessage={(introText: string) => handleMessage(profile, introText)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </PullToRefresh>

      <MatchOverlay profile={matchedProfile} onClose={() => setMatchedProfile(null)} />

      {/* Screen A — Location consent (first visit only) */}
      {showLocationModal && (
        <LocationConsentModal
          onAllow={() => setShowLocationModal(false)}
          onDeny={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
};

export default SwipePage;

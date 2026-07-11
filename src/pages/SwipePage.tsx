import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import TopNav from "@/components/TopNav";
import MatchOverlay from "@/components/MatchOverlay";
import FeedProfileCard from "@/components/feed/FeedProfileCard";
import { useProfiles, type UserProfile } from "@/hooks/useProfileData";
import { useSwipe } from "@/hooks/useSwipe";
import { Loader2, SearchX, ArrowLeft, Home, Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LocationConsentModal, useLocationConsent } from "@/components/ConsentModals";

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const LS_PASSED = "bll_passed_profiles";
const LS_LIKED = "bll_liked_profiles";
const loadSet = (key: string): Set<string> => new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
const saveSet = (key: string, set: Set<string>) => localStorage.setItem(key, JSON.stringify([...set]));

const SwipePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profiles, likedIds, loading } = useProfiles();
  const { recordSwipe } = useSwipe();
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set());
  const [isResetting, setIsResetting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(!useLocationConsent());

  // Initialize likedProfiles with data from server ONCE when it loads
  useMemo(() => {
    if (likedIds && likedIds.length > 0) {
      setLikedProfiles(prev => new Set([...prev, ...likedIds]));
    }
  }, [likedIds]);

  const visibleProfiles = useMemo(
    () => profiles.filter(p => !passedProfiles.has(p.user_id)),
    [profiles, passedProfiles]
  );

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
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-background via-background to-primary/5">
      <TopNav />

      {/* Vibrant gradient hero header with navigation */}
      <header className="relative overflow-hidden gradient-brand">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative max-w-md mx-auto px-4 py-4">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-primary-foreground/80 text-xs font-medium uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> {t.swipe.lookingFor}
              </div>
              <h1 className="text-3xl font-black text-primary-foreground leading-tight mt-1">
                {t.app.discover}
              </h1>
            </div>
            {!loading && visibleProfiles.length > 0 && (
              <span className="text-xs text-primary-foreground bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold">
                {visibleProfiles.length} nearby
              </span>
            )}
          </motion.div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
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
            <AnimatePresence mode="popLayout">
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
      </main>

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

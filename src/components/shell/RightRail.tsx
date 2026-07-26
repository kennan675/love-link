import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Heart, MessageCircle, Clock, CheckCheck, AlertCircle, Loader2 } from "lucide-react";
import { useSuggestedProfiles } from "@/hooks/useSuggestedProfiles";
import { useMatches, getProfilePhoto } from "@/hooks/useMatches";
import { useSwipe } from "@/hooks/useSwipe";
import { useState } from "react";

// ── Status badge config ────────────────────────────────────────────────
type MatchStatus = "accepted" | "pending_them" | "pending_me" | "no_messages";

const statusBadge: Record<MatchStatus, { label: string; className: string; icon?: React.ReactNode }> = {
  accepted: {
    label: "",
    className: "",
  },
  pending_them: {
    label: "Awaiting reply",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    icon: <Clock className="w-2.5 h-2.5" />,
  },
  pending_me: {
    label: "Replied to you!",
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    icon: <CheckCheck className="w-2.5 h-2.5" />,
  },
  no_messages: {
    label: "Not yet matched",
    className: "bg-muted text-muted-foreground",
    icon: <AlertCircle className="w-2.5 h-2.5" />,
  },
};

export default function RightRail() {
  const navigate = useNavigate();
  const { profiles: suggested, loading: suggestLoading } = useSuggestedProfiles();
  const { matches, loading: matchLoading } = useMatches();
  const { recordSwipe } = useSwipe();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleLike = async (userId: string, profile: any) => {
    if (likedIds.has(userId)) return;
    setLikedIds(prev => new Set(prev).add(userId));
    await recordSwipe(profile, "right");
  };

  // Top 5 matches for "Active Now"
  const activeConversations = matches.slice(0, 5);

  return (
    <aside className="hidden lg:flex fixed right-0 top-14 bottom-0 w-[320px] z-40 flex-col p-3 gap-4 overflow-y-auto bg-background border-l border-border">

      {/* ── Suggested for You ── */}
      <section className="rounded-2xl bg-card border border-border p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> Suggested for you
          </h3>
          <Link to="/swipe" className="text-xs font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>

        {suggestLoading ? (
          <div className="flex flex-col gap-2 py-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : suggested.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 px-2">
            No new suggestions right now. Check back later!
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {suggested.map(profile => {
              const photo = getProfilePhoto(profile);
              const isLiked = likedIds.has(profile.user_id);
              return (
                <li
                  key={profile.user_id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition cursor-pointer"
                  onClick={() => navigate(`/swipe?profileId=${profile.user_id}`)}
                >
                  <img
                    src={photo}
                    alt={profile.full_name}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                      {profile.full_name}
                      {profile.verified && (
                        <span className="text-blue-400 text-[10px]">✓</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[profile.occupation_title, profile.occupation_company]
                        .filter(Boolean)
                        .join(" · ") || "BlackLoveLink member"}
                    </p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleLike(profile.user_id, profile);
                    }}
                    disabled={isLiked}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition shrink-0 ${
                      isLiked
                        ? "bg-rose-500 text-white cursor-default"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                    aria-label={isLiked ? "Liked" : `Like ${profile.full_name}`}
                  >
                    <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Active Now (Your Conversations) ── */}
      <section className="rounded-2xl bg-card border border-border p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-sm font-bold text-foreground">Active now</h3>
          <Link to="/messages" className="text-xs font-semibold text-primary hover:underline">
            Messages
          </Link>
        </div>

        {matchLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeConversations.length === 0 ? (
          <div className="text-center py-5 px-2">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No conversations yet.{" "}
              <Link to="/swipe" className="text-primary font-semibold hover:underline">
                Start swiping!
              </Link>
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {activeConversations.map(match => {
              const profile = match.matchedProfile;
              const photo = getProfilePhoto(profile);
              const badge = statusBadge[match.status];
              const isFullMatch = match.status === "accepted";

              return (
                <li key={match.id}>
                  <Link
                    to="/messages"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition group"
                  >
                    {/* Avatar + online dot */}
                    <div className="relative shrink-0">
                      <img
                        src={photo}
                        alt={profile.full_name}
                        className="w-9 h-9 rounded-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      {/* Green dot only for fully matched */}
                      {isFullMatch && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-card" />
                      )}
                    </div>

                    {/* Name + status badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-medium truncate ${match.hasUnread ? "text-foreground font-semibold" : "text-foreground"}`}>
                          {profile.full_name.split(" ")[0]}
                        </span>
                        {badge.label && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${badge.className}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        )}
                      </div>
                      {match.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {match.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* Unread indicator or chat icon */}
                    {match.hasUnread ? (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    ) : (
                      <MessageCircle className="ml-auto w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Tip card ── */}
      <section className="rounded-2xl p-4 bg-gradient-to-br from-primary/10 via-card to-secondary/10 border border-border">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Tip</p>
        <p className="text-sm font-semibold text-foreground leading-snug">
          Verified profiles get 4× more meaningful matches.
        </p>
        <Link
          to="/profile"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          Verify now →
        </Link>
      </section>
    </aside>
  );
}
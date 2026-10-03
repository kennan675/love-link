import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
    id: string;
    user_id: string;
    full_name: string;
    occupation_title: string;
    occupation_company: string;
    dob: string | null;
    age: number | null;
    gender: string | null;
    intent: string | null;
    interests: string[];
    bio: string;
    photos: string[];
    avatar_url: string | null;
    verified: boolean;
    profile_completed: boolean;
    push_notifications: boolean;
    email_notifications: boolean;
    is_public: boolean;
}

export const useCurrentUserProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                if (error) throw error;
                if (isMounted) setProfile(data as unknown as UserProfile | null);
            } catch (e) {
                console.error("Error fetching current user profile:", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => { isMounted = false; };
    }, []);

    return { profile, loading };
};

/**
 * Compute a compatibility score between the current user and a candidate profile.
 * Higher score = better match. Factors:
 *   - Shared interests (3 pts each)
 *   - Same dating intent (10 pts)
 *   - Verified profile (5 pts)
 *   - Profile recency bonus (0-5 pts, decays over 90 days)
 */
const computeScore = (
    myProfile: { interests: string[]; intent: string | null },
    candidate: UserProfile
): number => {
    let score = 0;

    // Shared interests — 3 points each
    const myInterests = new Set((myProfile.interests ?? []).map(i => i.toLowerCase().trim()));
    const theirInterests = (candidate.interests ?? []).map(i => i.toLowerCase().trim());
    for (const interest of theirInterests) {
        if (myInterests.has(interest)) score += 3;
    }

    // Same dating intent — 10 points
    if (
        myProfile.intent &&
        candidate.intent &&
        myProfile.intent.toLowerCase() === candidate.intent.toLowerCase()
    ) {
        score += 10;
    }

    // Verified profile bonus — 5 points
    if (candidate.verified) score += 5;

    // Recency bonus — up to 5 points (profiles created in last 90 days)
    if ((candidate as any).created_at) {
        const daysSinceCreation = (Date.now() - new Date((candidate as any).created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 90) {
            score += Math.round(5 * (1 - daysSinceCreation / 90));
        }
    }

    return score;
};

export const useProfiles = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [likedIds, setLikedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const shuffleSeedRef = useRef<number>(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const fetchProfiles = useCallback(async (shouldShuffle = false) => {
        try {
            if (shouldShuffle) {
                setRefreshing(true);
                shuffleSeedRef.current += 1;
            } else {
                setLoading(true);
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                if (isMountedRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
                return;
            }

            // 1. Parallelise: fetch own profile + existing swipes at the same time
            const [myProfileResult, existingSwipesResult] = await Promise.all([
                supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle(),
                (supabase as any).from("swipes").select("swiped_id, direction").eq("swiper_id", session.user.id),
            ]);

            const myProfile = myProfileResult.data;
            const existingSwipes = existingSwipesResult.data;

            const passedSwipeIds = new Set(
                (existingSwipes ?? [])
                    .filter((s: any) => s.direction === "left")
                    .map((s: any) => s.swiped_id)
            );

            const serverLikedSwipeIds = (existingSwipes ?? [])
                .filter((s: any) => s.direction === "right" || s.direction === "message")
                .map((s: any) => s.swiped_id);

            // 2. Fetch candidate profiles
            const query = (supabase as any)
                .from("profiles")
                .select("*")
                .eq("profile_completed", true)
                .eq("is_public", true)
                .neq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            let candidates = (data ?? []) as unknown as UserProfile[];

            // 3. Filter out ONLY already passed (swiped left) profiles
            if (passedSwipeIds.size > 0) {
                candidates = candidates.filter(p => !passedSwipeIds.has(p.user_id));
            }

            // 4. Score and sort by compatibility
            if (myProfile) {
                const scored = candidates.map(candidate => ({
                    profile: candidate,
                    score: computeScore(
                        {
                            interests: myProfile.interests ?? [],
                            intent: myProfile.intent ?? null,
                        },
                        candidate
                    ),
                }));

                // Sort by score descending, then by creation date for ties
                scored.sort((a, b) => b.score - a.score);
                candidates = scored.map(s => s.profile);
            }

            // 5. If refresh/shuffle requested, perform a smart Fisher-Yates shuffle
            // so pulling down consistently reveals a brand-new mix of profiles at the top
            if (shouldShuffle || shuffleSeedRef.current > 0) {
                const shuffled = [...candidates];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                candidates = shuffled;
            }

            if (isMountedRef.current) {
                setProfiles(candidates);
                setLikedIds(serverLikedSwipeIds);

                // Preload first images
                candidates.forEach((candidate, index) => {
                    const photos = [
                        ...(candidate.photos?.filter(Boolean) ?? []),
                        ...(candidate.avatar_url ? [candidate.avatar_url] : []),
                    ].slice(0, index < 5 ? 2 : 1);
                    photos.forEach(url => {
                        if (!url) return;
                        const img = new window.Image();
                        img.fetchPriority = index < 2 ? 'high' : 'low';
                        img.src = url;
                    });
                });
            }
        } catch (e) {
            console.error("Error fetching profiles:", e);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const refetch = useCallback(async (shouldShuffle = true) => {
        await fetchProfiles(shouldShuffle);
    }, [fetchProfiles]);

    return { profiles, likedIds, loading, refreshing, refetch };
};

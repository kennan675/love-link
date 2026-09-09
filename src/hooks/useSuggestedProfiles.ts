import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/hooks/useProfileData";

/**
 * Fetches top 3 compatibility-scored profiles (excluding already-swiped ones)
 * for the "Suggested for You" rail widget.
 */
export const useSuggestedProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { if (isMounted) setLoading(false); return; }
        const userId = session.user.id;

        // Fetch current user profile & already-swiped ids in parallel
        const [myProfileResult, swipesResult] = await Promise.all([
          supabase.from("profiles").select("interests,intent,gender").eq("user_id", userId).maybeSingle(),
          (supabase as any).from("swipes").select("swiped_id").eq("swiper_id", userId),
        ]);

        const myProfile = myProfileResult.data;
        const swipedIds = new Set<string>(
          (swipesResult.data ?? []).map((s: any) => s.swiped_id)
        );

        const myGender = myProfile?.gender?.toLowerCase();
        let targetGender: string | null = null;
        if (myGender === "male") targetGender = "Female";
        else if (myGender === "female") targetGender = "Male";

        let query = (supabase as any)
          .from("profiles")
          .select("*")
          .eq("profile_completed", true)
          .eq("is_public", true)
          .neq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(40);

        if (targetGender) query = query.ilike("gender", targetGender);

        const { data, error } = await query;
        if (error) throw error;

        let candidates = (data ?? []) as unknown as UserProfile[];

        // Filter out already swiped
        candidates = candidates.filter(p => !swipedIds.has(p.user_id));

        // Score by shared interests + intent match
        const myInterests = new Set<string>(
          (myProfile?.interests ?? []).map((i: string) => i.toLowerCase().trim())
        );
        const myIntent = myProfile?.intent?.toLowerCase() ?? null;

        const scored = candidates.map(c => {
          let score = 0;
          (c.interests ?? []).forEach((i: string) => {
            if (myInterests.has(i.toLowerCase().trim())) score += 3;
          });
          if (myIntent && c.intent?.toLowerCase() === myIntent) score += 10;
          if (c.verified) score += 5;
          return { profile: c, score };
        });

        scored.sort((a, b) => b.score - a.score);

        if (isMounted) setProfiles(scored.slice(0, 3).map(s => s.profile));
      } catch (e) {
        console.error("useSuggestedProfiles error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetch();
    return () => { isMounted = false; };
  }, []);

  return { profiles, loading };
};

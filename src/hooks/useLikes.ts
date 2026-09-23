import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/hooks/useProfileData";

export interface LikeEntry {
    swipe_id: string;
    direction: string;
    intro_text: string | null;
    created_at: string;
    liker: UserProfile;
}

export const useLikes = () => {
    const [likes, setLikes] = useState<LikeEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLikes = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) { setLoading(false); return; }

            // Get all right/up/message swipes where current user is the target
            const { data: swipes, error } = await (supabase as any)
                .from("swipes")
                .select("id, direction, intro_text, created_at, swiper_id")
                .eq("swiped_id", session.user.id)
                .in("direction", ["right", "up", "message"])
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (!swipes || swipes.length === 0) { setLikes([]); setLoading(false); return; }

            // Fetch profiles of each liker
            const swiperIds = swipes.map((s: any) => s.swiper_id);
            const { data: profiles } = await supabase
                .from("profiles")
                .select("*")
                .in("user_id", swiperIds);

            if (!profiles) { setLikes([]); setLoading(false); return; }

            const profileMap = new Map(profiles.map(p => [p.user_id, p]));

            const entries: LikeEntry[] = swipes
                .map((s: any) => {
                    const liker = profileMap.get(s.swiper_id);
                    if (!liker || liker.deactivated_at || !liker.is_public) return null;
                    return {
                        swipe_id: s.id,
                        direction: s.direction,
                        intro_text: s.intro_text,
                        created_at: s.created_at,
                        liker: liker as unknown as UserProfile,
                    };
                })
                .filter(Boolean) as LikeEntry[];

            setLikes(entries);
        } catch (e) {
            console.error("Error fetching likes:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLikes(); }, [fetchLikes]);

    return { likes, loading, refetch: fetchLikes };
};

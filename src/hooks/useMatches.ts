import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/hooks/useProfileData";

export interface Match {
    id: string;
    matchedProfile: UserProfile;
    created_at: string;
    status: "pending_them" | "pending_me" | "accepted" | "no_messages";
    lastMessage?: string;
    lastMessageAt?: string;
    hasUnread?: boolean;
}

/** Pick the best display photo for a profile */
export const getProfilePhoto = (profile: UserProfile): string => {
    return profile.photos?.[0] ?? profile.avatar_url ?? "/placeholder.svg";
};

export const useMatches = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const fetchMatches = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) { setLoading(false); return; }

            const userId = session.user.id;

            const { data: matchRows, error } = await supabase
                .from("matches")
                .select("*")
                .or(`user_a.eq.${userId},user_b.eq.${userId}`)
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (!matchRows || matchRows.length === 0) {
                setMatches([]);
                setLoading(false);
                return;
            }

            // Get the other user_ids
            const otherIds = matchRows.map((m: any) =>
                m.user_a === userId ? m.user_b : m.user_a
            );

            // Fetch profiles
            const { data: profiles } = await supabase
                .from("profiles")
                .select("*")
                .in("user_id", otherIds);

            const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

            // Fetch all messages for these matches to determine status
            const matchIds = matchRows.map((m: any) => m.id);
            const { data: allMessages } = await supabase
                .from("messages")
                .select("*")
                .in("match_id", matchIds)
                .order("created_at", { ascending: false });

            // Group messages by match_id
            const messagesByMatch = new Map<string, any[]>();
            (allMessages ?? []).forEach((msg: any) => {
                const list = messagesByMatch.get(msg.match_id) || [];
                list.push(msg);
                messagesByMatch.set(msg.match_id, list);
            });

            const result: Match[] = matchRows
                .map((m: any) => {
                    const otherId = m.user_a === userId ? m.user_b : m.user_a;
                    const prof = profileMap.get(otherId);
                    if (!prof || prof.deactivated_at || prof.deletion_requested) return null;

                    const msgs = messagesByMatch.get(m.id) || [];

                    // Determine status based on message history
                    let status: Match["status"] = "no_messages";
                    const iSent = msgs.some((msg: any) => msg.sender_id === userId);
                    const theySent = msgs.some((msg: any) => msg.sender_id === otherId);

                    if (iSent && theySent) {
                        status = "accepted"; // Both have messaged
                    } else if (iSent && !theySent) {
                        status = "pending_them"; // I sent, waiting for them
                    } else if (!iSent && theySent) {
                        status = "pending_me"; // They sent, waiting for me
                    }

                    const lastMsg = msgs[0];

                    // Unread: last message was from the other person and is unread
                    const hasUnread = lastMsg
                        ? lastMsg.sender_id === otherId && lastMsg.read === false
                        : false;

                    return {
                        id: m.id,
                        matchedProfile: prof as UserProfile,
                        created_at: m.created_at,
                        status,
                        lastMessage: lastMsg?.content,
                        lastMessageAt: lastMsg?.created_at,
                        hasUnread,
                    };
                })
                .filter(Boolean) as Match[];

            // Sort: unread first, then by lastMessageAt desc
            result.sort((a, b) => {
                if (a.hasUnread && !b.hasUnread) return -1;
                if (!a.hasUnread && b.hasUnread) return 1;
                const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.created_at).getTime();
                const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.created_at).getTime();
                return bTime - aTime;
            });

            setMatches(result);
        } catch (e) {
            console.error("Error fetching matches:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();

        // Subscribe to new matches in realtime so both users' lists update instantly
        const setupChannel = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const userId = session.user.id;

            // Clean up existing channel
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }

            const channel = supabase
                .channel(`matches-user-${userId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "matches",
                        // No filter here — we'll check membership client-side
                    },
                    (payload) => {
                        const m = payload.new as any;
                        // Only refetch if we're involved in this match
                        if (m.user_a === userId || m.user_b === userId) {
                            fetchMatches();
                        }
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "messages",
                    },
                    () => {
                        // Refresh match list to update lastMessage & unread badge
                        fetchMatches();
                    }
                )
                .subscribe((status) => {
                    if (status === "CHANNEL_ERROR") {
                        console.error("Matches realtime channel error");
                    }
                });

            channelRef.current = channel;
        };

        setupChannel();

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, []);

    return { matches, loading, refetch: fetchMatches };
};

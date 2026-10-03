import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/hooks/useProfileData";

export interface Notification {
  id: string;
  type: "match" | "like" | "message_request" | "admin";
  profile: UserProfile | null;
  message?: string;
  created_at: string;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const readIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      const userId = session.user.id;

      // 1. Fetch new matches (mutual likes)
      const { data: matchRows } = await supabase
        .from("matches")
        .select("*")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(20);

      // 2. Fetch swipes where someone liked/messaged me (pending_me)
      const { data: inboundSwipes } = await (supabase as any)
        .from("swipes")
        .select("*")
        .eq("swiped_id", userId)
        .in("direction", ["right", "message"])
        .order("created_at", { ascending: false })
        .limit(20);

      // Collect all other user IDs
      const otherIds = new Set<string>();
      (matchRows ?? []).forEach((m: any) => {
        otherIds.add(m.user_a === userId ? m.user_b : m.user_a);
      });
      (inboundSwipes ?? []).forEach((s: any) => otherIds.add(s.swiper_id));

      // Fetch profiles for those users
      const profileMap = new Map<string, UserProfile>();
      if (otherIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", [...otherIds]);
        (profiles ?? []).forEach((p: any) => profileMap.set(p.user_id, p as UserProfile));
      }

      const notes: Notification[] = [];

      // Build match notifications
      (matchRows ?? []).forEach((m: any) => {
        const otherId = m.user_a === userId ? m.user_b : m.user_a;
        notes.push({
          id: `match-${m.id}`,
          type: "match",
          profile: profileMap.get(otherId) ?? null,
          message: `You matched with ${profileMap.get(otherId)?.full_name ?? "someone"}! 🎉`,
          created_at: m.created_at,
          read: readIdsRef.current.has(`match-${m.id}`),
        });
      });

      // Build like/message-request notifications — deduplicate against matches
      const matchedIds = new Set(
        (matchRows ?? []).map((m: any) => m.user_a === userId ? m.user_b : m.user_a)
      );
      (inboundSwipes ?? []).forEach((s: any) => {
        if (matchedIds.has(s.swiper_id)) return; // already shown as a match
        const profile = profileMap.get(s.swiper_id) ?? null;
        notes.push({
          id: `swipe-${s.id}`,
          type: s.direction === "message" ? "message_request" : "like",
          profile,
          message: s.direction === "message"
            ? `${profile?.full_name ?? "Someone"} sent you a message request 💌`
            : `${profile?.full_name ?? "Someone"} liked your profile ❤️`,
          created_at: s.created_at,
          read: readIdsRef.current.has(`swipe-${s.id}`),
        });
      });

      // 3. Admin notifications (photo removals, platform notices)
      try {
        const { data: adminNotifs } = await (supabase as any)
          .from("admin_notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);
        (adminNotifs ?? []).forEach((n: any) => {
          notes.push({
            id: `admin-${n.id}`,
            type: "admin" as const,
            profile: null,
            message: n.message,
            created_at: n.created_at,
            read: n.read || readIdsRef.current.has(`admin-${n.id}`),
          });
        });
      } catch {
        // admin_notifications table may not exist yet — skip silently
      }

      // Sort by date desc
      notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(notes);
      setUnreadCount(notes.filter(n => !n.read).length);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => { readIdsRef.current.add(n.id); return { ...n, read: true }; });
      setUnreadCount(0);
      return updated;
    });
  };

  useEffect(() => {
    fetchNotifications();

    const setupChannel = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      if (channelRef.current) supabase.removeChannel(channelRef.current);

      const channel = supabase
        .channel(`notifications-${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "matches" },
          (payload) => {
            const m = payload.new as any;
            if (m.user_a === userId || m.user_b === userId) fetchNotifications();
          }
        )
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "swipes" },
          (payload) => {
            const s = payload.new as any;
            if (s.swiped_id === userId) fetchNotifications();
          }
        )
        .on("postgres_changes", {
            event: "INSERT", schema: "public", table: "admin_notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => fetchNotifications()
        )
        .subscribe();

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

  return { notifications, loading, unreadCount, markAllRead, refetch: fetchNotifications };
};

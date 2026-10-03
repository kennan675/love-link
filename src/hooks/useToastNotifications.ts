import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ToastNotif {
  id: string;
  type: "match" | "like" | "message_request" | "message" | "admin";
  message: string;
  avatarUrl?: string | null;
  avatarInitial?: string;
  navigateTo: string;
  createdAt: number;
}

const MAX_TOASTS = 3;
export const TOAST_DURATION_MS = 5000;

export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<ToastNotif[]>([]);
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const matchIdsRef = useRef<Set<string>>(new Set());
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timerRefs.current.get(id);
    if (timer) { clearTimeout(timer); timerRefs.current.delete(id); }
  }, []);

  const push = useCallback((toast: Omit<ToastNotif, "createdAt">) => {
    const entry: ToastNotif = { ...toast, createdAt: Date.now() };
    setToasts(prev => [entry, ...prev].slice(0, MAX_TOASTS));

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
      timerRefs.current.delete(toast.id);
    }, TOAST_DURATION_MS);
    timerRefs.current.set(toast.id, timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !mounted) return;
      const userId = session.user.id;

      // Load existing match IDs so we can filter incoming messages
      const { data: existingMatches } = await supabase
        .from("matches")
        .select("id")
        .or(`user_a.eq.${userId},user_b.eq.${userId}`);
      (existingMatches ?? []).forEach((m: any) => matchIdsRef.current.add(m.id));

      // ── Channel 1: New Matches ──────────────────────────────────────────
      const matchesChannel = supabase
        .channel(`toast-matches-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "matches" },
          async (payload) => {
            if (!mounted) return;
            const m = payload.new as any;
            if (m.user_a !== userId && m.user_b !== userId) return;
            matchIdsRef.current.add(m.id);
            const otherId = m.user_a === userId ? m.user_b : m.user_a;
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url, photos")
              .eq("user_id", otherId)
              .maybeSingle();
            const name = (profile as any)?.full_name ?? "Someone";
            push({
              id: `toast-match-${m.id}`,
              type: "match",
              message: `You matched with ${name}! 🎉`,
              avatarUrl: (profile as any)?.avatar_url ?? (profile as any)?.photos?.[0] ?? null,
              avatarInitial: name.charAt(0),
              navigateTo: "/messages",
            });
          }
        )
        .subscribe();
      channelsRef.current.push(matchesChannel);

      // ── Channel 2: New Likes / Message Requests ─────────────────────────
      const swipesChannel = supabase
        .channel(`toast-swipes-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "swipes",
            filter: `swiped_id=eq.${userId}`,
          },
          async (payload) => {
            if (!mounted) return;
            const s = payload.new as any;
            if (!["right", "up", "message"].includes(s.direction)) return;
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url, photos")
              .eq("user_id", s.swiper_id)
              .maybeSingle();
            const name = (profile as any)?.full_name ?? "Someone";
            const isMsg = s.direction === "message";
            push({
              id: `toast-swipe-${s.id}`,
              type: isMsg ? "message_request" : "like",
              message: isMsg
                ? `${name} sent you a message request 💌`
                : `${name} liked your profile ❤️`,
              avatarUrl: (profile as any)?.avatar_url ?? (profile as any)?.photos?.[0] ?? null,
              avatarInitial: name.charAt(0),
              navigateTo: isMsg ? "/messages" : "/likes",
            });
          }
        )
        .subscribe();
      channelsRef.current.push(swipesChannel);

      // ── Channel 3: New Chat Messages (across all matches) ───────────────
      const messagesChannel = supabase
        .channel(`toast-messages-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          async (payload) => {
            if (!mounted) return;
            const msg = payload.new as any;
            // Ignore own messages and messages not in my matches
            if (msg.sender_id === userId) return;
            if (!matchIdsRef.current.has(msg.match_id)) return;
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url, photos")
              .eq("user_id", msg.sender_id)
              .maybeSingle();
            const name = (profile as any)?.full_name ?? "Someone";
            const raw: string = msg.content ?? "";
            const preview = raw.length > 45 ? raw.slice(0, 45) + "…" : raw;
            push({
              id: `toast-msg-${msg.id}`,
              type: "message",
              message: `${name}: ${preview}`,
              avatarUrl: (profile as any)?.avatar_url ?? (profile as any)?.photos?.[0] ?? null,
              avatarInitial: name.charAt(0),
              navigateTo: "/messages",
            });
          }
        )
        .subscribe();
      channelsRef.current.push(messagesChannel);

      // ── Channel 4: Admin Notifications ─────────────────────────────────
      const adminChannel = supabase
        .channel(`toast-admin-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "admin_notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!mounted) return;
            const notif = payload.new as any;
            push({
              id: `toast-admin-${notif.id}`,
              type: "admin",
              message: notif.message,
              navigateTo: "/profile",
            });
          }
        )
        .subscribe();
      channelsRef.current.push(adminChannel);
    };

    setup();

    return () => {
      mounted = false;
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
      channelsRef.current = [];
      timerRefs.current.forEach(t => clearTimeout(t));
      timerRefs.current.clear();
    };
  }, [push]);

  return { toasts, dismiss };
};

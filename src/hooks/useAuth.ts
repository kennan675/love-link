import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const SESSION_CACHE_KEY = "bll_session_cache";
const SESSION_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedSession {
  userId: string;
  email: string | undefined;
  cachedAt: number;
}

function readCache(): CachedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedSession = JSON.parse(raw);
    if (Date.now() - parsed.cachedAt > SESSION_CACHE_TTL_MS) {
      localStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(user: User) {
  try {
    const entry: CachedSession = {
      userId: user.id,
      email: user.email,
      cachedAt: Date.now(),
    };
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(entry));
  } catch { /* storage unavailable */ }
}

function clearCache() {
  try { localStorage.removeItem(SESSION_CACHE_KEY); } catch { /* ignore */ }
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Primary: get the live session from Supabase
    supabase.auth.getSession().then(({ data: { session: liveSession } }) => {
      if (!mounted) return;

      if (liveSession?.user) {
        // Live session found — cache it and use it
        writeCache(liveSession.user);
        setSession(liveSession);
        setUser(liveSession.user);
        setLoading(false);
      } else {
        // No live session — check the offline cache
        const cached = readCache();
        if (cached) {
          // Cache is fresh — optimistically trust it while we try to refresh
          // ProtectedRoute will show content; if refresh fails, signOut clears it
          supabase.auth.refreshSession().then(({ data }) => {
            if (!mounted) return;
            if (data.session?.user) {
              writeCache(data.session.user);
              setSession(data.session);
              setUser(data.session.user);
            } else {
              // Refresh failed — cache is stale, clear it
              clearCache();
              setSession(null);
              setUser(null);
            }
            setLoading(false);
          });
        } else {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    });

    // Live auth state listener (catches sign-in / sign-out events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        if (newSession?.user) {
          writeCache(newSession.user);
        } else {
          clearCache();
        }
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    clearCache();
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}

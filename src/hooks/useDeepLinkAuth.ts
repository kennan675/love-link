import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "@/integrations/supabase/client";
import { getProfileStatus } from "@/services/profileStatus";

/**
 * Listens for deep links (e.g. com.blacklovelink.app://auth/callback)
 * to handle OAuth callbacks seamlessly inside the native app without leaving the user on Chrome.
 */
export function useDeepLinkAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleUrl = async (urlStr: string) => {
      if (!urlStr) return;

      // Close the in-app browser tab if open
      try {
        await Browser.close();
      } catch {
        // In-app browser might already be closed
      }

      // Check if this is an auth callback
      if (urlStr.includes("auth/callback") || urlStr.includes("com.blacklovelink.app")) {
        try {
          let authedUser: { id: string } | null = null;

          // Case 1: PKCE code exchange (?code=...)
          const codeMatch = urlStr.match(/[?&]code=([^&#]+)/);
          if (codeMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            try {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (!error && data?.session?.user) {
                authedUser = data.session.user;
              }
            } catch (err) {
              console.warn("PKCE exchange error, trying fallback session:", err);
            }
          }

          // Case 2: Implicit token hash (#access_token=...&refresh_token=...)
          const accessMatch = urlStr.match(/[#?&]access_token=([^&#]+)/);
          const refreshMatch = urlStr.match(/[#?&]refresh_token=([^&#]+)/);
          if (!authedUser && accessMatch && refreshMatch) {
            const access_token = decodeURIComponent(accessMatch[1]);
            const refresh_token = decodeURIComponent(refreshMatch[1]);
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              if (!error && data?.session?.user) {
                authedUser = data.session.user;
              }
            } catch (err) {
              console.warn("setSession error:", err);
            }
          }

          // Fallback: check if session is already stored/refreshed
          if (!authedUser) {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
              authedUser = data.session.user;
            }
          }

          if (authedUser) {
            const status = await getProfileStatus(authedUser.id);
            navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you", { replace: true });
            return;
          }
        } catch (err) {
          console.error("Deep link auth error:", err);
        }
      }
    };

    // Cold start deep link (app launched via link)
    CapApp.getLaunchUrl().then((launchUrl) => {
      if (launchUrl?.url) {
        handleUrl(launchUrl.url);
      }
    });

    // Warm deep link (app resumed via link)
    const listenerPromise = CapApp.addListener("appUrlOpen", (data) => {
      handleUrl(data.url);
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [navigate]);
}

export default useDeepLinkAuth;

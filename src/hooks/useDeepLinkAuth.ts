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
          // Case 1: PKCE code exchange (?code=...)
          if (urlStr.includes("code=")) {
            const normalized = urlStr.replace("com.blacklovelink.app://", "https://localhost/");
            const urlObj = new URL(normalized);
            const code = urlObj.searchParams.get("code");
            if (code) {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (!error && data?.session?.user) {
                const status = await getProfileStatus(data.session.user.id);
                navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you", { replace: true });
                return;
              }
            }
          }

          // Case 2: Implicit token hash (#access_token=...&refresh_token=...)
          if (urlStr.includes("access_token=")) {
            const rawHash = urlStr.includes("#") ? urlStr.split("#")[1] : urlStr.split("?")[1];
            if (rawHash) {
              const params = new URLSearchParams(rawHash);
              const access_token = params.get("access_token");
              const refresh_token = params.get("refresh_token");
              if (access_token && refresh_token) {
                const { data, error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });
                if (!error && data?.session?.user) {
                  const status = await getProfileStatus(data.session.user.id);
                  navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you", { replace: true });
                  return;
                }
              }
            }
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

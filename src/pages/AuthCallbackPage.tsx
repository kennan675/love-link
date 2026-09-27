import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

import { getProfileStatus } from "@/services/profileStatus";

/**
 * Handles the OAuth redirect from Google.
 * Supabase detects the #access_token hash (detectSessionInUrl: true),
 * exchanges it, then fires INITIAL_SESSION / SIGNED_IN.
 * This page just waits for that event and navigates accordingly.
 */
const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);

    useEffect(() => {
        let done = false;

        // If opened on a mobile device in an external browser, bounce into the app
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const deepLinkUrl = `com.blacklovelink.app://auth/callback${window.location.search}${window.location.hash}`;
        if (isMobile && !window.location.origin.includes("localhost")) {
            try {
                window.location.href = deepLinkUrl;
            } catch (e) {
                console.warn("Could not bounce to native app:", e);
            }
        }

        const finish = async (session: any) => {
            if (done) return;
            done = true;

            // If on mobile browser, also bounce tokens into app via deep link hash
            if (isMobile && session?.access_token && session?.refresh_token && !window.location.origin.includes("localhost")) {
                try {
                    window.location.href = `com.blacklovelink.app://auth/callback#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
                } catch (e) {
                    console.warn("Could not bounce token deep link:", e);
                }
            }

            try {
                const status = await getProfileStatus(session.user.id);
                navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you", { replace: true });
            } catch {
                navigate("/auth?step=onboard-you", { replace: true });
            }
        };

        // Primary: listen for the session event fired after token exchange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session?.user) {
                if (session.access_token && session.refresh_token) {
                    setTokens({ access: session.access_token, refresh: session.refresh_token });
                }
                finish(session);
            } else if (event === "INITIAL_SESSION" && !session) {
                // Token exchange failed or no session — send back to auth
                if (!done) {
                    done = true;
                    setError("Sign-in was cancelled or failed. Please try again.");
                }
            }
        });

        // Fallback: if session is already in storage (e.g. back-button scenario)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                if (session.access_token && session.refresh_token) {
                    setTokens({ access: session.access_token, refresh: session.refresh_token });
                }
                finish(session);
            }
        });

        // Safety timeout — if nothing happens in 8s, send back to auth
        const timeout = setTimeout(() => {
            if (!done) {
                done = true;
                setError("Sign-in timed out. Please try again.");
            }
        }, 8000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
            {error ? (
                <>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={() => navigate("/auth", { replace: true })}
                        className="px-6 py-3 rounded-xl gradient-brand text-primary-foreground font-semibold text-sm shadow-button hover:opacity-90 transition"
                    >
                        Back to Sign In
                    </button>
                </>
            ) : (
                <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-brand shadow-glow animate-pulse">
                        <Heart className="w-8 h-8 text-primary-foreground" fill="currentColor" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">Signing you in…</p>
                        <p className="text-sm text-muted-foreground">Almost there, please wait.</p>
                    </div>
                    <div className="h-1 w-48 bg-muted rounded-full overflow-hidden">
                        <div className="h-full gradient-brand rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
                    </div>
                    {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.location.origin.includes("localhost") && (
                        <a
                            href={tokens ? `com.blacklovelink.app://auth/callback#access_token=${encodeURIComponent(tokens.access)}&refresh_token=${encodeURIComponent(tokens.refresh)}` : `com.blacklovelink.app://auth/callback${window.location.search}${window.location.hash}`}
                            className="mt-3 px-5 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition"
                        >
                            Open in BlackLoveLink App
                        </a>
                    )}
                </>
            )}
        </div>
    );
};

export default AuthCallbackPage;

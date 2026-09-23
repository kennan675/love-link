import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";

async function getProfileStatus(userId: string): Promise<"complete" | "incomplete"> {
    const { data } = await supabase
        .from("profiles")
        .select("profile_completed")
        .eq("user_id", userId)
        .maybeSingle();
    return data?.profile_completed ? "complete" : "incomplete";
}

/**
 * Handles the OAuth redirect from Google.
 * Supabase detects the #access_token hash (detectSessionInUrl: true),
 * exchanges it, then fires INITIAL_SESSION / SIGNED_IN.
 * This page just waits for that event and navigates accordingly.
 */
const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let done = false;

        const finish = async (userId: string) => {
            if (done) return;
            done = true;
            try {
                const status = await getProfileStatus(userId);
                navigate(status === "complete" ? "/swipe" : "/auth?step=onboard-you", { replace: true });
            } catch {
                navigate("/auth?step=onboard-you", { replace: true });
            }
        };

        // Primary: listen for the session event fired after token exchange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session?.user) {
                finish(session.user.id);
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
            if (session?.user) finish(session.user.id);
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
                </>
            )}
        </div>
    );
};

export default AuthCallbackPage;

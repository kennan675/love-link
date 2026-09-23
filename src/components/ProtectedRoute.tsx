import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, LogOut } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Shows a loading spinner while session resolves, verifies account is not suspended,
 * and redirects to /auth if no session is found.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading, signOut } = useAuth();
    const [isSuspended, setIsSuspended] = useState(false);
    const [suspensionReason, setSuspensionReason] = useState<string | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        let mounted = true;
        if (!user) {
            setCheckingStatus(false);
            return;
        }

        async function checkStatus() {
            try {
                const { data } = await supabase
                    .from("profiles")
                    .select("deactivated_at, deletion_requested, leave_reason")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (!mounted) return;

                if (data?.deactivated_at && !data?.deletion_requested) {
                    setIsSuspended(true);
                    setSuspensionReason(
                        data.leave_reason || "Violation of community standards or suspended by an administrator."
                    );
                } else {
                    setIsSuspended(false);
                }
            } catch (err) {
                console.warn("Could not check account status:", err);
            } finally {
                if (mounted) setCheckingStatus(false);
            }
        }

        checkStatus();

        return () => {
            mounted = false;
        };
    }, [user]);

    // While session or profile status is resolving, show a spinner
    if (loading || (user && checkingStatus)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth?mode=signin" replace />;
    }

    if (isSuspended) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d0907] px-4 text-center">
                <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#16100c] p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#f5ebd9] mb-2">
                        Account Suspended
                    </h2>
                    <p className="text-sm text-[#b89f81] mb-6 leading-relaxed">
                        Your account has been suspended by an administrator and access to BlackLoveLink has been restricted.
                    </p>
                    {suspensionReason && (
                        <div className="rounded-xl border border-[#3d2c1e] bg-[#221811] p-4 text-left mb-6">
                            <p className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold mb-1">
                                Reason
                            </p>
                            <p className="text-sm text-[#e6d7c3]">{suspensionReason}</p>
                        </div>
                    )}
                    <p className="text-xs text-[#8c7456] mb-6">
                        If you believe this was done in error, please contact support at{" "}
                        <a href="mailto:techhubafrica24@gmail.com" className="text-[#d4af37] underline hover:text-[#f3e5ab]">
                            techhubafrica24@gmail.com
                        </a>.
                    </p>
                    <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full bg-[#3d2c1e] hover:bg-[#4d3826] text-[#f5ebd9] border border-[#d4af37]/30 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;

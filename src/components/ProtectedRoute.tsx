import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Shows a loading spinner while session resolves (up to ~2s grace window),
 * then redirects to /auth if no session is found.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    // While the session is being resolved (live fetch + optional refresh),
    // show a spinner rather than immediately redirecting. This prevents the
    // "flash to /auth" that happens when the app reopens and hasn't hydrated yet.
    if (loading) {
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

    return <>{children}</>;
};

export default ProtectedRoute;

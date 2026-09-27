import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/hooks/useAuth";
import { getProfileStatus } from "@/services/profileStatus";
import Index from "@/pages/Index";

/**
 * Entry route for root path ('/').
 * - In native mobile app (Capacitor):
 *   - If signed in with complete profile: opens directly to /swipe without asking (like Instagram)
 *   - If signed in without complete profile (new OAuth user): opens /auth?step=onboard-you
 *   - If not signed in: navigates to /auth (sign in / sign up)
 *   - Never displays the marketing homepage on mobile!
 * - In web browser:
 *   - Displays the public landing page (Index)
 */
export const AppEntryRoute = () => {
  const isNative = Capacitor.isNativePlatform();
  const { user, loading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<"checking" | "complete" | "incomplete">("checking");

  useEffect(() => {
    if (!isNative) return;
    if (!user) {
      setProfileStatus("checking");
      return;
    }

    let mounted = true;
    getProfileStatus(user.id).then((status) => {
      if (!mounted) return;
      setProfileStatus(status);
    });

    return () => {
      mounted = false;
    };
  }, [isNative, user]);

  // On standard web browsers, display the marketing landing page
  if (!isNative) {
    return <Index />;
  }

  // Inside native mobile app: wait for auth state and profile check to resolve
  if (loading || (user && profileStatus === "checking")) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // First-time or logged-out users: start directly at sign in / sign up
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Signed-in users: open directly into the app (like Instagram)
  if (profileStatus === "complete") {
    return <Navigate to="/swipe" replace />;
  }

  // Signed-in users who haven't completed their profile yet (e.g. brand new Google OAuth user)
  return <Navigate to="/auth?step=onboard-you" replace />;
};

export default AppEntryRoute;

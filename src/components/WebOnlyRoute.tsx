import React from "react";
import { Navigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/hooks/useAuth";

interface WebOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper for website-only pages (e.g. /education, /how-it-works, /success-stories, etc.).
 * In the native mobile app, these marketing subpages are not displayed.
 * Users are routed directly to the native app (/swipe if logged in, or /auth if not).
 * In web browsers, pages render normally.
 */
export const WebOnlyRoute = ({ children }: WebOnlyRouteProps) => {
  const isNative = Capacitor.isNativePlatform();
  const { user, loading } = useAuth();

  if (!isNative) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/swipe" replace />;
  }

  return <Navigate to="/auth" replace />;
};

export default WebOnlyRoute;

import React from "react";

interface WebOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Info subpages (How it works, Support, Contact, etc.) now render inside the
 * native app too, so users are never sent to an external browser for them.
 */
export const WebOnlyRoute = ({ children }: WebOnlyRouteProps) => <>{children}</>;

export default WebOnlyRoute;

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, useIsAuthenticated } from "@/store/auth.store";
import type { JSX } from "react";

export function AuthRedirect({ children }: { children: JSX.Element }) {
  const isAuthenticated = useIsAuthenticated();
  const initialized = useAuthStore((s) => s.initialized);
  const location = useLocation();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/home";
    return <Navigate to={from} replace />;
  }

  return children;
}

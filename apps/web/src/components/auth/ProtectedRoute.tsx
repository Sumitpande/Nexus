import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, useIsAuthenticated } from "@/store/auth.store";
import type { JSX } from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useIsAuthenticated();
  const { initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // remember where the user was trying to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

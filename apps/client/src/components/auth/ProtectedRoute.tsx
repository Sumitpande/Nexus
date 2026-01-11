import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@/store/auth.store";
import type { JSX } from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = useIsAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

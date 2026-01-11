import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { authResponseSchema } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/auth.store";

const AUTH_ROUTES = ["/login", "/signup"];

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accessToken, login, markInitialized } = useAuthStore();

  useEffect(() => {
    // ✅ If already authenticated, do NOTHING
    if (user && accessToken) {
      markInitialized();
      return;
    }

    // 🚫 Skip refresh on auth pages
    if (AUTH_ROUTES.includes(location.pathname)) {
      markInitialized();
      return;
    }

    async function restore() {
      try {
        const res = await api.post("/auth/refresh");
        const parsed = authResponseSchema.parse(res.data);
        login(parsed);
        navigate("/home");
      } catch {
        markInitialized();
      }
    }

    restore();
  }, [location.pathname]);

  return <>{children}</>;
}

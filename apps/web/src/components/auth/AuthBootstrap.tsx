import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { refreshSession } from "@/api/refresh.manager";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { user, accessToken, login, markInitialized, initialized } =
    useAuthStore();

  useEffect(() => {
    // Run bootstrap exactly once
    if (initialized) return;

    // If already authenticated (e.g. after login redirect)
    if (user && accessToken) {
      markInitialized();
      return;
    }

    (async () => {
      try {
        const { accessToken, user } = await refreshSession();
        login({ accessToken, user });
      } catch {
        // refresh failed → unauthenticated
      } finally {
        // ALWAYS unblock routing
        markInitialized();
      }
    })();
  }, []);

  return <>{children}</>;
}

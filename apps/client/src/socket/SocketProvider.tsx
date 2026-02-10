import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "./socket";
import { useAuthStore, useIsAuthenticated } from "@/store/auth.store";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { initialized } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // Wait for auth bootstrap
    if (!initialized) return;

    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, initialized]);

  return <>{children}</>;
}

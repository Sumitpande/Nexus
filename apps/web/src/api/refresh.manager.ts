import { api } from "@/api/axios";
import { authResponseSchema, type AuthResponse } from "@/schema/auth.schema";

let refreshPromise: Promise<AuthResponse> | null = null;

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh")
      .then((res) => authResponseSchema.parse(res.data))
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

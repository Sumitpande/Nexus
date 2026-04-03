import { api } from "./axios";
import { useAuthStore } from "@/store/auth.store";
import { refreshSession } from "@/api/refresh.manager";

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/signup") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const { accessToken, user } = await refreshSession()!;

        useAuthStore.getState().login({ accessToken, user });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  },
);

import { create } from "zustand";
import { type AuthResponse, type User, userSchema } from "@/schema/auth.schema";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;

  login: (payload: AuthResponse) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  markInitialized: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null, // ✅ memory only
  initialized: false,

  login: (payload) => {
    const parsedUser = userSchema.parse(payload.user);

    set({
      user: parsedUser,
      accessToken: payload.accessToken,
    });
  },

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  logout: () => {
    set({ user: null, accessToken: null });
  },
  markInitialized: () => {
    set({ initialized: true });
  },
}));

/** Derived selector (do NOT store boolean flags) */
export const useIsAuthenticated = () =>
  useAuthStore((s) => Boolean(s.accessToken && s.user));

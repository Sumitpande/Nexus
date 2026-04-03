import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem("nexus-theme") as Theme) || "dark",

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),

  setTheme: (theme) => set({ theme }),
}));

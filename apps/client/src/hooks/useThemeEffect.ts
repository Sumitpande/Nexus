import { useEffect } from "react";
import { useThemeStore } from "@/store/theme.store";

export function useThemeEffect() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    localStorage.setItem("nexus-theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);
}

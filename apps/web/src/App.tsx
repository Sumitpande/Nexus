import { Toaster } from "sonner";
import "./App.css";

import AppRoutes from "./routes";
import { useThemeEffect } from "./hooks/useThemeEffect";

function App() {
  useThemeEffect();
  return (
    <>
      <Toaster />
      <AppRoutes />
    </>
  );
}

export default App;

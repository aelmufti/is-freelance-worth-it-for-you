import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // En mode "debug", on garde React en dev pour avoir les messages
  // d'hydration complets (`npm run build -- --mode debug`).
  define: mode === "debug" ? { "process.env.NODE_ENV": '"development"' } : {},
}));

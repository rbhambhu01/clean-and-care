import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Repo name — GitHub Pages serves project sites from /<repo>/, so the
// production build needs that as its base path. Local dev stays at "/".
const REPO_NAME = "clean-and-care";

export default defineConfig(({ command }) => ({
  base: command === "build" ? `/${REPO_NAME}/` : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
}));

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// A throwaway dev app for exercising the real, built QuickadUI packages
// together in a real Tailwind v4 + Vite setup — not published, not part of
// the release pipeline. See README.md for what it's for and how to run it.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});

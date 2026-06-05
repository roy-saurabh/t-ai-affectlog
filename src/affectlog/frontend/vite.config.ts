import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Forward /api/* directly to FastAPI — routes include the /api prefix.
      "/api": { target: "http://localhost:8000" },
      // FastAPI's swagger UI fetches /openapi.json relative to the browser origin.
      "/openapi.json": { target: "http://localhost:8000" },
      // FastAPI OAuth2 redirect (used by swagger UI try-it auth flow)
      "/docs/oauth2-redirect": { target: "http://localhost:8000" },
      "/v1":     { target: "http://localhost:8000" },
      "/healthz": { target: "http://localhost:8000" },
    },
  },

  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-charts": ["recharts"],
        },
      },
    },
  },

  preview: {
    port: 4173,
    host: true,
  },
});

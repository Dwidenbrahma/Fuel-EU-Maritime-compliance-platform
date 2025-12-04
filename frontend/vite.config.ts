import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // forward API calls during development to backend running on port 4000
      "/routes": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/compliance": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/banking": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/pooling": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "/pools": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    // proxy: {
    //   "/routes": {
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/compliance": {
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/banking": {
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/pooling": {
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/compare": {
    //     target: "http://localhost:4000",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});

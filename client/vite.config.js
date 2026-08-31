import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VERCEL ? "/" : "/eduflow/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, _res) => {
            // Suppress proxy connection error logs during backend restarts
          });
        },
      },
      "/socket.io": {
        target: "http://127.0.0.1:5000",
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, _res) => {
            // Suppress websocket connection reset logs during backend restarts
          });
        },
      },
    },
  },
});

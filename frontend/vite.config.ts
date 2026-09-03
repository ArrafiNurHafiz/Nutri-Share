import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// Backend port — keep in sync with nutrishare.sh (BACKEND_PORT=3000).
// Readable via VITE_API_PORT so the shell script and Vite never drift.
const API_TARGET = `http://localhost:${process.env.VITE_API_PORT || 3000}`;

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
      fs: {
        allow: [".."],
      },
      proxy: {
        "/api": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/uploads": {
          target: API_TARGET,
          changeOrigin: true,
        },
      },
    },
  };
});

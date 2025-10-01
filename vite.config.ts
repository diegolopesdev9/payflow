
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // aceita hosts dinâmicos do replit
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // aliases usados no projeto
  resolve: {
    alias: {
      "@": "/src",
      "@lib": "/src/lib",
      "@components": "/src/components",
      "@pages": "/src/pages",
    },
  },
});

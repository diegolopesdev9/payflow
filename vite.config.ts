
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ⚠️ Não altere mais nada fora deste bloco `server`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,           // escuta em 0.0.0.0 (necessário no Replit)
    port: 5173,
    strictPort: true,
    // Permite os hosts do preview do Replit
    allowedHosts: [
      ".replit.dev",
      ".spock.replit.dev"
    ],
    // HMR via WSS para funcionar atrás do proxy do Replit
    hmr: {
      protocol: "wss",
      clientPort: 443,
      overlay: true,      // se quiser, pode trocar para false se o overlay ficar "preso"
    },
    // Garante que as chamadas a /api cheguem no servidor (8080)
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  // (Opcional) se você estiver usando `vite preview` em algum momento
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
  },
});

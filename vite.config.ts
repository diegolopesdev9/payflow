
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,          // expõe para o preview do Replit
    port: 5173,
    strictPort: true,
    allowedHosts: true,  // aceita host dinâmico do preview
    hmr: { clientPort: 443 }, // evita loop de reconexão no iframed preview
    proxy: {
      "/api": "http://localhost:8080"
    }
  }
});

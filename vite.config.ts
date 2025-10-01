
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
    
    // Desliga HMR e o overlay no Preview do Replit (instável com WS)
    hmr: false,
    // Evita overlay de erro tomar a tela
    hmrOverlay: false as unknown as undefined, // (para Vite <6 ignore, para Vite 5 o 'overlay' fica dentro de hmr, mas aqui estamos forçando off)
    // Garante polling de arquivos (FS do Replit às vezes perde eventos)
    watch: { usePolling: true },
    // Evita bloqueio de host com o domínio dinâmico do Preview do Replit
    allowedHosts: true,
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

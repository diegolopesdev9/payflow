
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

const isReplit = !!process.env.REPL_SLUG && !!process.env.REPL_OWNER;
const replitHost = isReplit
  ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : "localhost";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true, // aceita *.replit.dev / *.repl.co
    origin: isReplit ? `https://${replitHost}` : undefined,
    hmr: isReplit
      ? {
          protocol: "wss",
          host: replitHost,
          clientPort: 443,
        }
      : undefined,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (p) => p,
      },
    },
  },
});

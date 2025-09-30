
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
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false
      }
    }
  },
});

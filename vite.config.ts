
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,            // escuta em 0.0.0.0 (necessário no Replit)
    port: 5173,
    strictPort: true,
    // ✅ libera o domínio do Replit (e quaisquer *.replit.dev)
    allowedHosts: [/.+\.replit\.dev$/],
    // HMR via 443 no preview do Replit
    hmr: { clientPort: 443 },
    // proxy do front para a API local (8080)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

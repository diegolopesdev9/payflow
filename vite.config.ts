
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      // Replit usa HTTPS; o HMR precisa saber a porta do cliente do iframe
      clientPort: 443
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        ws: false
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

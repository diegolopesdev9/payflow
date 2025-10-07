
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  optimizeDeps: {
    // Excluir Prisma do bundle frontend
    exclude: ['@prisma/client', '.prisma/client']
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', '.prisma/client']
    }
  },
  server: {
    host: true,            // escuta em 0.0.0.0 (necessário no Replit)
    port: 5173,
    strictPort: true,
    // ✅ libera o domínio do Replit (e quaisquer *.replit.dev)
    allowedHosts: [
      /.+\.replit\.dev$/,
      /\.spock\.replit\.dev$/
    ],
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

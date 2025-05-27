import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true, // 👈 ОБЯЗАТЕЛЬНО для WebSocket!
        changeOrigin: true
      }
    }
  },
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      // Add any other aliases if needed
    }
  }
})

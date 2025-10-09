import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://talk-wire.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'https://talk-wire.up.railway.app',
        ws: true,
        changeOrigin: true
      }
    }
  },
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
    }
  }
})

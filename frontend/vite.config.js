import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API requests during development to the backend server
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // forward auth and API calls to backend running on 3001
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/ho-so': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/hoso': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/dashboard': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

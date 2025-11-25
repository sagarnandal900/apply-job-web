import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 8081, // Use port 8081 for network access
    proxy: {
      '/api': {
        target: 'http://localhost:57514', // Point to current backend port
        changeOrigin: true,
        secure: false
      }
    }
  }
})

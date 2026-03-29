import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  
    server: {
    proxy: {
      "/api": {
        target: "https://bodyplan-api.giize.com",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: "https://bodyplan-api.giize.com",
        changeOrigin: true,
        secure: false
      }
    }
  }
})

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
        target: "http://bodyplan-api.giize.com:3000",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: "http://bodyplan-api.giize.com:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
})

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // 0.0.0.0 — Docker container dışından erişim için
    port: 5173,
    watch: {
      usePolling: true, // Docker + Windows'ta dosya değişikliklerini yakalamak için
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Intranet/', //BASE PARA IMPLEMENTACION WEB
  server: {
    host: true, // Esto permite que se escuche en la red local
    port: 5173,  // El puerto por defecto
    historyApiFallback: true,
  }
})

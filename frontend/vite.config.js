import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Intranet/', // BASE PARA IMPLEMENTACION WEB
  server: {
    host: true, 
    port: 5173, 
    // Ajuste aquí: especificamos que el index está dentro de /Intranet/
    historyApiFallback: {
      index: '/Intranet/index.html'
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
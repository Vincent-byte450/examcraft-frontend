import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    chunkSizeWarningLimit: 1000, // optional: silence warning if needed

    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router'],
          ui: ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})

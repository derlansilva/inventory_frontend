import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Compila para navegadores modernos (mais rápido)
    minify: 'esbuild', // Usa o minificador ultra-rápido do Vite
  }
})
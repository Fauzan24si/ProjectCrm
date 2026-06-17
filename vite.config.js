import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Target server AI (OpenAI-compatible). Diambil dari .env.
  // Contoh: http://79.137.75.106:20128
  const aiTarget = env.VITE_AI_PROXY_TARGET || 'http://79.137.75.106:20128'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        // Request dari browser ke /ai-api/* diteruskan ke server AI.
        // Karena same-origin, browser tidak melakukan CORS preflight.
        '/ai-api': {
          target: aiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/ai-api/, ''),
        },
      },
    },
  }
})

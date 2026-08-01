import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // Everything under /api is forwarded to the FastAPI backend,
        // with the /api prefix stripped off.
        '/api': {
          target: backend,
          changeOrigin: true,
          // SSE must not be buffered by the proxy
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Accept-Encoding', 'identity')
            })
          },
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig((config) => {

  const env = loadEnv(config.mode, process.cwd())

  return {
    plugins: [
      vue(),
      svgLoader()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      host: '192.168.1.71',
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_APP_API_URL,
          ws: true,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        },
      }
    },
    esbuild:{
     // drop: ['console', 'debugger']
    },
    envPrefix: 'VITE_'
  }
})
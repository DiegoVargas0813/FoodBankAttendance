import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default ({ mode }: ConfigEnv) => {
  // load env variables for current mode (mode: 'development' | 'production' etc.)
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY || 'http://localhost:3000';

  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        injectRegister: 'auto',
        srcDir: 'src/serviceworkers',
        filename: 'sw.js',
        registerType: 'autoUpdate',
        manifest: {
          name: 'Banco de Alimentos',
          short_name: 'BAMX',
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#35875b',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    }
  })
}
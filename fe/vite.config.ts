import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
  const plugins: any[] = [vue()]
  // only try to load the devtools plugin when running the dev server
  if (command === 'serve') {
    try {
      const mod = await import('vite-plugin-vue-devtools')
      const devtools = mod && (mod.default || mod)
      if (typeof devtools === 'function') {
        plugins.push(devtools())
        // helpful log so dev can see plugin loaded
        console.log('vite-plugin-vue-devtools: enabled')
      }
    } catch (e) {
      // plugin not installed — do not fail the dev server, just warn
      console.warn('vite-plugin-vue-devtools not installed — skipping (run `npm i --save-dev vite-plugin-vue-devtools` to enable)')
    }
  }

  return {
    plugins,
    server: {
      port: 5173,
      proxy: {
        // proxy /api requests to backend running on localhost:3000
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
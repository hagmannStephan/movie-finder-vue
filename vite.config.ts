import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // server: {
  //   host: true,
  //   watch: {
  //     usePolling: true,
  //     interval: 100
  // },
  // },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.moviefinder.stephanhagmann.ch',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});

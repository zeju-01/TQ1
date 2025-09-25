import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.', // 明确指定根目录为当前目录
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
  server: {
    port: 5174,
    host: true,
    strictPort: false, // 不严格使用指定端口，如果端口被占用则使用其他可用端口
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // 指向后端服务的3001端口
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons'],
          utils: ['axios', 'dayjs'],
        },
      },
    },
  },
})
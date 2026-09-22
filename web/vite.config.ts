import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 开发期代理到 NestJS（约定后端端口 3000）。
// 后端不设全局前缀，业务路由直接挂在根路径上，因此这里逐个列出模块前缀；
// 新增模块时需同步补充此列表（生产环境由 nginx 承担同样的转发职责）。
const API_PREFIXES = [
  '/auth',
  '/users',
  '/roles',
  '/permissions',
  '/menus',
  '/audit-logs',
  '/login-logs',
  '/files',
  '/sse',
  // 探针：/health 由 M1 提供，/ready 由 M13 提供
  '/health',
  '/ready',
]

const apiProxy = Object.fromEntries(
  API_PREFIXES.map((prefix) => [
    prefix,
    { target: 'http://localhost:3000', changeOrigin: true },
  ]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: apiProxy,
  },
})

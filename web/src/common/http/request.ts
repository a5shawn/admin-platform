import axios, { type AxiosInstance } from 'axios'

/**
 * 统一 axios 实例。
 *
 * - 开发期走 Vite 代理（见 vite.config.ts 的 server.proxy），因此 baseURL 默认为空；
 *   如需直连后端，设置 VITE_API_BASE_URL=http://localhost:3000。
 * - 请求拦截器注入 Token（M6 接入登录后启用）。
 * - 响应拦截器统一处理 401（M6 起跳转登录页）。
 *
 * 来源：admin-platform/web/src/common/http（2026-09）
 */
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  // TODO(M6)：从登录态 store 读取 Token 并注入 Authorization
  return config
})

request.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // TODO(M6)：401 时清理登录态并跳转登录页
    return Promise.reject(error)
  },
)

export default request

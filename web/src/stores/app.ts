import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 应用级状态。登录态与权限信息在 M6 / M8 加入。
 */
export const useAppStore = defineStore('app', () => {
  const title = ref('admin-platform')
  /** 后端 /health 探针结果：null=未探测，true=正常，false=异常 */
  const apiHealthy = ref<boolean | null>(null)

  function setApiHealthy(value: boolean) {
    apiHealthy.value = value
  }

  return { title, apiHealthy, setApiHealthy }
})

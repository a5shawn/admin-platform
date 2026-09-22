import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '../app'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为未探测后端', () => {
    const store = useAppStore()
    expect(store.title).toBe('admin-platform')
    expect(store.apiHealthy).toBeNull()
  })

  it('setApiHealthy 可更新探针结果', () => {
    const store = useAppStore()
    store.setApiHealthy(true)
    expect(store.apiHealthy).toBe(true)

    store.setApiHealthy(false)
    expect(store.apiHealthy).toBe(false)
  })
})

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import request from '@/common/http/request'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const loading = ref(false)
const errorMessage = ref('')

/** 通过 Vite 代理探测后端 /health，验证前后端链路已打通 */
async function probeHealth() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await request.get<{ status: string }>('/health')
    appStore.setApiHealthy(data.status === 'ok')
  } catch (error) {
    appStore.setApiHealthy(false)
    errorMessage.value = error instanceof Error ? error.message : '请求失败'
  } finally {
    loading.value = false
  }
}

onMounted(probeHealth)
</script>

<template>
  <el-row :gutter="16">
    <el-col :span="12">
      <el-card shadow="never" header="后端连通性">
        <el-space direction="vertical" alignment="flex-start" :size="12">
          <div>
            <span class="label">GET /health：</span>
            <el-tag v-if="appStore.apiHealthy === true" type="success">正常</el-tag>
            <el-tag v-else-if="appStore.apiHealthy === false" type="danger">异常</el-tag>
            <el-tag v-else type="info">未探测</el-tag>
          </div>
          <el-text v-if="errorMessage" type="danger" size="small">{{ errorMessage }}</el-text>
          <el-button :loading="loading" size="small" @click="probeHealth">重新探测</el-button>
          <el-text type="info" size="small">
            请求经 Vite 代理（vite.config.ts 的 server.proxy）转发到 http://localhost:3000
          </el-text>
        </el-space>
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card shadow="never" header="技术栈">
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="前端"
            >Vue 3.5 + Vite 7 + Pinia 3 + Vue Router 4</el-descriptions-item
          >
          <el-descriptions-item label="UI">Element Plus 2.14</el-descriptions-item>
          <el-descriptions-item label="后端">NestJS 11（CommonJS）+ Prisma 7</el-descriptions-item>
          <el-descriptions-item label="依赖服务"
            >PostgreSQL 16 (pgvector) + Redis 7</el-descriptions-item
          >
        </el-descriptions>
      </el-card>
    </el-col>

    <el-col :span="24">
      <el-card shadow="never" header="下一步" class="next-card">
        <el-text>
          M1 只做工程骨架；M2 起实现用户 CRUD（内存版）→ 请求生命周期与校验 → Prisma 落库 →
          统一响应与异常体系。
        </el-text>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.label {
  color: #606266;
  margin-right: 4px;
}

.next-card {
  margin-top: 16px;
}
</style>

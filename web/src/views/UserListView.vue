<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

import { listUsers, removeUser, updateUserStatus } from '@/common/api/user'
import { UserStatus } from '@/common/types/user'
import type { User } from '@/common/types/user'

const users = ref<User[]>([])
const keyword = ref('')
const loading = ref(false)

function formatTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

function reportError(error: unknown, fallback: string): void {
  ElMessage.error(error instanceof Error ? error.message : fallback)
}

async function load(): Promise<void> {
  loading.value = true
  try {
    users.value = await listUsers(keyword.value.trim() || undefined)
  } catch (error) {
    reportError(error, '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

async function toggleStatus(user: User): Promise<void> {
  const next = user.status === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE
  try {
    await updateUserStatus(user.id, next)
    ElMessage.success(next === UserStatus.ACTIVE ? '已启用' : '已禁用')
    await load()
  } catch (error) {
    reportError(error, '更新状态失败')
  }
}

async function remove(user: User): Promise<void> {
  try {
    await removeUser(user.id)
    ElMessage.success(`已删除 ${user.username}`)
    await load()
  } catch (error) {
    reportError(error, '删除失败')
  }
}

function resetAndLoad(): void {
  keyword.value = ''
  void load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="toolbar">
        <el-input
          v-model="keyword"
          class="toolbar__search"
          placeholder="按用户名 / 邮箱 / 昵称搜索"
          clearable
          @keyup.enter="load"
          @clear="load"
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="resetAndLoad">重置</el-button>
        <el-text type="info" size="small">
          数据在内存中，重启后端即清空（M4 接 Prisma 后落库）
        </el-text>
      </div>
    </template>

    <el-table v-loading="loading" :data="users" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === UserStatus.ACTIVE ? 'success' : 'info'">
            {{ row.status === UserStatus.ACTIVE ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="toggleStatus(row)">
            {{ row.status === UserStatus.ACTIVE ? '禁用' : '启用' }}
          </el-button>
          <el-popconfirm title="确定删除该用户？" @confirm="remove(row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar__search {
  width: 280px;
}
</style>

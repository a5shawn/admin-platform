<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Odometer } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

/**
 * 中后台默认布局：左侧菜单 + 顶部栏 + 内容区。
 * M8 会把手写菜单替换为按角色从后端拉取的动态菜单。
 */
const appStore = useAppStore()
const route = useRoute()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => (route.meta.title as string | undefined) ?? '')
</script>

<template>
  <el-container class="layout">
    <el-aside width="210px" class="layout__aside">
      <div class="layout__logo">{{ appStore.title }}</div>
      <el-menu :default-active="activeMenu" router class="layout__menu">
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>概览</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout__header">
        <span class="layout__title">{{ pageTitle }}</span>
        <el-tag size="small" type="info">M1 工程骨架</el-tag>
      </el-header>

      <el-main class="layout__main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
}

.layout__aside {
  background-color: #001529;
}

.layout__logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.layout__menu {
  border-right: none;
  background-color: transparent;
}

.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.layout__title {
  font-size: 16px;
  font-weight: 600;
}

.layout__main {
  padding: 16px;
}
</style>

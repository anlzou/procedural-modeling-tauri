<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <!-- 左侧工具栏：竖向对齐 -->
    <div class="left-toolbar" v-if="route.path !== '/'">
      <button class="icon-btn" @click="router.push('/')" title="返回首页">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
    </div>
    <router-view />
  </div>
</template>

<style>
/* 全局样式：移除所有按钮点击时的 outline 方框 */
button:focus-visible {
  outline: none !important;
}
button {
  -webkit-tap-highlight-color: transparent;
}
</style>

<style scoped>
.app-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.left-toolbar {
  position: fixed;
  top: 0.8rem;
  left: 0.5rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.left-toolbar .icon-btn {
  pointer-events: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.left-toolbar .icon-btn:hover {
  background: rgba(80, 80, 160, 0.5);
  color: #fff;
  transform: scale(1.08);
}
</style>
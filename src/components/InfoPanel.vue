<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const collapsed = ref(true)
const pinned = ref(false)
const panelRef = ref(null)

function onClickOutside(e) {
  if (!collapsed.value && !pinned.value && panelRef.value && !panelRef.value.contains(e.target)) {
    collapsed.value = true
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div class="info-panel-wrapper" :class="{ collapsed }">
    <!-- 折叠状态：? 图标按钮 -->
    <button v-if="collapsed" class="circle-btn" @click="collapsed = false" title="展开信息">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    </button>

    <!-- 展开状态（无关闭按钮，点击外部关闭） -->
    <template v-else>
      <div ref="panelRef" class="info-panel">
        <button class="pin-btn" :class="{ active: pinned }" @click="pinned = !pinned" :title="pinned ? '取消置顶' : '置顶面板'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="6" r="2.5"/>
            <line x1="12" y1="8.5" x2="12" y2="15"/>
            <path d="M9 14l3 5 3-5"/>
          </svg>
        </button>
        <div class="info-panel-body">
          <div class="info-panel-body-fixed">
            <slot name="header" />
          </div>
          <div class="info-panel-body-scroll">
            <slot />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.info-panel-wrapper {
  position: absolute;
  top: 4.2rem;
  left: 0.5rem;
  z-index: 10;
  max-width: 400px;
}

.circle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, calc(var(--panel-alpha, 0.65) + 0.1));
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.circle-btn:hover {
  background: rgba(80, 80, 160, 0.5);
  color: #fff;
  transform: scale(1.08);
}

.info-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 55vh;
  background: rgba(0, 0, 0, var(--panel-alpha, 0.65));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  color: #e0e0e0;
  animation: panelIn 0.3s ease;
}

.info-panel-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.info-panel-body-fixed {
  flex-shrink: 0;
}
.info-panel-body-scroll {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  margin-top: 0.5rem;
  padding-right: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
.info-panel-body-scroll::-webkit-scrollbar {
  width: 4px;
}
.info-panel-body-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.info-panel-body-scroll::before,
.info-panel-body-scroll::after {
  content: '';
  display: block;
  height: 0.25rem;
  flex-shrink: 0;
}

.info-panel .pin-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.info-panel .pin-btn:hover {
  color: rgba(255, 255, 255, 0.6);
}

.info-panel .pin-btn.active {
  color: #22d3ee;
}

.info-panel .pin-btn.active:hover {
  color: #67e8f9;
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .info-panel-wrapper {
    left: 0.5rem;
    right: 0.5rem;
    max-width: none;
  }
}
</style>

<style>
.info-panel-body h2 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
}
.info-panel-body p {
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 0.75rem;
  color: #d0d0e0;
}
.info-panel-body .features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}
.info-panel-body .features span {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #b0b0c0;
}
.info-panel-body .controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0;
}
.info-panel-body .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #c0c0d0;
  cursor: pointer;
  transition: all 0.2s;
}
.info-panel-body .btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.info-panel-body .btn.active {
  background: rgba(100, 100, 255, 0.25);
  border-color: rgba(100, 100, 255, 0.4);
  color: #fff;
}
.info-panel-body .hint {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.25);
  margin-top: 0;
}
</style>

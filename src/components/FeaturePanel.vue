<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  /** 是否为当前模型启用功能面板 */
  enabled: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const expanded = ref(false)
const panelRef = ref(null)

function toggle() {
  expanded.value = !expanded.value
  emit('toggle', expanded.value)
}

function onClickOutside(e) {
  if (expanded.value && panelRef.value && !panelRef.value.contains(e.target)) {
    expanded.value = false
    emit('toggle', false)
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div v-if="enabled" class="feature-panel-wrapper" :class="{ expanded }">
    <!-- 折叠态：居中图标按钮 -->
    <Transition name="pop-btn">
      <button v-show="!expanded" class="fp-toggle" @click="toggle" :title="'展开' + title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
    </Transition>

    <!-- 展开态：面板 -->
    <Transition name="pop-panel">
      <div v-show="expanded" ref="panelRef" class="feature-panel">
        <div class="fp-header">
          <span class="fp-title">{{ title || '功能面板' }}</span>
          <button class="fp-close" @click="toggle" title="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="fp-body">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.feature-panel-wrapper {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.fp-toggle {
  position: absolute;
  bottom: 0;
  pointer-events: auto;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(10, 10, 20, var(--panel-alpha, 0.6));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
}
.fp-toggle:hover {
  background: rgba(80, 80, 160, 0.5);
  color: #fff;
  transform: scale(1.08);
}

.feature-panel {
  pointer-events: auto;
  min-width: 320px;
  max-width: 90vw;
  background: rgba(10, 10, 20, var(--panel-alpha, 0.6));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #d0d0e0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  overflow: visible;
  transform-origin: bottom center;
  position: absolute;
  bottom: 0;
}

.fp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.fp-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f0f0ff;
}
.fp-close {
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
  flex-shrink: 0;
}
.fp-close:hover { color: rgba(255, 255, 255, 0.6); }

/* 按钮缩放淡出 */
.pop-btn-leave-active {
  transition: all 0.25s ease;
}
.pop-btn-enter-active {
  transition: all 0.25s ease;
}
.pop-btn-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
.pop-btn-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

/* 面板缩放弹出 */
.pop-panel-enter-active {
  animation: popIn 0.4s ease;
}
.pop-panel-leave-active {
  animation: popOut 0.3s ease;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70% {
    opacity: 1;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes popOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}

.fp-body {
  padding: 0.8rem 1.2rem;
  max-height: 40vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.fp-body::-webkit-scrollbar { width: 4px; }
.fp-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* 面板弹入动画 */
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  element: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const panelRef = ref(null)

function onClickOutside(e) {
  if (panelRef.value && !panelRef.value.contains(e.target)) {
    emit('close')
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="detail-fade">
      <div v-if="element" class="detail-overlay">
        <div ref="panelRef" class="detail-panel">
          <button class="detail-close" @click="emit('close')" title="关闭">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- 头部：原子序数 + 符号 + 名称 -->
          <div class="detail-head">
            <div class="detail-number">#{{ element.number }}</div>
            <div class="detail-symbol">{{ element.symbol }}</div>
            <div class="detail-names">
              <div class="detail-cname">{{ element.chineseName }}</div>
              <div class="detail-enname">{{ element.name }}</div>
            </div>
            <div class="detail-mass">{{ element.mass }}</div>
          </div>

          <!-- 详情网格 -->
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">分类</span>
              <span class="detail-value">{{ element.category }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">电子排布</span>
              <span class="detail-value mono">{{ element.electronConfig }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">熔点</span>
              <span class="detail-value">{{ element.meltPoint }} °C</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">沸点</span>
              <span class="detail-value">{{ element.boilPoint }} °C</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">发现年份</span>
              <span class="detail-value">{{ element.discovered }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">周期·族</span>
              <span class="detail-value">{{ element.row }} · {{ element.column }}</span>
            </div>
          </div>

          <!-- 描述 -->
          <div class="detail-desc">{{ element.description }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.detail-panel {
  position: relative;
  width: 380px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  background: rgba(10, 10, 20, var(--panel-alpha, 0.6));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.5rem;
  color: #d0d0e0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.detail-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: none;
  outline: none;
}
.detail-close:hover { color: #fff; background: transparent; }

.detail-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.detail-number {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
  align-self: flex-start;
  margin-top: 4px;
}
.detail-symbol {
  font-size: 3rem;
  font-weight: 700;
  color: #22d3ee;
  text-shadow: 0 0 16px rgba(34, 211, 238, 0.4);
  line-height: 1;
}
.detail-names {
  flex: 1;
}
.detail-cname {
  font-size: 1.3rem;
  font-weight: 600;
  color: #f0f0ff;
}
.detail-enname {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}
.detail-mass {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  font-variant-numeric: tabular-nums;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.detail-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
}
.detail-label {
  display: block;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.detail-value {
  font-size: 0.85rem;
  color: #d0d0e0;
  font-weight: 600;
}
.detail-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.detail-desc {
  font-size: 0.82rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

/* 过渡动画 */
.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: all 0.25s ease;
}
.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
}
.detail-fade-enter-from .detail-panel,
.detail-fade-leave-to .detail-panel {
  transform: scale(0.9);
}
</style>

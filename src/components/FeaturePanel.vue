<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const expanded = ref(false)
const pinned = ref(false)
const panelRef = ref(null)

const props = defineProps({
  title: { type: String, default: '⚙ 面板' },
  features: { type: Array, default: null },
  showMonitor: { type: Boolean, default: true },
  fps: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  objectCount: { type: Number, default: 0 },
})

const dotColors = ['#22d3ee', '#a78bfa', '#34d399', '#f59e0b', '#ef4444']

function onClickOutside(e) {
  if (expanded.value && !pinned.value && panelRef.value && !panelRef.value.contains(e.target)) {
    expanded.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div class="feature-panel-wrapper" :class="{ expanded }">
    <!-- 展开按钮 -->
    <button v-show="!expanded" class="fp-toggle" @click="expanded = true" title="展开面板">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    </button>

    <Transition name="fp-slide">
      <div v-show="expanded" ref="panelRef" class="feature-panel">
        <!-- 头部 -->
        <div class="fp-header">
          <h3>{{ title }}</h3>
          <button class="fp-pin" :class="{ active: pinned }" @click="pinned = !pinned" :title="pinned ? '取消置顶' : '置顶面板'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="6" r="2.5"/><line x1="12" y1="8.5" x2="12" y2="15"/><path d="M9 14l3 5 3-5"/>
            </svg>
          </button>
        </div>

        <!-- 性能监控 -->
        <div v-if="showMonitor" class="fp-section">
          <div class="fp-section-title">📊 性能监控</div>
          <div class="fp-monitor">
            <div class="fp-monitor-item"><span class="fp-label">FPS</span><span class="fp-value fps">{{ fps }}</span></div>
            <div class="fp-monitor-item"><span class="fp-label">内存</span><span class="fp-value memory">{{ (memory / 1024 / 1024).toFixed(1) }} MB</span></div>
            <div class="fp-monitor-item"><span class="fp-label">对象</span><span class="fp-value count">{{ objectCount }}</span></div>
          </div>
        </div>

        <!-- 功能特性 -->
        <div v-if="features && features.length" class="fp-section">
          <div class="fp-section-title">✨ 功能特性</div>
          <div class="fp-features">
            <div v-for="(f, i) in features" :key="i" class="fp-feature">
              <span class="fp-dot" :style="{ background: dotColors[i % dotColors.length] }"></span>
              <span>{{ f }}</span>
            </div>
          </div>
        </div>

        <!-- 插槽 -->
        <div class="fp-section"><slot /></div>

        <!-- 透明度 -->
        <div class="fp-section fp-alpha-row">
          <span class="fp-alpha-label">🔍 透明度</span>
          <input type="range" min="0.05" max="0.95" step="0.05" :value="0.15"
            @input="document.documentElement.style.setProperty('--panel-alpha', $event.target.value)"
            class="fp-slider" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.feature-panel-wrapper {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.fp-toggle {
  pointer-events: auto;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  position: absolute;
  bottom: 0; right: 0;
}
.fp-toggle:hover {
  background: rgba(80,80,160,0.5);
  color: #fff;
  transform: scale(1.08);
}

.feature-panel {
  pointer-events: auto;
  width: 280px;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  background: rgba(10,10,20, var(--panel-alpha,0.6));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  color: #d0d0e0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  margin-bottom: 48px;
  overflow: hidden;
}

.fp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fp-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0f0ff;
}
.fp-pin {
  width: 26px; height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0;
}
.fp-pin:hover { color: rgba(255,255,255,0.6); }
.fp-pin.active { color: #22d3ee; }
.fp-pin.active:hover { color: #67e8f9; }

.fp-section {
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.fp-section:last-child { border-bottom: none; }
.fp-section-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.fp-monitor {
  display: flex;
  gap: 0.6rem;
}
.fp-monitor-item {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
}
.fp-label {
  display: block;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.35);
  margin-bottom: 2px;
}
.fp-value {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.fp-value.fps { color: #22d3ee; }
.fp-value.memory { color: #a78bfa; }
.fp-value.count { color: #34d399; }

.fp-features {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.fp-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}
.fp-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fp-alpha-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.fp-alpha-label {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}
.fp-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.15);
  outline: none;
  cursor: pointer;
}
.fp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: rgba(130,130,200,0.7);
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
}

.fp-slide-enter-active,
.fp-slide-leave-active { transition: all 0.3s ease; }
.fp-slide-enter-from,
.fp-slide-leave-to { opacity: 0; transform: translateY(-10px) scale(0.96); }

@media (max-width: 768px) {
  .feature-panel-wrapper { bottom: 0.5rem; right: 0.5rem; }
  .feature-panel { width: calc(100vw - 2rem); max-width: 320px; }
}
</style>

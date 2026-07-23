<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const expanded = ref(false)
const pinned = ref(false)
const panelRef = ref(null)
const alpha = ref(0.15)
const playing = ref(true)
const speed = ref(1)

const emit = defineEmits(['togglePlay', 'updateSpeed', 'updateLight', 'toggleGrowth', 'updateGrowthSpeed'])

// 光源控制
const lightVisible = ref([])
const lightIntensity = ref(1.0)

function setAlpha(val) {
  alpha.value = val
  document.documentElement.style.setProperty('--panel-alpha', val)
}

function togglePlay() {
  playing.value = !playing.value
  emit('togglePlay', playing.value)
}

function changeSpeed(val) {
  speed.value = val
  emit('updateSpeed', val)
}

function toggleLight(idx) {
  lightVisible.value[idx] = !lightVisible.value[idx]
  emit('updateLight', { index: idx, visible: lightVisible.value[idx], intensity: lightIntensity.value })
}

function changeLightIntensity(val) {
  lightIntensity.value = val
  emit('updateLight', { index: -1, visible: null, intensity: val })
}

// 生长控制
const growthSpeed = ref(8)

function toggleGrowth() {
  emit('toggleGrowth')
}

function changeGrowthSpeed(val) {
  growthSpeed.value = val
  emit('updateGrowthSpeed', val)
}

function onClickOutside(e) {
  if (expanded.value && !pinned.value && panelRef.value && !panelRef.value.contains(e.target)) {
    expanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.documentElement.style.setProperty('--panel-alpha', alpha.value)
})
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))

const props = defineProps({
  fps: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  objectCount: { type: Number, default: 0 },
  lightSources: { type: Array, default: null },
  growing: { type: Boolean, default: false },
  growthProgress: { type: Number, default: 0 },
  growthTotal: { type: Number, default: 0 },
})

// Initialize light visibility from prop
watch(() => props.lightSources, (val) => {
  if (val) lightVisible.value = val.map(() => true)
}, { immediate: true })
</script>

<template>
  <div class="control-panel-wrapper" :class="{ expanded }">
    <!-- 展开按钮（面板关闭时显示） -->
    <button v-show="!expanded" class="ctrl-toggle" @click="expanded = true" title="展开控制">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    </button>

    <!-- 面板（无关闭按钮，点击外部关闭） -->
    <Transition name="slide">
      <div v-show="expanded" ref="panelRef" class="control-panel">
        <div class="panel-header">
          <h3>⚙ 控制面板</h3>
          <button class="pin-btn" :class="{ active: pinned }" @click="pinned = !pinned" :title="pinned ? '取消置顶' : '置顶面板'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="6" r="2.5"/>
              <line x1="12" y1="8.5" x2="12" y2="15"/>
              <path d="M9 14l3 5 3-5"/>
            </svg>
          </button>
        </div>

        <!-- 性能监控（固定区域） -->
        <div class="section section-fixed">
          <div class="section-title">📊 性能监控</div>
          <div class="monitor-grid">
            <div class="monitor-item">
              <span class="label">FPS</span>
              <span class="value fps">{{ fps.toFixed(0) }}</span>
            </div>
            <div class="monitor-item">
              <span class="label">内存</span>
              <span class="value memory">{{ (memory / 1024 / 1024).toFixed(1) }} MB</span>
            </div>
            <div class="monitor-item">
              <span class="label">对象数</span>
              <span class="value count">{{ objectCount }}</span>
            </div>
          </div>
        </div>

        <!-- 可滚动区域 -->
        <div class="control-panel-scroll">
          <!-- 光源控制 -->
          <div v-if="lightSources" class="section">
            <div class="section-title">💡 光源控制</div>
            <div class="controls-row" style="margin-bottom:0.4rem;">
              <button
                v-for="(ls, i) in lightSources"
                :key="i"
                class="light-btn"
                :class="{ active: lightVisible[i] }"
                @click="toggleLight(i)"
              >{{ ls.name }}</button>
            </div>
            <div class="slider-row">
              <span class="slider-label">亮度</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                :value="lightIntensity"
                @input="changeLightIntensity(parseFloat($event.target.value))"
                class="alpha-slider"
              />
              <span class="slider-value">{{ lightIntensity.toFixed(1) }}x</span>
            </div>
          </div>

          <!-- 动画控制 -->
          <div class="section">
            <div class="section-title">🔄 动画控制</div>
            <div class="anim-row">
              <button class="play-btn" @click="togglePlay" :title="playing ? '暂停' : '播放'">
                <svg v-if="playing" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
              <div class="speed-row">
                <span class="slider-label">速度</span>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  :value="speed"
                  @input="changeSpeed(parseFloat($event.target.value))"
                  class="alpha-slider"
                />
                <span class="slider-value">{{ speed.toFixed(1) }}x</span>
              </div>
            </div>
          </div>

          <!-- 生长控制 -->
          <div v-if="growthTotal > 0" class="section">
            <div class="section-title">🌱 生长控制</div>
            <div class="anim-row">
              <button class="play-btn" @click="toggleGrowth" :title="growing ? '暂停生长' : '开始生长'">
                <svg v-if="growing" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
              <div class="speed-row">
                <span class="slider-label">速度</span>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  :value="growthSpeed"
                  @input="changeGrowthSpeed(parseFloat($event.target.value))"
                  class="alpha-slider"
                />
                <span class="slider-value">{{ growthSpeed.toFixed(0) }}</span>
              </div>
            </div>
            <div class="progress-bar-wrapper">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (growthTotal > 0 ? (growthProgress / growthTotal * 100) : 0) + '%' }"></div>
              </div>
              <span class="progress-label">{{ growthProgress }} / {{ growthTotal }}</span>
            </div>
          </div>

          <!-- 自定义插槽（用于 CSS3D 布局按钮等） -->
          <slot name="extra" />

          <!-- 面板透明度 -->
          <div class="section">
            <div class="section-title">🔍 面板透明度</div>
            <div class="slider-row">
              <span class="slider-label">半透明</span>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                :value="alpha"
                @input="setAlpha(parseFloat($event.target.value))"
                class="alpha-slider"
              />
              <span class="slider-label">实心</span>
              <span class="slider-value">{{ Math.round(alpha * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.control-panel-wrapper {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  pointer-events: none;
}

.ctrl-toggle {
  pointer-events: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  position: absolute;
  bottom: 0;
  right: 0;
}

.ctrl-toggle:hover {
  background: rgba(80, 80, 160, 0.5);
  color: #fff;
  transform: scale(1.08);
}

.control-panel {
  pointer-events: auto;
  width: 280px;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  background: rgba(10, 10, 20, var(--panel-alpha, 0.6));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0;
  color: #d0d0e0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  margin-bottom: 48px;
  overflow: hidden;
}

.section-fixed {
  flex-shrink: 0;
}

.control-panel-scroll {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
.control-panel-scroll::-webkit-scrollbar {
  width: 4px;
}
.control-panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0f0ff;
}

.pin-btn {
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
  flex-shrink: 0;
  padding: 0;
}

.pin-btn:hover {
  color: rgba(255, 255, 255, 0.6);
}

.pin-btn.active {
  color: #22d3ee;
}

.pin-btn.active:hover {
  color: #67e8f9;
}

/* Light control buttons */
.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.light-btn {
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.light-btn:hover {
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.25);
}

.light-btn.active {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.4);
}

.section {
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.monitor-grid {
  display: flex;
  gap: 0.6rem;
}

.monitor-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
}

.monitor-item .label {
  display: block;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 2px;
}

.monitor-item .value {
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.value.fps {
  color: #22d3ee;
}

.value.memory {
  color: #a78bfa;
}

.value.count {
  color: #34d399;
}

.placeholder-msg {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
  padding: 0.3rem 0;
}

/* Slider */
.slider-row,
.anim-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.anim-row {
  gap: 0.6rem;
}

.play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.play-btn:hover {
  background: rgba(80, 80, 160, 0.4);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
}

.speed-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
}

.slider-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}

.slider-value {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  min-width: 2.5em;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.alpha-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
  cursor: pointer;
}

.alpha-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(130, 130, 200, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.alpha-slider::-webkit-slider-thumb:hover {
  background: rgba(130, 130, 200, 0.9);
  transform: scale(1.15);
}

.alpha-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(130, 130, 200, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

/* Progress bar */
.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #22d3ee, #34d399);
  transition: width 0.05s linear;
}

.progress-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

/* 响应式 */
@media (max-width: 768px) {
  .control-panel-wrapper {
    bottom: 0.5rem;
    right: 0.5rem;
  }

  .control-panel {
    width: calc(100vw - 2rem);
    max-width: 320px;
  }
}

/* 插槽内样式统一 */
:deep(.section) {
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
:deep(.section-title) {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}
:deep(.layout-row) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
:deep(.layout-btn) {
  flex: 0 0 calc(50% - 0.25rem);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  text-align: center;
}
:deep(.layout-btn:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
:deep(.layout-btn.active) {
  background: rgba(34, 211, 238, 0.15);
  border-color: rgba(34, 211, 238, 0.3);
  color: #22d3ee;
}
</style>

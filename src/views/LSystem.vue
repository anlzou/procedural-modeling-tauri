<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { LSystem, L_SYSTEM_PRESETS } from '../utils/lsystem.js'
import InfoPanel from '../components/InfoPanel.vue'
import ControlPanel from '../components/ControlPanel.vue'

const canvasRef = ref(null)
let scene, camera, renderer, controls, group, animationId
let ambientLight, dirLight, dirLight2
let currentPreset = ref('plant')
let frameCount = 0, lastFpsTime = 0
const fps = ref(0)
const memory = ref(0)
const playing = ref(true)
const speed = ref(1)
const presets = L_SYSTEM_PRESETS

// 分类标签映射
const CATEGORY_LABELS = {
  plant: '🌿 植物类',
  fractal: '🔺 分形类',
  curve: '📐 曲线类',
}
const CATEGORY_ORDER = ['plant', 'fractal', 'curve']

// 按分类分组预设
const categoryGroups = CATEGORY_ORDER.map(cat => ({
  key: cat,
  label: CATEGORY_LABELS[cat],
  items: Object.entries(presets).filter(([, p]) => p.category === cat),
}))

// 生长控制
const growing = ref(false)
const growthSpeed = ref(8)
const growthProgress = ref(0)
const growthTotal = ref(0)
let allSegments = []        // 预计算的所有线段
let lsInstance = null       // 当前的 LSystem 实例
let presetData = null       // 当前的预设数据
let growthFrameAccum = 0    // 帧累积器，用于平滑生长

const lightSources = [
  { name: '环境光' },
  { name: '主光源' },
  { name: '辅光源' },
]

function onTogglePlay(val) { playing.value = val }
function onUpdateSpeed(val) { speed.value = val }

function onToggleGrowth() {
  if (growing.value) {
    growing.value = false
    return
  }

  growthProgress.value = 0
  growthFrameAccum = 0

  const key = currentPreset.value
  const preset = presets[key]

  if (preset?.category === 'plant') {
    // 植物预设：随机选择迭代次数控制分支数量（结构完整）
    const maxIter = preset.iterations
    const minIter = Math.max(1, Math.floor(maxIter * 0.5)) // 至少一半迭代
    const randIter = minIter + Math.floor(Math.random() * (maxIter - minIter + 1))

    // 用随机迭代次数重新生成
    lsInstance = new LSystem(preset.axiom, preset.rules, preset.angle, preset.length, randIter, preset.leafLength)
    allSegments = lsInstance.buildSegments()
    growthTotal.value = allSegments.length
  }
  // 非植物预设：使用预设的完整迭代次数，不变

  growing.value = true
}

function onUpdateGrowthSpeed(val) {
  growthSpeed.value = val
}

function onUpdateLight({ index, visible, intensity }) {
  if (index === -1) {
    // Global intensity
    if (ambientLight) ambientLight.intensity = 0.6 * intensity
    if (dirLight) dirLight.intensity = 1.2 * intensity
    if (dirLight2) dirLight2.intensity = 0.4 * intensity
  } else {
    // Toggle specific light
    const lights = [ambientLight, dirLight, dirLight2]
    if (lights[index]) lights[index].visible = visible
  }
}

onMounted(() => {
  init()
  buildLSystem('plant')
  animate()
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  controls?.dispose()
  renderer?.dispose()
})

function init() {
  const container = canvasRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(3, 2, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.0

  ambientLight = new THREE.AmbientLight(0x404060, 0.6)
  scene.add(ambientLight)

  dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)

  dirLight2 = new THREE.DirectionalLight(0xff8844, 0.4)
  dirLight2.position.set(-3, 2, -4)
  scene.add(dirLight2)

  group = new THREE.Group()
  scene.add(group)

  window.addEventListener('resize', onResize)
}

function clearGroup() {
  while (group.children.length > 0) {
    const child = group.children[0]
    group.remove(child)
    if (child.geometry) child.geometry.dispose()
    if (child.material) child.material.dispose()
  }
}

function buildLSystem(key) {
  clearGroup()

  const preset = presets[key]
  if (!preset) return

  // 停止生长动画
  growing.value = false
  growthProgress.value = 0

  // 保存预设和 LSystem 实例供后续增量生长使用
  presetData = preset
  lsInstance = new LSystem(preset.axiom, preset.rules, preset.angle, preset.length, preset.iterations, preset.leafLength)
  allSegments = lsInstance.buildSegments()
  growthTotal.value = allSegments.length

  // 渲染完整模型（支持多部件颜色）
  let hasValidGeometry = false

  // 收集所有需要渲染的颜色组
  const colorGroups = [{ type: null, color: preset.color }]
  if (preset.leafColor) {
    colorGroups.push({ type: 'leaf', color: preset.leafColor })
    colorGroups[0].type = 'branch'  // 主干也用 type 过滤
  }

  for (const { type, color } of colorGroups) {
    try {
      const geometry = lsInstance.toGeometry(type)
      if (!geometry.attributes.position || geometry.attributes.position.count < 3) continue
      renderMesh(geometry, color)
      hasValidGeometry = true
    } catch (e) {
      // 回退到线条
      const lineGeo = lsInstance.toLineGeometry()
      const material = new THREE.LineBasicMaterial({ color })
      group.add(new THREE.Line(lineGeo, material))
      hasValidGeometry = true
    }
  }

  // 居中视图
  if (hasValidGeometry) centerViewOnModel()
}

/**
 * 从预计算 segments 中增量渲染前 count 段（支持多部件颜色）
 */
function updateGrowthVisuals() {
  clearGroup()

  const count = growthProgress.value
  if (count === 0 || !lsInstance || !presetData) return

  // 收集需要渲染的颜色组
  const colorGroups = [{ type: null, color: presetData.color }]
  if (presetData.leafColor) {
    colorGroups.push({ type: 'leaf', color: presetData.leafColor })
    colorGroups[0].type = 'branch'
  }

  for (const { type, color } of colorGroups) {
    try {
      const geometry = lsInstance.toGeometryFromSegments(allSegments, count, type)
      if (!geometry.attributes.position || geometry.attributes.position.count < 3) continue
      renderMesh(geometry, color)
    } catch (e) {
      // 忽略渲染错误
    }
  }
}

/**
 * 辅助：将几何体添加到组中（带材质和线框）
 */
function renderMesh(geometry, color) {
  const wireGeometry = geometry.clone()

  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.4,
    metalness: 0.1,
    emissive: color,
    emissiveIntensity: 0.05,
  })

  group.add(new THREE.Mesh(geometry, material))

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.1,
  })
  group.add(new THREE.Mesh(wireGeometry, wireMat))
}

/**
 * 计算模型包围盒，将相机视角中心对准模型中部
 */
function centerViewOnModel() {
  if (!group || group.children.length === 0) return

  const box = new THREE.Box3().setFromObject(group)
  if (box.min.x === Infinity) return

  const center = new THREE.Vector3()
  box.getCenter(center)

  // 将轨道控制的目标点设为模型中心
  controls.target.copy(center)

  // 根据模型尺寸调整相机距离以保证完整显示
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const idealDist = maxDim * 1.8
  const curDir = camera.position.clone().sub(controls.target).normalize()
  if (curDir.length() > 0.01) {
    camera.position.copy(controls.target).add(curDir.multiplyScalar(Math.max(idealDist, 3)))
  } else {
    camera.position.set(0, maxDim * 0.5, maxDim * 1.8)
  }

  controls.update()
}

function switchPreset(key) {
  currentPreset.value = key
  buildLSystem(key)
}

function onResize() {
  const container = canvasRef.value
  if (!container || !renderer) return
  const width = container.clientWidth
  const height = container.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  frameCount++
  if (lastFpsTime === 0) lastFpsTime = performance.now()
  const now = performance.now()
  if (now - lastFpsTime >= 1000) {
    fps.value = frameCount; frameCount = 0; lastFpsTime = now
    if (window.performance?.memory) memory.value = window.performance.memory.usedJSHeapSize
  }

  // 生长动画逻辑
  if (growing.value && allSegments.length > 0 && growthProgress.value < growthTotal.value) {
    // 随机抖动：每次添加 0.3~1.3 倍基础速度的段数
    const jitter = 0.3 + Math.random() * 1.0
    const addCount = Math.max(1, Math.round(growthSpeed.value * jitter))
    growthProgress.value = Math.min(growthProgress.value + addCount, growthTotal.value)
    updateGrowthVisuals()

    // 生长完毕
    if (growthProgress.value >= growthTotal.value) {
      growing.value = false
    }
  }

  controls.update()
  controls.autoRotate = playing.value
  renderer.render(scene, camera)
}
</script>

<template>
  <div class="page">
    <InfoPanel>
      <template #header>
        <h2>🌿 路径 4：L-System / 分形植物</h2>
        <p><strong>核心原理：</strong>用字符串重写规则生成递归结构，模拟植物、龙曲线等自然形态。</p>
      </template>
      <div class="features">
        <span>✓ 公理 (Axiom) + 产生式规则</span>
        <span>✓ 递归迭代生成复杂结构</span>
        <span>✓ 状态栈实现分支</span>
        <span>✓ TubeGeometry 管状渲染</span>
      </div>
      <div
        v-for="group in categoryGroups"
        :key="group.key"
        class="category-group"
      >
        <div class="category-label">{{ group.label }}</div>
        <div class="controls-row">
          <button
            v-for="[key, p] in group.items"
            :key="key"
            class="btn"
            :class="{ active: currentPreset === key }"
            @click="switchPreset(key)"
          >
            {{ p.name }}
          </button>
        </div>
      </div>
      <p class="hint">🖱 鼠标拖拽旋转 · 滚轮缩放</p>
    </InfoPanel>

    <ControlPanel :fps="fps" :memory="memory" :objectCount="group?.children.length || 0" :lightSources="lightSources" :growing="growing" :growthProgress="growthProgress" :growthTotal="growthTotal" @togglePlay="onTogglePlay" @updateSpeed="onUpdateSpeed" @updateLight="onUpdateLight" @toggleGrowth="onToggleGrowth" @updateGrowthSpeed="onUpdateGrowthSpeed" />

    <div ref="canvasRef" class="canvas-container"></div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #0a0a1a; }
.canvas-container { width: 100%; height: 100%; }

.category-group {
  margin-bottom: 0.5rem;
}
.category-group:last-child {
  margin-bottom: 0;
}
.category-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  margin-bottom: 0.3rem;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
</style>

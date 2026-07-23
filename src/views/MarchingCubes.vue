<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MarchingCubes, MC_PRESETS } from '../utils/marchingCubes.js'
import InfoPanel from '../components/InfoPanel.vue'
import ControlPanel from '../components/ControlPanel.vue'

const canvasRef = ref(null)
let scene, camera, renderer, controls, mesh, animationId, frameCount = 0, lastFpsTime = 0
let ambientLight, dirLight, dirLight2
const fps = ref(0)
const memory = ref(0)
const playing = ref(true)
const speed = ref(1)
const currentMode = ref('metaballs')

const presets = MC_PRESETS
const currentPreset = computed(() => presets[currentMode.value])

const lightSources = [
  { name: '环境光' },
  { name: '主光源' },
  { name: '辅光源' },
]

function onTogglePlay(val) { playing.value = val }
function onUpdateSpeed(val) { speed.value = val }

function onUpdateLight({ index, visible, intensity }) {
  if (index === -1) {
    if (ambientLight) ambientLight.intensity = 0.5 * intensity
    if (dirLight) dirLight.intensity = 1.5 * intensity
    if (dirLight2) dirLight2.intensity = 0.5 * intensity
  } else {
    const lights = [ambientLight, dirLight, dirLight2]
    if (lights[index]) lights[index].visible = visible
  }
}

function rebuildMesh() {
  const preset = currentPreset.value
  if (!preset) return

  // Remove old mesh
  if (mesh) {
    scene.remove(mesh)
    mesh.geometry?.dispose()
    mesh.material?.dispose()
  }

  const mc = new MarchingCubes(preset.field, preset.resolution, preset.centers, preset.range)
  const geometry = mc.generate()

  const material = new THREE.MeshPhysicalMaterial({
    color: preset.color,
    roughness: 0.2,
    metalness: 0.6,
    clearcoat: 0.3,
    emissive: preset.emissive,
    emissiveIntensity: 0.1,
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Center view on model
  const box = new THREE.Box3().setFromObject(mesh)
  const center = new THREE.Vector3()
  box.getCenter(center)
  controls.target.copy(center)

  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const dist = maxDim * 1.8
  const dir = camera.position.clone().sub(controls.target).normalize()
  camera.position.copy(controls.target).add(dir.multiplyScalar(Math.max(dist, 3)))
  controls.update()
}

function switchMode(key) {
  currentMode.value = key
  rebuildMesh()
}

onMounted(() => {
  init()
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
  camera.position.set(3, 2, 4)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.5

  // Lights
  ambientLight = new THREE.AmbientLight(0x404060, 0.5); scene.add(ambientLight)
  dirLight = new THREE.DirectionalLight(0xffffff, 1.5); dirLight.position.set(5, 10, 7); scene.add(dirLight)
  dirLight2 = new THREE.DirectionalLight(0x4488ff, 0.5); dirLight2.position.set(-5, -2, -3); scene.add(dirLight2)

  // Generate initial mesh
  rebuildMesh()

  // Grid helper
  const gridHelper = new THREE.GridHelper(4, 10, 0x444466, 0x333355)
  gridHelper.position.y = -1.2
  scene.add(gridHelper)

  window.addEventListener('resize', onResize)
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

  controls.update()
  controls.autoRotate = playing.value
  renderer.render(scene, camera)
}
</script>

<template>
  <div class="page">
    <InfoPanel>
      <template #header>
        <h2>🧊 路径 2：Marching Cubes（等值面提取）</h2>
        <p><strong>核心原理：</strong>将空间划分为体素网格，采样标量场值，用 Marching Cubes 算法提取等值面生成真实 Mesh。</p>
      </template>
      <div class="features">
        <span>✓ 体素细分 + 256 配置查表</span>
        <span>✓ Metaball 公式：∑(r²/d²) − 1</span>
        <span>✓ 三重周期极小曲面 (TPMS)</span>
        <span>✓ Schwarz P / Gyroid / Diamond 晶格</span>
      </div>
      <div class="controls-row">
        <button
          v-for="(p, key) in presets"
          :key="key"
          class="btn"
          :class="{ active: currentMode === key }"
          @click="switchMode(key)"
        >{{ p.name }}</button>
      </div>
      <p class="hint">🖱 鼠标拖拽旋转 · 滚轮缩放</p>
    </InfoPanel>

    <ControlPanel :fps="fps" :memory="memory" :objectCount="1" :lightSources="lightSources" @togglePlay="onTogglePlay" @updateSpeed="onUpdateSpeed" @updateLight="onUpdateLight" />

    <div ref="canvasRef" class="canvas-container"></div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #0a0a1a; }
.canvas-container { width: 100%; height: 100%; }
</style>

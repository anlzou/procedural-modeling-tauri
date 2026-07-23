<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from '../shaders/raymarching.vert?raw'
import fragmentShader from '../shaders/raymarching.frag?raw'
import InfoPanel from '../components/InfoPanel.vue'
import ControlPanel from '../components/ControlPanel.vue'

const canvasRef = ref(null)
let scene, camera, renderer, controls, shaderMat, shaderMesh
let ambientLight, dl1, dl2, pl
let objects = [], animationId, frameCount = 0, lastFpsTime = 0
const fps = ref(0)
const memory = ref(0)
const objectCount = ref(8)
const playing = ref(true)
const speed = ref(1)

// 复杂模型显隐
const primitivesVisible = ref(true)
const complexModels = ref([])
const modelVisible = ref([false, false, false, false, false])
const modelList = [
  { key: 'spring', label: '螺旋弹簧', color: 0x22d3ee },
  { key: 'dna', label: 'DNA 双螺旋', color: 0xa78bfa },
  { key: 'superformula', label: '超公式曲面', color: 0xf59e0b },
  { key: 'sierpinski', label: '谢尔宾斯基四面体', color: 0xef4444 },
  { key: 'stellation', label: '星芒多面体', color: 0x34d399 },
]

function onTogglePlay(val) { playing.value = val }
function onUpdateSpeed(val) { speed.value = val }

function togglePrimitives() {
  primitivesVisible.value = !primitivesVisible.value
  objects.forEach(o => { o.mesh.visible = primitivesVisible.value })
}

function toggleModel(idx) {
  modelVisible.value[idx] = !modelVisible.value[idx]
  if (complexModels.value[idx]) complexModels.value[idx].visible = modelVisible.value[idx]
}

onMounted(() => { init(); animate() })
onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  controls?.dispose(); renderer?.dispose()
  objects.forEach(o => { scene.remove(o.mesh); o.mesh.geometry?.dispose(); o.mesh.material?.dispose() })
  complexModels.value.forEach(m => {
    scene.remove(m)
    if (m instanceof THREE.Group) {
      m.children.forEach(c => { c.geometry?.dispose(); c.material?.dispose() })
    } else {
      m.geometry?.dispose(); m.material?.dispose()
    }
  })
})

function init() {
  const container = canvasRef.value
  const width = container.clientWidth, height = container.clientHeight

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
  camera.position.set(0, 2, 6)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true; controls.autoRotate = true
  controls.autoRotateSpeed = 0.8; controls.minDistance = 2
  controls.maxDistance = 20; controls.target.set(0, 0, 0)

  // Skybox: Raymarching shader on a large sphere
  const bgGeo = new THREE.SphereGeometry(50, 32, 32)
  shaderMat = new THREE.ShaderMaterial({
    vertexShader, fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
    },
    side: THREE.BackSide,
  })
  shaderMesh = new THREE.Mesh(bgGeo, shaderMat)
  scene.add(shaderMesh)

  // Lights
  ambientLight = new THREE.AmbientLight(0x404060, 0.6); scene.add(ambientLight)
  dl1 = new THREE.DirectionalLight(0xffffff, 2); dl1.position.set(5, 10, 7); scene.add(dl1)
  dl2 = new THREE.DirectionalLight(0x4488ff, 1); dl2.position.set(-5, 3, -5); scene.add(dl2)
  pl = new THREE.PointLight(0xff6644, 1.5, 10); pl.position.set(0, 3, 0); scene.add(pl)

  create3DObjects()
  createComplexModels()
  window.addEventListener('resize', onResize)
}

function create3DObjects() {
  const items = [
    [THREE.TorusKnotGeometry, [0.6, 0.25, 100, 16], 0x7c3aed, [-1.8, 0.2, 0], [0.8, 0.5, 0.3]],
    [THREE.IcosahedronGeometry, [0.5, 0], 0xf59e0b, [1.8, -0.5, 0], [0.4, 0.7, 0.1]],
    [THREE.OctahedronGeometry, [0.45], 0x06b6d4, [0, 0.8, -1.5], [0.6, 0.3, 0.5]],
    [THREE.TorusGeometry, [0.5, 0.2, 30, 50], 0xec4899, [0, -0.6, 1.8], [0.5, 0.2, 0.7]],
    [THREE.DodecahedronGeometry, [0.4], 0x22c55e, [-1.2, -0.8, 1.2], [0.3, 0.9, 0.2]],
    [THREE.BoxGeometry, [0.7, 0.7, 0.7], 0xef4444, [1.4, 0.6, -1.2], [0.7, 0.4, 0.6]],
    [THREE.ConeGeometry, [0.4, 0.8, 8], 0x8b5cf6, [-0.8, -0.3, -1.8], [0.5, 0.6, 0.4]],
    [THREE.CylinderGeometry, [0.35, 0.35, 0.7, 16], 0x14b8a6, [0.9, -0.2, 1.6], [0.2, 0.8, 0.3]],
  ]
  items.forEach(([Geo, args, color, pos, rot], i) => {
    const mat = new THREE.MeshPhysicalMaterial({
      color, emissive: color, emissiveIntensity: 0.3,
      roughness: 0.2, metalness: 0.7, clearcoat: 0.4,
    })
    const mesh = new THREE.Mesh(new Geo(...args), mat)
    mesh.position.set(pos[0], pos[1], pos[2])
    scene.add(mesh)
    objects.push({ mesh, rotSpeed: rot, initPos: new THREE.Vector3(pos[0], pos[1], pos[2]), phase: i * 1.2 })
  })
}

// ==================== 复杂模型生成 ====================

function createSpringCoil() {
  const pts = []
  const turns = 10, seg = 100
  for (let i = 0; i <= seg; i++) {
    const t = i / seg * turns * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(t) * 0.7, (i / seg - 0.5) * 3, Math.sin(t) * 0.7))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, 120, 0.07, 8, false)
}

function createDNAHelix() {
  const group = new THREE.Group()
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xa78bfa, roughness: 0.3, metalness: 0.6 })
  const rungMat = new THREE.MeshPhysicalMaterial({ color: 0x22d3ee, roughness: 0.4, metalness: 0.3 })

  // Two helices
  const strands = []
  for (let s = 0; s < 2; s++) {
    const pts = []
    const offset = s * Math.PI
    for (let i = 0; i <= 120; i++) {
      const t = i / 120 * 4 * Math.PI * 2
      pts.push(new THREE.Vector3(
        Math.cos(t + offset) * 0.6,
        (i / 120 - 0.5) * 4,
        Math.sin(t + offset) * 0.6
      ))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.06, 6, false), mat)
    group.add(strand)
    strands.push(pts)
  }

  // Rungs
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    const angle = t * 4 * Math.PI * 2
    const y = (t - 0.5) * 4
    const p1 = new THREE.Vector3(Math.cos(angle) * 0.6, y, Math.sin(angle) * 0.6)
    const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * 0.6, y, Math.sin(angle + Math.PI) * 0.6)
    const mid = p1.clone().add(p2).multiplyScalar(0.5)
    const dir = p2.clone().sub(p1)
    const len = dir.length()
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 4), rungMat)
    cyl.position.copy(mid)
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    group.add(cyl)
  }
  return group
}

function createSuperformula() {
  const vertices = [], indices = []
  const rows = 60, cols = 60

  function superformula(theta, a, b, m, n1, n2, n3) {
    const t1 = Math.pow(Math.abs(Math.cos(m * theta / 4) / a), n2)
    const t2 = Math.pow(Math.abs(Math.sin(m * theta / 4) / b), n3)
    return Math.pow(t1 + t2, -1 / n1)
  }

  for (let i = 0; i <= rows; i++) {
    const u = i / rows * Math.PI
    for (let j = 0; j <= cols; j++) {
      const v = j / cols * Math.PI * 2
      const r1 = superformula(u, 1, 1, 6, 1.5, 1, 1)
      const r2 = superformula(v, 1, 1, 6, 1.5, 1, 1)
      const r = r1 * r2
      const x = r * Math.sin(u) * Math.cos(v)
      const y = r * Math.sin(u) * Math.sin(v)
      const z = r * Math.cos(u)
      vertices.push(x * 0.8, y * 0.8, z * 0.8)
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j
      const b = a + cols + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function createSierpinski() {
  const group = new THREE.Group()
  const depth = 3

  function tetra(p1, p2, p3, p4, d, parent) {
    if (d === 0) {
      const geo = new THREE.TetrahedronGeometry(0.5)
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xef4444, roughness: 0.3, metalness: 0.4,
        emissive: 0xef4444, emissiveIntensity: 0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      const center = p1.clone().add(p2).add(p3).add(p4).multiplyScalar(0.25)
      mesh.position.copy(center)
      parent.add(mesh)
      return
    }
    const mid = (a, b) => a.clone().add(b).multiplyScalar(0.5)
    const m12 = mid(p1, p2), m13 = mid(p1, p3), m14 = mid(p1, p4)
    const m23 = mid(p2, p3), m24 = mid(p2, p4), m34 = mid(p3, p4)
    tetra(p1, m12, m13, m14, d - 1, parent)
    tetra(p2, m12, m23, m24, d - 1, parent)
    tetra(p3, m13, m23, m34, d - 1, parent)
    tetra(p4, m14, m24, m34, d - 1, parent)
  }

  const s = 1.5
  const p1 = new THREE.Vector3(0, s, 0)
  const p2 = new THREE.Vector3(-s, -s / 2, s / 2)
  const p3 = new THREE.Vector3(s, -s / 2, s / 2)
  const p4 = new THREE.Vector3(0, -s / 2, -s)
  tetra(p1, p2, p3, p4, depth, group)
  return group
}

function createStellation() {
  const group = new THREE.Group()
  const icoGeo = new THREE.IcosahedronGeometry(0.8, 0)
  const pos = icoGeo.getAttribute('position')

  // Collect face centers
  const faceCenters = []
  for (let i = 0; i < pos.count; i += 3) {
    const a = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
    const b = new THREE.Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1))
    const c = new THREE.Vector3(pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2))
    faceCenters.push(a.clone().add(b).add(c).divideScalar(3))
  }

  // Central icosahedron
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x34d399, roughness: 0.2, metalness: 0.7,
    emissive: 0x34d399, emissiveIntensity: 0.15,
  })
  group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), coreMat))

  // Spikes
  const spikeMat = new THREE.MeshPhysicalMaterial({
    color: 0x22d3ee, roughness: 0.15, metalness: 0.8,
    emissive: 0x22d3ee, emissiveIntensity: 0.1,
  })
  for (const fc of faceCenters) {
    const dir = fc.clone().normalize()
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), spikeMat)
    spike.position.copy(dir.clone().multiplyScalar(0.85))
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    group.add(spike)
  }
  return group
}

function createComplexModels() {
  const models = [
    { fn: createSpringCoil, pos: [-2.2, 0.5, 0], rotSpeed: [0.6, 0.3, 0.1] },
    { fn: createDNAHelix, pos: [0, 0.5, -2.2], rotSpeed: [0.2, 0.8, 0] },
    { fn: createSuperformula, pos: [2.2, 0, 0], rotSpeed: [0.4, 0.5, 0.2] },
    { fn: createSierpinski, pos: [0, -0.3, 2.2], rotSpeed: [0.3, 0.6, 0.1] },
    { fn: createStellation, pos: [0, 1.5, 0], rotSpeed: [0.5, 0.4, 0.3] },
  ]

  models.forEach(({ fn, pos, rotSpeed }, i) => {
    const result = fn()
    if (result instanceof THREE.Group) {
      result.position.set(pos[0], pos[1], pos[2])
      result.visible = modelVisible.value[i]
      scene.add(result)
      complexModels.value.push(result)
      result.userData.rotSpeed = rotSpeed
      result.children.forEach(c => {
        c.userData.rotSpeed = rotSpeed
        c.userData.initPos = new THREE.Vector3(pos[0], pos[1], pos[2])
        c.userData.phase = i * 1.5
      })
    } else {
      const mesh = new THREE.Mesh(result, new THREE.MeshPhysicalMaterial({
        color: modelList[i].color,
        roughness: 0.25, metalness: 0.6,
        emissive: modelList[i].color, emissiveIntensity: 0.1,
        side: THREE.DoubleSide,
      }))
      mesh.position.set(pos[0], pos[1], pos[2])
      mesh.visible = modelVisible.value[i]
      scene.add(mesh)
      complexModels.value.push(mesh)
      mesh.userData.rotSpeed = rotSpeed
      mesh.userData.initPos = new THREE.Vector3(pos[0], pos[1], pos[2])
      mesh.userData.phase = i * 1.5
    }
  })
}

function onResize() {
  const c = canvasRef.value; if (!c || !renderer) return
  const w = c.clientWidth, h = c.clientHeight
  camera.aspect = w / h; camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  if (shaderMat) shaderMat.uniforms.uResolution.value.set(w, h)
}

function animate(time) {
  animationId = requestAnimationFrame(animate)
  const t = time * 0.001

  frameCount++
  if (time - lastFpsTime >= 1000) {
    fps.value = frameCount; frameCount = 0; lastFpsTime = time
    if (window.performance?.memory) memory.value = window.performance.memory.usedJSHeapSize
  }

  if (playing.value) {
    const s = speed.value
    if (shaderMat) shaderMat.uniforms.uTime.value = t * s

    objects.forEach((o, i) => {
      o.mesh.rotation.x += o.rotSpeed[0] * 0.012 * s
      o.mesh.rotation.y += o.rotSpeed[1] * 0.012 * s
      o.mesh.rotation.z += o.rotSpeed[2] * 0.012 * s
      o.mesh.position.y = o.initPos.y + Math.sin(t * 0.6 * s + o.phase) * 0.3
      o.mesh.position.x = o.initPos.x + Math.sin(t * 0.4 * s + o.phase * 0.7) * 0.15
      o.mesh.material.emissiveIntensity = 0.3 + 0.2 * Math.sin(t * 0.8 * s + o.phase)
    })

    // Animate complex models
    complexModels.value.forEach((m, i) => {
      const rs = m.userData.rotSpeed || [0.3, 0.4, 0.2]
      if (m instanceof THREE.Group) {
        m.rotation.x += rs[0] * 0.008 * s
        m.rotation.y += rs[1] * 0.008 * s
        m.rotation.z += rs[2] * 0.008 * s
      } else {
        m.rotation.x += rs[0] * 0.008 * s
        m.rotation.y += rs[1] * 0.008 * s
        m.rotation.z += rs[2] * 0.008 * s
        const initPos = m.userData.initPos || new THREE.Vector3(0, 0, 0)
        const phase = m.userData.phase || i
        m.position.y = initPos.y + Math.sin(t * 0.5 * s + phase) * 0.2
      }
    })
  }

  controls.update()
  if (playing.value) controls.autoRotate = true; else controls.autoRotate = false
  renderer.render(scene, camera)
}
</script>

<template>
  <div class="page">
    <InfoPanel>
      <template #header>
        <h2>🔮 路径 1：SDF + Raymarching</h2>
        <p><strong>核心原理：</strong>不生成网格，直接在 Fragment Shader 中用数学函数定义空间中的形状，通过光线步进（Raymarching）渲染。</p>
      </template>
      <div class="features">
        <span>✓ SDF 基本体：球体、立方体、圆环、圆柱</span>
        <span>✓ 布尔运算：并集、交集、差集、平滑并集</span>
        <span>✓ 扭曲变形、表面位移</span>
        <span>✓ Mandelbulb 分形</span>
        <span>✓ 5 种复杂 Three.js 模型：螺旋弹簧、DNA 双螺旋等</span>
      </div>
      <div class="section-title" style="margin-top:0.6rem;font-size:0.7rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.6rem;">模型显隐</div>
      <div class="controls-row">
        <button class="btn" :class="{ active: primitivesVisible }" @click="togglePrimitives">🟣 基本体组合</button>
        <button
          v-for="(m, i) in modelList"
          :key="m.key"
          class="btn"
          :class="{ active: modelVisible[i] }"
          @click="toggleModel(i)"
        >{{ m.label }}</button>
      </div>
      <p class="hint">🖱 拖拽旋转 · 滚轮缩放</p>
    </InfoPanel>

    <ControlPanel :fps="fps" :memory="memory" :objectCount="objectCount" :lightSources="lightSources" @togglePlay="onTogglePlay" @updateSpeed="onUpdateSpeed" @updateLight="onUpdateLight" />

    <div ref="canvasRef" class="canvas-container"></div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #0a0a0f; }
.canvas-container { width: 100%; height: 100%; }
</style>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { Tween, Easing, Group } from '@tweenjs/tween.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import InfoPanel from '../components/InfoPanel.vue'
import ControlPanel from '../components/ControlPanel.vue'

const containerRef = ref(null)
const tweenGroup = new Group()

let camera, scene, renderer, controls, animationId
let frameCount = 0, lastFpsTime = 0
const fps = ref(0)
const memory = ref(0)
const objects = []
const targets = { table: [], sphere: [], helix: [], grid: [] }
let rotationGroup = null
const playing = ref(true)
const speed = ref(1)

const currentLayout = ref('table')
const currentModel = ref('periodic-table')
const lightSources = null // CSS3D 没有光照

const css3dModels = {
  'periodic-table': { name: '🧪 元素周期表', layouts: ['table', 'sphere', 'helix', 'grid'] },
}
const layoutLabels = { table: '📋 TABLE', sphere: '🌐 SPHERE', helix: '🌀 HELIX', grid: '📦 GRID' }

const currentModelLayouts = computed(() => css3dModels[currentModel.value]?.layouts || [])

function onTogglePlay(val) { playing.value = val }
function onUpdateSpeed(val) { speed.value = val }

const table = [
  'H', 'Hydrogen', '1.00794', 1, 1, 'He', 'Helium', '4.002602', 18, 1,
  'Li', 'Lithium', '6.941', 1, 2, 'Be', 'Beryllium', '9.012182', 2, 2,
  'B', 'Boron', '10.811', 13, 2, 'C', 'Carbon', '12.0107', 14, 2,
  'N', 'Nitrogen', '14.0067', 15, 2, 'O', 'Oxygen', '15.9994', 16, 2,
  'F', 'Fluorine', '18.9984032', 17, 2, 'Ne', 'Neon', '20.1797', 18, 2,
  'Na', 'Sodium', '22.98976...', 1, 3, 'Mg', 'Magnesium', '24.305', 2, 3,
  'Al', 'Aluminium', '26.9815386', 13, 3, 'Si', 'Silicon', '28.0855', 14, 3,
  'P', 'Phosphorus', '30.973762', 15, 3, 'S', 'Sulfur', '32.065', 16, 3,
  'Cl', 'Chlorine', '35.453', 17, 3, 'Ar', 'Argon', '39.948', 18, 3,
  'K', 'Potassium', '39.948', 1, 4, 'Ca', 'Calcium', '40.078', 2, 4,
  'Sc', 'Scandium', '44.955912', 3, 4, 'Ti', 'Titanium', '47.867', 4, 4,
  'V', 'Vanadium', '50.9415', 5, 4, 'Cr', 'Chromium', '51.9961', 6, 4,
  'Mn', 'Manganese', '54.938045', 7, 4, 'Fe', 'Iron', '55.845', 8, 4,
  'Co', 'Cobalt', '58.933195', 9, 4, 'Ni', 'Nickel', '58.6934', 10, 4,
  'Cu', 'Copper', '63.546', 11, 4, 'Zn', 'Zinc', '65.38', 12, 4,
  'Ga', 'Gallium', '69.723', 13, 4, 'Ge', 'Germanium', '72.63', 14, 4,
  'As', 'Arsenic', '74.9216', 15, 4, 'Se', 'Selenium', '78.96', 16, 4,
  'Br', 'Bromine', '79.904', 17, 4, 'Kr', 'Krypton', '83.798', 18, 4,
  'Rb', 'Rubidium', '85.4678', 1, 5, 'Sr', 'Strontium', '87.62', 2, 5,
  'Y', 'Yttrium', '88.90585', 3, 5, 'Zr', 'Zirconium', '91.224', 4, 5,
  'Nb', 'Niobium', '92.90628', 5, 5, 'Mo', 'Molybdenum', '95.96', 6, 5,
  'Tc', 'Technetium', '(98)', 7, 5, 'Ru', 'Ruthenium', '101.07', 8, 5,
  'Rh', 'Rhodium', '102.9055', 9, 5, 'Pd', 'Palladium', '106.42', 10, 5,
  'Ag', 'Silver', '107.8682', 11, 5, 'Cd', 'Cadmium', '112.411', 12, 5,
  'In', 'Indium', '114.818', 13, 5, 'Sn', 'Tin', '118.71', 14, 5,
  'Sb', 'Antimony', '121.76', 15, 5, 'Te', 'Tellurium', '127.6', 16, 5,
  'I', 'Iodine', '126.90447', 17, 5, 'Xe', 'Xenon', '131.293', 18, 5,
  'Cs', 'Caesium', '132.9054', 1, 6, 'Ba', 'Barium', '132.9054', 2, 6,
  'La', 'Lanthanum', '138.90547', 4, 9, 'Ce', 'Cerium', '140.116', 5, 9,
  'Pr', 'Praseodymium', '140.90765', 6, 9, 'Nd', 'Neodymium', '144.242', 7, 9,
  'Pm', 'Promethium', '(145)', 8, 9, 'Sm', 'Samarium', '150.36', 9, 9,
  'Eu', 'Europium', '151.964', 10, 9, 'Gd', 'Gadolinium', '157.25', 11, 9,
  'Tb', 'Terbium', '158.92535', 12, 9, 'Dy', 'Dysprosium', '162.5', 13, 9,
  'Ho', 'Holmium', '164.93032', 14, 9, 'Er', 'Erbium', '167.259', 15, 9,
  'Tm', 'Thulium', '168.93421', 16, 9, 'Yb', 'Ytterbium', '173.054', 17, 9,
  'Lu', 'Lutetium', '174.9668', 18, 9, 'Hf', 'Hafnium', '178.49', 4, 6,
  'Ta', 'Tantalum', '180.94788', 5, 6, 'W', 'Tungsten', '183.84', 6, 6,
  'Re', 'Rhenium', '186.207', 7, 6, 'Os', 'Osmium', '190.23', 8, 6,
  'Ir', 'Iridium', '192.217', 9, 6, 'Pt', 'Platinum', '195.084', 10, 6,
  'Au', 'Gold', '196.966569', 11, 6, 'Hg', 'Mercury', '200.59', 12, 6,
  'Tl', 'Thallium', '204.3833', 13, 6, 'Pb', 'Lead', '207.2', 14, 6,
  'Bi', 'Bismuth', '208.9804', 15, 6, 'Po', 'Polonium', '(209)', 16, 6,
  'At', 'Astatine', '(210)', 17, 6, 'Rn', 'Radon', '(222)', 18, 6,
  'Fr', 'Francium', '(223)', 1, 7, 'Ra', 'Radium', '(226)', 2, 7,
  'Ac', 'Actinium', '(227)', 4, 10, 'Th', 'Thorium', '232.03806', 5, 10,
  'Pa', 'Protactinium', '231.0588', 6, 10, 'U', 'Uranium', '238.02891', 7, 10,
  'Np', 'Neptunium', '(237)', 8, 10, 'Pu', 'Plutonium', '(244)', 9, 10,
  'Am', 'Americium', '(243)', 10, 10, 'Cm', 'Curium', '(247)', 11, 10,
  'Bk', 'Berkelium', '(247)', 12, 10, 'Cf', 'Californium', '(251)', 13, 10,
  'Es', 'Einstenium', '(252)', 14, 10, 'Fm', 'Fermium', '(257)', 15, 10,
  'Md', 'Mendelevium', '(258)', 16, 10, 'No', 'Nobelium', '(259)', 17, 10,
  'Lr', 'Lawrencium', '(262)', 18, 10, 'Rf', 'Rutherfordium', '(267)', 4, 7,
  'Db', 'Dubnium', '(268)', 5, 7, 'Sg', 'Seaborgium', '(271)', 6, 7,
  'Bh', 'Bohrium', '(272)', 7, 7, 'Hs', 'Hassium', '(270)', 8, 7,
  'Mt', 'Meitnerium', '(276)', 9, 7, 'Ds', 'Darmstadium', '(281)', 10, 7,
  'Rg', 'Roentgenium', '(280)', 11, 7, 'Cn', 'Copernicium', '(285)', 12, 7,
  'Nh', 'Nihonium', '(286)', 13, 7, 'Fl', 'Flerovium', '(289)', 14, 7,
  'Mc', 'Moscovium', '(290)', 15, 7, 'Lv', 'Livermorium', '(293)', 16, 7,
  'Ts', 'Tennessine', '(294)', 17, 7, 'Og', 'Oganesson', '(294)', 18, 7,
]

function switchLayout(key) {
  currentLayout.value = key
  transform(targets[key], 2000)
}

function transform(targets, duration) {
  tweenGroup.removeAll()

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i]
    const target = targets[i]

    new Tween(object.position, tweenGroup)
      .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
      .easing(Easing.Exponential.InOut)
      .start()

    new Tween(object.rotation, tweenGroup)
      .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
      .easing(Easing.Exponential.InOut)
      .start()
  }
}

function init() {
  const container = containerRef.value
  const w = container.clientWidth
  const h = container.clientHeight

  camera = new THREE.PerspectiveCamera(40, w / h, 1, 10000)
  camera.position.z = 3000

  scene = new THREE.Scene()

  // 旋转容器组
  rotationGroup = new THREE.Group()
  scene.add(rotationGroup)

  // Create element cards
  for (let i = 0; i < table.length; i += 5) {
    const element = document.createElement('div')
    element.className = 'element'
    element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')'

    const number = document.createElement('div')
    number.className = 'number'
    number.textContent = (i / 5) + 1
    element.appendChild(number)

    const symbol = document.createElement('div')
    symbol.className = 'symbol'
    symbol.textContent = table[i]
    element.appendChild(symbol)

    const details = document.createElement('div')
    details.className = 'details'
    details.innerHTML = table[i + 1] + '<br>' + table[i + 2]
    element.appendChild(details)

    const objectCSS = new CSS3DObject(element)
    objectCSS.position.x = Math.random() * 4000 - 2000
    objectCSS.position.y = Math.random() * 4000 - 2000
    objectCSS.position.z = Math.random() * 4000 - 2000
    rotationGroup.add(objectCSS)
    objects.push(objectCSS)
  }

  // Table layout
  for (let i = 0; i < table.length; i += 5) {
    const object = new THREE.Object3D()
    object.position.x = (table[i + 3] * 140) - 1330
    object.position.y = -(table[i + 4] * 180) + 990
    targets.table.push(object)
  }

  // Sphere layout
  const vector = new THREE.Vector3()
  for (let i = 0, l = objects.length; i < l; i++) {
    const phi = Math.acos(-1 + (2 * i) / l)
    const theta = Math.sqrt(l * Math.PI) * phi
    const object = new THREE.Object3D()
    object.position.setFromSphericalCoords(800, phi, theta)
    vector.copy(object.position).multiplyScalar(2)
    object.lookAt(vector)
    targets.sphere.push(object)
  }

  // Helix layout
  for (let i = 0, l = objects.length; i < l; i++) {
    const theta = i * 0.175 + Math.PI
    const y = -(i * 8) + 450
    const object = new THREE.Object3D()
    object.position.setFromCylindricalCoords(900, theta, y)
    vector.x = object.position.x * 2
    vector.y = object.position.y
    vector.z = object.position.z * 2
    object.lookAt(vector)
    targets.helix.push(object)
  }

  // Grid layout
  for (let i = 0; i < objects.length; i++) {
    const object = new THREE.Object3D()
    object.position.x = ((i % 5) * 400) - 800
    object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800
    object.position.z = (Math.floor(i / 25)) * 1000 - 2000
    targets.grid.push(object)
  }

  // Renderer
  renderer = new CSS3DRenderer()
  renderer.setSize(w, h)
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0'
  container.appendChild(renderer.domElement)

  // Controls
  controls = new TrackballControls(camera, renderer.domElement)
  controls.minDistance = 500
  controls.maxDistance = 6000
  controls.addEventListener('change', () => renderer.render(scene, camera))

  // Start with table layout
  transform(targets.table, 2000)
  // 首次渲染
  renderer.render(scene, camera)

  window.addEventListener('resize', onResize)
}

function onResize() {
  const container = containerRef.value
  if (!container) return
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.render(scene, camera)
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

  tweenGroup.update()

  // 自动旋转
  if (playing.value && rotationGroup) {
    rotationGroup.rotation.y += 0.005 * speed.value
  }

  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  init()
  animate()
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  controls?.dispose()
  // CSS3DRenderer 没有 dispose 方法，只需移除 DOM
  const domEl = renderer?.domElement
  if (domEl && domEl.parentNode) domEl.parentNode.removeChild(domEl)
  // Remove CSS3D elements
  objects.forEach(obj => {
    if (obj.element?.parentNode) obj.element.parentNode.removeChild(obj.element)
  })
})
</script>

<template>
  <div class="page">
    <InfoPanel>
      <template #header>
        <h2>🧪 CSS3D 渲染</h2>
        <p><strong>核心原理：</strong>使用 Three.js CSS3DRenderer 将 HTML 元素渲染到 3D 空间，通过 CSS3DObject 将 DOM 元素映射为 3D 物体，支持轨道交互与布局动画。</p>
      </template>
      <div class="features">
        <span>✓ CSS3DRenderer — HTML 元素的 3D 渲染器</span>
        <span>✓ CSS3DObject — 将 DOM 元素包裹为 3D 物体</span>
        <span>✓ TrackballControls — 自由轨道控制</span>
        <span>✓ TWEEN — 平滑布局过渡动画</span>
      </div>
      <div class="controls-row" style="margin-top:0.4rem;">
        <button
          v-for="(info, key) in css3dModels"
          :key="key"
          class="btn"
          :class="{ active: currentModel === key }"
          @click="currentModel = key"
        >{{ info.name }}</button>
      </div>
      <p class="hint">🖱 鼠标拖拽旋转 · 滚轮缩放</p>
    </InfoPanel>

    <ControlPanel :fps="fps" :memory="memory" :objectCount="objects.length" @togglePlay="onTogglePlay" @updateSpeed="onUpdateSpeed">
      <template #extra>
        <div class="section">
          <div class="section-title">🎯 布局切换</div>
          <div class="layout-row">
            <button
              v-for="(label, key) in layoutLabels"
              :key="key"
              class="layout-btn"
              :class="{ active: currentLayout === key }"
              @click="switchLayout(key)"
            >{{ label }}</button>
          </div>
        </div>
      </template>
    </ControlPanel>

    <div ref="containerRef" class="canvas-container"></div>
  </div>
</template>

<style>
/* Global styles for CSS3D elements (need to be unscoped) */
.element {
  width: 120px;
  height: 160px;
  box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
  border: 1px solid rgba(127, 255, 255, 0.25);
  font-family: Helvetica, sans-serif;
  text-align: center;
  line-height: normal;
  cursor: default;
}
.element:hover {
  box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.75);
  border: 1px solid rgba(127, 255, 255, 0.75);
}
.element .number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 12px;
  color: rgba(127, 255, 255, 0.75);
}
.element .symbol {
  position: absolute;
  top: 40px;
  left: 0px;
  right: 0px;
  font-size: 60px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.95);
}
.element .details {
  position: absolute;
  bottom: 15px;
  left: 0px;
  right: 0px;
  font-size: 12px;
  color: rgba(127, 255, 255, 0.75);
}
</style>

<style scoped>
.page { display: flex; flex-direction: column; height: 100vh; background: #0a0a1a; }
.canvas-container { width: 100%; height: 100%; position: relative; }
</style>

import * as THREE from 'three'

/**
 * Build vertex/index data for a cylinder oriented from start to end.
 */
function buildCylinder(start, end, radius, seg) {
  const dir = new THREE.Vector3().copy(end).sub(start)
  const len = dir.length()
  if (len < 1e-6) return null
  dir.normalize()

  const up = Math.abs(dir.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const right = new THREE.Vector3().crossVectors(dir, up).normalize()
  const localUp = new THREE.Vector3().crossVectors(right, dir).normalize()

  const verts = []
  const idx = []

  for (let ring = 0; ring < 2; ring++) {
    const center = ring === 0 ? start : end
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2
      const off = right.clone().multiplyScalar(Math.cos(a) * radius)
        .add(localUp.clone().multiplyScalar(Math.sin(a) * radius))
      const v = center.clone().add(off)
      verts.push(v.x, v.y, v.z)
    }
  }

  for (let i = 0; i < seg; i++) {
    const a = i, b = (i + 1) % seg
    const c = seg + a, d = seg + b
    idx.push(a, c, b, b, c, d)
  }

  return { verts, idx, count: seg * 2 }
}

export class LSystem {
  constructor(axiom, rules, angle, length, iterations = 4, leafLength) {
    this.axiom = axiom
    this.rules = rules
    this.angle = (angle * Math.PI) / 180
    this.length = length
    this.iterations = iterations
    this.leafLength = leafLength != null ? leafLength : length * 0.4
  }

  generate() {
    let result = this.axiom
    for (let i = 0; i < this.iterations; i++) {
      let next = ''
      for (const char of result) {
        next += this.rules[char] || char
      }
      result = next
    }
    return result
  }

  /**
   * Return all segments as {start, end, dir} objects.
   */
  buildSegments() {
    const instructions = this.generate()
    const segments = []
    const stack = []
    let pos = new THREE.Vector3(0, 0, 0)
    let dir = new THREE.Vector3(0, 1, 0)

    for (const char of instructions) {
      switch (char) {
        case 'F': {
          const next = pos.clone().add(dir.clone().multiplyScalar(this.length))
          segments.push({ start: pos.clone(), end: next.clone(), dir: dir.clone(), type: 'branch' })
          pos = next
          break
        }
        case 'G': {
          const segLen = this.leafLength != null ? this.leafLength : this.length * 0.4
          const next = pos.clone().add(dir.clone().multiplyScalar(segLen))
          segments.push({ start: pos.clone(), end: next.clone(), dir: dir.clone(), type: 'leaf' })
          pos = next
          break
        }
        case '+':
          dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -this.angle); break
        case '-':
          dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.angle); break
        case '&':
          dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), -this.angle); break
        case '^':
          dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.angle); break
        case '<':
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.angle); break
        case '>':
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle); break
        case '[':
          stack.push({ pos: pos.clone(), dir: dir.clone() }); break
        case ']': {
          const state = stack.pop()
          if (state) { pos = state.pos; dir = state.dir }
          break
        }
      }
    }
    return segments
  }

  /**
   * Build a merged BufferGeometry from individual cylinder segments.
   */
  toGeometry(typeFilter) {
    const segments = this.buildSegments()
    const filtered = typeFilter ? segments.filter(s => s.type === typeFilter) : segments
    if (filtered.length === 0) return new THREE.BufferGeometry()

    const radius = this.length * 0.1
    const allVerts = []
    const allIdx = []
    let offset = 0

    for (const seg of filtered) {
      const cyl = buildCylinder(seg.start, seg.end, radius, 6)
      if (!cyl) continue
      for (const v of cyl.verts) allVerts.push(v)
      for (const i of cyl.idx) allIdx.push(i + offset)
      offset += cyl.count
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(allVerts, 3))
    geo.setIndex(allIdx)
    geo.computeVertexNormals()
    return geo
  }

  /**
   * Build a merged BufferGeometry from the first `count` segments in the array.
   * If `typeFilter` is provided, only segments with that type are included.
   * Used for incremental growth animation and multi-color rendering.
   */
  toGeometryFromSegments(segments, count, typeFilter) {
    let validSegments = segments.slice(0, count)
    if (typeFilter) validSegments = validSegments.filter(s => s.type === typeFilter)
    if (validSegments.length === 0) return new THREE.BufferGeometry()

    const radius = this.length * 0.1
    const allVerts = []
    const allIdx = []
    let offset = 0

    for (const seg of validSegments) {
      const cyl = buildCylinder(seg.start, seg.end, radius, 6)
      if (!cyl) continue
      for (const v of cyl.verts) allVerts.push(v)
      for (const i of cyl.idx) allIdx.push(i + offset)
      offset += cyl.count
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(allVerts, 3))
    geo.setIndex(allIdx)
    geo.computeVertexNormals()
    return geo
  }

  /**
   * Fallback line-based geometry.
   */
  toLineGeometry() {
    const instructions = this.generate()
    const vertices = []
    const stack = []
    let pos = new THREE.Vector3(0, 0, 0)
    let dir = new THREE.Vector3(0, 1, 0)

    vertices.push(pos.x, pos.y, pos.z)

    for (const char of instructions) {
      switch (char) {
        case 'F':
        case 'G': {
          const next = pos.clone().add(dir.clone().multiplyScalar(this.length))
          vertices.push(next.x, next.y, next.z)
          pos = next
          break
        }
        case '+':
          dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), -this.angle); break
        case '-':
          dir.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.angle); break
        case '&':
          dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), -this.angle); break
        case '^':
          dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.angle); break
        case '<':
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), -this.angle); break
        case '>':
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle); break
        case '[':
          stack.push({ pos: pos.clone(), dir: dir.clone() }); break
        case ']': {
          const state = stack.pop()
          if (state) { pos = state.pos; dir = state.dir; vertices.push(pos.x, pos.y, pos.z) }
          break
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    return geo
  }
}

// Preset definitions — 3D branching patterns
export const L_SYSTEM_PRESETS = {
  plant: {
    name: '🌿 植物 (Plant)',
    category: 'plant',
    axiom: 'X',
    rules: { X: 'F[&+X][^-X][&X][^+X]', F: 'FF' },
    angle: 28,
    length: 0.35,
    iterations: 5,
    color: 0x44aa44,
  },
  dragon: {
    name: '🐉 龙曲线 (Dragon Curve)',
    category: 'fractal',
    axiom: 'FX',
    rules: { X: 'X+YF+', Y: '-FX-Y' },
    angle: 90,
    length: 0.5,
    iterations: 8,
    color: 0xff6b6b,
  },
  sierpinski: {
    name: '🔺 谢尔宾斯基 (Sierpinski)',
    category: 'fractal',
    axiom: 'F-G-G',
    rules: { F: 'F-G+F+G-F', G: 'GG' },
    angle: 120,
    length: 0.4,
    iterations: 4,
    color: 0x4fc3f7,
  },
  fractalTree: {
    name: '🌳 分形树 (Fractal Tree)',
    category: 'plant',
    axiom: 'F',
    rules: { F: 'F[&+F][^-F][&F][^+F]F' },
    angle: 22,
    length: 0.3,
    iterations: 5,
    color: 0x8B5E3C,
  },
  koch: {
    name: '❄️ 科赫雪花 (Koch Snowflake)',
    category: 'fractal',
    axiom: 'F++F++F',
    rules: { F: 'F-F++F-F' },
    angle: 60,
    length: 0.3,
    iterations: 4,
    color: 0xe0e0ff,
  },
  barnsley: {
    name: '🌿 蕨类植物 (Barnsley Fern)',
    category: 'plant',
    axiom: 'X',
    rules: { X: 'F[&+X][^-X][&X][^+X]', F: 'FF' },
    angle: 22,
    length: 0.18,
    iterations: 6,
    color: 0x66bb6a,
  },
  hilbert: {
    name: '📐 希尔伯特曲线 (Hilbert Curve)',
    category: 'curve',
    axiom: 'A',
    rules: { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' },
    angle: 90,
    length: 0.35,
    iterations: 4,
    color: 0x4fc3f7,
  },
  gosper: {
    name: '🌀 高斯帕曲线 (Gosper Curve)',
    category: 'curve',
    axiom: 'F',
    rules: { F: 'F+F-F--F-F+F+FF' },
    angle: 60,
    length: 0.35,
    iterations: 3,
    color: 0xce93d8,
  },
  levy: {
    name: '📈 莱维C形曲线 (Levy C Curve)',
    category: 'fractal',
    axiom: 'F',
    rules: { F: '+F--F+' },
    angle: 45,
    length: 0.4,
    iterations: 8,
    color: 0xffd54f,
  },
  hexRing: {
    name: '🔶 六角环 (Hexagonal Ring)',
    category: 'curve',
    axiom: 'F+F+F+F+F+F',
    rules: { F: 'F+F-F-F+F' },
    angle: 60,
    length: 0.3,
    iterations: 3,
    color: 0xba68c8,
  },
  bush: {
    name: '🌾 分形灌木 (Fractal Bush)',
    category: 'plant',
    axiom: 'F',
    rules: { F: 'F[+F]F[-F][F]' },
    angle: 22,
    length: 0.3,
    iterations: 4,
    color: 0x66bb6a,
  },
  complexTree: {
    name: '🌳 3D 巨大茂密大树 (Giant Dense Tree)',
    category: 'plant',
    axiom: 'X',
    rules: { X: 'FFF[&+GGG][<&+GGG][>&+GGG][&+X][<&+X][>&-X]', F: 'FF' },
    angle: 30,
    length: 0.3,
    leafLength: 0.06,
    iterations: 4,
    color: 0x8d6e63,
    leafColor: 0x44cc66,
  },
}

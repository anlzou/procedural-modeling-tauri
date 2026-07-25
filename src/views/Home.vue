<script setup>
import { onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

const router = useRouter()

const SCROLL_KEY = 'home_scroll_top'

function saveScroll() {
  const scrollEl = document.querySelector('.home')
  if (scrollEl) sessionStorage.setItem(SCROLL_KEY, scrollEl.scrollTop)
}

onMounted(() => {
  const saved = sessionStorage.getItem(SCROLL_KEY)
  if (saved) {
    const scrollEl = document.querySelector('.home')
    if (scrollEl) setTimeout(() => { scrollEl.scrollTop = parseInt(saved) }, 0)
  }
})

onBeforeRouteLeave(() => {
  saveScroll()
})

const paths = [
  {
    id: 'sdf-raymarching',
    title: 'SDF + Raymarching',
    desc: '符号距离函数 + 光线步进，在 Fragment Shader 中用数学函数定义形状并渲染',
    icon: '🔮',
    color: '#7c3aed',
  },
  {
    id: 'marching-cubes',
    title: 'Marching Cubes',
    desc: '等值面提取算法，在 3D 网格上采样标量场生成真实 BufferGeometry',
    icon: '🧊',
    color: '#0891b2',
  },
  {
    id: 'parametric',
    title: 'Parametric Geometry',
    desc: '参数化曲面，用数学函数 f(u,v)→(x,y,z) 定义各种经典曲面',
    icon: '🌀',
    color: '#d97706',
  },
  {
    id: 'lsystem',
    title: 'L-System / 分形',
    desc: '字符串重写规则生成递归结构，模拟植物、分形等自然形态',
    icon: '🌿',
    color: '#16a34a',
  },
  {
    id: 'css3d',
    title: 'CSS3D 渲染',
    desc: 'CSS3DRenderer 将 HTML 元素渲染到 3D 空间，支持多种 CSS3D 模型',
    icon: '🧪',
    color: '#06b6d4',
  },
]
</script>

<template>
  <div class="home">
    <header class="hero">
      <h1>🎨 程序化 3D 生成演示</h1>
      <p class="subtitle">基于 Vue 3 + Three.js + Tauri 的桌面端 3D 程序化生成应用</p>
    </header>

    <div class="cards">
      <div
        v-for="p in paths"
        :key="p.id"
        class="card"
        :style="{ '--accent': p.color }"
        @click="router.push(`/${p.id}`)"
      >
        <div class="card-icon">{{ p.icon }}</div>
        <h3>{{ p.title }}</h3>
        <p>{{ p.desc }}</p>
        <div class="card-footer">
          <span class="btn">查看 Demo →</span>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>技术栈：Vue 3 + Vite + Three.js + Tauri 2</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.hero {
  text-align: center;
  margin: 3rem 0 4rem;
}

.hero h1 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #0891b2, #16a34a, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.15rem;
  color: var(--text);
  opacity: 0.8;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  width: 100%;
  flex: 1;
}

.card {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border-color: var(--accent);
}

.card-icon {
  font-size: 2.8rem;
}

.card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-h);
  margin: 0;
}

.card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text);
  flex: 1;
}

.card-footer {
  margin-top: auto;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.card:hover .btn {
  opacity: 1;
}

.footer {
  margin-top: 4rem;
  padding: 1rem;
  color: var(--text);
  opacity: 0.6;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  .hero {
    margin: 1.5rem 0 2rem;
  }
  .hero h1 {
    font-size: 1.8rem;
  }
  .subtitle {
    font-size: 0.95rem;
  }
  .cards {
    gap: 1rem;
  }
  .card {
    padding: 1.25rem 1rem;
  }
  .footer {
    margin-top: 2rem;
  }
}
</style>

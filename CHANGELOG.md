# Changelog

## v0.2.1 (2026-07-25)

### 🚀 新增
- **Wear OS 兼容** — `vite.config.ts` 添加 `build.target: "es2015"`，适配 Chrome 83 WebView
- **README 文档** — 补充 Wear OS 兼容性章节、armv7 构建指南、WebView 远程调试、环境变量统一配置
- **`--target` 多架构说明** — 文档新增参数对比表（单架构 vs 双架构 vs 全架构）

### 🔧 变更（合并自 procedural-modeling-demo）
- **首页滚动记忆** — 离开首页自动保存滚动位置，返回后恢复
- **曲面自动居中** — 参数化曲面根据包围盒自动偏移，所有模型居中显示
- **移除关闭按钮** — 功能面板 / 元素详情弹窗取消关闭按钮，点击外部关闭
- **响应式面板** — 控制面板全滚动布局、信息面板取消固定/滚动分区、功能面板自适应宽度
- **按钮轮廓移除** — 全局移除 `button:focus-visible` 轮廓和触控高亮
- **ParametricGeometry** — 所有曲面自动居中

### 🐛 修复
- **Marching Cubes** — 修复 `edges.indexOf` 引用比较 bug，改用 `edgeIdx` 计数器
- **ControlPanel 样式** — 补充缺失的 CSS 样式（section、slider、过渡动画等）
- **APK 签名** — 修复 `apksigner: command not found`，文档使用完整路径
- **Java 版本** — Gradle 8.x 不兼容 Java 26，需使用 Java 17（`sdk use java 17.0.20-amzn`）

---

## v0.2.0 (2026-07-25)

### 🚀 新增
- **CSS3D 功能面板** — 元素周期表搜索、关键字筛选、呼吸灯高亮动画
- **元素详情弹窗** — 点击元素卡片查看完整信息（分类、电子排布、熔点/沸点等）
- **FeaturePanel 组件** — 通用底部居中功能面板
- **ElementDetail 组件** — 元素详情弹窗组件
- **elementData.js** — 118 种化学元素完整数据及搜索函数

### 🔧 变更
- **CSS3DRenderer 重构** — 集成 FeaturePanel 和 ElementDetail，优化搜索交互
- **README 更新** — 区分开发/发布构建流程，补充详细的 Android 构建文档

### 🐛 修复
- 项目结构优化与 bug 修复

---

## v0.1.0 (2026-07-24)

### 🚀 初始发布
- **Tauri v2 + Vue 3 + TypeScript 项目骨架**
- **5 种程序化生成 Demo：**
  - 🔮 **SDF + Raymarching** — Fragment Shader 光线步进（含 Mandelbulb 分形）
  - 🧊 **Marching Cubes** — 等值面提取（Metaball、Schwarz P、Gyroid、Diamond 晶格）
  - 🌀 **Parametric Geometry** — 参数化曲面（莫比乌斯环、克莱因瓶、超级公式等）
  - 🌿 **L-System / 分形** — 字符串重写规则生成植物、龙曲线等分形结构
  - 🧪 **CSS3D 渲染** — 元素周期表 3D 展示（TABLE/SPHERE/HELIX/GRID 四种布局）
- **控制面板** — FPS/内存监控、光源控制、播放/暂停/调速、面板透明度
- **信息面板** — 各 Demo 原理说明和交互提示
- **路由导航** — Hash 路由 + 返回按钮
- **Android APK 构建** — 完整构建流程和环境配置

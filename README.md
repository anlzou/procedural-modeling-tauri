# Procedural Modeling Tauri

> **程序化建模桌面应用** — 基于 Tauri v2 + Vue 3 + TypeScript 构建的跨平台桌面应用

---

## 📋 项目概览

| 属性 | 值 |
|------|-----|
| **名称** | `procedural-modeling-tauri` |
| **版本** | [`0.2.1`](CHANGELOG.md) |
| **标识符** | `com.anlzou.procedural` |
| **类型** | 跨平台桌面应用 |

---

## 🏗️ 技术栈

| 层面 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Vue 3 (Composition API + `<script setup>`) | ^3.5.13 |
| **构建工具** | Vite | ^8.0.16 |
| **语言 (前端)** | TypeScript / JavaScript | ~6.0.3 |
| **桌面壳层** | Tauri v2 | ^2 |
| **语言 (后端)** | Rust (edition 2021) | — |
| **3D 引擎** | Three.js | ^0.185.1 |
| **路由** | vue-router (Hash 模式) | ^4.6.4 |
| **动画** | @tweenjs/tween.js | ^25.0.0 |
| **包管理** | pnpm | — |

---

## 📁 目录结构

```
procedural-modeling-tauri/
├── index.html                  # 入口 HTML
├── package.json                # 前端依赖配置
├── vite.config.ts              # Vite 构建配置 (port 1420，适配 Tauri HMR)
├── tsconfig.json               # TypeScript 配置
├── pnpm-lock.yaml              # 依赖锁定文件
│
├── src/                        # 前端源码
│   ├── main.ts                 # Vue 应用入口
│   ├── App.vue                 # 根组件 (含导航)
│   ├── style.css               # 全局样式
│   ├── vite-env.d.ts           # 类型声明
│   │
│   ├── router/
│   │   └── index.ts            # vue-router 路由配置
│   │
│   ├── views/                  # 3D 演示页面
│   │   ├── Home.vue            # 首页 (功能卡片导航)
│   │   ├── SDFRaymarching.vue  # SDF + 光线步进
│   │   ├── MarchingCubes.vue   # Marching Cubes 等值面
│   │   ├── ParametricGeometry.vue  # 参数化曲面
│   │   ├── LSystem.vue         # L-System 分形植物
│   │   └── CSS3DRenderer.vue   # CSS3D 渲染
│   │
│   ├── components/             # 共享组件
│   │   ├── ControlPanel.vue    # 控制面板 (FPS/光源/动画)
│   │   ├── InfoPanel.vue       # 信息面板
│   │   ├── FeaturePanel.vue    # 功能面板 (元素搜索)
│   │   └── ElementDetail.vue   # 元素详情弹窗
│   │
│   ├── utils/                  # 工具库
│   │   ├── lsystem.js          # L-System 生成器
│   │   ├── marchingCubes.js    # Marching Cubes 算法
│   │   └── elementData.js      # 118 种化学元素数据
│   │
│   ├── shaders/                # GLSL 着色器
│   │   ├── raymarching.frag    # 光线步进片段着色器
│   │   └── raymarching.vert    # 光线步进顶点着色器
│   │
│   └── assets/                 # 静态资源
│
├── src-tauri/                  # Rust 后端
│   ├── Cargo.toml              # Rust 依赖
│   ├── build.rs                # Tauri 构建脚本
│   ├── tauri.conf.json         # Tauri 窗口/打包配置
│   ├── capabilities/
│   │   └── default.json        # 权限声明
│   ├── src/
│   │   ├── main.rs             # 程序入口
│   │   └── lib.rs              # Tauri 命令定义
│   ├── icons/                  # 应用图标
│   └── gen/                    # 自动生成的平台配置
│
└── public/                     # 公共静态文件
```

---

## 🔧 依赖详解

### 前端依赖

| 包名 | 用途 |
|------|------|
| `vue` ^3.5.13 | 前端 UI 框架 |
| `vue-router` ^4.6.4 | 前端路由 (Hash 模式，适配 Tauri) |
| `three` ^0.185.1 | 3D 渲染引擎 |
| `@tweenjs/tween.js` ^25.0.0 | 补间动画库 (CSS3D 布局切换) |
| `@tauri-apps/api` ^2 | Tauri 前端 IPC 调用库 |
| `@tauri-apps/plugin-opener` ^2 | 打开外部链接插件 |
| `@vitejs/plugin-vue` ^6.0.7 | Vite Vue 插件 |
| `typescript` ~6.0.3 | TypeScript 编译器 |
| `vite` ^8.0.16 | 开发/构建工具 |
| `vue-tsc` ^3.3.5 | Vue TypeScript 类型检查 |
| `@tauri-apps/cli` ^2 | Tauri CLI |

### Rust 后端依赖

| Crate | 用途 |
|-------|------|
| `tauri` 2 | Tauri 框架核心 |
| `tauri-plugin-opener` 2 | 打开外部链接 |
| `serde` 1 (derive) | 序列化/反序列化 |
| `serde_json` 1 | JSON 处理 |
| `tauri-build` 2 | 构建脚本 |

---

## ⚙️ 关键配置

- **Vite 端口**：`1420`（严格端口模式）
- **HMR 端口**：`1421`
- **窗口尺寸**：800 × 600（可通过 `tauri.conf.json` 调整）
- **路由模式**：Hash (createWebHashHistory)，适配 Tauri 文件协议
- **TypeScript**：严格模式已启用
- **Rust 生产编译**：LTO、opt-level=3、strip、panic=abort

---

## 🎯 当前功能状态

### ✅ 已实现
- **Tauri v2 基础架构** — Rust 后端 + Vue 前端 IPC 通信
- **`greet` 命令** — Rust 端 `#[tauri::command]` 示例函数
- **窗口管理** — 主窗口 + opener 插件
- **5 种程序化生成 Demo：**
  - 🔮 **SDF + Raymarching** — 基于 Fragment Shader 的符号距离函数光线步进渲染，含 Mandelbulb 分形
  - 🧊 **Marching Cubes** — 等值面提取算法，支持 Metaball、Schwarz P、Gyroid、Diamond 晶格
  - 🌀 **Parametric Geometry** — 参数化曲面（莫比乌斯环、克莱因瓶、超级公式、波浪曲面等）
  - 🌿 **L-System / 分形** — 字符串重写规则生成植物、龙曲线、谢尔宾斯基等分形结构，支持生长动画
  - 🧪 **CSS3D 渲染** — 元素周期表 3D 展示，支持 TABLE/SPHERE/HELIX/GRID 四种布局切换
- **控制面板** — FPS/内存监控、光源控制、播放/暂停/调速、面板透明度调节
- **信息面板** — 各 Demo 的原理说明和交互提示
- **功能面板** — CSS3D 页面元素搜索、关键字筛选
- **元素详情弹窗** — 点击元素卡片查看完整信息（分类、电子排布、熔点/沸点等）
- **呼吸灯高亮** — 搜索聚焦时元素卡片自动呼吸动画
- **路由导航** — Hash 路由 + 返回按钮
- **首页滚动记忆** — 离开首页自动保存滚动位置，返回后恢复
- **曲面自动居中** — 参数化曲面根据包围盒自动偏移，确保所有模型居中显示
- **无关闭按钮设计** — 功能面板 / 元素详情弹窗移除关闭按钮，点击外部即可关闭（简化交互）
- **响应式面板** — 控制面板全滚动布局（性能监控融入滚动区）、信息面板取消固定/滚动分区、底部功能面板自适应宽度
- **按钮轮廓移除** — 全局移除 `button:focus-visible` 轮廓、去触控高亮

---

## 🚀 开发命令

```bash
# 启动开发模式（前端 + Tauri 桌面窗口）
pnpm tauri dev

# 仅启动前端 Web 开发服务器
pnpm dev

# 构建前端
pnpm build

# 构建 Tauri 桌面应用（Linux/macOS）
pnpm tauri build

# 构建 Tauri 桌面应用（Windows - 需安装 Visual Studio Build Tools）
pnpm tauri build
```

---

## 📱 编译 Android APK

### 前提条件

| 依赖 | 版本要求 | 用途 |
|------|---------|------|
| Android SDK | — | Android 编译工具链 |
| Android NDK | r26+ | Rust 交叉编译到 Android |
| Java / JDK | **17**（推荐 Corretto） | Gradle 构建 |
| Rust Android 目标 | aarch64-linux-android 等 | Rust 交叉编译目标 |

> ⚠️ **JDK 版本注意**：Gradle 8.x **不兼容 Java 26**，请使用 **Java 17 或 21**。建议通过 [sdkman](https://sdkman.io/)（Linux）或手动下载安装。
>
> 💡 sdkman 用户注意：`sdk install java 17.0.20-amzn` 后还需执行 `sdk default java 17.0.20-amzn`，否则新终端会使用最新版（如 Java 26）导致 Gradle 报错 `26.0.1`。

### 环境变量配置

构建 Android APK 需要以下环境变量。推荐写入 `~/.bashrc` 永久生效：

```bash
# ========== Android SDK / NDK ==========
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/26.3.11579264"

# ========== Android 构建工具（apksigner 等）加入 PATH ==========
export PATH="$ANDROID_HOME/build-tools/35.0.0:$PATH"

# ========== Java 17（通过 sdkman 安装后自动设置 JAVA_HOME）==========
# 注意：sdkman 默认启用最新版（如 Java 26），但 Gradle 8.x 不兼容 Java 26
# 必须使用 sdk use 或 sdk default 指定 Java 17
export JAVA_HOME="$HOME/.sdkman/candidates/java/17.0.20-amzn"
export PATH="$JAVA_HOME/bin:$PATH"

# ========== Rust 编译优化（低内存机器建议 1，高性能机器可 2-4）==========
export CARGO_BUILD_JOBS=1
```

> 修改后执行 `source ~/.bashrc` 立即生效。也可在单条命令前临时指定（如 `JAVA_HOME=... CARGO_BUILD_JOBS=1 pnpm tauri android build`）。

### Linux 环境

#### 1. 安装 Android SDK

```bash
# 下载命令行工具
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
unzip cmdline-tools.zip -d ~/Android/Sdk/
mkdir -p ~/Android/Sdk/cmdline-tools/latest
mv ~/Android/Sdk/cmdline-tools/* ~/Android/Sdk/cmdline-tools/latest/ 2>/dev/null || true

# 安装 SDK 组件
~/Android/Sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=~/Android/Sdk \
  "platform-tools" \
  "platforms;android-34" \
  "build-tools;34.0.0" \
  "ndk;26.3.11579264"
```

#### 2. 安装 Java 17（推荐使用 sdkman）

```bash
# 安装 sdkman（如已安装可跳过）
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 安装并切换到 Java 17
sdk install java 17.0.20-amzn
sdk use java 17.0.20-amzn

# 验证
java -version  # 应显示 17.x
```

#### 3. 安装 Rust Android 交叉编译目标

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

#### 4. 构建 APK

```bash
# 查看设备架构，构建对应版本（避免 INSTALL_FAILED_NO_MATCHING_ABIS）
adb shell getprop ro.product.cpu.abi  # 输出示例: armeabi-v7a
```

#### `--target` 参数说明

| 参数 | 产物 | 兼容设备 | 编译时间 |
|------|------|---------|---------|
| `--target aarch64` | **单个 APK**，仅 arm64 | 仅 arm64-v8a 设备（主流手机/平板） | ✅ 快 |
| `--target armv7` | **单个 APK**，仅 armv7 | 仅 armeabi-v7a 设备（旧手机/Wear OS 手表） | ✅ 快 |
| `--target aarch64 armv7` | **一个 APK，双架构** | ✅ arm64 + armv7 都能装 | ⚠️ 较慢 |
| `--target aarch64 armv7 x86_64 i686` | **一个 APK，全架构** | 所有 Android 设备 | 🔴 最慢，内存需求大 |

> 多架构时编译为一个 APK，两个架构的 `.so` 都打包在内，安装时 Android 自动选择匹配的。`--debug` 版输出文件位置不变：`app-universal-debug.apk`。

> 以下命令假设**环境变量已正确配置**（参见上一节），否则请在命令前临时指定：
> `JAVA_HOME="$HOME/.sdkman/candidates/java/17.0.20-amzn" CARGO_BUILD_JOBS=1 pnpm tauri android build ...`

---

#### 开发调试（`--debug` 自动签名，开箱即用）

```bash
# 仅构建 arm64（推荐，节省内存和编译时间）
pnpm tauri android build --target aarch64 --debug

# 构建 armv7（Wear OS 手表等旧设备）
pnpm tauri android build --target armv7 --debug

# 构建后直接安装
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk

# 一行命令：构建 + 安装
pnpm tauri android build --target aarch64 --debug && \
  adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

---

#### 正式发布（Release 版需手动签名）

Release 版 APK 未签名，需用密钥签名后方可安装：

```bash
# 1. 构建 Release APK（仅 arm64）
pnpm tauri android build --target aarch64

# 2. 用 debug 密钥签名（开发测试用）
#    注意：使用完整路径，apksigner 位于 $ANDROID_HOME/build-tools/35.0.0/
$ANDROID_HOME/build-tools/35.0.0/apksigner sign \
  --ks ~/.android/debug.keystore \
  --ks-key-alias androiddebugkey \
  --ks-pass pass:android --key-pass pass:android \
  src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk

# 3. 重命名并安装
mv src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk \
   src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk

# 构建全部 4 个架构（arm64/armv7/x86/x86_64，耗时久、内存需求大）
pnpm tauri android build
```

> **内存不足怎么办？** 使用 `CARGO_BUILD_JOBS=1` 限制并行编译，并只构建 `--target aarch64` 单架构。

---

### Windows 环境

#### 1. 安装 Android SDK

1. 下载 [Android Studio](https://developer.android.com/studio) 并安装
2. 启动 Android Studio，通过 **SDK Manager** 安装：
   - Android SDK Platform 34
   - Android SDK Build-Tools 34
   - Android NDK 26+
3. 记下 SDK 路径（默认 `C:\Users\<用户名>\AppData\Local\Android\Sdk`）

也可通过命令行安装：

```powershell
# 下载命令行工具（Windows）
# 下载地址：https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip
# 解压到 C:\Android\Sdk\cmdline-tools

# 安装 SDK 组件
cmdline-tools\latest\bin\sdkmanager.bat --sdk_root=C:\Android\Sdk `
  "platform-tools" `
  "platforms;android-34" `
  "build-tools;34.0.0" `
  "ndk;26.3.11579264"
```

#### 2. 安装 Java 17

1. 下载 **Java 17 (LTS)** 安装包：
   - [Amazon Corretto 17](https://docs.aws.amazon.com/corretto/latest/corretto-17-ug/downloads-list.html)（推荐）
   - 或 [Oracle JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
2. 安装后设置系统环境变量：
   - `JAVA_HOME` = `C:\Program Files\Amazon Corretto\jdk17.0.x...`
   - 将 `%JAVA_HOME%\bin` 添加到 `PATH`

#### 3. 安装 Rust Android 目标

```powershell
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

#### 4. 构建 APK

```powershell
# 设置环境变量（PowerShell）
$env:ANDROID_HOME = "C:\Android\Sdk"
$env:ANDROID_NDK_HOME = "$env:ANDROID_HOME\ndk\26.3.11579264"
$env:CARGO_BUILD_JOBS = 2

# 构建 APK（仅在 PowerShell 中有效）
pnpm tauri android build
```

> 如果使用 **Git Bash** 或 **CMD**：
>
> ```cmd
> set ANDROID_HOME=C:\Android\Sdk
> set ANDROID_NDK_HOME=C:\Android\Sdk\ndk\26.3.11579264
> set JAVA_HOME=C:\Program Files\Amazon Corretto\jdk17.0.x...
> set CARGO_BUILD_JOBS=2
> set PATH=%PATH%;%ANDROID_HOME%\build-tools\35.0.0
> pnpm tauri android build
> ```

#### 5. 安装到设备

```powershell
# 启用 USB 调试后，连接安卓设备
adb install -r src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-unsigned.apk
```

---

### Wear OS / 旧 WebView 兼容

> ⚠️ **Oppo Watch X 等 Wear OS 手表的 WebView 基于 Chrome 83（2020 年）**，无法解析现代 ES2020+ 语法，导致应用灰屏。

#### vite.config.ts 兼容性配置

`vite.config.ts` 中已设置 `build.target: "es2015"`，将 JS 编译为兼容旧版 WebView 的 ES5 语法：

```ts
build: {
  target: "es2015",
},
```

> 如遇构建问题，可改用 `chrome83` 等具体浏览器版本作为 target。

#### 构建 armv7 架构（Wear OS）

```bash
# 构建 armv7 调试版（Oppo Watch X 等 Wear OS 设备）
JAVA_HOME="$HOME/.sdkman/candidates/java/17.0.20-amzn" \
  CARGO_BUILD_JOBS=1 \
  pnpm tauri android build --target armv7 --debug

# 安装到设备
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

#### 启用 WebView 远程调试

```bash
# 开启 WebView 调试
adb shell "echo 'com.anlzou.procedural:chrome' > /data/local/tmp/webview_debugging"

# 电脑 Chrome 访问 chrome://inspect
# 即可看到手表的 WebView，点击 inspect 查看 Console 错误
```

### 输出文件

构建完成后，APK 和 AAB 文件位于：

```
src-tauri/gen/android/app/build/outputs/
├── apk/universal/release/
│   └── app-universal-release-unsigned.apk   # APK 安装包（未签名）
└── bundle/universalRelease/
    └── app-universal-release.aab            # Android App Bundle（Google Play 格式）
```

> ⚠️ 正式发布前需要对 APK/AAB 进行签名。可使用 Android Studio 的 **Build → Generate Signed Bundle/APK** 或配置 Gradle 签名。

---

## 🖥️ 推荐开发环境

- [VS Code](https://code.visualstudio.com/)
- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

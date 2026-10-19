# Tokamak Explorer · 第二阶段

浏览器本地运行的磁场几何教学工具。React / TypeScript / Vite / Three.js / React Three Fiber / Drei / Tailwind CSS / Vitest。无需后端、付费 API。原有 `../tokamak` Remotion 工程保持独立。

## 启动与检查

Node.js 20.19+ 或 22.12+：

```sh
npm install
npm run dev
npm run test
npm run typecheck
npm run build
```

也可用 pnpm 执行同名脚本。本次环境没有 npm 命令，基线使用脚本对应的 Node 入口，最终通过 pnpm 运行项目脚本。

通常访问 http://127.0.0.1:5173/。核心源文件：`src/model.ts` 数学；`src/Scene.tsx` 三维；`src/main.tsx` 控制与截面；`src/theme.ts` 三维主题，`src/style.css` 界面主题变量；`src/presets.ts` 装置数据。

## 交互

- m、n 输入得到约分后的精确 q；√2、π 保留符号无理数身份；普通数值输入始终 Numeric / Undetermined。
- 播放、暂停、重播、速度（单位：环向圈/s）、进度拖动共同控制轨迹、末端、箭头、绕转计数与 Poincaré 图。
- 修改 q、几何、初始角或追踪圈数后归零并暂停，请点击播放或拖动进度观察新轨迹。
- 三种模式：单线、三条不同起始极向角的线、连续磁面。图层分组提供透明度和叠加开关；磁面强度平滑过渡。
- 几何参数提供滑块及数值输入；恢复按钮返回当前装置预设。非法输入保留上一有效场景。
- 相机支持旋转、缩放、平移，四种预设及复位、双击聚焦，按尺寸平滑调整距离。
- Poincaré 每完成一圈环向记录一次，不计初始点；点的记录数不等于不同位置数。清空后继续前进可继续记录；拖动进度会重新显示对应历史记录。
- 目前包含 EAST、ITER、SPARC、JET、ASDEX Upgrade、KSTAR、JT-60SA 共 7 个真实装置预设。装置切换不修改 q。参数解释与公开链接见右侧“装置参数来源”，详细约定见 [SOURCES.md](SOURCES.md)。

## 模型与限制

沿用 θ=θ₀+φ/q。精确分数 q=m/n 约分后最小周期为 m 圈环向、n 圈极向；完成时显示紫色闭合标记，后续绕转只是重复路径。

R=R₀+r cos(θ+αsinθ)，Z=κr sinθ，α=asin(δ)，r=ρa。x=Rcosφ，y=Rsinφ，z=Z。δ 按顶部内移量 δr 定义，UI 限制 −0.6≤δ≤0.6。几何角近似等同直磁力线角，不是真实 Grad–Shafranov 解或 EFIT 平衡。参考磁面不是真空室，几何中心不是真实磁轴；不模拟磁岛与 Shafranov 位移。

尺寸指标的内外侧和半高度对应外层 a 边界；选定磁面以 r=ρa 单独标示。无理数的有限轨迹不代表已覆盖整个磁面。预设状态按所引资料年代描述，不作当前工程进展断言。

每条轨迹限制 60,000 段，超预算明确拒绝；多线最多三条。完整轨迹缓存，动画改变 Line2 的 instanceCount，曲面 BufferGeometry 随几何变化生成并释放。动画 UI 约 30 Hz；尚未做不同显卡的帧率基准测试。

三维模块延迟加载；当前 UI 脚本约 238 KB、gzip 76 KB，三维分块约 922 KB、gzip 250 KB。总下载体积未显著减少，三维块仍有构建体积提示。

## 验证与截图

原有 10 项测试保留，动画/几何新增 4 项、预设新增 9 项，合计 23 项通过。浏览器实际检查 1920×1080、1366×768、390×844；暂停稳定、进度与截面同步、非法几何保护、相机侧视及复位、ITER 保留 q 均已操作检查。

[最终 1920×1080 截图](screenshots/final-1920x1080.png)；其他关键场景在 `screenshots/`。详见 [QA.md](QA.md)。

## 后续事项

未加入 PNG 图表导出、参数分享、真实平衡数据、自由调节线宽/颜色、自动化浏览器回归套件。当前相机与装置切换为实际浏览器验收，未纳入 Vitest 的 DOM/WebGL 测试。未进入第三阶段。


## 后续开发

稳定 TypeScript 入口为 src/api.ts；扩展约定见 [EXTENDING.md](EXTENDING.md)。GitHub Actions 会检查测试、类型和构建。仅提交网页项目本身，不包含相邻 Remotion 工程、依赖和构建缓存。


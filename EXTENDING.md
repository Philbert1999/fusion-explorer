# 扩展接口与后续优化

项目暂不需要后端。可复用的 TypeScript 入口为 `src/api.ts`，现有计算保持同步纯函数，便于以后放进 Web Worker 或独立分析工具。

## 数学接口

```ts
import { rational, trace, poincare, DEFAULT_GEOMETRY } from './src/api';
import type { Geometry, Q } from './src/api';

const geometry: Geometry = { ...DEFAULT_GEOMETRY, kappa: 1.8, delta: 0.4 };
const q: Q = rational(3, 2);
const samples = trace(geometry, q, 3, 0);
const crossings = poincare(geometry, q, 3, 0);
```

- 长度单位 m，角度单位 rad，绕转单位为环向圈。
- `section(g, theta, r?)` 返回 `[R,Z]`，默认 r=ρa。
- `point(g, phi, theta)` 返回 `[x,y,z]`，z 为竖直方向。
- `trace(g,q,turns,theta0)` 返回 `{phi,theta,xyz}[]`；非法参数或超过每条 60,000 段预算时抛错，调用方应保留上一有效场景。
- `poincare(g,q,turns,theta0)` 返回每个完整环向圈的 `{turn,theta,rz,xyz}`；不含初始点，不去重。使用前应通过轨迹输入校验。
- `progressTurns(progress,turns)` 与 `hasClosed(q,progress,turns)` 让二维、三维和闭合说明使用同一进度。
- `Q` 保留精确有理数、符号无理数和普通数值三种身份，导入/分享时不得丢失此身份或通过误差阈值推断闭合。

## 新增装置

向 `src/presets.ts` 的 `Preset[]` 增加条目，下拉框自动显示。填写地域、状态所依据的年代、设计版本、曲面定义、公开来源及教学默认值说明。切换装置不修改 q。新增尺寸若超出 UI 范围，应同时更新 `main.tsx` 的 fields 边界并检查相机视野。

## 三维、主题与性能

- `Scene.tsx` 的 Props 定义几何、q、总圈数、起始角、进度、模式、图层与相机输入。渲染层不拥有第二份播放进度。
- 场景色彩在 `theme.ts`，界面色彩在 `style.css` 顶层变量；统一修改这两个入口。
- `GrowingLine` 缓存完整点列，通过 instanceCount 显示前缀；不要在动画帧里重新生成全轨迹。
- 下一步可将播放面板与图表拆成组件，或把采样移入 Worker；以实际性能测量决定，不提前搭建框架。

## 未来 EFIT 接入

当前 `section/point` 是轴对称 Miller-like 教学映射。真实 EFIT 输入还需要网格、坐标与单位、磁通标记、磁轴及 q 剖面等信息，并可能需要数值积分的磁力线跟踪，不能只把数组传给当前 `trace`。届时单独加入经过校验的导入模块与平衡数据类型，保留当前教学模型作为独立选项；使用同一渲染和播放输入形状前先完成物理定义与测试。

## 验证

修改数学约定时同步更新核心测试、二维截面和三维曲面。提交前运行 `npm run test`、`npm run typecheck`、`npm run build`，并以 1920×1080、1366×768 和窄屏检查交互。公开上传时不要提交本机凭据、`.env`、依赖缓存或临时调试文件。

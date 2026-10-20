import PrinciplePage from "./PrinciplePage";
import FusionIntro from "./FusionIntro";
import ConfinementLesson from "./ConfinementLesson";
import DirectionLesson from "./DirectionLesson";
import DevicePrinciples from "./DevicePrinciples";
import InstabilityLab from "./InstabilityLab";
import PlaybackDuration from "./PlaybackDuration";
import { advanceProgress } from "./playback";
import DriftView from "./DriftView";
import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { devices, deviceBounds } from "./devices";
import { deviceFactsChecked, formatDevicePower } from "./deviceFacts";
import Torus from "./Torus";
import StellaratorLesson from "./StellaratorLesson";
import { type Geometry, point, TAU } from "./model";
import { Camera, GrowingLine } from "./Scene";
import { drifts, orbit } from "./particles";
import { theme } from "./theme";

const colors = [
  "#8db5e2",
  "#b4a3ec",
  "#80cbbb",
  "#dcacd0",
  "#aebdd7",
  "#91c6e8",
  "#c4c7ef",
];
function Lights() {
  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[4, -8, 15]} intensity={2.4} />
      <directionalLight
        position={[-8, 5, 6]}
        intensity={1.8}
        color={theme.accent}
      />
    </>
  );
}
function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="lab-slider">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = +e.target.value;
          if (e.target.value && Number.isFinite(n) && n >= min && n <= max)
            onChange(n);
        }}
      />
      <input
        aria-label={label + " 滑块"}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
function ComparisonCamera({
  width,
  radius,
  height,
  reset,
}: {
  width: number;
  radius: number;
  height: number;
  reset: number;
}) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height,
      vertical = 2 * (radius * 0.53 + height * 0.85);
    const distance =
      (1.18 * Math.max(width / aspect, vertical)) /
        (2 * Math.tan((21 * Math.PI) / 180)) +
      radius * 0.85;
    camera.position.set(0, -distance * 0.85, distance * 0.53);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, width, radius, height, reset]);
  return <OrbitControls makeDefault />;
}
function Comparison() {
  const [hovered, setHovered] = useState<string | null>(null);
  const typical = ["EAST", "ITER", "Wendelstein 7-X", "LHD"];
  const [selected, setSelected] = useState(typical),
    [reset, setReset] = useState(0),
    [search, setSearch] = useState(""),
    [family, setFamily] = useState("all");
  const visible = devices.filter(
    (p) =>
      (family === "all" || p.family === family) &&
      `${p.name} ${p.region}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  let cursor = 0;
  const items = devices
    .filter((p) => selected.includes(p.name))
    .map((p) => {
      const bounds = deviceBounds(p, true),
        x = cursor + bounds.radius;
      cursor += 2 * bounds.radius + 2;
      return { p, x, bounds, index: devices.indexOf(p) };
    });
  const centre = Math.max(0, cursor - 2) / 2;
  const color = (index: number) => colors[index % colors.length];
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">TOKAMAKS & STELLARATORS · SAME SCALE</p>
          <h1>装置尺寸对比 · 同一把尺子</h1>
          <p>
            {devices.length} 台公开参考：
            {devices.filter((p) => p.family === "tokamak").length} 台托卡马克、
            {devices.filter((p) => p.family === "stellarator").length} 台仿星器
            / 螺旋装置。当前选中 {items.length} 台。
          </p>
        </div>
        <button onClick={() => setReset((n) => n + 1)}>复位视角</button>
      </div>
      <div className="device-toolbar">
        <input
          type="search"
          aria-label="搜索装置或国家"
          placeholder="搜索装置或国家…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="装置类别筛选"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
        >
          <option value="all">全部类别</option>
          <option value="tokamak">托卡马克</option>
          <option value="stellarator">仿星器 / 螺旋装置</option>
        </select>
        <button
          onClick={() =>
            setSelected((s) =>
              Array.from(new Set([...s, ...visible.map((p) => p.name)])),
            )
          }
        >
          选中筛选结果
        </button>
        <button onClick={() => setSelected([])}>清空选择</button>
        <button onClick={() => setSelected(typical)}>典型对比</button>
      </div>
      <div className="device-library">
        {visible.map((p) => (
          <label key={p.name}>
            <input
              type="checkbox"
              checked={selected.includes(p.name)}
              onChange={(e) =>
                setSelected((s) =>
                  e.target.checked
                    ? [...s, p.name]
                    : s.filter((x) => x !== p.name),
                )
              }
            />
            <span>
              {p.name}
              <small>
                {p.family === "stellarator" ? "仿星器 / 螺旋装置" : "托卡马克"}{" "}
                · {p.region}
              </small>
            </span>
          </label>
        ))}
        {!visible.length && <p>没有匹配装置</p>}
      </div>
      <p className="device-model-note">
        仿星器始终显示通用三维扭转示意：R₀、a、场周期数有来源，扭转幅度和截面形状不是实测边界。
        所有装置共用米制坐标。拖动旋转，滚轮缩放；多选时可放大检查。
      </p>
      <div className="lab-canvas compare-canvas">
        {items.length ? (
          <Canvas
            key={reset}
            camera={{ position: [0, -32, 23], up: [0, 0, 1], fov: 42 }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={[theme.background]} />
            <Lights />
            <ComparisonCamera
              width={Math.max(1, cursor - 2)}
              radius={Math.max(...items.map((p) => p.bounds.radius))}
              height={Math.max(...items.map((p) => p.bounds.height))}
              reset={reset}
            />
            <group>
              {items.map(({ p, x, index }) => (
                <group
                  key={p.name}
                  position={[x - centre, 0, 0]}
                  onPointerOver={event => { event.stopPropagation(); setHovered(p.name); }}
                  onPointerOut={() => setHovered(null)}
                >
                  <Torus
                    g={{ ...p.geometry, rho: 1 }}
                    color={color(index)}
                    opacity={1}
                    periods={p.periods}
                  />
                </group>
              ))}
            </group>
          </Canvas>
        ) : (
          <p className="empty-lab">请至少选择一个装置</p>
        )}
        {hovered && selected.includes(hovered) && <div className="device-hover-name" role="status">{hovered}</div>}
        <div className="comparison-legend">
          {items.map(({ p, index }) => (
            <span key={p.name} style={{ color: color(index) }}>
              ● {p.name} · 2(R₀+a)=
              {(2 * (p.geometry.R0 + p.geometry.a)).toFixed(2)} m
            </span>
          ))}
        </div>
      </div>
      <details open className="lab-card device-sources">
        <summary>参数、适用工况与来源 · {items.length} 台</summary>
        <p className="device-power-note">时间与功率资料核查：{deviceFactsChecked}。每项注明加热、聚变输出或电源功率，以及设计 / 系统能力 / 示例放电；不是净发电功率。建造与运行阶段分开列出，运行期间包含停机升级。</p>
        <div className="table-scroll">
          <table className="device-table">
            <thead>
              <tr>
                {[
                  "装置 / 地区",
                  "类型",
                  "建造 / 使用时间",
                  "功率 · 类型与工况",
                  "R₀ / m",
                  "a / m",
                  "κ / δ",
                  "场周期 Nfp",
                  "依据与限制",
                ].map((s) => (
                  <th key={s}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(({ p, index }) => (
                <tr key={p.name}>
                  <td style={{ color: color(index) }}>
                    {p.name}
                    <small>{p.region}</small>
                  </td>
                  <td>
                    {p.family === "stellarator"
                      ? "仿星器/螺旋装置"
                      : "托卡马克"}
                  </td>
                  <td className="device-history">
                    <strong>{p.facts.operation}</strong>
                    {p.facts.construction && <small>{p.facts.construction}</small>}
                    <a href={p.facts.historySource} target="_blank" rel="noreferrer">时间资料 ↗</a>
                  </td>
                  <td className="device-power">
                    {p.facts.power.map(power => <div key={power.label}>
                      <strong>{formatDevicePower(power.mw)}</strong>
                      <span>{power.label}</span>
                      <small>{power.detail}</small>
                      <a href={power.source} target="_blank" rel="noreferrer">功率资料 ↗</a>
                    </div>)}
                  </td>
                  <td>{p.geometry.R0}</td>
                  <td>{p.geometry.a}</td>
                  <td>
                    {p.family === "stellarator"
                      ? "不统一适用"
                      : `${p.geometry.kappa} / ${p.geometry.delta}`}
                  </td>
                  <td>{p.periods ?? "—"}</td>
                  <td>
                    <a href={p.source} target="_blank" rel="noreferrer">
                      {p.version}
                    </a>
                    {p.periodSource && (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={p.periodSource}
                          target="_blank"
                          rel="noreferrer"
                        >
                          场周期依据
                        </a>
                      </>
                    )}
                    <small>
                      {p.status}。{p.definition}。{p.note}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="lab-note">
        目录包含历史装置、设计版本和工况参考，非全球完整清单或实时状态库。比较等离子体参考尺寸，不是真空室、线圈或
        CAD；“三维形状示意”不能代替真实 VMEC / EFIT
        平衡。装置比较不改变磁力线页的 q。
      </p>
      <DevicePrinciples />
    </>
  );
}
function DriftLab() {
  const [energy, setEnergy] = useState(10),
    [pitch, setPitch] = useState(45),
    [B, setB] = useState(2),
    [electric, setElectric] = useState(800);
  const [enabled, setEnabled] = useState([true, true, true]);
  const p = drifts(energy, pitch, B, 3.6, electric),
    n = drifts(energy, pitch, B, 3.6, electric, -1);
  const names = ["梯度 B 漂移", "曲率漂移", "E × B 漂移"],
    values = Object.values(p);
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">LOCAL DRIFT LAB</p>
          <h1>同一磁场，三种漂移</h1>
          <p>
            左侧看环面中的运动，右侧看局部截面。先试「只看
            E×B」，再试两种磁漂移。
          </p>
        </div>
      </div>
      <div className="drift-layout">
        <section className="lab-card">
          <h2>先选一种机制</h2>
          <div className="drift-presets">
            {["只看梯度 B", "只看曲率", "只看 E×B", "三种叠加"].map(
              (name, i) => (
                <button
                  key={name}
                  className={
                    enabled.every((v, j) => v === (i === 3 || i === j))
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setEnabled([0, 1, 2].map((j) => i === 3 || i === j));
                    setElectric(i >= 2 ? 800 : 0);
                    setPitch(i === 0 ? 75 : i === 1 ? 15 : 45);
                  }}
                >
                  {name}
                </button>
              ),
            )}
          </div>
          <h3>控制条件</h3>
          <Slider
            label="能量 / keV"
            value={energy}
            min={1}
            max={100}
            onChange={setEnergy}
          />
          <Slider
            label="俯仰角 / °"
            value={pitch}
            min={5}
            max={85}
            onChange={setPitch}
          />
          <Slider label="磁场 / T" value={B} min={1} max={5} onChange={setB} />
          <Slider
            label="径向电场 / V·m⁻¹"
            value={electric}
            min={-1000}
            max={1000}
            onChange={setElectric}
          />
          <p>
            俯仰角是速度与磁场的夹角。正负试验电荷质量相同；负电荷并非实际电子。
          </p>
        </section>
        <section className="lab-card">
          <h2>看场方向，再看粒子往哪里走</h2>
          <p className="drift-insight" role="status">
            {!enabled.some(Boolean)
              ? "所有漂移贡献已关闭，粒子只沿环向前进。"
              : enabled[2] && !enabled[0] && !enabled[1]
                ? electric === 0
                  ? "电场为零，E×B 漂移也为零。"
                  : `E ${electric > 0 ? "向外" : "向内"}，B 指向截面屏幕内：正负电荷一起${electric > 0 ? "上移" : "下移"}。`
                : !enabled[2]
                  ? "磁漂移随电荷反向：+e 向上，−e 向下。两者均沿 +φ 前进。"
                  : "磁漂移使正负电荷反向；E×B 再给两者叠加同向分量。"}
          </p>
          <DriftView
            energy={energy}
            pitch={pitch}
            electric={electric}
            positive={values.reduce(
              (sum, v, i) => sum + (enabled[i] ? v : 0),
              0,
            )}
            negative={Object.values(n).reduce(
              (sum, v, i) => sum + (enabled[i] ? v : 0),
              0,
            )}
          />
          <table className="device-table">
            <thead>
              <tr>
                <th>贡献</th>
                <th>+e / m·s⁻¹</th>
                <th>−e / m·s⁻¹</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name, i) => (
                <tr key={name}>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={enabled[i]}
                        onChange={() =>
                          setEnabled((s) => s.map((v, j) => (j === i ? !v : v)))
                        }
                      />{" "}
                      {name}
                    </label>
                  </td>
                  <td>{values[i].toFixed(1)}</td>
                  <td>{Object.values(n)[i].toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <details className="lab-card drift-formulas">
        <summary>为什么方向不同？ · 展开公式</summary>
        <div className="formula-row">
          <span>v∇B = μ B × ∇B / (Q B²)</span>
          <span>vκ = m v∥² b × κ / (Q B)</span>
          <span>vE = E × B / B²</span>
        </div>
        <p>
          磁漂移随电荷符号反向，E × B
          漂移不依赖电荷和质量。这是局部机制分解，不代表完整托卡马克中的无界垂直运动；全局约束轨道请看「粒子轨道」。
        </p>
        <a
          href="https://farside.ph.utexas.edu/teaching/plasma/Plasma/node18.html"
          target="_blank"
          rel="noreferrer"
        >
          物理依据：UT Austin · Magnetic Drifts
        </a>
      </details>
    </>
  );
}
const particleGeometry: Geometry = {
  R0: 3,
  a: 1,
  rho: 0.6,
  kappa: 1,
  delta: 0,
};
function ParticleLab() {
  const [energy, setEnergy] = useState(100),
    [pitch, setPitch] = useState(75),
    [duration, setDuration] = useState(150),
    [progress, setProgress] = useState(1),
    [playing, setPlaying] = useState(false),
    [reset, setReset] = useState(0);
  const result = useMemo(
    () => orbit(energy, pitch, duration),
    [energy, pitch, duration],
  );
  useEffect(() => {
    setProgress(1);
    setPlaying(false);
  }, [result]);
  useEffect(() => {
    if (!playing) return;
    let id = 0,
      last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setProgress((p) => advanceProgress(p, dt, duration / 30));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, duration]);
  useEffect(() => {
    if (progress >= 1) setPlaying(false);
  }, [progress]);
  const count = Math.max(
      1,
      Math.floor(progress * (result.points.length - 1)) + 1,
    ),
    visible = result.points.slice(0, count),
    end = visible.at(-1)!;
  const sectionPath = visible
    .map(
      (p, i) => `${i ? "L" : "M"}${160 + (p.R - 3) * 120},${155 - p.Z * 120}`,
    )
    .join(" ");
  const parallelScale = Math.max(
    ...result.points.map((p) => Math.abs(p.parallel)),
  );
  const velocityPath = result.points
    .filter((_, i) => i % 12 === 0)
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${30 + (p.t / (duration * 1e-6)) * 310},${90 - (p.parallel / parallelScale) * 65}`,
    )
    .join(" ");
  const reference = Array.from({ length: 181 }, (_, i) =>
    point(particleGeometry, (i / 180) * TAU, 0),
  );
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">GUIDING CENTRE · NOT A FIELD LINE</p>
          <h1>通行粒子与被俘获粒子</h1>
          <p>被俘获粒子在磁镜点反弹，导引中心在 R–Z 投影形成香蕉轨道。</p>
        </div>
        <button onClick={() => setReset((n) => n + 1)}>复位视角</button>
      </div>
      <div className="particle-layout">
        <section className="lab-card particle-controls">
          <h2>氘离子 · +e</h2>
          <div className="lab-buttons">
            <button
              className={pitch === 25 ? "active" : ""}
              onClick={() => setPitch(25)}
            >
              通行示例
            </button>
            <button
              className={pitch === 75 ? "active" : ""}
              onClick={() => setPitch(75)}
            >
              香蕉示例
            </button>
          </div>
          <Slider
            label="粒子能量 / keV"
            value={energy}
            min={1}
            max={150}
            onChange={setEnergy}
          />
          <Slider
            label="初始俯仰角 / °"
            value={pitch}
            min={5}
            max={85}
            onChange={setPitch}
          />
          <Slider
            label="积分时长 / μs"
            value={duration}
            min={10}
            max={250}
            onChange={setDuration}
          />
          <h3>
            {result.kind === "trapped"
              ? "被俘获 · Trapped"
              : result.kind === "passing"
                ? "通行 · Passing"
                : "有限追踪 · 尚未判定"}
          </h3>
          <p>
            本次全轨迹检测到 {result.bounces}{" "}
            次平行速度反向。分类依据积分结果，不由按钮名称决定。
          </p>
          <p>
            能量相对误差 {result.error.toExponential(1)}
            <br />
            环向正则动量误差 {result.momentumError.toExponential(1)}
          </p>
          {result.stopped && (
            <p role="alert">轨迹到达 r = a 教学边界，已停止积分。</p>
          )}
          <p>
            固定圆截面：R₀ = 3 m、a = 1 m、B₀ = 2 T、q₀ = 2，初始 r = 0.6
            m。这里的 q₀ 是场模型参数，不是精确磁力线绕转比。
          </p>
        </section>
        <div>
          <div className="lab-canvas particle-canvas">
            <Canvas
              camera={{ position: [7, -9, 7], up: [0, 0, 1], fov: 42 }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={[theme.background]} />
              <Lights />
              <Camera
                g={particleGeometry}
                view="default"
                reset={reset}
                distanceScale={0.8}
              />
              <Torus
                g={particleGeometry}
                color={theme.surface}
                opacity={0.26}
              />
              <Line
                points={reference}
                color="#8797ae"
                lineWidth={1}
                transparent
                opacity={0.35}
              />
              <GrowingLine
                data={result.points}
                progress={progress}
                color={theme.accent}
              />
              <mesh position={end.xyz}>
                <sphereGeometry args={[0.065, 16, 16]} />
                <meshBasicMaterial color={theme.line} />
              </mesh>
            </Canvas>
            <div className="particle-legend">
              紫色：导引中心轨道　灰色：环向参考圈　青色：当前粒子
            </div>
          </div>
          <div className="lab-playback">
            <PlaybackDuration
              context="粒子轨道"
              seconds={duration}
              unit="μs"
              min={10}
              max={250}
              step={10}
              onChange={setDuration}
            />
            <button
              onClick={() => {
                if (progress >= 1) setProgress(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "暂停" : "播放"}
            </button>
            <button
              onClick={() => {
                setProgress(0);
                setPlaying(true);
              }}
            >
              重播
            </button>
            <input
              aria-label="粒子轨道进度"
              type="range"
              min="0"
              max="1"
              step=".001"
              value={progress}
              onChange={(e) => {
                setProgress(+e.target.value);
                setPlaying(false);
              }}
            />
            <span>{(end.t * 1e6).toFixed(1)} μs</span>
          </div>
          <div className="particle-plots">
            <section className="lab-card">
              <h3>R–Z 投影 · 同步轨迹</h3>
              <svg
                viewBox="0 0 360 310"
                role="img"
                aria-label="粒子香蕉轨道截面"
              >
                <circle
                  cx="160"
                  cy="155"
                  r="120"
                  fill="none"
                  stroke="#34445d"
                />
                <circle
                  cx="160"
                  cy="155"
                  r="72"
                  fill="none"
                  stroke="#6583a6"
                  strokeDasharray="4 5"
                />
                <path
                  d={sectionPath}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="2"
                />
                <circle
                  cx={160 + (end.R - 3) * 120}
                  cy={155 - end.Z * 120}
                  r="4"
                  fill={theme.line}
                />
                <text x="150" y="300" fill="#a8bbd2">
                  R₀ = 3 m · → R
                </text>
                <text x="10" y="25" fill="#a8bbd2">
                  ↑ Z
                </text>
              </svg>
            </section>
            <section className="lab-card">
              <h3>平行速度 v∥ · 磁镜反射</h3>
              <svg
                viewBox="0 0 360 200"
                role="img"
                aria-label="平行速度随时间变化"
              >
                <line
                  x1="30"
                  y1="90"
                  x2="340"
                  y2="90"
                  stroke="#65758b"
                  strokeDasharray="4 4"
                />
                <path
                  d={velocityPath}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="2"
                />
                <line
                  x1={30 + (end.t / (duration * 1e-6)) * 310}
                  x2={30 + (end.t / (duration * 1e-6)) * 310}
                  y1="15"
                  y2="170"
                  stroke={theme.line}
                />
                <text x="30" y="190" fill="#a8bbd2">
                  0
                </text>
                <text x="270" y="190" fill="#a8bbd2">
                  {duration} μs
                </text>
                <text x="30" y="15" fill="#a8bbd2">
                  ±{parallelScale.toExponential(1)} m/s
                </text>
              </svg>
              <p>
                速度穿过零点对应磁镜反弹；该图显示整个积分区间，青线标记当前时刻。
              </p>
            </section>
          </div>
        </div>
      </div>
      <p className="lab-note">
        数值积分一阶导引中心方程，平均掉快速回旋，包含磁矩力及磁漂移；不包含碰撞、电场、湍流和真实
        EFIT
        平衡。香蕉外形由运动方程自然产生。演化时长控制实际积分区间，固定推进 30
        μs/播放秒。显示的 μs 仍为物理时间。
      </p>
      <a
        href="https://farside.ph.utexas.edu/teaching/plasma1/Fusionhtml/node27.html"
        target="_blank"
        rel="noreferrer"
      >
        UT Austin · Trapped and Passing Particles
      </a>
    </>
  );
}
export default function Experiments({ mode }: { mode: string }) {
  return (
    <div className="experiments">
      {mode === "fusion-intro" ? (
        <FusionIntro />
      ) : mode === "mirror" || mode === "frc" || mode === "pinch" || mode === "inertial" ? (
        <ConfinementLesson key={mode} kind={mode} />
      ) : mode === "tokamak-principle" ? (
        <PrinciplePage key="tokamak" />
      ) : mode === "stellarator-principle" ? (
        <PrinciplePage key="stellarator" stellar />
      ) : mode === "directions" ? (
        <DirectionLesson />
      ) : mode === "instabilities" ? (
        <InstabilityLab />
      ) : mode === "compare" ? (
        <Comparison />
      ) : mode === "stellarator" ? (
        <StellaratorLesson />
      ) : mode === "drifts" ? (
        <DriftLab />
      ) : (
        <ParticleLab />
      )}
    </div>
  );
}

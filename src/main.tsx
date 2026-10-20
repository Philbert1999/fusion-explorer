import PlaybackDuration from "./PlaybackDuration";
import { advanceProgress } from "./playback";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DEFAULT_GEOMETRY,
  TAU,
  rational,
  qValue,
  closure,
  section,
  trace,
  poincare,
  progressTurns,
  hasClosed,
  type Q,
  type Geometry,
} from "./model";
import "./style.css";
import { presets } from "./presets";
const Experiments = lazy(() => import("./Experiments"));
const Scene = lazy(() => import("./Scene"));
const fields: [keyof Geometry, string, number, number, number][] = [
  ["R0", "大半径 R₀ / m", 0.5, 8, 0.01],
  ["a", "小半径 a / m", 0.1, 3, 0.01],
  ["rho", "归一化半径 ρ", 0.1, 1, 0.01],
  ["kappa", "拉长比 κ", 0.6, 2.5, 0.01],
  ["delta", "三角形变 δ", -0.6, 0.6, 0.01],
];
function Control({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="control">
      <span>{label}</span>
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          if (e.target.value && Number.isFinite(+e.target.value))
            onChange(+e.target.value);
        }}
      />
      <input
        aria-label={label + " 滑块"}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}
function Plot({
  g,
  q,
  current,
  theta,
  clearAt,
  poin = false,
}: {
  g: Geometry;
  q: Q;
  current: number;
  theta: number;
  clearAt: number;
  poin?: boolean;
}) {
  const hits = poincare(g, q, current, theta).filter((p) => p.turn > clearAt),
    scale = 70 / Math.max(g.a, g.kappa * g.a),
    cx = (R: number) => 150 + (R - g.R0) * scale,
    cy = (Z: number) => 100 - Z * scale;
  const path = (r: number) =>
    Array.from({ length: 129 }, (_, i) => section(g, (i / 128) * TAU, r))
      .map(([R, Z]) => `${cx(R)},${cy(Z)}`)
      .join(" ");
  return (
    <>
      <svg
        viewBox="0 0 300 200"
        role="img"
        aria-label={poin ? "Poincaré 截面" : "R-Z 极向截面"}
      >
        <defs>
          <pattern
            id={poin ? "gp" : "gr"}
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <path d="M25 0H0V25" fill="none" className="grid" />
          </pattern>
        </defs>
        <rect width="300" height="200" fill={`url(#${poin ? "gp" : "gr"})`} />
        <path d="M15 100H285 M150 15V180" className="axis" />
        <polyline points={path(g.a)} className="outer" />
        <polyline points={path(g.a * g.rho)} className="contour" />
        {poin ? (
          hits.map((p, i) => (
            <circle
              key={i}
              cx={cx(p.rz[0])}
              cy={cy(p.rz[1])}
              r="3"
              className="hit"
            />
          ))
        ) : (
          <circle cx="150" cy="100" r="3" className="reference" />
        )}
        <text x="263" y="118">
          R / m
        </text>
        <text x="157" y="18">
          Z / m
        </text>
        <text x="112" y="193">
          R₀ = {g.R0.toFixed(2)} m
        </text>
      </svg>
      <p>
        {poin
          ? `${hits.length} 次穿越记录 · 不含起点，重合点叠加`
          : `r = ${(g.a * g.rho).toFixed(2)} m · 虚线为 a 边界`}
      </p>
    </>
  );
}
function App() {
  const [lab, setLab] = useState("fusion-intro");
  const [preset, setPreset] = useState(0);
  const [q, setQ] = useState<Q>(rational(3, 2)),
    [m, setM] = useState("3"),
    [n, setN] = useState("2"),
    [numeric, setNumeric] = useState("1.5"),
    [g, setG] = useState(DEFAULT_GEOMETRY),
    [turns, setTurns] = useState(6),
    [angle, setAngle] = useState(0),
    [error, setError] = useState("");
  const [progress, setProgress] = useState(1),
    [playing, setPlaying] = useState(false),
    [clearAt, setClearAt] = useState(0),
    [mode, setMode] = useState("single"),
    [overlay, setOverlay] = useState(true),
    [opacity, setOpacity] = useState(0.4),
    [view, setView] = useState("default"),
    [reset, setReset] = useState(0);
  const value = qValue(q),
    period = closure(q),
    current = progressTurns(progress, turns),
    theta = (angle * Math.PI) / 180,
    label =
      q.kind === "rational"
        ? `${q.m}/${q.n}`
        : q.kind === "irrational"
          ? q.symbol
          : String(q.value);
  useEffect(() => {
    if (!playing) return;
    let id = 0,
      last = 0;
    const frame = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      if (dt >= 1 / 30) {
        last = now;
        setProgress((p) => advanceProgress(p, dt, turns));
      }
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [playing, turns]);
  useEffect(() => {
    if (progress >= 1) setPlaying(false);
  }, [progress]);
  function accept(
    nextG: Geometry,
    nextQ = q,
    nextTurns = turns,
    nextAngle = angle,
  ) {
    try {
      trace(nextG, nextQ, nextTurns, (nextAngle * Math.PI) / 180);
      setG(nextG);
      setQ(nextQ);
      setTurns(nextTurns);
      setAngle(nextAngle);
      setError("");
      setProgress(0);
      setClearAt(0);
      setPlaying(false);
    } catch (e) {
      setError((e as Error).message + "；保留上一有效模型。");
    }
  }
  function fraction(a: string, b: string) {
    setM(a);
    setN(b);
    try {
      accept(g, rational(+a, +b));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="app">
      <header>
        <strong>
          TOKAMAK <span>EXPLORER</span>
        </strong>
        <span>磁场与粒子实验室</span>
        <nav className="lab-nav" aria-label="实验模式">
          {[
            ["fusion-intro", "核聚变入门"],
            ["mirror", "磁镜原理"],
            ["frc", "FRC 原理"],
            ["pinch", "Z / θ 箍缩"],
            ["inertial", "惯性聚变原理"],
            ["tokamak-principle", "托卡马克原理"],
            ["stellarator-principle", "仿星器原理"],
            ["stellarator", "两种装置的区别"],
            ["compare", "装置对比"],
            ["particles", "粒子轨道"],
            ["drifts", "漂移机制"],
            ["instabilities", "托卡马克中的不稳定性与输运"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={lab === id ? "active" : ""}
              onClick={() => {
                setLab(id);
                setPlaying(false);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      {lab === "field" ? (
        <main>
          <aside className="controls">
            <div className="eyebrow">EXPLORE THE FIELD</div>
            <h2>实验参数</h2>
            <label>
              装置几何 / Device
              <select
                aria-label="装置预设"
                value={preset}
                onChange={(e) => {
                  const i = +e.target.value;
                  setPreset(i);
                  accept(presets[i].geometry);
                  setReset((r) => r + 1);
                }}
              >
                {presets.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <details open>
              <summary>
                磁力线 <small>Field line</small>
              </summary>
              <div className="qdisplay">
                q = {label}
                <small>{value.toFixed(5)}</small>
              </div>
              <label>精确分数 m / n</label>
              <div className="pair">
                <input
                  aria-label="m"
                  type="number"
                  min="1"
                  max="10000"
                  value={m}
                  onChange={(e) => fraction(e.target.value, n)}
                />
                <span>/</span>
                <input
                  aria-label="n"
                  type="number"
                  min="1"
                  max="10000"
                  value={n}
                  onChange={(e) => fraction(m, e.target.value)}
                />
              </div>
              <label>
                数值 q · 不判定有理性
                <input
                  aria-label="数值 q"
                  type="number"
                  min=".05"
                  max="100"
                  step="any"
                  value={numeric}
                  onChange={(e) => {
                    setNumeric(e.target.value);
                    accept(g, { kind: "numeric", value: +e.target.value });
                  }}
                />
              </label>
              <div className="presets">
                {[
                  [1, 1],
                  [3, 2],
                  [2, 1],
                  [5, 3],
                ].map(([a, b]) => (
                  <button
                    key={`${a}/${b}`}
                    onClick={() => {
                      setM("" + a);
                      setN("" + b);
                      accept(g, rational(a, b));
                    }}
                  >
                    {b === 1 ? a : `${a}/${b}`}
                  </button>
                ))}
                {(["√2", "π"] as const).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => accept(g, { kind: "irrational", symbol })}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              <Control
                label="追踪圈数 / 环向"
                value={turns}
                min={1}
                max={100}
                onChange={(v) => {
                  if (Number.isInteger(v)) accept(g, q, v);
                }}
              />
              <Control
                label="初始极向角 / °"
                value={angle}
                min={0}
                max={360}
                onChange={(v) => {
                  if (v >= 0 && v <= 360) accept(g, q, turns, v);
                }}
              />
            </details>
            <details open>
              <summary>
                几何 <small>Surface geometry</small>
              </summary>
              {fields.map(([key, label, min, max, step]) => (
                <Control
                  key={key}
                  label={label}
                  value={g[key]}
                  min={min}
                  max={max}
                  step={step}
                  onChange={(v) => {
                    if (v < min || v > max) {
                      setError(`${label} 范围 ${min}–${max}`);
                      return;
                    }
                    accept({ ...g, [key]: v });
                  }}
                />
              ))}
              <button onClick={() => accept(presets[preset].geometry)}>
                恢复当前预设几何
              </button>
            </details>
            <details>
              <summary>
                图层 <small>Layers</small>
              </summary>
              <Control
                label="磁面透明度"
                value={opacity}
                min={0.05}
                max={0.8}
                step={0.01}
                onChange={(v) => setOpacity(Math.min(0.8, Math.max(0.05, v)))}
              />
              <label>
                <input
                  type="checkbox"
                  checked={overlay}
                  onChange={(e) => setOverlay(e.target.checked)}
                />
                {mode === "surface" ? "叠加磁力线" : "叠加参考磁面"}
              </label>
            </details>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <footer>本地计算 · 教学参数化模型</footer>
          </aside>
          <div className="workspace">
            <div className="scene" onDoubleClick={() => setReset((r) => r + 1)}>
              <div className="sceneTitle">
                <div className="eyebrow">FIELD GEOMETRY / 磁场几何</div>
                <h1>看见磁力线如何绕转</h1>
                <p>环向 φ 沿中央孔洞绕转，极向 θ 绕管道截面。</p>
              </div>
              <div className="modes">
                {[
                  ["single", "单条磁力线"],
                  ["multiple", "多条磁力线"],
                  ["surface", "磁面"],
                ].map(([v, text]) => (
                  <button
                    className={mode === v ? "active" : ""}
                    key={v}
                    onClick={() => setMode(v)}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <Suspense fallback={<p>加载三维场景…</p>}>
                <Scene
                  g={g}
                  q={q}
                  turns={turns}
                  theta={theta}
                  progress={progress}
                  mode={mode}
                  overlay={overlay}
                  opacity={opacity}
                  view={view}
                  reset={reset}
                />
              </Suspense>
              <div className="camera-tools">
                {[
                  ["default", "透视"],
                  ["top", "俯视"],
                  ["side", "侧视"],
                  ["section", "截面"],
                ].map(([v, text]) => (
                  <button
                    key={v}
                    className={view === v ? "active" : ""}
                    onClick={() => {
                      setView(v);
                      setReset((r) => r + 1);
                    }}
                  >
                    {text}
                  </button>
                ))}
                <button
                  aria-label="复位相机"
                  onClick={() => {
                    setView("default");
                    setReset((r) => r + 1);
                  }}
                >
                  复位
                </button>
              </div>
              <div className="legend">
                <span>● 参考磁面</span>
                <span>● 磁力线 / 前进箭头</span>
                <span>● 起点</span>
                {hasClosed(q, progress, turns) && <b>已完成最小闭合周期</b>}
              </div>
              <div className="orbit-help">
                左键旋转 · 滚轮缩放 · 右键平移 · 双击聚焦
              </div>
            </div>
            <div className="playback">
              <button
                aria-label={playing ? "暂停" : "播放"}
                onClick={() => {
                  if (progress >= 1) {
                    setProgress(0);
                    setClearAt(0);
                  }
                  setPlaying(!playing);
                }}
              >
                {playing ? "暂停" : "播放"}
              </button>
              <button
                onClick={() => {
                  setProgress(0);
                  setClearAt(0);
                  setPlaying(true);
                }}
              >
                重播
              </button>
              <input
                aria-label="播放进度"
                type="range"
                min="0"
                max="1"
                step=".001"
                value={progress}
                onChange={(e) => {
                  setProgress(+e.target.value);
                  setClearAt(0);
                }}
              />
              <span>
                {current.toFixed(2)} / {turns} 圈
              </span>
              <PlaybackDuration
                context="磁力线"
                seconds={turns}
                unit="示意秒（1 圈/s）"
                max={100}
                step={1}
                onChange={(v) => {
                  if (Number.isInteger(v)) accept(g, q, v);
                }}
              />
              <small>固定推进 1 圈/s</small>
            </div>
            <div className="plots">
              <article>
                <h3>
                  R–Z 极向截面 <small>φ = 0</small>
                </h3>
                <Plot {...{ g, q, current, theta, clearAt }} />
              </article>
              <article>
                <h3>
                  Poincaré 截面{" "}
                  <button onClick={() => setClearAt(Math.floor(current))}>
                    清空记录
                  </button>
                </h3>
                <Plot {...{ g, q, current, theta, clearAt }} poin />
              </article>
            </div>
          </div>
          <aside className="explanation">
            <div className="eyebrow">UNDERSTAND THE WINDING</div>
            <h2>绕转与闭合</h2>
            <span className="badge">
              {q.kind === "rational"
                ? "Rational Surface"
                : q.kind === "irrational"
                  ? "Irrational Surface"
                  : "Numeric / Undetermined"}
            </span>
            <div className="formula">θ(φ) = θ₀ + φ/q</div>
            <p>q 是每完成一圈极向绕转对应的环向圈数。</p>
            {period ? (
              <>
                <div className="period">
                  <strong>
                    {period.toroidal}
                    <small>圈环向</small>
                  </strong>
                  <span>↗</span>
                  <strong>
                    {period.poloidal}
                    <small>圈极向</small>
                  </strong>
                </div>
                <p>
                  约分后 q = {label}。最小闭合周期为 {period.toroidal} 圈环向与{" "}
                  {period.poloidal}{" "}
                  圈极向。继续追踪会重复路径，不会覆盖新的磁面区域。
                </p>
              </>
            ) : (
              <p>
                {q.kind === "irrational"
                  ? "符号无理数没有精确闭合周期。理想可积模型中轨迹稠密，但有限圈数不等于完整覆盖。"
                  : "有限精度数值输入；不根据浮点近似宣布数学有理性或精确闭合。"}
              </p>
            )}
            <section>
              <h3>
                当前绕转 <small>Winding</small>
              </h3>
              <dl>
                <dt>环向 φ / 2π</dt>
                <dd>{current.toFixed(3)}</dd>
                <dt>极向 Δθ / 2π</dt>
                <dd>{(current / value).toFixed(3)}</dd>
                <dt>最小周期</dt>
                <dd>
                  {hasClosed(q, progress, turns) ? "已完成" : "未完成 / 无判定"}
                </dd>
              </dl>
            </section>
            <section>
              <h3>
                几何指标 <small>Geometry</small>
              </h3>
              <dl>
                <dt>纵横比 R₀/a</dt>
                <dd>{(g.R0 / g.a).toFixed(2)}</dd>
                <dt>外侧 R₀+a</dt>
                <dd>{(g.R0 + g.a).toFixed(2)} m</dd>
                <dt>内侧 R₀−a</dt>
                <dd>{(g.R0 - g.a).toFixed(2)} m</dd>
                <dt>垂直半高度 κa</dt>
                <dd>{(g.kappa * g.a).toFixed(2)} m</dd>
                <dt>当前 r = ρa</dt>
                <dd>{(g.a * g.rho).toFixed(2)} m</dd>
              </dl>
            </section>
            <details>
              <summary>装置参数来源</summary>
              <p>
                {presets[preset].region} · {presets[preset].status}
              </p>
              <p>
                {presets[preset].version}。{presets[preset].definition}。
                {presets[preset].note}
              </p>
              {presets[preset].source && (
                <a
                  href={presets[preset].source}
                  target="_blank"
                  rel="noreferrer"
                >
                  查看公开参数来源 ↗
                </a>
              )}
              <p>切换几何保留 q；真实 q 剖面需要额外平衡数据。</p>
            </details>
            <details open className="note">
              <summary>模型约定</summary>
              <p>
                磁面与磁场处处相切。有理面上的单条闭合线不会填满磁面。参考磁面不是真空室。
              </p>
              <p>
                α = asin(δ)，顶部内移量为
                δr。几何极向角近似等同直磁力线角；不是真实平衡解。R₀
                是几何参考中心，不是真实磁轴。
              </p>
            </details>
          </aside>
        </main>
      ) : (
        <Suspense fallback={<p>加载实验室…</p>}>
          <Experiments mode={lab} />
        </Suspense>
      )}
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        })}
        aria-label="回到网页顶部"
      >
        ↑ 回到顶部
      </button>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);

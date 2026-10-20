import { extraLessons } from "./extraInstabilities";
import InstabilityClassification from "./InstabilityClassification";
import { microLessons, isMicro, microSignal } from "./microinstability";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Camera } from "./Scene";
import Torus from "./Torus";
import PlaybackDuration from "./PlaybackDuration";
import { advanceProgress } from "./playback";
import { point, TAU } from "./model";
import {
  localGeometry as g,
  localPoint,
  diffusionSigma,
  type Mechanism,
} from "./instability";
import { theme } from "./theme";
const lessons = {
  ...microLessons,
  ...extraLessons,
  kink: {
    name: "扭曲模 · Kink",
    watch: "看青色截面一起偏离灰色参考，像软管弯曲；不是粒子在回旋。",
    principle:
      "电流驱动的理想 MHD 模可使等离子体柱整体横向弯曲。理想形变保持磁拓扑；是否失稳取决于电流、压力剖面与边界。",
    formula: "ξR ∝ A cos φ；ξZ ∝ A sin φ",
    limit: "仅规定 n=1 螺旋位移，不计算增长率、稳定阈值或破裂。",
    url: "https://farside.ph.utexas.edu/teaching/plasma1/Fusionhtml/node14.html",
    source: "UT Austin · 理想扭曲模与撕裂模",
  },
  tearing: {
    name: "撕裂模 · Tearing",
    watch: "看局部截面中逐渐变宽的岛状轮廓；多层轮廓沿环向延伸，示意磁岛管。",
    principle:
      "非理想效应允许磁重联，在有理面附近产生磁岛。沿磁场的快速热传输可使岛内温度趋平，影响约束。共振满足 q=m/n。",
    formula: "示例 m/n=2/1，q=2；χ=2θ−φ",
    limit:
      "岛轮廓为椭圆拓扑示意，未求解重联过程；宽度为预设值，非 Rutherford 方程。",
    url: "https://farside.ph.utexas.edu/teaching/plasma/Plasma/node99.html",
    source: "UT Austin · 线性撕裂模推导",
  },
  ballooning: {
    name: "气球模 · Ballooning",
    watch: "看环面外侧的青色网格鼓起，内侧形变较小；颜色不表示温度。",
    principle:
      "压力梯度与不利磁曲率可驱动气球模，扰动常集中在托卡马克外侧。磁力线弯曲的张力起稳定作用。",
    formula: "ξr ∝ A(t) exp[−3(1−cos θ)] cos(6φ−ωt)",
    limit:
      "外侧局域包络仅作示意，不是本征模，不据此判断 β 极限；也不等同所有 ELM。",
    url: "https://nstx.pppl.gov/DragNDrop/Publications_Presentations/Publications/Dissertations/Sabbagh-1990/Sabbagh-Dissertation-1990.pdf",
    source: "PPPL · Kink / Ballooning 理论（论文 PDF）",
  },
  diffusion: {
    name: "扩散输运 · Transport",
    watch:
      "看一小团粒子沿环向移动的同时，在灰色嵌套磁面之间展宽；旁图显示相同的径向分布。",
    principle:
      "输运描述粒子或能量在空间中的净迁移。扩散近似中通量从高密度指向低密度；跨场输运可来自碰撞及湍流，不能只凭单条磁力线判断。",
    formula: "Γr = −D⊥ ∂n/∂r；σ² = σ₀² + 2D⊥t",
    limit:
      "用固定分位点展示一维高斯云展宽；点是分布标记，不是单粒子随机轨道。D 与时间均为归一化示意，未模拟湍流。",
    url: "https://farside.ph.utexas.edu/teaching/plasma/lectures/node56.html",
    source: "UT Austin · 磁化等离子体输运推导",
  },
};
export default function InstabilityLab() {
  const [kind, setKind] = useState<Mechanism>("kink"),
    [progress, setProgress] = useState(0),
    [playing, setPlaying] = useState(true),
    [seconds, setSeconds] = useState(1),
    [reset, setReset] = useState(0);
  useEffect(() => {
    if (!playing) return;
    let id = 0,
      last = performance.now();
    const tick = (now: number) => {
      if (now - last >= 33) {
        const dt = Math.min(now - last, 100) / 1000;
        last = now;
        setProgress((p) => advanceProgress(p, dt, seconds * 10));
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, seconds]);
  useEffect(() => {
    if (progress === 1) setPlaying(false);
  }, [progress]);
  const lesson = lessons[kind],
    sigma = diffusionSigma(progress * seconds);
  const curves = useMemo(() => {
    if (kind === "tearing")
      return Array.from({ length: 13 }, (_, j) =>
        Array.from({ length: 129 }, (_, i) => {
          const u = (TAU * i) / 128,
            phi = -1.3 + j * 0.1;
          return point(
            {
              ...g,
              rho:
                0.65 +
                (0.025 + 0.14 * Math.min(progress * seconds, 1)) * Math.cos(u),
            },
            phi,
            phi / 2 + 0.35 * Math.sin(u),
          );
        }),
      );
    return Array.from({ length: 23 }, (_, j) =>
      Array.from({ length: 129 }, (_, i) => {
        const phi = j < 14 ? -1.3 + (1.2 * i) / 128 : -1.3 + (j - 14) * 0.15,
          theta = j < 14 ? (TAU * j) / 14 : (TAU * i) / 128;
        return localPoint(kind, phi, theta, progress * seconds);
      }),
    );
  }, [kind, progress, seconds]);
  const markers = Array.from({ length: 63 }, (_, i) => {
    const z = [-1.593, -0.967, -0.589, -0.282, 0, 0.282, 0.589, 0.967, 1.593][
        i % 9
      ],
      theta = (Math.floor(i / 9) - 3) * 0.065,
      phi = -1.25 + progress * seconds * 0.95;
    return point({ ...g, rho: 0.6 + z * sigma }, phi, theta);
  });
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">INSTABILITY & TRANSPORT · LOCAL TORUS LAB</p>
          <h1>看见形变，也看见跨磁面的输运</h1>
          <p>
            淡蓝甜甜圈定位整体；前侧高亮一小段。拖动旋转、滚轮缩放，动画时间为归一化教学时间。
          </p>
        </div>
        <button onClick={() => setReset((v) => v + 1)}>复位视角</button>
      </div>
      <div className="instability-layout">
        <section className="lab-card">
          <h2>选择机制</h2>
          <div className="instability-options">
            {(Object.keys(lessons) as Mechanism[]).map((k) => (
              <button
                className={k === kind ? "active" : ""}
                key={k}
                onClick={() => {
                  setKind(k);
                  setProgress(0);
                  setPlaying(true);
                }}
              >
                {lessons[k].name}
              </button>
            ))}
          </div>
          <p>{lesson.watch}</p>
          {isMicro(kind) && (
            <p className="device-model-note">
              局部微结构已放大 · 青：正扰动 /
              橙：负扰动。线条为标量波纹，不是磁力线，也不代表真实回旋半径。
            </p>
          )}
          <p>
            灰色：未扰动参考
            <br />
            青色：形变或岛轮廓
            <br />
            紫色：输运分布标记
          </p>
        </section>
        <div>
          <div className="lab-canvas instability-canvas">
            <Canvas
              camera={{ position: [7, -9, 7], up: [0, 0, 1], fov: 42 }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={[theme.background]} />
              <ambientLight intensity={1.4} />
              <directionalLight position={[4, -6, 10]} intensity={2.6} />
              <Camera g={g} view="default" reset={reset} />
              <Torus g={{ ...g, rho: 1 }} color={theme.surface} opacity={0.2} />
              {kind === "rwm" && (
                <Torus g={{ ...g, rho: 1.25 }} color="#8492a6" opacity={0.08} />
              )}
              {[0.45, 0.65, 0.85].map((rho) => (
                <Line
                  key={rho}
                  points={Array.from({ length: 129 }, (_, i) =>
                    point({ ...g, rho }, -1.3 + (1.2 * i) / 128, 0),
                  )}
                  color="#70859e"
                  lineWidth={1}
                />
              ))}
              {!isMicro(kind) &&
                kind !== "diffusion" &&
                curves.map((c, i) => (
                  <Line key={i} points={c} color={theme.line} lineWidth={1.6} />
                ))}
              {isMicro(kind) &&
                Array.from({ length: 49 }, (_, j) => {
                  const eta = (j - 24) / 48,
                    value = microSignal(
                      kind,
                      -0.7,
                      eta - 0.35,
                      progress * seconds,
                    );
                  return (
                    <Line
                      key={`micro-${j}`}
                      points={Array.from({ length: 65 }, (_, i) => {
                        const phi = -1.3 + (1.2 * i) / 64;
                        return point({ ...g, rho: 0.82 }, phi, eta + phi / 2);
                      })}
                      color={value >= 0 ? "#65e4f2" : "#f1b698"}
                      transparent
                      opacity={Math.abs(value)}
                      lineWidth={2.5}
                    />
                  );
                })}
              {kind === "diffusion" &&
                markers.map((p, i) => (
                  <mesh key={i} position={p}>
                    <sphereGeometry args={[0.032, 8, 8]} />
                    <meshBasicMaterial color={theme.accent} />
                  </mesh>
                ))}
            </Canvas>
          </div>
          <div className="lab-playback">
            <button
              onClick={() => {
                if (progress === 1) setProgress(0);
                setPlaying((v) => !v);
              }}
            >
              {playing ? "暂停演示" : "播放演示"}
            </button>
            <button
              onClick={() => {
                setProgress(0);
                setPlaying(true);
              }}
            >
              重播演示
            </button>
            <PlaybackDuration
              context="不稳定性与输运"
              seconds={seconds}
              min={0.5}
              max={4}
              unit="T"
              onChange={setSeconds}
            />
            <input
              aria-label="机制演示进度"
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
            <span>t/T = {(progress * seconds).toFixed(2)}</span>
          </div>
          <p className="device-model-note">
            教学形变与分布演示 · {lesson.limit}{" "}
            延长时长会延长演化区间；原有形变在 1T
            后规定饱和；ELM/锯齿按规定周期反复，RWM
            缓慢增长趋于饱和，波纹继续传播。
          </p>
        </div>
        <section className="lab-card">
          <h2>{lesson.name}</h2>
          <p className="device-model-note">
            {isMicro(kind)
              ? "微观 · " + (kind === "etg" ? "电子回旋尺度" : "典型离子尺度")
              : kind === "diffusion"
                ? "跨尺度输运 · 不是不稳定性类别"
                : kind === "elm"
                  ? "宏观边缘事件 · 爆发含多尺度细结构"
                  : kind === "sawtooth"
                    ? "宏观芯部事件 · 重联层可很薄"
                    : "宏观 MHD 结构 · 局部层宽可更小"}
          </p>
          <p>{lesson.principle}</p>
          <p className="instability-formula">{lesson.formula}</p>
          <a href={lesson.url} target="_blank" rel="noreferrer">
            {lesson.source} ↗
          </a>
          {kind === "diffusion" && (
            <>
              <h3>径向密度分布 · 同步展宽</h3>
              <svg
                viewBox="0 0 300 180"
                role="img"
                aria-label="扩散高斯分布随归一化时间展宽"
              >
                <line x1="20" y1="150" x2="280" y2="150" stroke="#70859e" />
                {[0.035, sigma].map((s, j) => (
                  <path
                    key={j}
                    d={Array.from({ length: 121 }, (_, i) => {
                      const x = (i - 60) / 200,
                        y = 150 - (4 / s) * Math.exp((-x * x) / (2 * s * s));
                      return `${i ? "L" : "M"}${20 + (i * 260) / 120},${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke={j ? theme.accent : "#70859e"}
                    strokeWidth="2"
                  />
                ))}
                <text x="20" y="174" fill="#b5c5d9">
                  r/a：0.3 → 0.9 · 灰：初始 / 紫：当前
                </text>
              </svg>
              <p>σ/a = {sigma.toFixed(3)}；标记数固定 63，无边界损失模型。</p>
            </>
          )}
          <h3>不稳定性 ≠ 输运</h3>
          <p>
            不稳定性是扰动的增长；输运是粒子和能量的迁移。两者有关联，但并非每次形变都造成同样的损失。
          </p>
        </section>
      </div>
      <InstabilityClassification />
    </>
  );
}

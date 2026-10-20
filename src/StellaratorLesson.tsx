import DevicePrinciples from "./DevicePrinciples";
import PlaybackDuration from "./PlaybackDuration";
import { advanceProgress } from "./playback";
import { useEffect, useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Camera, GrowingLine } from "./Scene";
import Torus from "./Torus";
import { point, TAU, type Geometry } from "./model";
import { driftProjection, stellaratorPoint } from "./stellarator";
import { theme } from "./theme";

const g: Geometry = { R0: 3, a: 0.7, rho: 1, kappa: 1, delta: 0 };
const path = (points: number[][]) =>
  points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
export default function StellaratorLesson() {
  const [magnification, setMagnification] = useState(50),
    [playbackSeconds, setPlaybackSeconds] = useState(2),
    [transform, setTransform] = useState(true),
    [iota, setIota] = useState(0.7),
    [periods, setPeriods] = useState(5),
    [progress, setProgress] = useState(0.2),
    [playing, setPlaying] = useState(true),
    [bias, setBias] = useState(0.02),
    [reset, setReset] = useState(0);
  useEffect(() => {
    if (!playing) return;
    let id = 0,
      last = performance.now();
    const tick = (now: number) => {
      if (now - last >= 33) {
        const dt = Math.min(now - last, 100) / 1000;
        last = now;
        setProgress((p) => advanceProgress(p, dt, playbackSeconds * 6));
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, playbackSeconds]);
  useEffect(() => {
    if (progress === 1) setPlaying(false);
  }, [progress]);
  const panels = useMemo(
    () =>
      [false, true].map((stellar) => {
        const scale = stellar ? 1 : magnification;
        const baseline = [],
          line = [];
        for (let i = 0; i <= 1440; i++) {
          const u = (playbackSeconds * i) / 1440,
            phi = (TAU * u) / iota;
          const theta = Math.PI / 2 + (transform ? TAU * u : 0);
          const offset =
            0.04 * driftProjection(u, transform, bias).displacement;
          const position = (rho: number) =>
            stellar
              ? stellaratorPoint({ ...g, rho }, periods, phi, theta)
              : point({ ...g, rho }, phi, theta);
          baseline.push({ xyz: position(0.7) });
          line.push({ xyz: position(0.7 + scale * offset) });
        }
        return { stellar, scale, baseline, line };
      }),
    [magnification, transform, iota, periods, bias, playbackSeconds],
  );
  const current = driftProjection(playbackSeconds * progress, transform, bias),
    theta = current.phase;
  const xy = [160 + 80 * Math.cos(theta), 142 - 80 * Math.sin(theta)],
    normal = [Math.cos(theta), -Math.sin(theta)];
  const plot = (kind: "pure" | "transform" | "residual") =>
    path(
      Array.from({ length: 201 }, (_, i) => {
        const u = (playbackSeconds * i) / 200,
          value = driftProjection(
            u,
            kind !== "pure",
            kind === "residual" ? bias : 0,
          ).displacement;
        return [45 + (u / playbackSeconds) * 520, 190 - value * 72];
      }),
    );
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">ROTATIONAL TRANSFORM · ORBIT AVERAGING</p>
          <h1>两种装置：都想留住粒子，方法有什么不同？</h1>
          <p>
            粒子不是沿一条线永远不偏离。两种装置都让磁场拧着走，帮助粒子往外、往内的偏移在一段运动后相互抵消；区别在于怎样拧出这个磁场，以及怎样优化粒子走过的路线。
          </p>
        </div>
        <button onClick={() => setReset((n) => n + 1)}>复位视角</button>
      </div>
      <section className="lab-card device-principles"><h2>先用几句话说清楚</h2><p>托卡马克让等离子体中的大电流帮助“拧”磁场；仿星器主要让外部三维线圈完成这件事。两者都想让粒子多绕几圈后留在原来的区域里。</p><p>通行粒子能沿场向前绕；被俘获粒子会在磁场较强的位置掉头，来回弹。托卡马克中常见的香蕉轨道不是仿星器的统一轨道形状；仿星器的三维磁场更复杂，需要优化，让来回弹的粒子不至于每次都朝外偏一点。</p><p>“抵消”指一段运动后向内、向外的偏移尽量相抵，不是每一刻都不漂移。这里两侧使用同一条人为参考漂移，只帮助观察位形与显示倍率；真实粒子轨道并非由这两幅曲面直接算出，数值托卡马克轨道请看第五页。</p></section>
      <div className="stellar-layout">
        <section className="lab-card">
          <h2>① 旋转变换从哪里来</h2>
          <p>
            左侧托卡马克主要靠等离子体电流提供极向场；右侧仿星器可用外部三维线圈产生旋转变换。两侧同步展示。
          </p>
          <label className="lab-slider">
            <span>托卡马克漂移显示倍率</span>
            <input
              aria-label="托卡马克漂移放大倍数"
              type="number"
              min="1"
              max="100"
              value={magnification}
              onChange={(e) => {
                const v = +e.target.value;
                if (v >= 1 && v <= 100) setMagnification(v);
              }}
            />
            <input
              aria-label="托卡马克漂移放大滑块"
              type="range"
              min="1"
              max="100"
              value={magnification}
              onChange={(e) => setMagnification(+e.target.value)}
            />
          </label>
          <div className="lab-buttons">
            <button onClick={() => setMagnification(1)}>同倍率对照</button>
            <button onClick={() => setMagnification(50)}>放大至 ×50</button>
          </div>
          <p>
            两侧采用同一人为参考漂移；左侧默认放大 50 倍，右侧 1
            倍。倍率只改变显示，不能据此比较真实装置性能。
          </p>
          <label>
            <input
              type="checkbox"
              checked={transform}
              onChange={(e) => setTransform(e.target.checked)}
            />{" "}
            启用极向绕转（旋转变换）
          </label>
          <label className="lab-slider">
            <span>示意旋转变换 ι</span>
            <input
              aria-label="示意旋转变换 ι"
              type="number"
              min=".25"
              max="1.5"
              step=".05"
              value={iota}
              disabled={!transform}
              onChange={(e) => {
                const v = +e.target.value;
                if (v >= 0.25 && v <= 1.5) setIota(v);
              }}
            />
            <input
              aria-label="示意旋转变换 ι 滑块"
              type="range"
              min=".25"
              max="1.5"
              step=".05"
              value={iota}
              disabled={!transform}
              onChange={(e) => setIota(+e.target.value)}
            />
          </label>
          <p>
            {transform
              ? `ι = Δθ / Δφ；本教学角约定下 q = 1/ι ≈ ${(1 / iota).toFixed(2)}。`
              : "关闭教学极向绕转：θ 固定，不能由示意曲面推断真实 ι 或 q。"}
          </p>
          {
            <label>
              外形场周期 Nfp
              <select
                aria-label="外形场周期"
                value={periods}
                onChange={(e) => setPeriods(+e.target.value)}
              >
                {[3, 4, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          }
          <p>
            Nfp 是外形重复周期数，不是 q、ι 或 MHD
            模数；扭转外形本身不能保证粒子约束。
          </p>
        </section>
        <div>
          <div className="paired-orbits">
            {panels.map(({ stellar, scale, baseline, line }) => {
              const index = Math.floor(progress * (line.length - 1));
              return (
                <section className="paired-orbit" key={String(stellar)}>
                  <h2>
                    {stellar ? "仿星器" : "托卡马克"}
                    <span>漂移显示 ×{scale}</span>
                  </h2>
                  <div className="lab-canvas stellar-canvas">
                    <Canvas
                      camera={{ position: [7, -9, 7], up: [0, 0, 1], fov: 42 }}
                      dpr={[1, 1.5]}
                    >
                      <color attach="background" args={[theme.background]} />
                      <ambientLight intensity={1.3} />
                      <directionalLight
                        position={[4, -6, 10]}
                        intensity={2.4}
                      />
                      <directionalLight
                        position={[-6, 4, 3]}
                        color={theme.accent}
                        intensity={1.7}
                      />
                      <Camera
                        g={g}
                        view="default"
                        reset={reset}
                        distanceScale={1.05}
                      />
                      <Torus
                        g={g}
                        color={stellar ? "#b0a0d0" : theme.surface}
                        opacity={0.25}
                        periods={stellar ? periods : undefined}
                      />
                      <GrowingLine
                        data={baseline}
                        progress={progress}
                        color="#8595ab"
                      />
                      <GrowingLine
                        data={line}
                        progress={progress}
                        color={theme.line}
                      />
                      <Line
                        points={[baseline[index].xyz, line[index].xyz]}
                        color="#f1b698"
                        lineWidth={3}
                      />
                      <mesh position={line[index].xyz}>
                        <sphereGeometry args={[0.055, 16, 16]} />
                        <meshBasicMaterial color="#fff0de" />
                      </mesh>
                    </Canvas>
                  </div>
                  <p>
                    参考 Δr/a = {(0.04 * current.displacement).toFixed(4)} ·
                    共用进度
                  </p>
                </section>
              );
            })}
          </div>
          <p className="paired-legend">
            灰线：无漂移参考线 · 青线：叠加示意漂移 ·
            橙线：当前显示偏移。可分别拖动旋转；高倍率越出曲面不代表真实粒子损失。
          </p>
          <div className="lab-playback">
            <PlaybackDuration
              context="并排原理"
              seconds={playbackSeconds}
              unit="T"
              max={4}
              min={0.5}
              onChange={setPlaybackSeconds}
            />
            <button
              onClick={() => {
                if (progress === 1) setProgress(0);
                setPlaying((v) => !v);
              }}
            >
              {playing ? "暂停原理动画" : "播放原理动画"}
            </button>
            <input
              aria-label="仿星器原理进度"
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
            <span>{(progress * playbackSeconds).toFixed(2)} T</span>
          </div>
          <div className="lab-card">
            <h2>共同点：让粒子经历磁面的不同方位</h2>
            <p>
              局部 ∇B
              和曲率漂移不会凭空消失。沿磁力线运动会改变粒子所处的方位，也改变漂移相对磁面法向的投影。托卡马克和仿星器都利用旋转变换；并非前者只能上下漂移、后者才会抵消。
            </p>
            <p className="stellar-caution">
              本图构造 θ=θ₀+ιφ，再叠加人为径向偏移（Δr/a = 0.04 ×
              归一化位移）。青线因此不再是磁力线。未由线圈计算
              B，未积分粒子轨道，未导入 VMEC；几何角近似直磁力线角。
            </p>
          </div>
        </div>
        <section className="lab-card">
          <h2>② 向上 ≠ 一直向外</h2>
          <svg
            viewBox="0 0 330 285"
            role="img"
            aria-label="竖直漂移在磁面法向上的投影"
          >
            <defs>
              <marker
                id="stellar-arrow"
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0 0 L6 3 L0 6" fill="context-stroke" />
              </marker>
            </defs>
            <circle cx="160" cy="142" r="80" fill="none" stroke="#6985a5" />
            <circle cx="160" cy="142" r="3" fill="#8496b0" />
            <line
              x1={xy[0]}
              y1={xy[1]}
              x2={xy[0]}
              y2={xy[1] - 45}
              stroke={theme.line}
              strokeWidth="3"
              markerEnd="url(#stellar-arrow)"
            />
            <line
              x1={xy[0]}
              y1={xy[1]}
              x2={xy[0] + 45 * normal[0]}
              y2={xy[1] + 45 * normal[1]}
              stroke="#f1b698"
              strokeWidth="2"
              markerEnd="url(#stellar-arrow)"
            />
            <circle cx={xy[0]} cy={xy[1]} r="5" fill="#fff0de" />
            <text x="15" y="18" fill={theme.line}>
              青色：局部竖直漂移 ↑
            </text>
            <text x="15" y="42" fill="#f1b698">
              橙色：磁面外法向 n
            </text>
            <text x="25" y="270" fill="#a7bad1">
              圆截面投影示意 · → R，↑ Z
            </text>
          </svg>
          <h3>
            {current.radial > 1e-6
              ? "此刻：向外的径向分量"
              : current.radial < -1e-6
                ? "此刻：向内的径向分量"
                : "此刻：径向分量约为零"}
          </h3>
          <p>
            v径向 = v漂移 ·
            n。在圆截面的上半圈，向上的漂移可向外；到了下半圈，同样向上则可向内。
          </p>
          <p>
            该投影演示只解释通行与平均的直觉。真实被俘获粒子不会均匀走遍一圈，仍需单独优化。
          </p>
        </section>
      </div>
      <DevicePrinciples />
      <div className="stellar-bottom">
        <section className="lab-card">
          <h2>③ 被俘获粒子：优化反弹平均径向漂移</h2>
          <div className="stellar-bias">
            <div>
              <p>理想全向性目标：⟨v漂移 · ∇ψ⟩反弹 ≈ 0。</p>
              <p>
                W7-X 走准等动力学路线，HSX
                研究准螺旋对称；这都不是“局部竖直漂移等于零”。
              </p>
              <div className="lab-buttons">
                <button onClick={() => setBias(0.25)}>较大残余示意</button>
                <button onClick={() => setBias(0.02)}>优化后示意</button>
                <button onClick={() => setBias(0)}>理想零平均</button>
              </div>
              <label>
                示意残余偏置 b = {bias.toFixed(2)}
                <input
                  aria-label="示意残余漂移偏置"
                  type="range"
                  min="0"
                  max=".3"
                  step=".01"
                  value={bias}
                  onChange={(e) => setBias(+e.target.value)}
                />
              </label>
              <p className="stellar-caution">
                图线是预设的归一化函数，不是从上方位形算出的轨道或性能。b
                不是装置参数，不能据此比较真实损失率。
              </p>
            </div>
            <svg
              viewBox="0 0 600 250"
              role="img"
              aria-label="径向漂移累积与平均的归一化示意"
            >
              <line x1="45" y1="190" x2="565" y2="190" stroke="#8294aa" />
              <path
                d={plot("pure")}
                fill="none"
                stroke="#8294aa"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <path
                d={plot("transform")}
                fill="none"
                stroke={theme.line}
                strokeWidth="2"
              />
              <path
                d={plot("residual")}
                fill="none"
                stroke={theme.accent}
                strokeWidth="3"
              />
              <line
                x1={45 + progress * 520}
                y1="35"
                x2={45 + progress * 520}
                y2="215"
                stroke="#f1b698"
              />
              <text x="45" y="20" fill="#b5c5d9">
                Δr / (v漂移 T) · 归一化示意
              </text>
              <text x="45" y="238" fill="#b5c5d9">
                0
              </text>
              <text x="520" y="238" fill="#b5c5d9">
                {playbackSeconds} T
              </text>
              <text x="70" y="60" fill="#8294aa">
                灰：持续同向径向分量
              </text>
              <text x="70" y="85" fill={theme.accent}>
                紫：周期项 + 残余 b·t/T
              </text>
              <text x="70" y="110" fill={theme.line}>
                青：零平均的周期项
              </text>
            </svg>
          </div>
        </section>
        <section className="lab-card">
          <h2>优势与代价</h2>
          <p>
            <strong>稳态潜力：</strong>
            主要由外部线圈提供旋转变换，减少对感应式大电流驱动的依赖。
          </p>
          <p>
            <strong>更多优化自由度：</strong>利用三维 B
            的结构，改善镜俘获粒子的平均径向漂移与新古典输运。
          </p>
          <p>
            <strong>代价：</strong>
            三维线圈、装配、维护及偏滤器设计更复杂；未优化三维场可能增加粒子损失。
          </p>
          <p>
            仿星器仍可能有自举电流和 MHD
            不稳定性；并非无条件优于托卡马克。托卡马克也可通过非感应电流驱动追求稳态。
          </p>
          <a
            href="https://www.ipp.mpg.de/14779/stellarator"
            target="_blank"
            rel="noreferrer"
          >
            IPP · Stellarator 原理
          </a>
          <br />
          <a
            href="https://www.pppl.gov/news/2023/scientists-discover-shortcut-aids-design-twisty-fusion-facilities"
            target="_blank"
            rel="noreferrer"
          >
            PPPL · 粒子漂移与仿星器优化
          </a>
          <br />
          <a
            href="https://www.ipp.mpg.de/1528710/READYTOPRINTFacilities080507screen_colour_1.pdf"
            target="_blank"
            rel="noreferrer"
          >
            IPP · W7-X 优化依据
          </a>
        </section>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import MatterMap, { DensityVolumes } from "./MatterMap";
import {
  fusionReactions,
  fusionFrame,
  plasmaDensity,
  type Nucleus,
} from "./fusion";

const positions: [number, number, number][] = [
  [-0.26, 0.23, 0.17],
  [0.26, -0.23, 0.17],
  [0.26, 0.23, -0.17],
  [-0.26, -0.23, -0.17],
  [-0.52, 0, 0], [0.52, 0, 0],
  [0, -0.52, 0], [0, 0.52, 0],
  [0, 0, -0.52], [0, 0, 0.52], [0, 0, 0],
];
function NuclearBall({
  nucleus,
  position,
  angle,
}: {
  nucleus: Nucleus;
  position: [number, number, number];
  angle: number;
}) {
  const count = nucleus.protons + nucleus.neutrons;
  return (
    <group position={position} rotation={[0.3, angle, 0.2]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={count === 1 ? [0, 0, 0] : positions[i]}>
          <sphereGeometry args={[count > 4 ? 0.24 : 0.34, 32, 24]} />
          <meshStandardMaterial
            color={i < nucleus.protons ? "#f49c8f" : "#8bbbe9"}
            roughness={0.26}
            metalness={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}
export default function FusionIntro() {
  const [selected, setSelected] = useState(0),
    [playing, setPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0),
    [duration, setDuration] = useState(12);
  const [ionization, setIonization] = useState(100),
    [density, setDensity] = useState(1);
  const r = fusionReactions[selected],
    f = fusionFrame(seconds),
    d = plasmaDensity(density * 1e20);
  useEffect(() => {
    if (!playing) return;
    let frame: number, previous: number | undefined;
    const tick = (now: number) => {
      if (previous !== undefined) {
        const dt = (now - previous) / 1000;
        setSeconds((t) => Math.min(duration, t + dt));
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);
  useEffect(() => {
    if (seconds >= duration) setPlaying(false);
  }, [seconds, duration]);
  const finished = seconds >= duration;
  const shown = f.fused ? r.products : r.reactants;
  const distance = f.fused ? 0.45 + 3.1 * f.release : 2.9 - 2.45 * f.approach;
  const jumpTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    window.scrollTo({top: window.scrollY + target.getBoundingClientRect().top - headerHeight - 20,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    target.focus({preventScroll: true});
  };
  return (
    <div className="fusion-intro">
      <div className="lab-heading">
        <div>
          <p className="eyebrow">START HERE · 从一颗原子核开始</p>
          <h1>核聚变：小原子核相遇，释放大能量</h1>
          <p>
            太阳靠核聚变发光。我们希望在地球上，把这股能量变成可以使用的电。
          </p>
        </div>
      </div>
      <nav className="intro-contents" aria-label="核聚变入门本页内容">
        <div><strong>小球演示只是开始</strong><span>向下滚动，还有三个互动内容；也可以直接点击跳转。</span></div>
        <div className="intro-contents-links">
          <button onClick={() => jumpTo('intro-plasma')}>等离子体是什么 <span aria-hidden="true">↓</span></button>
          <button onClick={() => jumpTo('intro-states')}>物态温度与密度图 <span aria-hidden="true">↓</span></button>
          <button onClick={() => jumpTo('intro-density')}>燃料到底有多稀薄 <span aria-hidden="true">↓</span></button>
        </div>
      </nav>
      <div className="fusion-layout">
        <section className="lab-card fusion-stage-card">
          <div className="fusion-choices" aria-label="选择核聚变反应">
            {fusionReactions.map((reaction, i) => (
              <button
                key={reaction.label}
                className={selected === i ? "active" : ""}
                aria-pressed={selected === i}
                onClick={() => {
                  setSelected(i);
                  setSeconds(0);
                  setPlaying(true);
                }}
              >
                {reaction.label}
              </button>
            ))}
          </div>
          <div className="fusion-legend">
            <span>
              <i className="proton-dot" />
              质子 · 带正电
            </span>
            <span>
              <i className="neutron-dot" />
              中子 · 不带电
            </span>
            <span>拖动可旋转球模型</span>
          </div>
          <div
            className="fusion-stage"
            role="img"
            aria-label="球形原子核相遇、反应并释放能量的三维演示"
          >
            <Canvas
              camera={{ position: [0, 1.1, 6.5], fov: 30 }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#080f1c"]} />
              <ambientLight intensity={1.4} />
              <directionalLight position={[-3, 4, 6]} intensity={3} />
              <directionalLight
                position={[4, -1, 2]}
                intensity={1}
                color="#9ac7ff"
              />
              {shown.map((nucleus, i) => (
                <NuclearBall
                  key={i}
                  nucleus={nucleus}
                  position={shown.length === 3
                    ? [distance * 0.7 * Math.cos(Math.PI / 2 + i * Math.PI * 2 / 3), distance * 0.7 * Math.sin(Math.PI / 2 + i * Math.PI * 2 / 3), 0]
                    : [i === 0 ? -distance : distance, 0, 0]}
                  angle={(i % 2 ? -1 : 1) * seconds * 0.3}
                />
              ))}
              {f.fused &&
                f.release < 0.98 &&
                [0, 1, 2].map((j) => (
                  <Line
                    key={j}
                    points={Array.from({ length: 129 }, (_, i) => {
                      const a = (i / 128) * Math.PI * 2,
                        radius = 0.65 + f.release * 4.5 + j * 0.18;
                      const wave = 0.06 * Math.sin(a * 12 - f.release * 30 + j);
                      return [
                        (radius + wave) * Math.cos(a),
                        (radius + wave) * Math.sin(a),
                        -0.6 + j * 0.12,
                      ] as [number, number, number];
                    })}
                    color="#ece1c5"
                    lineWidth={1.8}
                    transparent
                    opacity={(1 - f.release) * 0.9}
                  />
                ))}
              <OrbitControls
                enablePan={false}
                minDistance={5}
                maxDistance={14}
              />
            </Canvas>
            <div className="fusion-phase">
              {f.fused ? "形成产物 · 能量释放" : "两个原子核逐渐接近"}
              <small>第 {f.event} 轮</small>
            </div>
            <div className="fusion-names">
              {shown.map((nucleus, i) => <span key={i}>{nucleus.name}</span>)}
            </div>
          </div>
          <div className="fusion-equation" aria-live="polite">
            {r.equation}
          </div>
          <p className="fusion-caption">
            波动光表示释放的能量；能量主要由飞出的产物携带。MeV
            是微观世界的能量单位。
          </p>
          <div className="fusion-playback">
            <button
              onClick={() => {
                if (finished) setSeconds(0);
                setPlaying(finished || !playing);
              }}
            >
              {finished ? "重新播放" : playing ? "暂停" : "播放"}
            </button>
            <button
              onClick={() => {
                setSeconds(0);
                setPlaying(false);
              }}
            >
              回到开始
            </button>
            <input
              aria-label="核聚变演示进度"
              type="range"
              min="0"
              max={duration}
              step=".01"
              value={seconds}
              onChange={(e) => {
                setSeconds(+e.target.value);
                setPlaying(false);
              }}
            />
            <output>
              {seconds.toFixed(1)} / {duration} s
            </output>
          </div>
          <button className="intro-continue" onClick={() => jumpTo('intro-plasma')}>继续了解：等离子体是什么？ ↓</button>
          <label className="fusion-duration">
            演示时长
            <input
              aria-label="核聚变演示时长"
              type="range"
              min="4"
              max="40"
              step="4"
              value={duration}
              onChange={(e) => {
                setDuration(+e.target.value);
                setSeconds((t) => Math.min(t, +e.target.value));
              }}
            />
            <output>
              {duration} 秒 · {duration / 4} 轮
            </output>
          </label>
        </section>
        <aside className="fusion-explainer">
          <section className="lab-card">
            <p className="eyebrow">01 · 什么在聚变？</p>
            <h2>结合的是原子核</h2>
            <p>
              原子核由质子和中子组成。核聚变让较轻的原子核重新组合，形成新的原子核，并释放能量。
            </p>
            <p>{r.intro}</p>
            <div className="fusion-why">
              <h3>为什么需要高温？</h3>
              <p>
                原子核都带正电，会相互推开。高温让它们运动得更快，更有机会靠近并发生聚变；磁场帮助把燃料留住。
              </p>
            </div>
          </section>
          <section className="lab-card fusion-energy">
            <p className="eyebrow">02 · 能量从哪里来？</p>
            <strong>
              {r.energy}
              <small> MeV / 次反应</small>
            </strong>
            <p>
              反应后的总静质量略小，少掉的那一点变成了能量：<b>E = Δmc²</b>。
            </p>
            <div className="fusion-energy-shares">
              {r.products.map((product, i) => (
                <span key={i}>
                  {product.name}
                  {r.shares && <b>{r.shares[i]} MeV</b>}
                </span>
              ))}
            </div>
            {!r.shares && <p>三个 α 粒子共同带走约 8.7 MeV，实际能量分配并不固定相等。</p>}
          </section>
        </aside>
      </div>
      <section id="intro-plasma" tabIndex={-1} className="lab-card plasma-basics">
        <div className="plasma-description">
          <p className="eyebrow">03 · 先认识聚变燃料的状态</p>
          <h2>等离子体：物质的第四态</h2>
          <p>
            除了熟悉的固态、液态和气态，等离子体是物质的第四态。气体获得能量后，电子可以脱离原子，留下带正电的离子；这些自由电荷会一起响应电场和磁场，让它表现出新的性质。
          </p>
          <p>
            拖动滑块，把中性气体逐步变成等离子体。小青点是电子，较大的粉色球是离子。
          </p>
          <label>
            释放电子的原子比例
            <input
              aria-label="电离程度"
              type="range"
              min="0"
              max="100"
              value={ionization}
              onChange={(e) => setIonization(+e.target.value)}
            />
            <output>{ionization}%</output>
          </label>
        </div>
        <div className="plasma-particle-demo">
          <svg
            viewBox="0 0 480 230"
            role="img"
            aria-label="气体电离，电子与离子分离的示意图"
          >
            <defs>
              <radialGradient id="ion-ball" cx="30%" cy="25%">
                <stop stopColor="#ffd6ce" />
                <stop offset="1" stopColor="#ae5d64" />
              </radialGradient>
            </defs>
            {Array.from({ length: 12 }, (_, i) => {
              const x = 55 + (i % 4) * 120,
                y = 58 + Math.floor(i / 4) * 64,
                free = i < Math.round((ionization / 100) * 12);
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={free ? 0 : 20}
                    fill="none"
                    stroke="#4e6483"
                  />
                  <circle cx={x} cy={y} r="10" fill="url(#ion-ball)" />
                  {free && (
                    <text x={x - 4} y={y + 4} fill="#301d2e" fontSize="12">
                      +
                    </text>
                  )}
                  <circle
                    cx={x + (free ? 39 : 18)}
                    cy={y + (free ? -21 : 8)}
                    r="3.6"
                    fill="#65e4f2"
                  />
                </g>
              );
            })}
          </svg>
          <p>
            {ionization === 0
              ? "中性气体：电子仍跟着原子"
              : ionization === 100
                ? "电离后：离子与自由电子共存"
                : "部分电离：中性原子、离子和自由电子共存"}
          </p>
        </div>
      </section>
      <div id="intro-states" tabIndex={-1}><MatterMap fuelMass={d.plasmaMass} /></div>
      <section id="intro-density" tabIndex={-1} className="lab-card plasma-density">
        <p className="eyebrow">05 · 把稀薄程度画给你看</p>
        <h2>比空气稀薄得多的高温燃料</h2>
        <p>
          看同样大小的一立方米：常温空气里有很多分子，而磁约束装置里的高温燃料非常稀薄。
        </p>
        <label>
          燃料离子密度
          <input
            aria-label="聚变燃料离子密度"
            type="range"
            min=".2"
            max="3"
            step=".1"
            value={density}
            onChange={(e) => setDensity(+e.target.value)}
          />
          <output>{density.toFixed(1)} × 10²⁰ 个 / m³</output>
        </label>
        <DensityVolumes numberRatio={d.numberRatio} />
        <div className="density-comparison">
          <div>
            <span>常温空气 · 293 K、1 个大气压</span>
            <strong>
              约 2.5 × 10²⁵<small> 个分子 / m³</small>
            </strong>
            <p>重量约 1.2 kg / m³</p>
          </div>
          <div>
            <span>氘氚等离子体 · 两种燃料各一半</span>
            <strong>
              {density.toFixed(1)} × 10²⁰<small> 个离子 / m³</small>
            </strong>
            <p>重量约 {(d.plasmaMass * 1e6).toFixed(2)} mg / m³</p>
          </div>
        </div>
        <p className="density-takeaway">
          按数量，空气分子约多 <b>{Math.round(d.numberRatio / 1e4)} 万倍</b>
          ；按重量，空气约重 <b>{Math.round(d.massRatio / 1e4)} 万倍</b>。
        </p>
        <p>
          图中比较空气分子与燃料离子的数量；同样的数量，稀薄的燃料需要大得多的空间。拖动滑块，方块大小和上图中的聚变燃料节点会一起变化。
        </p>
      </section>
      <details className="fusion-sources">
        <summary>继续阅读 · 反应、等离子体与密度来源</summary>
        <p><a href="https://doi.org/10.1088/0029-5515/17/1/002" target="_blank" rel="noreferrer">氢硼反应与能量 · Nuclear Fusion ↗</a></p>
        <p>
          <a
            href="https://ukaea.github.io/PROCESS/physics-models/fusion_reactions/plasma_reactions/"
            target="_blank"
            rel="noreferrer"
          >
            UKAEA · 常见聚变反应及能量
          </a>{" "}
          ·{" "}
          <a
            href="https://www.iter.org/fusion-energy/making-it-work"
            target="_blank"
            rel="noreferrer"
          >
            ITER · 怎样实现核聚变
          </a>{" "}
          ·{" "}
          <a
            href="https://www.psfc.mit.edu/resources/fusion-101/what-is-plasma/"
            target="_blank"
            rel="noreferrer"
          >
            MIT · 什么是等离子体
          </a>
        </p>
        <p>
          密度对比采用理想气体空气和可调的典型燃料离子密度；空气平均分子质量
          28.97 u，氘氚离子平均质量约 2.5
          u。球模型展示反应前后组成，四秒为一轮教学动画。
        </p>
      </details>
    </div>
  );
}

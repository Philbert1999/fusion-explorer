import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import PlaybackDuration from "./PlaybackDuration";
import { circle, frcContour, mirrorCondition, mirrorField, mirrorParticle, pulseFrame, type ConfinementKind, type Vec } from "./confinement";

const cyan = "#65e0ed", coral = "#f1a39b", gold = "#eacb91";
const lessons = {
  mirror: {
    title: "磁镜：给磁力线的两端收个口",
    subtitle: "先看一根直管：不把磁场绕成甜甜圈，也能让一部分粒子来回反弹。",
    method: "两端线圈产生更强的磁场，中间较弱，形成一个磁瓶。粒子进入强磁场时，沿磁场向前的运动可以逐渐转为绕磁场打转，最后掉头。",
    motion: "粒子一边绕磁力线转，一边沿管道前进。出发方向足够倾斜的会在两端反弹；几乎顺着磁场冲出去的，会从瓶口漏掉。试着改变出发夹角。",
    challenge: "两端并没有真正封死。处于“漏失锥”方向内的粒子会逃逸，碰撞还会把原来被困住的粒子转进这个方向；端部漏失与不稳定性都需要处理。",
    source: "https://www.llnl.gov/sites/www/files/2020-06/mftf_etr_nov_86.pdf",
    sourceLabel: "LLNL · Principles of Mirror Fusion",
    contrast: "接下来托卡马克的想法是把长管首尾接起来，消除这样的两端开口；但弯曲磁场又带来新的漂移问题。",
  },
  frc: {
    title: "FRC：等离子体自己把内部磁场翻过来",
    subtitle: "FRC 是“场反位形”：外观像一根短圆筒，内部却有闭合的磁场结构。",
    method: "外部线圈先提供沿圆筒轴向的磁场。等离子体中绕轴流动的电流产生另一份磁场，把核心处的磁场方向反转，围出闭合磁力线。",
    motion: "青线显示闭合磁力线，亮点沿线移动帮助你看出方向。真正的离子还会回旋，轨道可能很宽，尤其经过弱磁场区域时，不一定紧贴某一条线。",
    challenge: "这个结构依赖等离子体电流，需要持续加热和维持。它也可能倾斜、旋转变形，并通过外侧开放磁力线区域损失粒子和能量。",
    source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5814458/",
    sourceLabel: "Scientific Reports · FRC 磁场拓扑实验",
    contrast: "FRC 的内部磁场主要在穿过轴线的截面内绕转，中心无需穿过一根线圈柱；它不是缩小版的托卡马克，也不是反场箍缩 RFP。",
  },
  pinch: {
    title: "Z 箍缩与 θ 箍缩：用磁场把燃料往里挤",
    subtitle: "名字取自电流方向。两种方式都会向内压缩，电流和磁场的方向却恰好不同。",
    method: "Z 箍缩：电流沿等离子体柱前进，产生绕柱的磁场。θ 箍缩：外线圈的轴向磁场快速增强，在等离子体中感应出绕柱电流。两者都用 J × B 的力把燃料向内挤。",
    motion: "这里重点观察整团等离子体的压缩，不是把所有粒子画成向内的直线。粒子仍在热运动和回旋；蓝色是磁场，金色是电流，粉色箭头是向内的力。",
    challenge: "Z 箍缩容易像软绳一样弯曲，或像香肠一样忽粗忽细。θ 箍缩也要处理端部漏失、稳定性和脉冲维持；不能把一次挤压等同于长期稳稳关住燃料。",
    source: "https://farside.ph.utexas.edu/teaching/plasma1/Fusionhtml/node11.html",
    sourceLabel: "UT Austin · Linear Pinches",
    contrast: "图里的 z 是直柱的轴向，θ 是绕直柱转一圈的方向。Z 装置还可以用箍缩金属套筒或产生 X 射线，驱动惯性聚变。",
  },
  inertial: {
    title: "惯性约束聚变：在燃料来得及散开前点燃它",
    subtitle: "从巨大磁笼切换到一颗微小燃料球：短时间压得很密、加热得很高。",
    method: "强激光把燃料球外层加热并烧蚀出去，外层向外喷，剩下的燃料受到反作用力向内压缩。惯性让压缩后的燃料在极短时间里来不及完全散开。",
    motion: "燃料先整体向中心运动，形成高密度区域和中心热点；发生聚变后，带电的 α 粒子可继续加热燃料，中子飞出，随后燃料球膨胀解体。",
    challenge: "压缩必须非常均匀，小小凹凸也会在内爆中长大，把冷材料混进热点。还要提高驱动效率、反复制造和注入靶丸，才能走向连续发电。",
    source: "https://heds-center.llnl.gov/research/research-areas/inertial-confinement-fusion",
    sourceLabel: "LLNL · Inertial Confinement Fusion",
    contrast: "直接驱动：激光直接照射燃料球。间接驱动：激光先照热腔壁，产生 X 射线，再由 X 射线照射燃料球；NIF 采用后一种思路。",
  },
} as const;

function Arrow({ from, to, color = cyan }: { from: Vec; to: Vec; color?: string }) {
  const direction = new Vector3(...to).sub(new Vector3(...from));
  return <arrowHelper args={[direction.clone().normalize(), new Vector3(...from), direction.length(), color, 0.16, 0.08]} />;
}
function Dot({ position, color = cyan }: { position: Vec; color?: string }) {
  return <mesh position={position}><sphereGeometry args={[0.075, 20, 16]} /><meshBasicMaterial color={color} /></mesh>;
}
function LessonCamera({ kind }: { kind: ConfinementKind }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const width = kind === "pinch" ? 13 : kind === "inertial" ? 8 : 10;
    const height = kind === "inertial" ? 6.4 : kind === "frc" ? 4.6 : 4;
    const distance = Math.max(width / (size.width / size.height), height) / (2 * Math.tan(21 * Math.PI / 180)) + 0.8;
    camera.position.set(0, distance * 0.26, distance * 0.966);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, kind]);
  return null;
}
function Coil({ x, radius = 1.5 }: { x: number; radius?: number }) {
  return <mesh position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
    <torusGeometry args={[radius, 0.105, 12, 80]} /><meshStandardMaterial color="#a7b9ce" metalness={0.8} roughness={0.24} />
  </mesh>;
}
function Cylinder({ radius, length = 5.6, opacity = 0.18 }: { radius: number; length?: number; opacity?: number }) {
  return <mesh rotation={[0, 0, Math.PI / 2]}>
    <cylinderGeometry args={[radius, radius, length, 64, 1, true]} />
    <meshStandardMaterial color="#a59cda" emissive="#493d78" emissiveIntensity={0.4} transparent opacity={opacity} depthWrite={false} side={2} />
  </mesh>;
}
function Mirror({ seconds, ratio, pitch, coils }: { seconds: number; ratio: number; pitch: number; coils: boolean }) {
  const lines = useMemo(() => Array.from({ length: 8 }, (_, i) => Array.from({ length: 121 }, (_, j): Vec => {
    const x = -4 + j / 120 * 8, a = i * Math.PI / 4;
    const radius = 1.15 / Math.sqrt(mirrorField(x, ratio));
    return [x, radius * Math.cos(a), radius * Math.sin(a)];
  })), [ratio]);
  const trapped = mirrorCondition(ratio, pitch).trapped;
  const position = mirrorParticle(seconds, ratio, pitch);
  const trail = Array.from({ length: 100 }, (_, i) => mirrorParticle(Math.max(0, seconds - 1.1 + i / 99 * 1.1), ratio, pitch));
  return <>
    <Cylinder radius={1.5} length={7} opacity={0.045} />
    {coils && [-3.1, -2.9, 2.9, 3.1].map(x => <Coil key={x} x={x} radius={1.6} />)}
    {lines.map((points, i) => <Line key={i} points={points} color={cyan} lineWidth={1.4} transparent opacity={0.75} />)}
    <Line points={trail} color={trapped ? gold : coral} lineWidth={3} />
    <Dot position={position} color={trapped ? gold : coral} />
    <Arrow from={[-1, 1.7, 0]} to={[1, 1.7, 0]} />
    <Html center position={[0, 1.8, 0]}><span className="confinement-label">磁场 B 沿管道 →</span></Html>
    <Html center position={[-3, -1.4, 0]}><span className="confinement-label">强磁场 · 瓶口</span></Html>
    <Html center position={[3, -1.4, 0]}><span className="confinement-label">强磁场 · 瓶口</span></Html>
    <Html center position={[0, -1.6, 0]}><span className="confinement-label">中间磁场较弱</span></Html>
  </>;
}
function FRC({ seconds, coils }: { seconds: number; coils: boolean }) {
  const contours = useMemo(() => [0, Math.PI / 2, Math.PI, Math.PI * 1.5].flatMap(a => [0.035, 0.12, 0.2].map(flux => frcContour(flux, a))), []);
  const index = Math.floor((seconds * 0.18 % 1) * (contours[1].length - 1));
  return <>
    <mesh scale={[2.8, 1, 1]}><sphereGeometry args={[1, 64, 32]} /><meshStandardMaterial color="#a59cda" transparent opacity={0.14} depthWrite={false} /></mesh>
    {coils && [-3.4, -2, 2, 3.4].map(x => <Coil key={x} x={x} radius={1.65} />)}
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map(a => <Line key={a} points={Array.from({ length: 81 }, (_, i): Vec => {
      const x = -4 + i / 80 * 8, radius = 1.2 + 0.2 * Math.exp(-x * x / 3);
      return [x, radius * Math.cos(a), radius * Math.sin(a)];
    })} color={cyan} transparent opacity={0.4} lineWidth={1} />)}
    {contours.map((points, i) => <Line key={i} points={points} color={cyan} lineWidth={1.5} transparent opacity={0.7} />)}
    <Dot position={contours[1][index]} />
    <Arrow from={[0.7, 0, 0]} to={[-0.7, 0, 0]} color={coral} />
    <Arrow from={[-1, 2, 0]} to={[1, 2, 0]} />
    <Line points={circle(0, Math.SQRT1_2)} color={gold} dashed dashSize={0.08} gapSize={0.06} />
    <Html center position={[0, 1.9, 0]}><span className="confinement-label">外侧磁场 →</span></Html>
    <Html center position={[0, -1.65, 0]}><span className="confinement-label">核心磁场 ← · 方向反转</span></Html>
  </>;
}
function RingArrow({ x, radius, reverse = false, color }: { x: number; radius: number; reverse?: boolean; color: string }) {
  const points = useMemo(() => circle(x, radius, reverse), [x, radius, reverse]);
  return <><Line points={points} color={color} lineWidth={1.8} /><Arrow from={points[15]} to={points[20]} color={color} /></>;
}
function Pinch({ seconds, theta, coils }: { seconds: number; theta: boolean; coils: boolean }) {
  const frame = pulseFrame(seconds);
  const radius = 0.45 + frame.radius * 0.5;
  return <>
    <Cylinder radius={radius} length={4.8} opacity={0.45} />
    {theta && coils && [-2.6, -2.3, 2.3, 2.6].map(x => <Coil key={x} x={x} radius={1.55} />)}
    {theta ? <>
      <Arrow from={[-2.8, 0, 0]} to={[2.8, 0, 0]} />
      {[-0.6, 0.6].map(z => <Arrow key={z} from={[-2.8, 1.15, z]} to={[2.8, 1.15, z]} />)}
      <RingArrow x={0} radius={radius} reverse color={gold} />
    </> : <>
      <Arrow from={[-2.7, 0, 0]} to={[2.7, 0, 0]} color={gold} />
      {[-1.8, 0, 1.8].map(x => <RingArrow key={x} x={x} radius={1.3} color={cyan} />)}
    </>}
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map(a => <Arrow key={a} from={[0, 1.85 * Math.cos(a), 1.85 * Math.sin(a)]} to={[0, 1.05 * Math.cos(a), 1.05 * Math.sin(a)]} color={coral} />)}
  </>;
}
const beamDirections: Vec[] = Array.from({ length: 12 }, (_, i) => {
  const z = 1 - 2 * (i + 0.5) / 12, a = i * 2.399963;
  return [Math.sqrt(1 - z * z) * Math.cos(a), Math.sqrt(1 - z * z) * Math.sin(a), z];
});
function Inertial({ seconds, indirect }: { seconds: number; indirect: boolean }) {
  const f = pulseFrame(seconds);
  return <>
    {indirect && <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[2.3, 2.3, 5.8, 64, 1, true]} /><meshStandardMaterial color="#c9b68b" metalness={0.6} roughness={0.3} transparent opacity={0.12} depthWrite={false} side={2} /></mesh>}
    {f.phase >= 0.12 && f.phase < 0.55 && <>
      {beamDirections.map((v, i) => <Arrow key={i} from={v.map(n => n * (indirect ? 2.1 : 3.2)) as Vec} to={v.map(n => n * f.radius) as Vec} color={indirect ? gold : "#bd99fa"} />)}
      {indirect && [-1, 1].flatMap(side => [-1, 1].map(y => <Line key={`${side}-${y}`} points={[[side * 4, y * 0.4, 0], [side * 1.8, y * 2.1, 0]]} color="#bd99fa" lineWidth={3} />))}
    </>}
    <mesh><sphereGeometry args={[1, 24, 16]} /><meshBasicMaterial color="#a59cda" wireframe transparent opacity={0.12} depthWrite={false} /></mesh>
    <mesh scale={f.radius}><sphereGeometry args={[1, 64, 40]} /><meshStandardMaterial color="#9f9ad2" transparent opacity={0.32} roughness={0.25} side={2} depthWrite={false} /></mesh>
    <mesh scale={f.radius * 0.72}><sphereGeometry args={[1, 48, 32]} /><meshStandardMaterial color={f.burning ? "#fff1cd" : cyan} emissive={f.burning ? "#ffb876" : "#267d91"} emissiveIntensity={f.burning ? 2 : 0.4} /></mesh>
    {f.phase > 0.16 && f.phase < 0.55 && beamDirections.slice(0, 6).map((v, i) => <Arrow key={i} from={v.map(n => n * (f.radius + 0.22)) as Vec} to={v.map(n => n * (f.radius + 0.85)) as Vec} color={coral} />)}
    {f.burning && beamDirections.slice(0, 6).map((v, i) => <Dot key={i} position={v.map(n => n * (0.7 + (f.phase - 0.55) * 12)) as Vec} color={gold} />)}
    <Html center position={[0, -2.6, 0]}><span className="confinement-label">{indirect ? "激光 → 腔壁 → X 射线 → 燃料球" : "激光 → 燃料球外层 → 向内压缩"}</span></Html>
  </>;
}

export default function ConfinementLesson({ kind }: { kind: ConfinementKind }) {
  const lesson = lessons[kind];
  const [seconds, setSeconds] = useState(0), [playing, setPlaying] = useState(true);
  const [duration, setDuration] = useState(18), [reset, setReset] = useState(0);
  const [ratio, setRatio] = useState(4), [pitch, setPitch] = useState(60);
  const [coils, setCoils] = useState(true), [indirect, setIndirect] = useState(false);
  useEffect(() => {
    if (!playing) return;
    let frame: number, previous: number | undefined;
    const tick = (now: number) => {
      if (previous === undefined) previous = now;
      if (now - previous >= 50) {
        const dt = (now - previous) / 1000;
        setSeconds(t => Math.min(duration, t + dt));
        previous = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);
  useEffect(() => { if (seconds >= duration) setPlaying(false); }, [seconds, duration]);
  const condition = mirrorCondition(ratio, pitch), pulse = pulseFrame(seconds);
  return <div className="confinement-lesson">
    <div className="lab-heading"><div><p className="eyebrow">FUSION PATHWAYS · 换一种方式留住燃料</p><h1>{lesson.title}</h1><p>{lesson.subtitle}</p></div></div>
    <div className="confinement-layout">
      <section className="lab-card confinement-visual">
        <div className="confinement-toolbar">
          {kind !== "inertial" && <label><input type="checkbox" checked={coils} onChange={e => setCoils(e.target.checked)} /> 显示线圈</label>}
          {kind === "inertial" && <div className="confinement-drive" aria-label="惯性聚变驱动方式">
            <button className={!indirect ? "active" : ""} onClick={() => setIndirect(false)}>直接驱动</button>
            <button className={indirect ? "active" : ""} onClick={() => setIndirect(true)}>间接驱动 · NIF 思路</button>
          </div>}
          <button onClick={() => setReset(n => n + 1)}>复位视角</button>
          <span>拖动旋转 · 滚轮缩放</span>
        </div>
        {kind === "pinch" && <div className="confinement-pinch-headings"><strong>Z 箍缩<small>轴向电流 → 绕柱磁场</small></strong><strong>θ 箍缩<small>感应绕柱电流 + 轴向磁场</small></strong></div>}
        <div className={`confinement-canvas ${kind === "pinch" ? "confinement-wide" : ""}`} role="img" aria-label={`${lesson.title}三维演示`}>
          <Canvas key={reset} camera={{ position: [0, 3, 8], fov: 42 }} dpr={[1, 1.5]}>
            <LessonCamera kind={kind} />
            <color attach="background" args={["#080f1c"]} />
            <ambientLight intensity={1.8} /><directionalLight position={[2, 6, 7]} intensity={3} /><directionalLight position={[-4, 1, -4]} intensity={1.5} color="#9fb9e9" />
            {kind === "mirror" && <Mirror seconds={seconds} ratio={ratio} pitch={pitch} coils={coils} />}
            {kind === "frc" && <FRC seconds={seconds} coils={coils} />}
            {kind === "pinch" && <><group position={[-3.6, 0, 0]} scale={0.88}><Pinch seconds={seconds} theta={false} coils={coils} /></group><group position={[3.6, 0, 0]} scale={0.88}><Pinch seconds={seconds} theta coils={coils} /></group></>}
            {kind === "inertial" && <Inertial seconds={seconds} indirect={indirect} />}
            <OrbitControls makeDefault enablePan minDistance={6} maxDistance={22} />
          </Canvas>
          <div className="confinement-annotation">{kind === "mirror" ? "磁场 B 沿管道 → · 两端强，中间弱" : kind === "frc" ? "外侧磁场 →  ｜  核心磁场 ←" : kind === "inertial" ? indirect ? "激光 → 腔壁 → X 射线 → 燃料球" : "激光 → 燃料球外层 → 向内压缩" : "蓝色：磁场 B  ·  金色：电流 J  ·  粉色：向内的力"}</div>
        </div>
        <div className="confinement-legend"><span style={{ color: cyan }}>● {kind === "inertial" ? "燃料" : "磁场 B"}</span>{kind === "inertial" && <span style={{ color: "#bd99fa" }}>● 激光 · 淡网格是初始大小</span>}<span style={{ color: gold }}>● {kind === "mirror" ? "被困粒子" : kind === "inertial" ? "X 射线 / 产物" : kind === "frc" ? "磁场为零的环" : "电流 J"}</span><span style={{ color: coral }}>● {kind === "mirror" ? "漏失粒子" : kind === "inertial" ? "烧蚀向外喷射" : kind === "frc" ? "核心反向磁场" : "向内的力"}</span></div>
        {kind === "mirror" && <div className="mirror-controls">
          <label>磁镜比（两端 / 中央）：{ratio.toFixed(1)}<input aria-label="磁镜比" type="range" min="1.5" max="6" step="0.1" value={ratio} onChange={e => { setRatio(+e.target.value); setSeconds(0); }} /></label>
          <label>粒子出发方向与磁场的夹角：{pitch}°<input aria-label="磁镜粒子出发夹角" type="range" min="5" max="85" step="1" value={pitch} onChange={e => { setPitch(+e.target.value); setSeconds(0); }} /></label>
          <p className={condition.trapped ? "mirror-trapped" : "mirror-lost"}>{condition.trapped ? "↔ 会反弹：沿磁场的前进逐渐停下，再掉头。" : "→ 会漏失：太顺着磁场前进，穿过瓶口。"} 当前漏失锥半角约 {condition.criticalAngle.toFixed(1)}°。</p>
        </div>}
        <div className="confinement-playback"><button onClick={() => { if (seconds >= duration) setSeconds(0); setPlaying(!playing); }}>{playing ? "暂停" : seconds >= duration ? "重新播放" : "播放"}</button><button onClick={() => { setSeconds(0); setPlaying(false); }}>回到开始</button><input aria-label={`${lesson.title}演示进度`} type="range" min="0" max={duration} step="0.05" value={seconds} onChange={e => { setSeconds(+e.target.value); setPlaying(false); }} /><span>{seconds.toFixed(1)} / {duration} s</span></div>
        <PlaybackDuration context={lesson.title} unit="演示秒" seconds={duration} min={6} max={60} step={1} onChange={value => { setDuration(value); setSeconds(t => Math.min(t, value)); }} />
        <p className="confinement-time-note">{kind === "pinch" || kind === "inertial" ? `第 ${pulse.cycle} 轮 · ${pulse.stage}。每 6 演示秒一轮，延长时长会增加轮次。` : "延长时长会展示更久的运动，播放速度保持不变。"} 画面为放慢的原理示意；{kind === "inertial" ? "真实内爆发生在纳秒量级。" : "演示秒不代表装置的物理时间。"}</p>
      </section>
      <div className="confinement-questions">
        {[['01', '靠什么约束燃料？', kind === "inertial" && indirect ? "激光先照热金属腔壁，腔壁产生的 X 射线再照射燃料球。球的外层向外烧蚀，剩下的燃料受到反作用力向内压缩，在来得及散开前发生聚变。" : lesson.method], ['02', '粒子怎么运动？', lesson.motion], ['03', '主要难点是什么？', lesson.challenge]].map(([n, title, text]) => <section key={n} className="lab-card"><p className="eyebrow">{n} · 看懂这一种思路</p><h2>{title}</h2><p>{text}</p></section>)}
      </div>
    </div>
    <section className="lab-card confinement-takeaway"><h2>和前后几页连起来看</h2><p>{lesson.contrast}</p><a href={lesson.source} target="_blank" rel="noreferrer">原理与进一步阅读 · {lesson.sourceLabel} ↗</a></section>
    {kind === "frc" && <p className="lab-note">闭合青线取自轴对称示意磁通 ψ = r²(1 − r² − z²/L²) 的等值线，亮点是沿线方向标记；不是计算得到的离子轨道。</p>}
  </div>;
}

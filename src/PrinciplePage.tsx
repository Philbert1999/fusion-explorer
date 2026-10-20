import CoilBody from "./CoilBody";
import type { ThreeEvent } from "@react-three/fiber";
import { cutCrossings } from "./cutCrossings";
import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Camera } from "./Scene";
import Torus from "./Torus";
import {
  point,
  rational,
  qValue,
  closure,
  TAU,
  type Geometry,
  type Q,
} from "./model";
import { variedStellaratorPoint } from "./stellarator";
const tokamakGeometry: Geometry = { R0: 3, a: 1, rho: 1, kappa: 1, delta: 0 };
const stellaratorGeometry: Geometry = {
  R0: 5.5,
  a: 0.53,
  rho: 1,
  kappa: 1,
  delta: 0,
};
export default function PrinciplePage({
  stellar = false,
}: {
  stellar?: boolean;
}) {
  const g = stellar ? stellaratorGeometry : tokamakGeometry;
  const [tf, setTf] = useState(true),
    [pf, setPf] = useState(true),
    [vessel, setVessel] = useState(true),
    [cs, setCs] = useState(true),
    [hovered, setHovered] = useState<string | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [opacity, setOpacity] = useState(0.9),
    [cut, setCut] = useState(0),
    [plane, setPlane] = useState(true),
    [symbol, setSymbol] = useState<"√2" | "π" | null>(null),
    [m, setM] = useState(3),
    [n, setN] = useState(2),
    [turns, setTurns] = useState(6),
    [reset, setReset] = useState(0);
  const parts: Record<
    string,
    { name: string; role: string; hide: () => void }
  > = {
    tf: {
      name: stellar ? "三维主线圈" : "环向场线圈 TF",
      role: stellar
        ? "用三维外部线圈同时提供沿大环和绕小截面的磁场，让场线拧起来。"
        : "竖直围住管道的线圈，主要产生绕中央大孔的环向磁场。",
      hide: () => setTf(false),
    },
    pf: {
      name: "极向场线圈 PF",
      role: "在 R–Z 小截面内提供磁场，帮助控制等离子体的位置、形状和稳定。",
      hide: () => setPf(false),
    },
    cs: {
      name: "中央螺线管 CS",
      role: "改变穿过大环的磁通，像变压器一样在等离子体里驱动环向电流；该电流产生极向磁场。",
      hide: () => setCs(false),
    },
    vessel: {
      name: "真空室",
      role: "抽成真空的容器，隔开空气与等离子体。里面的磁场负责约束高温等离子体。",
      hide: () => setVessel(false),
    },
  };
  const interact = (id: string) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(id);
    },
    onPointerOut: () => setHovered(null),
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      setSelected(id);
    },
  });
  const activePart = selected || hovered;
  const phi = (cut * Math.PI) / 180,
    q: Q = symbol ? { kind: "irrational", symbol } : rational(m, n),
    ratio = qValue(q),
    period = closure(q);
  const sample = (p: number, t: number, rho = 1) =>
    stellar
      ? variedStellaratorPoint({ ...g, rho }, 5, p, t)
      : point({ ...g, rho }, p, t);
  const coils = useMemo(
    () =>
      Array.from({ length: stellar ? 25 : 12 }, (_, j) =>
        Array.from({ length: 129 }, (_, i) => {
          const t = (TAU * i) / 128,
            p =
              (TAU * j) / (stellar ? 25 : 12) +
              (stellar ? 0.035 * Math.sin(2 * t) : 0);
          return stellar
            ? variedStellaratorPoint({ ...g, rho: 1.4 }, 5, p, t)
            : point({ ...g, rho: 1.35 }, p, t);
        }),
      ),
    [stellar, g],
  );
  const line = Array.from({ length: Math.ceil(turns * 256) + 1 }, (_, i) => {
    const p = (turns * TAU * i) / Math.ceil(turns * 256);
    return sample(p, p / ratio, 0.7);
  });
  const section = Array.from({ length: 129 }, (_, i) =>
    sample(phi, (TAU * i) / 128),
  );
  const rz = (p: number[]) => [Math.hypot(p[0], p[1]), p[2]];
  const path = (points: number[][]) =>
    points
      .map((p, i) => {
        const [R, Z] = rz(p);
        return `${i ? "L" : "M"}${180 + ((R - g.R0) * 60) / g.a},${135 - (Z * 60) / g.a}`;
      })
      .join(" ");
  const hits = cutCrossings(cut, turns, ratio).map((p) =>
    rz(sample(p.phi, p.theta, 0.7)),
  );
  const number = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    min: number,
    max: number,
  ) => (
    <label>
      {label}
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => {
          const v = +e.target.value;
          if (Number.isInteger(v) && v >= min && v <= max) onChange(v);
        }}
      />
    </label>
  );
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">
            {stellar ? "STELLARATOR" : "TOKAMAK"} · BEGINNER GUIDE
          </p>
          <h1>
            {stellar
              ? "仿星器原理：让外部线圈把磁场拧起来"
              : "托卡马克原理：用磁场把高温等离子体留在环里"}
          </h1>
          <p>
            有厚度的铜色/紫色部件是电磁线圈，灰色壳是真空室，细青线才是磁力线。可隐藏线圈，也可转动紫色切片观察内部。
          </p>
        </div>
        <button onClick={() => setReset((v) => v + 1)}>复位视角</button>
      </div>
      <section className="lab-card principle-winding">
        <h2>先试一试：m 数大圈，n 数小圈</h2>
        <div className="winding-controls">
          {number(
            "m · 绕大孔",
            m,
            (v) => {
              setM(v);
              setSymbol(null);
            },
            1,
            8,
          )}
          {number(
            "n · 绕小截面",
            n,
            (v) => {
              setN(v);
              setSymbol(null);
            },
            1,
            8,
          )}
          <label>
            追踪大圈数
            <input
              aria-label="追踪大圈数"
              type="range"
              min="1"
              max="200"
              step="1"
              value={turns}
              onChange={(e) => setTurns(+e.target.value)}
            />
            <output>{turns} 圈</output>
          </label>
          <span>有理数：</span>
          {[
            [1, 1],
            [3, 2],
            [2, 1],
            [5, 3],
          ].map(([a, b]) => (
            <button
              key={`${a}/${b}`}
              onClick={() => {
                setM(a);
                setN(b);
                setSymbol(null);
              }}
            >
              {b === 1 ? a : `${a}/${b}`}
            </button>
          ))}
          <span>无理数：</span>
          {(["√2", "π"] as const).map((value) => (
            <button key={value} onClick={() => setSymbol(value)}>
              {value}
            </button>
          ))}
        </div>
        <p aria-live="polite">
          {period
            ? `有理数 q=${period.toroidal}/${period.poloidal}：约分后走 ${period.toroidal} 个大圈、${period.poloidal} 个小圈，首次回到起点。`
            : `无理数 q=${symbol}（约 ${ratio.toFixed(5)}）：不会精确闭合；增加追踪圈数会看到更多不同位置。m/n 框保留的是上一组有理数，修改即返回有理数。`}
        </p>
      </section>
      <div className="principle-layout">
        <aside className="lab-card principle-controls">
          <h2>先认识装置</h2>
          <label>
            <input
              type="checkbox"
              checked={vessel}
              onChange={(e) => setVessel(e.target.checked)}
            />
            显示真空室轮廓（灰）
          </label>
          <p>
            灰色是真空室，里面装着高温等离子体。磁场把等离子体约束在内部，帮助它远离壁面。
          </p>
          <label>
            <input
              type="checkbox"
              checked={tf}
              onChange={(e) => setTf(e.target.checked)}
            />
            {stellar ? "显示三维主线圈（橙）" : "显示环向场线圈（橙）"}
          </label>
          {!stellar && (
            <label>
              <input
                type="checkbox"
                checked={pf}
                onChange={(e) => setPf(e.target.checked)}
              />
              显示极向场线圈 PF（紫）
            </label>
          )}
          {!stellar && (
            <label>
              <input
                type="checkbox"
                checked={cs}
                onChange={(e) => setCs(e.target.checked)}
              />
              显示中央螺线管 CS（银紫）
            </label>
          )}
          <p>
            悬停看名字，点击看操作；按外部线圈 →
            真空室的顺序隐藏，就能像剥洋葱一样看到内部青色磁力线。左侧勾选可重新打开。
          </p>
          <div className="part-legend">
            {Object.entries(parts)
              .filter(([id]) => !stellar || id === "tf" || id === "vessel")
              .map(([id, part]) => (
                <button key={id} onClick={() => setSelected(id)}>
                  {part.name} ·{" "}
                  {id === "tf"
                    ? stellar
                      ? "螺旋磁场"
                      : "环向磁场"
                    : id === "pf"
                      ? "截面内磁场"
                      : id === "cs"
                        ? "驱动等离子体电流"
                        : "真空容器"}
                </button>
              ))}
          </div>
          <label>
            线圈透明度
            <input
              aria-label="线圈透明度"
              type="range"
              min=".05"
              max="1"
              step=".05"
              value={opacity}
              onChange={(e) => setOpacity(+e.target.value)}
            />
          </label>
          <p>
            {stellar
              ? "三维主线圈一边围着环排列，一边改变形状，让磁场沿大环前进时也绕管道转。"
              : "橙色线圈竖着围住管道，主要产生绕中央大孔的磁场。紫色大圆线圈帮助控制等离子体的位置和形状。中间的螺线管像变压器，帮助在等离子体中驱动电流。"}
          </p>
          <p>
            {stellar
              ? "仿星器主要靠外部线圈完成这种“拧转”，可减少对大等离子体电流的依赖。"
              : "等离子体电流也会产生绕管道小截面的磁场；它与环向磁场合起来，让磁力线走成螺旋。紫色外部线圈主要帮助控制位置与形状。"}
          </p>
          {stellar && (
            <>
              <h3>W7-X 风格 · 五重对称</h3>
              <p>
                大环半径 5.5 m，小截面参考半径 0.53
                m。沿环重复的三维线圈，把纤细的等离子体环包在里面。
              </p>
              <p>
                IPP 公开资料展示了 W7-X 从豆形到三角形的截面变化。用 R–Z
                图上方的按钮和滑块，观察豆形、长椭圆和三角形切口。
              </p>
              <a
                href="https://www.ipp.mpg.de/ippcms/eng/presse/pi/10_09_pi.html"
                target="_blank"
                rel="noreferrer"
              >
                查看 IPP 的真实装置与截面说明 ↗
              </a>
              <p>
                <a
                  href="https://www.ipp.mpg.de/1471940/wendelstein_7_x"
                  target="_blank"
                  rel="noreferrer"
                >
                  对照真实 W7-X 的线圈图 ↗
                </a>
              </p>
            </>
          )}
        </aside>
        <div>
          <div className="lab-canvas principle-canvas">
            <Canvas
              camera={{ position: [7, -9, 7], up: [0, 0, 1], fov: 42 }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#080d18"]} />
              <ambientLight intensity={1.5} />
              <directionalLight position={[4, -6, 10]} intensity={2.6} />
              <Camera
                g={g}
                view="default"
                reset={reset}
                distanceScale={stellar ? 0.98 : 1.15}
              />
              {vessel && (
                <group {...interact("vessel")}>
                  <Torus
                    g={{ ...g, rho: 1.12 }}
                    color={stellar ? "#a4b4d1" : "#8d9aaa"}
                    opacity={stellar ? 0.42 : 0.6}
                    periods={stellar ? 5 : undefined}
                    varied={stellar}
                  />
                </group>
              )}
              <Torus
                g={g}
                color={stellar ? "#b2a0d2" : "#779fc4"}
                opacity={0.22}
                periods={stellar ? 5 : undefined}
                varied={stellar}
              />
              {tf && (
                <group {...interact("tf")}>
                  {coils.map((c, i) => (
                    <CoilBody
                      key={i}
                      points={c}
                      color={stellar ? "#d99d7a" : "#c89a75"}
                      opacity={opacity}
                      radius={stellar ? 0.045 : 0.075}
                    />
                  ))}
                </group>
              )}
              {!stellar && pf && (
                <group {...interact("pf")}>
                  {[-1.2, 1.2].map((z) => (
                    <CoilBody
                      key={z}
                      points={Array.from(
                        { length: 129 },
                        (_, i) =>
                          [
                            4.3 * Math.cos((TAU * i) / 128),
                            4.3 * Math.sin((TAU * i) / 128),
                            z,
                          ] as [number, number, number],
                      )}
                      color="#a99dc9"
                      opacity={opacity}
                    />
                  ))}
                </group>
              )}
              {!stellar && cs && (
                <group {...interact("cs")}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.45, 0.45, 3, 32]} />
                    <meshStandardMaterial
                      color="#adacc7"
                      metalness={0.65}
                      roughness={0.3}
                      transparent
                      opacity={opacity}
                    />
                  </mesh>
                  {Array.from({ length: 12 }, (_, j) => (
                    <CoilBody
                      key={j}
                      points={Array.from(
                        { length: 65 },
                        (_, i) =>
                          [
                            0.47 * Math.cos((TAU * i) / 64),
                            0.47 * Math.sin((TAU * i) / 64),
                            -1.35 + j * 0.245,
                          ] as [number, number, number],
                      )}
                      color="#bab9d1"
                      opacity={opacity}
                    />
                  ))}
                </group>
              )}
              <Line points={line} color="#65e4f2" lineWidth={2} />
              {plane && (
                <group rotation={[0, 0, phi]}>
                  <mesh position={[g.R0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <planeGeometry
                      args={[3.4 * g.a, (stellar ? 4.2 : 3.4) * g.a]}
                    />
                    <meshBasicMaterial
                      color="#ae93ff"
                      transparent
                      opacity={0.16}
                      side={2}
                      depthWrite={false}
                    />
                  </mesh>
                </group>
              )}
              <Line points={section} color="#b5a0ff" lineWidth={3} />
            </Canvas>
            {activePart && (
              <div className="part-popover" role="status">
                <strong>{parts[activePart].name}</strong>
                <p>{parts[activePart].role}</p>
                {selected ? (
                  <div className="lab-buttons">
                    <button
                      onClick={() => {
                        parts[selected].hide();
                        setSelected(null);
                        setHovered(null);
                      }}
                    >
                      隐藏这一层
                    </button>
                    <button onClick={() => setSelected(null)}>关闭选项</button>
                  </div>
                ) : (
                  <small>点击部件可打开隐藏选项</small>
                )}
              </div>
            )}
          </div>
          <div className="principle-plots">
            <section className="lab-card">
              <div className="section-controls">
                <h3>自己选一刀切在哪里</h3>
                {number("切片环向角 / °", cut, setCut, 0, 359)}
                <input
                  aria-label="切片角度滑块"
                  type="range"
                  min="0"
                  max="359"
                  value={cut}
                  onChange={(e) => setCut(+e.target.value)}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={plane}
                    onChange={(e) => setPlane(e.target.checked)}
                  />
                  显示紫色切片
                </label>
                <p>
                  0° 到 359°
                  表示绕中央大孔换切片位置；三维紫色面和下面两个图会一起更新。
                </p>
                {stellar && (
                  <div className="lab-buttons">
                    {[
                      [0, "豆形"],
                      [18, "长椭圆过渡"],
                      [36, "三角形"],
                    ].map(([v, name]) => (
                      <button key={v} onClick={() => setCut(+v)}>
                        {name} · {v}°示意
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <h2>这张 R–Z 图是什么？</h2>
              <p>
                在选定位置竖着切开管道，正对切口看。横轴 R
                是离装置中央轴多远，纵轴 Z
                是上下高度。紫线是外层轮廓，青线是磁力线所在的内层磁面。
              </p>
              <svg
                viewBox="0 0 360 285"
                role="img"
                aria-label="所选角度的 R-Z 切片"
              >
                <path
                  d={path(section)}
                  fill="none"
                  stroke="#b5a0ff"
                  strokeWidth="2"
                />
                <path
                  d={path(
                    Array.from({ length: 129 }, (_, i) =>
                      sample(phi, (TAU * i) / 128, 0.7),
                    ),
                  )}
                  fill="none"
                  stroke="#65e4f2"
                />
                <text x="15" y="265" fill="#becde0">
                  → R / m，↑ Z / m · φ = {cut}°
                </text>
              </svg>
              <p>
                {stellar
                  ? "绕环换位置，三维扭转形状的切口会变化。"
                  : "这个理想轴对称托卡马克绕环各处一样，因此换位置后切口轮廓不变。"}
              </p>
            </section>
            <section className="lab-card">
              <h2>庞加莱截面：给磁力线拍“过门照”</h2>
              <p>
                把紫色切片当成一扇门。磁力线每绕大环一圈、再次穿过同一扇门，就记一个点。把这些点叠在切口上，能看出它是否回到旧位置。
              </p>
              <svg
                viewBox="0 0 360 285"
                role="img"
                aria-label="所选切面的庞加莱点图"
              >
                <path d={path(section)} fill="none" stroke="#657b96" />
                {hits.map(([R, Z], i) => (
                  <circle
                    key={i}
                    cx={180 + ((R - g.R0) * 60) / g.a}
                    cy={135 - (Z * 60) / g.a}
                    r="4"
                    fill="#65e4f2"
                  />
                ))}
                <text x="15" y="265" fill="#becde0">
                  → R / m，↑ Z / m · {hits.length} 次截面记录
                </text>
              </svg>
              <p>
                每次过门记一个点，重合点会叠在一起。增加追踪圈数，比较有理数的重复点与无理数的新位置。
              </p>
            </section>
          </div>
        </div>
      </div>
      <section className="lab-card device-principles">
        <h2>m 和 n：先数清“大圈”和“小圈”</h2>
        <p>
          <strong>环向：</strong>绕中央大孔；<strong>极向：</strong>
          绕管道小截面；<strong>径向：</strong>从管道中心穿过一层层磁面往外走。
        </p>
        <p>
          q 可以理解为“走一个小圈，平均要绕几个大圈”。有理数能写成整数比，无理数
          √2、π 不能写成精确整数比。上方 m/n
          输入只用于有理数；点击无理数示例时不把它们硬凑成分数。有限画面里的近似重合不等于精确闭合。
        </p>
        <p>
          研究不稳定性时，同样写 m、n，但那时数的是波纹：m
          数绕小截面有几次起伏，n 数绕大孔有几次起伏；它们不是线圈数量。条件
          q=m/n 表示这类波纹可能与该处磁力线绕法匹配，不代表一定失稳。
        </p>
        <details className="principle-notes">
          <summary>模型与资料来源</summary>
          <p>
            装置、线圈和 W7-X
            风格的截面采用教学几何，帮助观察结构与方向；未导入真实工程 CAD
            或磁平衡。几何角近似用于直磁力线角。
          </p>
        </details>
        <a
          href={
            stellar
              ? "https://www.ipp.mpg.de/w7x"
              : "https://www.iter.org/machine/magnets"
          }
          target="_blank"
          rel="noreferrer"
        >
          {stellar ? "IPP · 仿星器与三维线圈" : "ITER · 三类主要磁体"} ↗
        </a>
      </section>
    </>
  );
}

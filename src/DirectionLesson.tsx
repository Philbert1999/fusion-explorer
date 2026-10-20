import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Vector3 } from "three";
import Torus from "./Torus";
import { Camera } from "./Scene";
import { point, TAU, type Geometry } from "./model";
const g: Geometry = { R0: 3, a: 1, rho: 0.75, kappa: 1, delta: 0 };
const phi = -0.1,
  theta = 0.7;
const guides = {
  toroidal: {
    name: "环向 φ",
    color: "#65e4f2",
    plain: "绕中央大孔走一圈",
    detail:
      "想象你沿着甜甜圈这条环形隧道向前走，绕中央大孔回到原处。这就是环向；不是绕管道的小截面转圈。",
    formula: "改变 φ，保持 r、θ 不变",
    points: Array.from({ length: 129 }, (_, i) =>
      point(g, (TAU * i) / 128, theta),
    ),
    origin: point(g, phi, theta),
    direction: [-Math.sin(phi), Math.cos(phi), 0],
  },
  poloidal: {
    name: "极向 θ",
    color: "#f1b698",
    plain: "绕管道的小截面走一圈",
    detail:
      "把甜甜圈在某处切开，会看到一个小圆。沿这个小圆的圆周绕一圈，就是极向。可以把它想成在隧道里沿墙面翻一个跟头。",
    formula: "改变 θ，保持 r、φ 不变",
    points: Array.from({ length: 129 }, (_, i) =>
      point(g, phi, (TAU * i) / 128),
    ),
    origin: point(g, phi, theta),
    direction: [
      -Math.sin(theta) * Math.cos(phi),
      -Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
    ],
  },
  radial: {
    name: "径向 r",
    color: "#b5a0ff",
    plain: "从管道中心向管壁方向走",
    detail:
      "这里的径向指从磁轴附近穿过一层层磁面、向外层走。它是小截面里的“内外”，不是从整个装置中心孔洞一直朝外走。负径向则往磁轴方向。",
    formula: "改变 r，保持 θ、φ 不变",
    points: [
      point({ ...g, rho: 0 }, phi, theta),
      point({ ...g, rho: 1 }, phi, theta),
    ],
    origin: point({ ...g, rho: 0.3 }, phi, theta),
    direction: [
      Math.cos(theta) * Math.cos(phi),
      Math.cos(theta) * Math.sin(phi),
      Math.sin(theta),
    ],
  },
};
export default function DirectionLesson() {
  const [mode, setMode] = useState<keyof typeof guides>("toroidal"),
    [reset, setReset] = useState(0);
  const guide = guides[mode];
  return (
    <>
      <div className="lab-heading">
        <div>
          <p className="eyebrow">DIRECTIONS · START HERE</p>
          <h1>甜甜圈里的三个方向</h1>
          <p>
            先记：环向绕大孔，极向绕小圈，径向穿磁面。点击下面三个方向，拖动三维甜甜圈换角度看。
          </p>
        </div>
        <button onClick={() => setReset((v) => v + 1)}>复位视角</button>
      </div>
      <div className="direction-layout">
        <div>
          <div className="lab-buttons">
            {(Object.keys(guides) as (keyof typeof guides)[]).map((k) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                style={{
                  color: guides[k].color,
                  borderColor: mode === k ? guides[k].color : undefined,
                }}
              >
                {guides[k].name} · {guides[k].plain}
              </button>
            ))}
          </div>
          <div className="lab-canvas instability-canvas">
            <Canvas
              camera={{ position: [7, -9, 7], up: [0, 0, 1], fov: 42 }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#080d18"]} />
              <ambientLight intensity={1.5} />
              <directionalLight position={[4, -6, 10]} intensity={2.8} />
              <Camera g={g} view="default" reset={reset} />
              <Torus g={{ ...g, rho: 1 }} color="#6583a6" opacity={0.25} />
              <Line
                points={Array.from({ length: 129 }, (_, i) =>
                  point({ ...g, rho: 0 }, (TAU * i) / 128, 0),
                )}
                color="#8492a6"
                dashed
                dashSize={0.12}
                gapSize={0.08}
              />
              <Line points={guide.points} color={guide.color} lineWidth={3} />
              <arrowHelper
                args={[
                  new Vector3(...guide.direction).normalize(),
                  new Vector3(...guide.origin),
                  0.8,
                  guide.color,
                  0.2,
                  0.12,
                ]}
              />
            </Canvas>
          </div>
        </div>
        <section className="lab-card">
          <h2 style={{ color: guide.color }}>
            {guide.name}：{guide.plain}
          </h2>
          <p>{guide.detail}</p>
          <p className="instability-formula">{guide.formula}</p>
          <h3>两个“半径”别混淆</h3>
          <p>
            <strong>大半径 R：</strong>从装置的中央对称轴到某个点的水平距离。R₀
            是管道几何中心的大半径。
          </p>
          <p>
            <strong>小半径 r：</strong>
            圆截面教学模型中，从管道中心到该点的距离。不同 r
            对应不同的嵌套磁面。
          </p>
          <p>
            比如在管道顶部，向外的“小径向”朝上，而大半径 R
            的增加方向仍是水平向外；它们不是同一个方向。
          </p>
          <h3>磁力线走哪个方向？</h3>
          <p>
            通常同时有环向与极向分量，像螺丝线一样绕在磁面上。理想磁面模型中，磁场不穿越磁面；粒子漂移与输运可以跨面，不能把它们当成同一条轨迹。
          </p>
          <p className="device-model-note">
            灰色虚线是本模型的几何中心环，不是真实磁轴测量。真实平衡可有磁轴偏移；非圆截面中径向常用磁通坐标
            ρ
            描述，不一定是直线距离。箭头仅指坐标方向，不表示力、电场或漂移方向。
          </p>
        </section>
      </div>
    </>
  );
}


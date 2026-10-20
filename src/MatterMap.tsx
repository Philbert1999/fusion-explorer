import { useState } from "react";
import {
  matterColors,
  matterExamples,
  matterPosition,
  equalParticleVolumes,
  type MatterKind,
} from "./matter";

function Miniature({ icon }: { icon: string }) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon === "block" ? (
        <>
          <path d="M20 38 55 20 82 35 47 54Z" fill="#514667" />
          <path d="M20 38V70L47 86V54M47 86 82 67V35" fill="#30324c" />
          <path d="M20 38 47 54 82 35" />
        </>
      ) : icon === "water" ? (
        <>
          <path d="M24 20V81Q50 93 76 81V20" />
          <ellipse cx="50" cy="20" rx="26" ry="8" />
          <path
            d="M25 54Q50 42 75 54V80Q50 92 25 80Z"
            fill="#548d88"
            fillOpacity=".6"
          />
          <ellipse cx="50" cy="54" rx="25" ry="8" />
          <path d="M33 30V43" />
        </>
      ) : icon === "air" ? (
        <>
          <path d="M22 34H69Q85 34 85 23Q85 12 74 14M16 50H60Q78 50 78 62Q78 74 65 72M23 66H42" />
          <circle cx="26" cy="85" r="2" />
          <circle cx="51" cy="19" r="2" />
        </>
      ) : icon === "wind" ? (
        <>
          <path d="M12 37Q35 17 58 37T88 37M12 56Q35 36 58 56T88 56M12 75Q35 55 58 75T88 75" />
          <path d="m78 28 10 9-12 5" />
        </>
      ) : icon === "flame" ? (
        <>
          <path
            d="M50 12C57 35 84 40 76 68Q62 96 36 82C12 69 24 46 37 31Q35 48 46 48Q57 38 50 12Z"
            fill="#d6997b"
            fillOpacity=".22"
          />
          <path d="M49 53Q29 74 46 83Q66 85 64 69Z" stroke="#f3cd98" />
        </>
      ) : icon === "neon" ? (
        <>
          <path
            d="M25 15V67Q25 88 50 88T75 67V15"
            stroke="#d99fe8"
            strokeWidth="9"
            strokeOpacity=".25"
          />
          <path
            d="M25 15V67Q25 88 50 88T75 67V15"
            stroke="#f0b7dc"
            strokeWidth="4"
          />
          <path d="M17 15H33M67 15H83M25 8V21M75 8V21" />
        </>
      ) : icon === "lightning" ? (
        <>
          <path
            d="M59 9 25 53H46L36 92 77 40H53Z"
            fill="#b5c5ed"
            fillOpacity=".3"
          />
          <path d="m60 48 23 9M31 47 15 32" />
        </>
      ) : icon === "sun" ? (
        <>
          <circle cx="50" cy="50" r="27" fill="#ddb98a" fillOpacity=".22" />
          <circle cx="50" cy="50" r="11" fill="#f3c58b" stroke="#f3c58b" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M50 6V16" transform={`rotate(${a} 50 50)`} />
          ))}
        </>
      ) : icon === "torus" ? (
        <>
          <ellipse
            cx="50"
            cy="52"
            rx="38"
            ry="23"
            strokeWidth="8"
            strokeOpacity=".6"
          />
          <ellipse cx="50" cy="52" rx="38" ry="23" />
          <path d="M14 48Q31 21 40 50T66 56 86 48" stroke="#d6ac91" />
          <path d="M45 18V31M56 76V88" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="12" fill="#b78683" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path
              key={a}
              d="M50 7V31m-6-7 6 7 6-7"
              transform={`rotate(${a} 50 50)`}
            />
          ))}
        </>
      )}
    </g>
  );
}
const names: Record<MatterKind, string> = {
  solid: "固态",
  liquid: "液态",
  gas: "气态",
  plasma: "等离子体",
};
const regions: { kind: MatterKind; points: number[][] }[] = [
  {
    kind: "solid",
    points: [
      [10, 500],
      [10, 3e4],
      [2500, 3e4],
      [2500, 500],
    ],
  },
  {
    kind: "liquid",
    points: [
      [60, 400],
      [60, 2e4],
      [4000, 2e4],
      [4000, 400],
    ],
  },
  {
    kind: "gas",
    points: [
      [30, 1e-8],
      [30, 100],
      [1e4, 100],
      [1e4, 1e-8],
    ],
  },
  {
    kind: "plasma",
    points: [
      [1e4, 1e-21],
      [1e4, 1],
      [1e6, 1e6],
      [1e9, 1e6],
      [1e9, 1e-21],
    ],
  },
];
export default function MatterMap({ fuelMass }: { fuelMass: number }) {
  const [selected, setSelected] = useState("fusion");
  const example = matterExamples.find((p) => p.id === selected)!;
  const color = matterColors[example.kind];
  return (
    <section className="lab-card matter-map">
      <p className="eyebrow">04 · 把四种物态放在同一张图上</p>
      <h2>温度 × 密度：等离子体的跨度有多大？</h2>
      <p>
        向右更热，向上更密。横轴每一格温度增加 10 倍，纵轴每一格密度增加 1,000
        倍。点一个带小图的节点，查看它的条件。
      </p>
      <div className="matter-legend">
        {Object.entries(names).map(([kind, name]) => (
          <span key={kind}>
            <i style={{ background: matterColors[kind as MatterKind] }} />
            {name}
            {kind === "plasma" ? " · 第四态" : ""}
          </span>
        ))}
      </div>
      <div className="matter-map-layout">
        <div className="matter-chart-scroll">
          <svg
            viewBox="0 -90 1200 730"
            role="group"
            aria-label="固液气与等离子体的温度和质量密度跨度图"
          >
            <defs>
              <linearGradient id="temperature-ramp">
                <stop stopColor="#4978d4" />
                <stop offset=".25" stopColor="#67c5da" />
                <stop offset=".5" stopColor="#dbcf9b" />
                <stop offset=".75" stopColor="#e68c69" />
                <stop offset="1" stopColor="#dc5e69" />
              </linearGradient>
              <linearGradient id="plasma-range" x1="0" y1="1" x2="1" y2="0">
                <stop stopColor="#16768a" stopOpacity=".38" />
                <stop offset="1" stopColor="#2b9bad" stopOpacity=".5" />
              </linearGradient>
              <pattern
                id="solid-range"
                width="9"
                height="9"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width="9"
                  height="9"
                  fill={matterColors.solid}
                  fillOpacity=".4"
                />
                <path
                  d="M-2 2 2-2M0 9 9 0M7 11 11 7"
                  stroke={matterColors.solid}
                  strokeOpacity=".65"
                />
              </pattern>
              <pattern
                id="liquid-range"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width="10"
                  height="10"
                  fill={matterColors.liquid}
                  fillOpacity=".42"
                />
                <path
                  d="M0 5H10"
                  stroke={matterColors.liquid}
                  strokeOpacity=".8"
                />
              </pattern>
            </defs>
            <rect
              x="100"
              y="60"
              width="1040"
              height="450"
              rx="6"
              fill="#0b1423"
            />
            {regions.map((region) => (
              <polygon
                key={region.kind}
                points={region.points
                  .map(([t, rho]) => matterPosition(t, rho).join(","))
                  .join(" ")}
                fill={
                  region.kind === "gas"
                    ? matterColors.gas
                    : `url(#${region.kind}-range)`
                }
                fillOpacity={region.kind === "gas" ? 0.3 : 1}
                stroke={matterColors[region.kind]}
                strokeOpacity=".95"
                strokeWidth="1.7"
                strokeDasharray="5 5"
              />
            ))}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((power) => {
              const x = matterPosition(10 ** power, 1e-21)[0];
              return (
                <g key={power}>
                  <path d={`M${x} 60V510`} className="matter-grid" />
                  <text x={x} y="567" textAnchor="middle">
                    10
                    <tspan baselineShift="super" fontSize="11">
                      {power}
                    </tspan>
                  </text>
                </g>
              );
            })}
            {[-21, -18, -15, -12, -9, -6, -3, 0, 3, 6].map((power) => {
              const y = matterPosition(10, 10 ** power)[1];
              return (
                <g key={power}>
                  <path d={`M100 ${y}H1140`} className="matter-grid" />
                  <text x="82" y={y + 5} textAnchor="end">
                    10
                    <tspan baselineShift="super" fontSize="11">
                      {power}
                    </tspan>
                  </text>
                </g>
              );
            })}
            <text x="100" y="32" className="matter-axis-title">
              质量密度 ρ / kg·m⁻³ ↑
            </text>
            <text
              x="1140"
              y="626"
              textAnchor="end"
              className="matter-axis-title"
            >
              温度 T / K → 更热
            </text>
            <rect
              x="100"
              y="526"
              width="1040"
              height="18"
              rx="6"
              fill="url(#temperature-ramp)"
            />
            <text x="100" y="602" className="matter-cold-label">
              冷 · 低温
            </text>
            <text
              x="1140"
              y="602"
              textAnchor="end"
              className="matter-hot-label"
            >
              热 · 高温
            </text>
            <text x="685" y="223" className="matter-plasma-title">
              等离子体
            </text>
            <text x="685" y="249" fill="#9dc3d0">
              既能极稀薄，也能比固体更密
            </text>
            <g className="matter-region-label">
              <path
                d="M130 112V80H110"
                fill="none"
                stroke={matterColors.solid}
              />
              <text x="106" y="75" style={{ fill: matterColors.solid }}>
                固态
              </text>
            </g>
            <g className="matter-region-label">
              <path
                d="M475 112H540V80"
                fill="none"
                stroke={matterColors.liquid}
              />
              <text
                x="540"
                y="75"
                textAnchor="middle"
                style={{ fill: matterColors.liquid }}
              >
                液态
              </text>
            </g>
            <text
              x="116"
              y="302"
              className="matter-region-label"
              style={{ fill: matterColors.gas }}
            >
              气态
            </text>
            {matterExamples.map((p) => {
              const [x, y] = matterPosition(
                  p.temperature,
                  p.id === "fusion" ? fuelMass : p.density,
                ),
                [lx, ly] = p.label,
                c = matterColors[p.kind];
              return (
                <g key={p.id}>
                  <path
                    d={`M${x} ${y}L${lx} ${ly}`}
                    stroke={c}
                    strokeOpacity=".65"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={selected === p.id ? 7 : 5}
                    onClick={() => setSelected(p.id)}
                    style={{ cursor: "pointer" }}
                    fill={c}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="11"
                    fill="none"
                    stroke={c}
                    strokeOpacity={selected === p.id ? 0.9 : 0.25}
                  />
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`查看${p.name}`}
                    className={`matter-node ${selected === p.id ? "selected" : ""}`}
                    onClick={() => setSelected(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(p.id);
                      }
                    }}
                    style={{ color: c }}
                  >
                    <rect
                      x={lx - 70}
                      y={ly - 40}
                      width="176"
                      height="80"
                      rx="8"
                      fill="#112034"
                      stroke={c}
                      strokeOpacity={selected === p.id ? 1 : 0.45}
                    />
                    <svg
                      x={lx - 65}
                      y={ly - 34}
                      width="52"
                      height="52"
                      viewBox="0 0 100 100"
                    >
                      <Miniature icon={p.icon} />
                    </svg>
                    <text x={lx - 7} y={ly - 12} fill={c} fontSize="13">
                      {p.name === "稀薄空间等离子体"
                        ? "空间等离子体"
                        : p.name === "磁约束聚变燃料"
                          ? "磁约束燃料"
                          : p.name}
                    </text>
                    <text x={lx - 7} y={ly + 7} fontSize="11">
                      {p.temperatureShort}
                    </text>
                    <text
                      x={lx + 18}
                      y={ly + 31}
                      textAnchor="middle"
                      className="node-density"
                    >
                      {p.id === "fusion"
                        ? `ρ ≈ ${(fuelMass * 1e6).toFixed(2)} mg/m³`
                        : p.densityShort}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
        <div
          className="matter-detail"
          aria-live="polite"
          style={{ borderColor: color }}
        >
          <span className="matter-badge" style={{ color }}>
            {example.id === "flame"
              ? "气态 · 含少量电离成分"
              : names[example.kind]}
            {example.kind === "plasma" ? " · 第四态" : ""}
          </span>
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label={`${example.name}小示意图`}
            style={{ color }}
          >
            <Miniature icon={example.icon} />
          </svg>
          <h3>{example.name}</h3>
          <dl>
            <dt>温度</dt>
            <dd>{example.temperatureText}</dd>
            <dt>质量密度</dt>
            <dd>
              {example.id === "fusion"
                ? `约 ${(fuelMass * 1e6).toFixed(2)} mg/m³`
                : example.densityText}
            </dd>
          </dl>
          <p>{example.description}</p>
          <a href={example.source} target="_blank" rel="noreferrer">
            查看资料 ↗
          </a>
        </div>
      </div>
      <p className="matter-map-note">
        室温约 293
        K。霓虹灯按电子温度定位，气体本身可以接近室温。色块表示常见跨度，不同物质会重叠；不是某一种物质的相图。
      </p>
    </section>
  );
}

function Cube({
  x,
  y,
  edge,
  color,
}: {
  x: number;
  y: number;
  edge: number;
  color: string;
}) {
  const z = edge * 0.35;
  return (
    <g stroke={color} strokeWidth="1.6" strokeLinejoin="round">
      <path
        d={`M${x} ${y}v${edge}h${edge}V${y}Z`}
        fill={color}
        fillOpacity=".09"
      />
      <path
        d={`M${x} ${y}l${z} ${-z}h${edge}l${-z} ${z}Z`}
        fill={color}
        fillOpacity=".2"
      />
      <path
        d={`M${x + edge} ${y}l${z} ${-z}v${edge}l${-z} ${z}Z`}
        fill={color}
        fillOpacity=".14"
      />
    </g>
  );
}
export function DensityVolumes({ numberRatio }: { numberRatio: number }) {
  const { airEdge, plasmaEdge, plasmaLitres } =
    equalParticleVolumes(numberRatio);
  return (
    <div className="density-volume-figure">
      <svg
        viewBox="0 0 1050 420"
        role="img"
        aria-label={`同样多粒子的体积对比：空气1毫升，等离子体约${Math.round(plasmaLitres)}升`}
      >
        <defs>
          <marker
            id="volume-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="m0 0 8 4-8 4" fill="none" stroke="#7f9fb6" />
          </marker>
        </defs>
        <text x="185" y="37" textAnchor="middle" className="volume-title">
          空气 · 1 mL
        </text>
        <text x="755" y="37" textAnchor="middle" className="volume-title">
          聚变燃料 · 约 {Math.round(plasmaLitres)} L
        </text>
        <Cube
          x={185 - airEdge / 2}
          y={350 - airEdge}
          edge={airEdge}
          color="#adbfda"
        />
        <circle
          cx="185"
          cy="348"
          r="9"
          fill="none"
          stroke="#9cb8d5"
          strokeDasharray="2 3"
        />
        <path
          d="M180 339 128 163"
          fill="none"
          stroke="#91a9c5"
          strokeDasharray="4 4"
        />
        <circle cx="107" cy="127" r="47" fill="#17273b" stroke="#647f9e" />
        <g fill="none" stroke="#b6cfea" strokeWidth="2">
          <path d="M90 98V151Q107 159 124 151V98" />
          <ellipse cx="107" cy="98" rx="17" ry="5" />
          <path d="M115 112H123M115 124H123M115 136H123" />
          <circle cx="101" cy="115" r="2" />
          <circle cx="108" cy="137" r="2" />
        </g>
        <text x="107" y="196" textAnchor="middle" fill="#a7bdd5" fontSize="14">
          放大看：1 mL 空气
        </text>
        <path
          d="M287 184H515"
          fill="none"
          stroke="#7f9fb6"
          markerEnd="url(#volume-arrow)"
        />
        <text x="400" y="160" textAnchor="middle" fill="#cee8ef" fontSize="20">
          同样多的粒子
        </text>
        <text x="400" y="213" textAnchor="middle" fill="#9db8cc" fontSize="15">
          空间放大约 {Math.round(numberRatio / 1e4)} 万倍
        </text>
        <Cube
          x={755 - plasmaEdge * 0.675}
          y={350 - plasmaEdge}
          edge={plasmaEdge}
          color="#65e4f2"
        />
        <text x="755" y="399" textAnchor="middle" fill="#9ac4d2" fontSize="14">
          两侧方块按同一体积比例绘制
        </text>
        <text x="185" y="399" textAnchor="middle" fill="#9db1ca" fontSize="14">
          真实比例下，左边只剩一个小点
        </text>
      </svg>
    </div>
  );
}

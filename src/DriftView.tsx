import PlaybackDuration from "./PlaybackDuration";
import { advanceProgress } from "./playback";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { driftTrack } from "./particles";
import { point, TAU } from "./model";

import {
  DEFAULT_DRIFT_VIEW,
  projectDrift,
  rotateDriftView,
} from "./driftCamera";

const path = (points: number[][]) =>
  points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
const g = { R0: 3, a: 1, rho: 1, kappa: 1, delta: 0 };
const positiveColor = "#ffdec0",
  negativeColor = "#b6a0ff",
  fieldColor = "#65e4f2",
  electricColor = "#f3ad89";
export default function DriftView({
  energy,
  pitch,
  positive,
  negative,
  electric,
}: {
  energy: number;
  pitch: number;
  positive: number;
  negative: number;
  electric: number;
}) {
  const [view, setView] = useState(DEFAULT_DRIFT_VIEW);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const project = useCallback(
    (xyz: [number, number, number]) => projectDrift(xyz, view),
    [view],
  );
  const [progress, setProgress] = useState(0.55),
    [playing, setPlaying] = useState(true),
    [playbackSeconds, setPlaybackSeconds] = useState(8),
    [magnified, setMagnified] = useState(true);
  useEffect(() => {
    setProgress(0);
  }, [energy, pitch, positive, negative]);
  useEffect(() => {
    if (!playing) return;
    let id = 0,
      last = performance.now();
    const tick = (now: number) => {
      if (now - last >= 33) {
        const dt = Math.min(now - last, 100) / 1000;
        last = now;
        setProgress((p) => advanceProgress(p, dt, playbackSeconds / (8 / 6)));
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, playbackSeconds]);
  useEffect(() => {
    if (progress === 1) setPlaying(false);
  }, [progress]);
  const factor = magnified
    ? Math.min(
        300,
        0.85 / (Math.max(Math.abs(positive), Math.abs(negative), 1) * playbackSeconds * 1e-6),
      )
    : 1;
  const tracks = [positive, negative].map((v) =>
    driftTrack(energy, pitch, v, progress, playbackSeconds),
  );
  const wires = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) =>
        path(
          Array.from({ length: 65 }, (_, j) =>
            project(point(g, (i / 24) * TAU, (j / 64) * TAU)),
          ),
        ),
      ),
    [project],
  );
  const loops = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) =>
        path(
          Array.from({ length: 129 }, (_, j) =>
            project(point(g, (j / 128) * TAU, (i / 9) * TAU)),
          ),
        ),
      ),
    [project],
  );
  const origin = project([0, -3.6, 0]);
  const arrow = (from: number[], to: number[], color: string) => (
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      stroke={color}
      strokeWidth="3"
      markerEnd="url(#vector-tip)"
    />
  );
  return (
    <div className="drift-visual">
      <div className="drift-visual-top">
        <span>装置内的导引中心 · 拖动左侧环面旋转</span>
        <button onClick={() => setView(DEFAULT_DRIFT_VIEW)}>
          复位漂移视角
        </button>
        <label>
          <input
            type="checkbox"
            checked={magnified}
            onChange={(e) => setMagnified(e.target.checked)}
          />{" "}
          放大漂移位移 <strong>×{factor.toFixed(1)}</strong>
        </label>
      </div>
      <svg
        viewBox="0 0 1000 420"
        role="img"
        aria-label="环面内漂移动画及磁场、电场和梯度方向"
      >
        <defs>
          <marker
            id="vector-tip"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L6 3 L0 6" fill="context-stroke" />
          </marker>
        </defs>
        <text x="32" y="35" className="drift-svg-title">
          ① 环面中的运动
        </text>
        <g
          className="drift-rotator"
          role="group"
          aria-label="可旋转漂移环面"
          tabIndex={0}
          data-view={`${view.yaw.toFixed(3)},${view.pitch.toFixed(3)}`}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            const previous = drag.current;
            if (!previous || previous.id !== e.pointerId) return;
            setView((v) =>
              rotateDriftView(
                v,
                e.clientX - previous.x,
                e.clientY - previous.y,
              ),
            );
            drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            if (drag.current?.id !== e.pointerId) return;
            drag.current = null;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
          onDoubleClick={() => setView(DEFAULT_DRIFT_VIEW)}
          onKeyDown={(e) => {
            const delta: Record<string, [number, number]> = {
              ArrowLeft: [-20, 0],
              ArrowRight: [20, 0],
              ArrowUp: [0, -20],
              ArrowDown: [0, 20],
            };
            if (e.key === "Home") {
              e.preventDefault();
              setView(DEFAULT_DRIFT_VIEW);
            } else if (delta[e.key]) {
              e.preventDefault();
              setView((v) => rotateDriftView(v, ...delta[e.key]));
            }
          }}
        >
          <rect x="0" y="55" width="595" height="350" fill="transparent" />
          {wires.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#7192b8"
              strokeOpacity=".28"
              strokeWidth=".8"
            />
          ))}
          {loops.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#8eaccb"
              strokeOpacity=".38"
              strokeWidth=".8"
            />
          ))}
          <path
            d={path(
              Array.from({ length: 51 }, (_, i) =>
                project([
                  3.6 * Math.cos(-2.7 + i * 0.025),
                  3.6 * Math.sin(-2.7 + i * 0.025),
                  0,
                ]),
              ),
            )}
            fill="none"
            stroke={fieldColor}
            strokeWidth="3"
            markerEnd="url(#vector-tip)"
          />
          <text x="30" y="82" fill={fieldColor}>
            B：沿环向 +φ（青色箭头）
          </text>
          {electric !== 0 &&
            arrow(
              electric > 0 ? origin : project([0, -5, 0]),
              electric > 0 ? project([0, -5, 0]) : origin,
              electricColor,
            )}
          <text x="30" y="108" fill={electricColor}>
            {electric > 0 ? "E：向外" : electric < 0 ? "E：向内" : "E = 0"}
          </text>

          {arrow(origin, project([0, -2, 0]), "#8fb7b0")}
          <text x="30" y="134" fill="#8fb7b0">
            ∇B、曲率：朝环心
          </text>
          <circle
            cx={origin[0]}
            cy={origin[1]}
            r="11"
            fill="none"
            stroke="#d8e6f7"
            strokeDasharray="3 3"
          />
          {tracks.map((track, i) => {
            const color = i ? negativeColor : positiveColor,
              pts = track.map((p) =>
                project([p.xyz[0], p.xyz[1], p.xyz[2] * factor]),
              ),
              end = pts.at(-1)!;
            return (
              <g key={i}>
                <path
                  d={path(pts)}
                  fill="none"
                  stroke={color}
                  strokeWidth={i ? 2 : 4}
                  strokeDasharray={i ? "6 4" : undefined}
                />
                <circle
                  cx={end[0]}
                  cy={end[1]}
                  r={i ? 5 : 9}
                  fill={i ? color : "#101a2b"}
                  stroke={color}
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </g>
        <text x="32" y="416" fill="#b4c7de">
          拖动旋转 · 双击复位 · 聚焦后可用方向键
        </text>
        <line x1="600" y1="55" x2="600" y2="345" stroke="#2d405b" />
        <text x="635" y="35" className="drift-svg-title">
          ② 沿磁场方向看局部截面
        </text>
        <line
          x1="665"
          y1="265"
          x2="960"
          y2="265"
          stroke="#566e88"
          markerEnd="url(#vector-tip)"
        />
        <line
          x1="790"
          y1="345"
          x2="790"
          y2="72"
          stroke="#566e88"
          markerEnd="url(#vector-tip)"
        />
        <text x="930" y="290" fill="#afc1d5">
          +R
        </text>
        <text x="805" y="82" fill="#afc1d5">
          +Z
        </text>
        <circle
          cx="790"
          cy="265"
          r="15"
          fill="#101a2b"
          stroke={fieldColor}
          strokeWidth="2"
        />
        <path
          d="M783 258 L797 272 M797 258 L783 272"
          stroke={fieldColor}
          strokeWidth="2"
        />
        <text x="650" y="325" fill={fieldColor}>
          B ⊗ 指向屏幕内
        </text>
        {electric !== 0 &&
          arrow(
            [electric > 0 ? 820 : 938, 245],
            [electric > 0 ? 938 : 820, 245],
            electricColor,
          )}
        <text x="880" y="225" fill={electricColor}>
          {electric > 0 ? "E →" : electric < 0 ? "← E" : "无电场"}
        </text>
        {arrow([765, 245], [665, 245], "#8fb7b0")}
        <text x="640" y="225" fill="#8fb7b0">
          ← ∇B、曲率
        </text>
        {tracks.map((track, i) => {
          const z = track.at(-1)!.xyz[2],
            x = 835 + i * 65,
            y = 265 - z * factor * 110,
            color = i ? negativeColor : positiveColor;
          return (
            <g key={i}>
              <line
                x1={x}
                y1="265"
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth="3"
                strokeDasharray={i ? "5 4" : undefined}
                markerEnd={Math.abs(z) > 1e-12 ? "url(#vector-tip)" : undefined}
              />
              <circle cx={x} cy={y} r="6" fill={color} />
              <text x={x + 14} y={y + 5} fill={color}>
                {i ? "−e" : "+e"}
              </text>
            </g>
          );
        })}
        <text x="650" y="400" fill="#a9bdd5">
          同向时轨迹重合；左右分列便于比较
        </text>
      </svg>
      <div className="drift-motion-controls">
        <PlaybackDuration
          context="漂移演示"
          seconds={playbackSeconds}
          unit="μs"
          onChange={setPlaybackSeconds}
        />
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
        <input
          aria-label="漂移动画进度"
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
        <span>{(playbackSeconds * progress).toFixed(2)} μs</span>
      </div>
      <div className="drift-readout">
        <span style={{ color: positiveColor }}>
          ● +e　{Math.abs(positive) < 1e-8 ? "—" : positive > 0 ? "↑" : "↓"}{" "}
          {Math.abs(positive).toFixed(0)} m/s　真实 ΔZ ={" "}
          {(positive * playbackSeconds * 1e-6 * progress * 1000).toFixed(2)} mm
        </span>
        <span style={{ color: negativeColor }}>
          ● −e　{Math.abs(negative) < 1e-8 ? "—" : negative > 0 ? "↑" : "↓"}{" "}
          {Math.abs(negative).toFixed(0)} m/s　真实 ΔZ ={" "}
          {(negative * playbackSeconds * 1e-6 * progress * 1000).toFixed(2)} mm
        </span>
      </div>
      <p className="drift-caption">
        淡蓝环面是空间参考。只放大竖直漂移位移，环向运动与场箭头不放大；非回旋轨道。纯环向教学场未含极向场，完整约束轨道见「粒子轨道」。
      </p>
    </div>
  );
}

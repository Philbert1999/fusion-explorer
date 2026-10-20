import { surfaceGeometry } from "./surface";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { DoubleSide, Mesh, MeshPhysicalMaterial, Vector3 } from "three";
import type React from "react";
import { point, TAU, type Geometry, trace, type Q, hasClosed } from "./model";
import { theme } from "./theme";
type Props = {
  g: Geometry;
  q: Q;
  turns: number;
  theta: number;
  progress: number;
  mode: string;
  overlay: boolean;
  opacity: number;
  view: string;
  reset: number;
};
export function GrowingLine({
  data,
  progress,
  color = theme.line,
}: {
  data: { xyz: [number, number, number] }[];
  progress: number;
  color?: string;
}) {
  const ref = useRef<React.ComponentRef<typeof Line>>(null);
  const points = useMemo(() => data.map((p) => p.xyz), [data]);
  useFrame(() => {
    if (ref.current)
      ref.current.geometry.instanceCount = Math.max(
        0,
        Math.floor(progress * (data.length - 1)),
      );
  });
  return <Line ref={ref} points={points} color={color} lineWidth={2} />;
}
export function Camera({
  g,
  view,
  reset,
  distanceScale = 1,
}: {
  g: Geometry;
  view: string;
  reset: number;
  distanceScale?: number;
}) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null),
    destination = useRef(new Vector3()),
    moving = useRef(true);
  const { camera, size } = useThree();
  useEffect(() => {
    const extent = Math.max(g.R0 + g.a, g.kappa * g.a);
    const d =
      (extent * 2.8 * distanceScale) / Math.min(1, size.width / size.height);
    const direction =
      view === "top"
        ? [0, -0.001, 1]
        : view === "side"
          ? [0, -1, 0.001]
          : view === "section"
            ? [0, 1, 0.001]
            : [0.62, -0.85, 0.65];
    destination.current
      .set(...(direction as [number, number, number]))
      .normalize()
      .multiplyScalar(d);
    camera.up.set(0, 0, 1);
    camera.far = d * 20;
    camera.updateProjectionMatrix();
    moving.current = true;
  }, [g, view, reset, size.width, size.height, camera, distanceScale]);
  useFrame((_, dt) => {
    if (moving.current && controls.current) {
      camera.position.lerp(destination.current, 1 - Math.exp(-7 * dt));
      controls.current.target.lerp(new Vector3(), 1 - Math.exp(-7 * dt));
      controls.current.update();
      if (camera.position.distanceTo(destination.current) < 0.005)
        moving.current = false;
    }
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      onStart={() => (moving.current = false)}
      minDistance={g.a * 0.5}
      maxDistance={g.R0 * 25}
    />
  );
}
function Contents(p: Props) {
  const { g, q, turns, theta, progress, mode, overlay, opacity } = p;
  const traces = useMemo(
    () =>
      Array.from({ length: mode === "multiple" ? 3 : 1 }, (_, i) =>
        trace(g, q, turns, theta + (i * TAU) / 3),
      ),
    [g, q, turns, theta, mode],
  );
  const surface = useMemo(() => {
    return surfaceGeometry(g);
  }, [g]);
  useEffect(() => () => surface.dispose(), [surface]);
  const wires = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 129 }, (_, j) =>
          point(g, (j / 128) * TAU, (i / 12) * TAU),
        ),
      ),
    [g],
  );
  const material = useRef<MeshPhysicalMaterial>(null);
  const end = useRef<Mesh>(null),
    arrow = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (material.current) {
      const target =
        mode === "surface" || overlay
          ? mode === "surface"
            ? opacity
            : opacity * 0.85
          : 0;
      material.current.opacity +=
        (target - material.current.opacity) * (1 - Math.exp(-10 * dt));
    }
    const t = traces[0],
      index = Math.floor(progress * (t.length - 1));
    if (end.current) end.current.position.set(...t[index].xyz);
    if (arrow.current) {
      arrow.current.visible = progress > 0;
      const i = Math.max(1, index - 10);
      arrow.current.position.set(...t[i].xyz);
      const next = new Vector3(...t[Math.min(i + 1, t.length - 1)].xyz);
      arrow.current.quaternion.setFromUnitVectors(
        new Vector3(0, 1, 0),
        next.sub(arrow.current.position).normalize(),
      );
    }
  });
  const showLine = mode !== "surface" || overlay;
  return (
    <>
      <Camera g={g} view={p.view} reset={p.reset} />
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[4, -6, 10]}
        intensity={2.2}
        color="#d9e7ff"
      />
      <directionalLight
        position={[-6, 4, 3]}
        intensity={2}
        color={theme.accent}
      />
      <mesh geometry={surface}>
        <meshPhysicalMaterial
          ref={material}
          color={theme.surface}
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.01}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      {wires.map((v, i) => (
        <Line
          key={i}
          points={v}
          color={theme.grid}
          lineWidth={0.5}
          transparent
          opacity={0.18}
        />
      ))}
      {showLine && (
        <>
          {traces.map((data, i) => (
            <GrowingLine
              key={i}
              data={data}
              progress={progress}
              color={i === 1 ? theme.accent : i === 2 ? "#b8f4df" : theme.line}
            />
          ))}
          <mesh position={traces[0][0].xyz}>
            <sphereGeometry args={[g.a * 0.045, 16, 16]} />
            <meshBasicMaterial color={theme.start} />
          </mesh>
          <mesh ref={end}>
            <sphereGeometry args={[g.a * 0.04, 16, 16]} />
            <meshBasicMaterial color={theme.end} />
          </mesh>
          <mesh ref={arrow}>
            <coneGeometry args={[g.a * 0.045, g.a * 0.15, 12]} />
            <meshBasicMaterial color={theme.line} />
          </mesh>
          {hasClosed(q, progress, turns) && (
            <mesh position={traces[0][0].xyz}>
              <sphereGeometry args={[g.a * 0.09, 20, 20]} />
              <meshBasicMaterial color={theme.accent} wireframe />
            </mesh>
          )}
        </>
      )}
    </>
  );
}
export default function Scene(p: Props) {
  return (
    <Canvas
      camera={{ position: [8, -10, 8], up: [0, 0, 1], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[theme.background]} />
      <Contents {...p} />
    </Canvas>
  );
}

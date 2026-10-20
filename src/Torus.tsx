import { useEffect, useMemo } from "react";
import { DoubleSide } from "three";
import { type Geometry } from "./model";
import { surfaceGeometry } from "./surface";
import { stellaratorPoint } from "./stellarator";
export default function Torus({
  g,
  color,
  opacity = 0.7,
  periods,
}: {
  g: Geometry;
  color: string;
  opacity?: number;
  periods?: number;
}) {
  const geometry = useMemo(
    () =>
      surfaceGeometry(
        g,
        periods
          ? (phi, theta) => stellaratorPoint(g, periods, phi, theta)
          : undefined,
      ),
    [g.R0, g.a, g.rho, g.kappa, g.delta, periods],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.32}
        metalness={0.25}
        transparent
        opacity={opacity}
        depthWrite={opacity >= 1}
        side={DoubleSide}
      />
    </mesh>
  );
}

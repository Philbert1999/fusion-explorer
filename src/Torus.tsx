import { useEffect, useMemo } from "react";
import { DoubleSide } from "three";
import { type Geometry } from "./model";
import { surfaceGeometry } from "./surface";
import { stellaratorPoint, variedStellaratorPoint } from "./stellarator";
export default function Torus({
  g,
  color,
  opacity = 0.7,
  periods,
  varied = false,
}: {
  g: Geometry;
  color: string;
  opacity?: number;
  periods?: number;
  varied?: boolean;
}) {
  const geometry = useMemo(
    () =>
      surfaceGeometry(
        g,
        periods
          ? (phi, theta) =>
              (varied ? variedStellaratorPoint : stellaratorPoint)(
                g,
                periods,
                phi,
                theta,
              )
          : undefined,
      ),
    [g.R0, g.a, g.rho, g.kappa, g.delta, periods, varied],
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

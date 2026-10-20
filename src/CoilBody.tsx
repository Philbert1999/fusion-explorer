import { useMemo, useEffect } from "react";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
export default function CoilBody({
  points,
  color,
  opacity,
  radius = 0.075,
}: {
  points: [number, number, number][];
  color: string;
  opacity: number;
  radius?: number;
}) {
  const geometry = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3(
          points.slice(0, -1).map((p) => new Vector3(...p)),
          true,
        ),
        256,
        radius,
        8,
        true,
      ),
    [points, radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.3}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity >= 1}
      />
    </mesh>
  );
}

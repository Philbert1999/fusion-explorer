import { BufferGeometry, Float32BufferAttribute } from "three";
import { point, TAU, type Geometry } from "./model";
export function surfaceGeometry(
  g: Geometry,
  sample = (phi: number, theta: number) => point(g, phi, theta),
) {
  const vertices: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 128; i++)
    for (let j = 0; j <= 64; j++)
      vertices.push(...sample((i / 128) * TAU, (j / 64) * TAU));
  for (let i = 0; i < 128; i++)
    for (let j = 0; j < 64; j++) {
      const k = i * 65 + j;
      indices.push(k, k + 65, k + 1, k + 1, k + 65, k + 66);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

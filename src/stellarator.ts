import { TAU, type Geometry } from "./model";
// Area-preserving rotating ellipse; pedagogical shape, not VMEC or a device equilibrium.
export function stellaratorPoint(
  g: Geometry,
  periods: number,
  phi: number,
  theta: number,
): [number, number, number] {
  const angle = periods * phi,
    r = g.a * g.rho,
    u = r * Math.sqrt(1.7) * Math.cos(theta),
    v = (r / Math.sqrt(1.7)) * Math.sin(theta);
  const R =
    g.R0 +
    0.12 * g.a * Math.cos(angle) +
    u * Math.cos(angle) -
    v * Math.sin(angle);
  const Z =
    0.12 * g.a * Math.sin(angle) + u * Math.sin(angle) + v * Math.cos(angle);
  return [R * Math.cos(phi), R * Math.sin(phi), Z];
}
export function driftProjection(cycles: number, transform: boolean, bias = 0) {
  if (
    ![cycles, bias].every(Number.isFinite) ||
    cycles < 0 ||
    cycles > 4 ||
    Math.abs(bias) > 1
  )
    throw new Error("Invalid illustrative drift input");
  return {
    phase: Math.PI / 2 + (transform ? TAU * cycles : 0),
    radial: transform ? Math.cos(TAU * cycles) + bias : 1,
    displacement: transform
      ? Math.sin(TAU * cycles) / TAU + bias * cycles
      : cycles,
  };
}

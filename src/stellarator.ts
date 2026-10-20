import { TAU, type Geometry } from "./model";
// shortcut: W7-X-inspired teaching contours; use measured/VMEC boundary coefficients for device geometry.
export function variedStellaratorPoint(
  g: Geometry,
  periods: number,
  phi: number,
  theta: number,
): [number, number, number] {
  const w = periods * phi,
    b = Math.max(0, Math.cos(w)),
    tri = Math.max(0, -Math.cos(w));
  const r = g.a * g.rho,
    u =
      0.9 *
      r *
      (Math.cos(theta) + (0.3 * b + 0.22 * tri) * Math.cos(2 * theta)),
    v =
      r *
      (1.25 + 0.55 * Math.sin(w) ** 2) *
      (Math.sin(theta) - 0.22 * tri * Math.sin(2 * theta));
  const tilt = 0.35 * Math.sin(w),
    R =
      g.R0 + 0.1 * g.a * Math.cos(w) + u * Math.cos(tilt) - v * Math.sin(tilt),
    Z = 0.1 * g.a * Math.sin(w) + u * Math.sin(tilt) + v * Math.cos(tilt);
  return [R * Math.cos(phi), R * Math.sin(phi), Z];
}
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

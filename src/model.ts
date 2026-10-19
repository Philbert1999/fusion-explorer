export const TAU = 2 * Math.PI;
export type Q =
  | { kind: "rational"; m: number; n: number }
  | { kind: "irrational"; symbol: "√2" | "π" }
  | { kind: "numeric"; value: number };
export type Geometry = {
  R0: number;
  a: number;
  rho: number;
  kappa: number;
  delta: number;
};
export const DEFAULT_GEOMETRY: Geometry = {
  R0: 3,
  a: 1,
  rho: 0.8,
  kappa: 1,
  delta: 0,
};
export const DEFAULT_CAMERA: [number, number, number] = [7, -9, 7];
export function rational(m: number, n: number): Q {
  if (
    !Number.isSafeInteger(m) ||
    !Number.isSafeInteger(n) ||
    m <= 0 ||
    n <= 0 ||
    m > 10000 ||
    n > 10000
  )
    throw Error("m、n 必须是 1–10000 的整数");
  let a = m,
    b = n;
  while (b) {
    [a, b] = [b, a % b];
  }
  return { kind: "rational", m: m / a, n: n / a };
}
export function qValue(q: Q) {
  return q.kind === "rational"
    ? q.m / q.n
    : q.kind === "numeric"
      ? q.value
      : q.symbol === "√2"
        ? Math.SQRT2
        : Math.PI;
}
export function closure(q: Q) {
  return q.kind === "rational" ? { toroidal: q.m, poloidal: q.n } : null;
}
export function validateGeometry(g: Geometry) {
  if (
    !Object.values(g).every(Number.isFinite) ||
    g.a <= 0 ||
    g.R0 <= g.a ||
    g.rho <= 0 ||
    g.rho > 1 ||
    g.kappa <= 0 ||
    Math.abs(g.delta) >= 1
  )
    throw Error("要求 R₀ > a > 0，0 < ρ ≤ 1，κ > 0，|δ| < 1");
}
export function section(
  g: Geometry,
  theta: number,
  r = g.a * g.rho,
): [number, number] {
  return [
    g.R0 + r * Math.cos(theta + Math.asin(g.delta) * Math.sin(theta)),
    g.kappa * r * Math.sin(theta),
  ];
}
export function point(
  g: Geometry,
  phi: number,
  theta: number,
): [number, number, number] {
  const [R, Z] = section(g, theta);
  return [R * Math.cos(phi), R * Math.sin(phi), Z];
}
export function trace(g: Geometry, q: Q, turns: number, theta0: number) {
  validateGeometry(g);
  const v = qValue(q);
  if (
    !Number.isFinite(v) ||
    v < 0.05 ||
    v > 100 ||
    !Number.isFinite(turns) ||
    turns < 1 ||
    turns > 100 ||
    !Number.isFinite(theta0)
  )
    throw Error("q 范围 0.05–100，追踪圈数范围 1–100");
  const steps = Math.ceil(turns * 180 * Math.max(1, 1 / v));
  if (steps > 60000) throw Error("采样预算为 60,000 段，请减少圈数或增大 q");
  return Array.from({ length: steps + 1 }, (_, i) => {
    const phi = (TAU * turns * i) / steps;
    const theta = theta0 + phi / v;
    return { phi, theta, xyz: point(g, phi, theta) };
  });
}
export function poincare(g: Geometry, q: Q, turns: number, theta0: number) {
  return Array.from({ length: Math.floor(turns) }, (_, i) => {
    const turn = i + 1;
    const theta = theta0 + (TAU * turn) / qValue(q);
    return {
      turn,
      theta,
      rz: section(g, theta),
      xyz: point(g, TAU * turn, theta),
    };
  });
}

export function progressTurns(progress: number, turns: number) {
  return Math.max(0, Math.min(1, progress)) * turns;
}
export function hasClosed(q: Q, progress: number, turns: number) {
  const c = closure(q);
  return c !== null && progressTurns(progress, turns) >= c.toroidal;
}

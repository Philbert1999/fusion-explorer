// Circular axisymmetric teaching field; independent of shaped device presets.
export const E_CHARGE = 1.602176634e-19;
export const MASS = 3.3435837724e-27;
type V = [number, number, number];
const dot = (a: V, b: V) => a.reduce((s, x, i) => s + x * b[i], 0);
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export function field(R: number, Z: number): V {
  return [-Z / R, 6 / R, (R - 3) / R];
}
const magnitude = (v: V) => Math.hypot(...v);
const unit = (R: number, Z: number) => {
  const B = field(R, Z),
    n = magnitude(B);
  return B.map((x) => x / n) as V;
};
export function drifts(
  energy: number,
  pitch: number,
  B: number,
  R: number,
  electric: number,
  sign = 1,
) {
  if (
    ![energy, pitch, B, R, electric].every(Number.isFinite) ||
    energy <= 0 ||
    B <= 0 ||
    R <= 0 ||
    Math.abs(sign) !== 1
  )
    throw new Error("Invalid drift parameters");
  const v2 = (2 * energy * 1000 * E_CHARGE) / MASS,
    angle = (pitch * Math.PI) / 180;
  return {
    gradient:
      (MASS * v2 * Math.sin(angle) ** 2) / (2 * sign * E_CHARGE * B * R),
    curvature: (MASS * v2 * Math.cos(angle) ** 2) / (sign * E_CHARGE * B * R),
    electric: electric / B,
  };
}
export type OrbitPoint = {
  t: number;
  R: number;
  Z: number;
  phi: number;
  parallel: number;
  xyz: V;
};
// Local pure-toroidal drift decomposition, not the full tokamak orbit solver.
export function driftTrack(
  energy: number,
  pitch: number,
  velocity: number,
  progress: number,
  horizonUs = 8,
) {
  if (
    ![energy, pitch, velocity, progress, horizonUs].every(Number.isFinite) ||
    energy <= 0 ||
    pitch < 0 ||
    pitch > 90 ||
    progress < 0 ||
    progress > 1 ||
    horizonUs < 1 ||
    horizonUs > 120
  )
    throw new Error("Invalid drift trace");
  const parallel =
    Math.sqrt((2 * energy * 1000 * E_CHARGE) / MASS) *
    Math.cos((pitch * Math.PI) / 180);
  return Array.from({ length: 121 }, (_, i) => {
    const t = (horizonUs * 1e-6 * progress * i) / 120,
      phi = -Math.PI / 2 + (parallel * t) / 3.6;
    return {
      t,
      xyz: [3.6 * Math.cos(phi), 3.6 * Math.sin(phi), velocity * t] as V,
    };
  });
}
export function orbit(energy = 100, pitch = 75, duration = 150, steps = 6000) {
  if (
    ![energy, pitch, duration, steps].every(Number.isFinite) ||
    energy < 1 ||
    energy > 150 ||
    pitch < 5 ||
    pitch > 85 ||
    duration < 10 ||
    duration > 250 ||
    !Number.isInteger(steps) ||
    steps < 100 ||
    steps > 24000
  )
    throw new Error("Particle parameters out of range");
  const speed = Math.sqrt((2 * energy * 1000 * E_CHARGE) / MASS),
    mu =
      (MASS * (speed * Math.sin((pitch * Math.PI) / 180)) ** 2) /
      (2 * magnitude(field(3.6, 0)));
  const dt = (duration * 1e-6) / steps;
  type State = [number, number, number, number];
  let state: State = [3.6, 0, 0, speed * Math.cos((pitch * Math.PI) / 180)];
  function derivative([R, , Z, v]: State): State {
    const h = 1e-5,
      B = field(R, Z),
      b = unit(R, Z);
    const dR = unit(R + h, Z).map((x, i) => (x - unit(R - h, Z)[i]) / (2 * h));
    const dZ = unit(R, Z + h).map((x, i) => (x - unit(R, Z - h)[i]) / (2 * h));
    const curl: V = [-dZ[1], dZ[0] - dR[2], b[1] / R + dR[1]];
    const star = B.map((x, i) => x + ((MASS * v) / E_CHARGE) * curl[i]) as V,
      denominator = dot(b, star);
    const grad: V = [
      (magnitude(field(R + h, Z)) - magnitude(field(R - h, Z))) / (2 * h),
      0,
      (magnitude(field(R, Z + h)) - magnitude(field(R, Z - h))) / (2 * h),
    ];
    const drift = cross(b, grad),
      velocity = star.map(
        (x, i) => (v * x + (mu / E_CHARGE) * drift[i]) / denominator,
      );
    return [
      velocity[0],
      velocity[1] / R,
      velocity[2],
      ((-mu / MASS) * dot(star, grad)) / denominator,
    ];
  }
  const points: OrbitPoint[] = [];
  let error = 0,
    momentumError = 0,
    bounces = 0,
    winding = 0,
    stopped = false;
  const initialEnergy = energy * 1000 * E_CHARGE;
  const momentum = (s: State) =>
    (E_CHARGE * ((s[0] - 3) ** 2 + s[2] ** 2)) / 2 +
    MASS * s[0] * s[3] * unit(s[0], s[2])[1];
  const initialMomentum = momentum(state);
  for (let i = 0; i <= steps; i++) {
    const [R, phi, Z, v] = state;
    if (!state.every(Number.isFinite) || R <= 0 || Math.hypot(R - 3, Z) >= 1) {
      stopped = true;
      break;
    }
    const previous = points.at(-1);
    if (previous) {
      if (v * previous.parallel < 0) bounces++;
      const change =
        Math.atan2(Z, R - 3) - Math.atan2(previous.Z, previous.R - 3);
      winding += Math.atan2(Math.sin(change), Math.cos(change));
    }
    points.push({
      t: i * dt,
      R,
      Z,
      phi,
      parallel: v,
      xyz: [R * Math.cos(phi), R * Math.sin(phi), Z],
    });
    error = Math.max(
      error,
      Math.abs(
        ((MASS * v * v) / 2 + mu * magnitude(field(R, Z))) / initialEnergy - 1,
      ),
    );
    momentumError = Math.max(
      momentumError,
      Math.abs(momentum(state) - initialMomentum) /
        (Math.abs(initialMomentum) + E_CHARGE),
    );
    if (i === steps) break;
    const add = (k: State, f: number) =>
      state.map((x, j) => x + dt * k[j] * f) as State;
    const k1 = derivative(state),
      k2 = derivative(add(k1, 0.5)),
      k3 = derivative(add(k2, 0.5)),
      k4 = derivative(add(k3, 1));
    state = state.map(
      (x, j) => x + (dt * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])) / 6,
    ) as State;
  }
  return {
    points,
    error,
    momentumError,
    bounces,
    stopped,
    kind:
      bounces >= 2
        ? "trapped"
        : bounces === 0 && Math.abs(winding) >= 2 * Math.PI
          ? "passing"
          : "undetermined",
    mu,
  };
}

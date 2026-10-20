import { relaxation } from "./extraInstabilities";
import { point, TAU, type Geometry } from "./model";
export type Mechanism =
  | "kink"
  | "tearing"
  | "ballooning"
  | "diffusion"
  | "itg"
  | "tem"
  | "etg"
  | "elm"
  | "sawtooth"
  | "rwm";
export const localGeometry: Geometry = {
  R0: 3,
  a: 1,
  rho: 0.72,
  kappa: 1,
  delta: 0,
};
// shortcut: prescribed shapes and diffusion quantiles, replace with an MHD/transport solver for predictions.
export function localPoint(
  kind: Mechanism,
  phi: number,
  theta: number,
  progress: number,
): [number, number, number] {
  const amplitude = 0.32 * Math.min(progress, 1);
  if (kind === "elm") {
    const phase = progress - Math.floor(progress),
      burst = Math.sin(Math.PI * Math.max(0, (phase - 0.65) / 0.35)) ** 2;
    return point(
      {
        ...localGeometry,
        rho:
          0.92 +
          (0.35 *
            burst *
            Math.exp(-3 * (1 - Math.cos(theta))) *
            (1 + Math.cos(8 * phi))) /
            2,
      },
      phi,
      theta,
    );
  }
  if (kind === "kink" || kind === "rwm" || kind === "sawtooth") {
    const p = point(
      { ...localGeometry, rho: kind === "sawtooth" ? 0.35 : 0.72 },
      phi,
      theta,
    );
    const shift =
      kind === "sawtooth"
        ? 0.22 * relaxation(progress)
        : kind === "rwm"
          ? 0.32 * (1 - Math.exp(-progress / 2))
          : amplitude;
    return [
      p[0] + shift * Math.cos(phi) * Math.cos(phi),
      p[1] + shift * Math.cos(phi) * Math.sin(phi),
      p[2] + shift * Math.sin(phi),
    ];
  }
  const rho =
    0.72 +
    (kind === "ballooning"
      ? amplitude *
        Math.exp(-3 * (1 - Math.cos(theta))) *
        Math.cos(6 * phi - TAU * progress)
      : 0);
  return point({ ...localGeometry, rho }, phi, theta);
}
export function diffusionSigma(progress: number) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 4)
    throw Error("Invalid normalized time");
  return Math.sqrt(0.035 ** 2 + 2 * 0.006 * progress);
}

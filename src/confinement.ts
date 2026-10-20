import { TAU } from "./model";

export type ConfinementKind = "mirror" | "frc" | "pinch" | "inertial";
export type Vec = [number, number, number];

export function mirrorCondition(ratio: number, pitchDegrees: number) {
  if (!Number.isFinite(ratio) || ratio <= 1 || !Number.isFinite(pitchDegrees) || pitchDegrees < 0 || pitchDegrees > 90)
    throw Error("Invalid mirror conditions");
  return {
    criticalAngle: Math.asin(1 / Math.sqrt(ratio)) * 180 / Math.PI,
    trapped: ratio * Math.sin(pitchDegrees * Math.PI / 180) ** 2 > 1,
  };
}

export function mirrorField(x: number, ratio: number) {
  return 1 + (ratio - 1) * (x / 3) ** 4;
}

// shortcut: visual bounce/gyro phases, replace with orbit integration for quantitative mirror trajectories.
export function mirrorParticle(seconds: number, ratio: number, pitch: number): Vec {
  const { trapped } = mirrorCondition(ratio, pitch);
  const s = Math.sin(pitch * Math.PI / 180);
  const turn = trapped ? 3 * ((1 / (s * s) - 1) / (ratio - 1)) ** 0.25 : 0;
  const x = trapped ? turn * Math.sin(seconds * 1.7) : Math.min(5.2, seconds * 1.5);
  const radius = 0.3 / Math.sqrt(mirrorField(x, ratio));
  return [x, radius * Math.cos(seconds * 10), radius * Math.sin(seconds * 10)];
}

export function frcFlux(x: number, r: number) {
  return r * r * (1 - r * r - (x / 2.8) ** 2);
}

export function frcContour(flux: number, azimuth = 0): Vec[] {
  if (!Number.isFinite(flux) || flux <= 0 || flux >= 0.25)
    throw Error("Flux must be inside the closed FRC region");
  const limit = 2.8 * Math.sqrt(1 - 2 * Math.sqrt(flux));
  const points: Vec[] = [];
  for (const sign of [1, -1]) {
    for (let i = 0; i <= 100; i++) {
      const x = limit * (sign === 1 ? -1 + 2 * i / 100 : 1 - 2 * i / 100);
      const b = 1 - (x / 2.8) ** 2;
      const r = Math.sqrt((b + sign * Math.sqrt(Math.max(0, b * b - 4 * flux))) / 2);
      points.push([x, r * Math.cos(azimuth), r * Math.sin(azimuth)]);
    }
  }
  points.push([...points[0]]);
  return points;
}

export function pulseFrame(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) throw Error("Invalid pulse time");
  const phase = (seconds % 6) / 6;
  const squeeze = Math.max(0, Math.min(1, (phase - 0.12) / 0.43));
  const expansion = Math.max(0, Math.min(1, (phase - 0.7) / 0.3));
  return {
    phase,
    cycle: Math.floor(seconds / 6) + 1,
    radius: 1 - 0.76 * squeeze + 0.6 * expansion,
    burning: phase >= 0.55 && phase < 0.7,
    stage: phase < 0.12 ? "准备燃料" : phase < 0.55 ? "向内压缩" : phase < 0.7 ? "中心燃烧" : "向外膨胀",
  };
}

export function circle(x: number, radius: number, reverse = false): Vec[] {
  return Array.from({ length: 97 }, (_, i) => {
    const angle = (reverse ? -1 : 1) * TAU * i / 96;
    return [x, radius * Math.cos(angle), radius * Math.sin(angle)];
  });
}

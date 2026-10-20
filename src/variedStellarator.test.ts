import { it, expect } from "vitest";
import { variedStellaratorPoint } from "./stellarator";
import { TAU } from "./model";
it("keeps a clear central opening at W7-X reference proportions", () => {
  const slender = { R0: 5.5, a: 0.53, rho: 1.4, kappa: 1, delta: 0 };
  for (let j = 0; j < 64; j++)
    for (let i = 0; i < 64; i++) {
      const p = variedStellaratorPoint(
        slender,
        5,
        (TAU * j) / 64,
        (TAU * i) / 64,
      );
      expect(Math.hypot(p[0], p[1])).toBeGreaterThan(4.3);
      expect(Math.abs(p[2])).toBeLessThan(1.5);
    }
});
const g = { R0: 3, a: 1, rho: 1, kappa: 1, delta: 0 };
it("has periodic, closed, simple and visibly different teaching sections", () => {
  const spans: number[][] = [];
  for (const phi of [0, Math.PI / 10, Math.PI / 5]) {
    const pts = Array.from({ length: 128 }, (_, i) => {
      const p = variedStellaratorPoint(g, 5, phi, (TAU * i) / 128);
      expect(p.every(Number.isFinite)).toBe(true);
      return [Math.hypot(p[0], p[1]), p[2]];
    });
    const cross = (a: number[], b: number[], c: number[]) =>
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (let i = 0; i < 128; i++)
      for (let j = i + 2; j < 128; j++) {
        if (i === 0 && j === 127) continue;
        const a = pts[i],
          b = pts[(i + 1) % 128],
          c = pts[j],
          d = pts[(j + 1) % 128];
        expect(
          cross(a, b, c) * cross(a, b, d) < 0 &&
            cross(c, d, a) * cross(c, d, b) < 0,
        ).toBe(false);
      }
    const first = variedStellaratorPoint(g, 5, phi, 0),
      last = variedStellaratorPoint(g, 5, phi, TAU);
    last.forEach((x, i) => expect(x).toBeCloseTo(first[i], 9));
    spans.push([
      Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])),
      Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1])),
    ]);
  }
  expect(spans[1][1] / spans[1][0]).toBeGreaterThan(spans[0][1] / spans[0][0]);
  const a = variedStellaratorPoint(g, 5, 0, 0.4),
    b = variedStellaratorPoint(g, 5, TAU, 0.4);
  b.forEach((x, i) => expect(x).toBeCloseTo(a[i], 9));
});

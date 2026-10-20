import { describe, it, expect } from "vitest";
import { devices, deviceBounds } from "./devices";
import { validateGeometry, TAU } from "./model";
import { stellaratorPoint, driftProjection } from "./stellarator";
describe("device directory and stellarator teaching model", () => {
  it("has unique sourced devices and six stellarators", () => {
    expect(new Set(devices.map((d) => d.name)).size).toBe(devices.length);
    expect(devices.filter((d) => d.family === "stellarator")).toHaveLength(6);
    expect(devices.length).toBeGreaterThanOrEqual(28);
    for (const d of devices) {
      expect(() => validateGeometry(d.geometry)).not.toThrow();
      expect(new URL(d.source).protocol).toBe("https:");
      if (d.periods)
        expect(Number.isInteger(d.periods) && d.periods > 0).toBe(true);
    }
  });
  it("uses a periodic non-self-intersecting radial envelope for illustrative surfaces", () => {
    for (const d of devices.filter((d) => d.periods)) {
      const b = deviceBounds(d, true);
      for (let phi = 0; phi <= TAU; phi += 0.15)
        for (let theta = 0; theta < TAU; theta += 0.3) {
          const p = stellaratorPoint(d.geometry, d.periods!, phi, theta);
          expect(Math.hypot(p[0], p[1])).toBeGreaterThan(0);
          expect(Math.hypot(p[0], p[1])).toBeLessThanOrEqual(b.radius + 1e-10);
          expect(Math.abs(p[2])).toBeLessThanOrEqual(b.height + 1e-10);
        }
      const p = stellaratorPoint(d.geometry, d.periods!, 0, 0.4),
        q = stellaratorPoint(d.geometry, d.periods!, TAU, 0.4);
      q.forEach((v, i) => expect(v).toBeCloseTo(p[i], 9));
      const next = stellaratorPoint(
        d.geometry,
        d.periods!,
        TAU / d.periods!,
        0.4,
      );
      expect(Math.hypot(next[0], next[1])).toBeCloseTo(
        Math.hypot(p[0], p[1]),
        9,
      );
      expect(next[2]).toBeCloseTo(p[2], 9);
    }
  });
  it("rotation changes radial projection without suppressing local drift", () => {
    expect(driftProjection(0, true).radial).toBeCloseTo(1);
    expect(driftProjection(0.5, true).radial).toBeCloseTo(-1);
    expect(driftProjection(2, true).displacement).toBeCloseTo(0);
    expect(driftProjection(2, false).displacement).toBe(2);
    expect(driftProjection(2, true, 0.1).displacement).toBeCloseTo(0.2);
    expect(() => driftProjection(NaN, true)).toThrow();
  });
});

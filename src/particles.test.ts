import { describe, it, expect } from "vitest";
import { drifts, driftTrack, orbit } from "./particles";
describe("guiding centre physics", () => {
  it("drift demonstration follows +B with physical z=v t and reverses correctly", () => {
    const p = driftTrack(10, 45, 500, 1),
      n = driftTrack(10, 45, -500, 1),
      half = driftTrack(10, 45, 500, 0.5);
    expect(p[0].xyz[1]).toBeCloseTo(-3.6);
    expect(p[1].xyz[0]).toBeGreaterThan(p[0].xyz[0]);
    expect(p.at(-1)!.xyz[2]).toBeCloseTo(0.004);
    expect(n.at(-1)!.xyz[2]).toBeCloseTo(-0.004);
    expect(half.at(-1)!.t).toBeCloseTo(4e-6);
    for (const sample of p)
      expect(Math.hypot(sample.xyz[0], sample.xyz[1])).toBeCloseTo(3.6);
    expect(driftTrack(10, 45, 0, 1).at(-1)!.xyz[2]).toBe(0);
    expect(() => driftTrack(10, 45, 500, 2)).toThrow();
  });
  it("magnetic drifts reverse with charge; E×B does not", () => {
    const p = drifts(10, 45, 2, 3.6, 100),
      n = drifts(10, 45, 2, 3.6, 100, -1);
    expect(p.gradient).toBe(-n.gradient);
    expect(p.curvature).toBe(-n.curvature);
    expect(p.electric).toBe(n.electric);
    expect(drifts(10, 45, 2, 3.6, -100).electric).toBe(-p.electric);
    expect(drifts(10, 45, 4, 3.6, 100).gradient).toBeCloseTo(p.gradient / 2);
  });
  it("passing particles transit, trapped particles bounce; invariants remain conserved", () => {
    for (const [pitch, kind] of [
      [25, "passing"],
      [75, "trapped"],
    ] as const) {
      const result = orbit(100, pitch);
      expect(result.kind).toBe(kind);
      expect(result.stopped).toBe(false);
      expect(result.error).toBeLessThan(1e-5);
      expect(result.momentumError).toBeLessThan(1e-5);
      expect(result.points).toHaveLength(6001);
    }
  });
  it("converges when time step is halved", () => {
    const a = orbit(100, 75, 150, 3000).points.at(-1)!,
      b = orbit().points.at(-1)!;
    expect(Math.hypot(a.R - b.R, a.Z - b.Z)).toBeLessThan(1e-5);
  });
  it("rejects invalid inputs", () => {
    expect(() => orbit(NaN)).toThrow();
    expect(() => orbit(100, 90)).toThrow();
    expect(() => orbit(100, 75, 150, 1e8)).toThrow();
  });
});


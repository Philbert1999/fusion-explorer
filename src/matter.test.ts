import { expect, it } from "vitest";
import { matterPosition, matterExamples, equalParticleVolumes } from "./matter";
it("places positive data on logarithmic axes with equal decade spacing", () => {
  expect(matterPosition(10, 1e-21)).toEqual([100, 510]);
  expect(matterPosition(1e9, 1e6)).toEqual([1140, 60]);
  const a = matterPosition(100, 1),
    b = matterPosition(1000, 1000),
    c = matterPosition(10000, 1e6);
  expect(b[0] - a[0]).toBeCloseTo(c[0] - b[0]);
  expect(b[1] - a[1]).toBeCloseTo(c[1] - b[1]);
  for (const p of matterExamples)
    expect(
      matterPosition(p.temperature, p.density).every(Number.isFinite),
    ).toBe(true);
  expect(() => matterPosition(0, 1)).toThrow();
});
it("keeps cube volume proportional to particle count rather than its edge length", () => {
  const a = equalParticleVolumes(250000),
    b = equalParticleVolumes(125000);
  expect((a.plasmaEdge / a.airEdge) ** 3).toBeCloseTo(250000, 4);
  expect(a.plasmaLitres).toBe(250);
  expect((a.plasmaEdge / b.plasmaEdge) ** 3).toBeCloseTo(2, 9);
  expect(() => equalParticleVolumes(-1)).toThrow();
});
it("keeps example labels separated with room for their icons and readings", () => {
  for (let i = 0; i < matterExamples.length; i++)
    for (let j = i + 1; j < matterExamples.length; j++) {
      const a = matterExamples[i].label,
        b = matterExamples[j].label;
      expect(Math.abs(a[0] - b[0]) >= 184 || Math.abs(a[1] - b[1]) >= 88).toBe(
        true,
      );
    }
});

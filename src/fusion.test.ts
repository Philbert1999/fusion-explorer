import { expect, it } from "vitest";
import { fusionReactions, fusionFrame, plasmaDensity } from "./fusion";
it("conserves charge and nucleon count for every reaction and accounts for energy", () => {
  for (const r of fusionReactions) {
    for (const key of ["protons", "neutrons"] as const)
      expect(r.reactants[0][key] + r.reactants[1][key]).toBe(
        r.products.map(product => product[key]).reduce((sum, value) => sum + value, 0),
      );
    if (r.shares)
      expect(r.shares.reduce((sum, energy) => sum + energy, 0)).toBeCloseTo(r.energy, 8);
  }
});
it("hydrogen-boron produces three alpha particles with no fixed energy split", () => {
  const r = fusionReactions.find(r => r.label === "氢 + 硼-11")!;
  expect(r.reactants[1]).toMatchObject({ protons: 5, neutrons: 6 });
  expect(r.products).toHaveLength(3);
  expect(r.products.every(p => p.protons === 2 && p.neutrons === 2)).toBe(true);
  expect(r.energy).toBe(8.7);
  expect(r.shares).toBeNull();
});
it("longer viewing time shows more reactions at the same pace", () => {
  expect(fusionFrame(1).fused).toBe(false);
  expect(fusionFrame(2).fused).toBe(true);
  expect(fusionFrame(4).release).toBe(1);
  expect(fusionFrame(12).event).toBe(3);
  expect(fusionFrame(5).phase).toBe(fusionFrame(1).phase);
  expect(() => fusionFrame(-1)).toThrow();
});
it("compares air molecules and D-T ions separately from their mass", () => {
  const d = plasmaDensity(1e20);
  expect(d.airMass).toBeCloseTo(1.204, 2);
  expect(d.plasmaMass * 1e6).toBeCloseTo(0.415, 3);
  expect(d.numberRatio).toBeGreaterThan(2.5e5);
  expect(d.massRatio).toBeGreaterThan(2.8e6);
  expect(plasmaDensity(2e20).numberRatio).toBe(d.numberRatio / 2);
  expect(() => plasmaDensity(0)).toThrow();
});

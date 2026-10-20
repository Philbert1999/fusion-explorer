import { it, expect } from "vitest";
import { cutCrossings } from "./cutCrossings";
import { TAU } from "./model";
it("records crossings at the selected door, including first arrival and exact endpoint", () => {
  expect(cutCrossings(0, 3, 1.5)).toHaveLength(4);
  const hits = cutCrossings(90, 3, 1.5);
  expect(hits).toHaveLength(3);
  hits.forEach((p, k) => {
    expect(p.phi).toBeCloseTo(TAU * (k + 0.25));
    expect(p.theta).toBeCloseTo(p.phi / 1.5);
  });
  expect(cutCrossings(180, 0.25, 2)).toHaveLength(0);
  expect(() => cutCrossings(360, 3, 2)).toThrow();
  expect(cutCrossings(0, 200, Math.SQRT2)).toHaveLength(201);
  expect(cutCrossings(36, 200, Math.SQRT2)).toHaveLength(200);
  expect(() => cutCrossings(0, 201, 2)).toThrow();
});

import { it, expect } from "vitest";
import { localGeometry, localPoint, diffusionSigma } from "./instability";
import { point } from "./model";
it("starts unperturbed, bends a cross section coherently, and localizes ballooning outboard", () => {
  expect(localPoint("kink", 0.3, 0.5, 0)).toEqual(
    point(localGeometry, 0.3, 0.5),
  );
  const shift = (t: number) =>
    localPoint("kink", 0.3, t, 1).map(
      (x, i) => x - point(localGeometry, 0.3, t)[i],
    );
  shift(0).forEach((x, i) => expect(x).toBeCloseTo(shift(2)[i]));
  const radius = (t: number) => {
    const p = localPoint("ballooning", 0, t, 1);
    return Math.hypot(Math.hypot(p[0], p[1]) - 3, p[2]);
  };
  expect(Math.abs(radius(0) - 0.72)).toBeGreaterThan(
    100 * Math.abs(radius(Math.PI) - 0.72),
  );
});
it("uses the diffusion variance law without changing total marker count", () => {
  expect(diffusionSigma(1) ** 2 - diffusionSigma(0) ** 2).toBeCloseTo(
    2 * 0.006,
  );
  expect(() => diffusionSigma(-1)).toThrow();
  expect(() => diffusionSigma(NaN)).toThrow();
});

import { expect, it } from "vitest";
import { mirrorCondition, mirrorField, mirrorParticle, frcContour, frcFlux, pulseFrame } from "./confinement";

it("uses the loss cone condition and narrows it for a stronger mirror", () => {
  expect(mirrorCondition(4, 20).trapped).toBe(false);
  expect(mirrorCondition(4, 60).trapped).toBe(true);
  expect(mirrorCondition(4, 20).criticalAngle).toBeCloseTo(30);
  expect(mirrorCondition(6, 20).criticalAngle).toBeLessThan(30);
  expect(() => mirrorCondition(1, 40)).toThrow();
});
it("places a trapped particle's turning point where parallel energy vanishes", () => {
  const p = mirrorParticle(Math.PI / 3.4, 4, 60);
  expect(mirrorField(p[0], 4) * Math.sin(Math.PI / 3) ** 2).toBeCloseTo(1);
  expect(mirrorParticle(6, 4, 10)[0]).toBeGreaterThan(3);
});
it("constructs closed FRC contours on a single flux surface", () => {
  for (const flux of [0.02, 0.1, 0.2]) {
    const points = frcContour(flux, 0.8);
    expect(points[0]).toEqual(points.at(-1));
    for (const p of points)
      expect(frcFlux(p[0], Math.hypot(p[1], p[2]))).toBeCloseTo(flux, 7);
  }
  expect(() => frcContour(0.3)).toThrow();
});
it("compresses before burn then expands, with more pulses for longer time", () => {
  expect(pulseFrame(0).radius).toBe(1);
  expect(pulseFrame(3.6).radius).toBeCloseTo(0.24);
  expect(pulseFrame(3.6).burning).toBe(true);
  expect(pulseFrame(5.8).radius).toBeGreaterThan(pulseFrame(3.6).radius);
  expect(pulseFrame(15.6).cycle).toBe(3);
  expect(pulseFrame(15.6).radius).toBeCloseTo(pulseFrame(3.6).radius);
  expect(() => pulseFrame(-1)).toThrow();
});

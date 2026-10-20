import { it, expect } from "vitest";
import { advanceProgress } from "./playback";
it("duration sets the time from start to end, clamps or loops", () => {
  expect(advanceProgress(0, 2, 10)).toBeCloseTo(0.2);
  expect(advanceProgress(0, 2, 20)).toBeCloseTo(0.1);
  expect(advanceProgress(0.4, 3, 10)).toBeCloseTo(0.7);
  expect(advanceProgress(0.9, 3, 10)).toBe(1);
  expect(advanceProgress(0.9, 3, 10, true)).toBeCloseTo(0.2);
  expect(() => advanceProgress(0, 1, 0)).toThrow();
  expect(() => advanceProgress(0, NaN, 5)).toThrow();
});

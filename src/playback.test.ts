import { it, expect } from "vitest";
import { advanceProgress, frameElapsed } from "./playback";
it("duration sets the time from start to end, clamps or loops", () => {
  expect(advanceProgress(0, 2, 10)).toBeCloseTo(0.2);
  expect(advanceProgress(0, 2, 20)).toBeCloseTo(0.1);
  expect(advanceProgress(0.4, 3, 10)).toBeCloseTo(0.7);
  expect(advanceProgress(0.9, 3, 10)).toBe(1);
  expect(advanceProgress(0.9, 3, 10, true)).toBeCloseTo(0.2);
  expect(() => advanceProgress(0, 1, 0)).toThrow();
  expect(() => advanceProgress(0, NaN, 5)).toThrow();
});

it('never advances to negative time when the first RAF predates setup', () => {
  expect(frameElapsed(99.7,100)).toBe(0);
  expect(frameElapsed(116,100)).toBeCloseTo(.016);
  expect(frameElapsed(5000,100)).toBe(.1);
  expect(advanceProgress(0,frameElapsed(99.7,100),24)).toBe(0);
  expect(() => frameElapsed(NaN,0)).toThrow();
});
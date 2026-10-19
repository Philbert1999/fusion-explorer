import { it, expect } from "vitest";
import {
  trace,
  rational,
  poincare,
  section,
  progressTurns,
  hasClosed,
  DEFAULT_GEOMETRY as g,
  TAU,
} from "./model";
it("动画进度与截面同步", () => {
  for (const [progress, count] of [
    [0, 0],
    [0.166, 0],
    [1 / 6, 1],
    [2 / 6, 2],
    [0.5, 3],
    [1, 6],
  ]) {
    expect(
      poincare(g, rational(3, 2), progressTurns(progress, 6), 0),
    ).toHaveLength(count);
  }
  expect(hasClosed(rational(3, 2), 0.499, 6)).toBe(false);
  expect(hasClosed(rational(3, 2), 0.5, 6)).toBe(true);
  expect(hasClosed({ kind: "irrational", symbol: "√2" }, 1, 100)).toBe(false);
});
it("首圈采样不等于初始点，第三圈返回初始位置", () => {
  const hits = poincare(g, rational(3, 2), 3, 0);
  expect(hits[0].rz[1]).not.toBeCloseTo(section(g, 0)[1]);
  hits[2].rz.forEach((v, i) => expect(v).toBeCloseTo(section(g, 0)[i], 10));
});
it("非圆几何各参数变化后仍在共同参数化磁面上", () => {
  for (const custom of [
    { ...g, R0: 4 },
    { ...g, a: 1.2 },
    { ...g, rho: 0.5 },
    { ...g, kappa: 1.8 },
    { ...g, delta: 0.4 },
  ]) {
    for (const p of trace(custom, rational(3, 2), 3, 0.2)) {
      const [R, Z] = section(custom, p.theta);
      expect(Math.hypot(p.xyz[0], p.xyz[1])).toBeCloseTo(R, 10);
      expect(p.xyz[2]).toBeCloseTo(Z, 10);
    }
  }
});
it("超预算采样拒绝，合法输入保留原模型", () => {
  expect(() => trace(g, { kind: "numeric", value: 0.05 }, 100, 0)).toThrow(
    "预算",
  );
  expect(g.R0).toBe(3);
  expect(() => trace({ ...g, a: 4 }, rational(1, 1), 3, 0)).toThrow();
});

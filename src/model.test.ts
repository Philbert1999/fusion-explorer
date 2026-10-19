import { describe, it, expect } from "vitest";
import {
  rational,
  closure,
  trace,
  poincare,
  point,
  section,
  DEFAULT_GEOMETRY as g,
  DEFAULT_CAMERA,
  TAU,
  type Q,
} from "./model";
describe("磁力线教学模型", () => {
  for (const [m, n] of [
    [1, 1],
    [3, 2],
    [2, 1],
  ])
    it(`q=${m}/${n} 的最小闭合周期`, () => {
      const q = rational(m, n);
      expect(closure(q)).toEqual({ toroidal: m, poloidal: n });
      const t = trace(g, q, m, 0.3);
      t.at(-1)!.xyz.forEach((v, i) => expect(v).toBeCloseTo(t[0].xyz[i], 10));
      expect((t.at(-1)!.theta - 0.3) / TAU).toBeCloseTo(n, 10);
    });
  it("约分", () =>
    expect(rational(6, 4)).toEqual({ kind: "rational", m: 3, n: 2 }));
  it("符号常数与数值不报告闭合", () => {
    for (const q of [
      { kind: "irrational", symbol: "√2" },
      { kind: "irrational", symbol: "π" },
      { kind: "numeric", value: 1.5 },
    ] as Q[])
      expect(closure(q)).toBeNull();
  });
  it("生成点位于磁面", () => {
    for (const p of trace(g, rational(3, 2), 3, 0.2)) {
      expect(
        (Math.hypot(p.xyz[0], p.xyz[1]) - g.R0) ** 2 + p.xyz[2] ** 2,
      ).toBeCloseTo((g.a * g.rho) ** 2, 10);
    }
  });
  it("Poincaré 与三维追踪一致、不含初始点", () => {
    const q = rational(3, 2),
      t = trace(g, q, 3, 0.2),
      hits = poincare(g, q, 3, 0.2);
    expect(hits).toHaveLength(3);
    hits.forEach((p, i) => {
      const sample = t[(i + 1) * 180];
      p.xyz.forEach((v, k) => expect(v).toBeCloseTo(sample.xyz[k], 10));
      expect(p.rz).toEqual(section(g, p.theta));
    });
    expect(poincare(g, q, 2, 0.2)).toHaveLength(2);
  });
  it("扩展几何的三维与二维映射一致", () => {
    const custom = { R0: 4, a: 1.2, rho: 0.7, kappa: 1.8, delta: 0.35 };
    for (let theta = 0; theta < TAU; theta += 0.2) {
      const [R, Z] = section(custom, theta),
        p = point(custom, 0.8, theta);
      expect(Math.hypot(p[0], p[1])).toBeCloseTo(R, 12);
      expect(p[2]).toBe(Z);
    }
    expect(section(custom, Math.PI / 2)[0]).toBeCloseTo(
      custom.R0 - custom.a * custom.rho * custom.delta,
      12,
    );
  });
  it("非法参数在边界拒绝", () => {
    expect(() => rational(0, 2)).toThrow();
    expect(() => rational(1.5, 2)).toThrow();
    expect(() => trace({ ...g, R0: 0.5 }, rational(1, 1), 3, 0)).toThrow();
    expect(() => trace(g, { kind: "numeric", value: NaN }, 3, 0)).toThrow();
  });
  it("默认相机可以看到中心孔和截面", () => {
    expect(DEFAULT_CAMERA).toEqual([7, -9, 7]);
  });
});

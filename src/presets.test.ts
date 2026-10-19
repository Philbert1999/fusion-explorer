import { describe, it, expect } from "vitest";
import { presets } from "./api";
import { rational, trace, section, validateGeometry, closure } from "./api";

describe("装置几何预设集成", () => {
  for (const preset of presets) {
    it(`${preset.name} 可生成与二维截面一致的轨迹`, () => {
      expect(() => validateGeometry(preset.geometry)).not.toThrow();
      const q = rational(3, 2);
      const points = trace(preset.geometry, q, 3, 0.2);
      for (const p of points) {
        const [R, Z] = section(preset.geometry, p.theta);
        expect(Math.hypot(p.xyz[0], p.xyz[1])).toBeCloseTo(R, 10);
        expect(p.xyz[2]).toBeCloseTo(Z, 10);
      }
      expect(closure(q)).toEqual({ toroidal: 3, poloidal: 2 });
      if (preset.source) expect(new URL(preset.source).protocol).toBe("https:");
    });
  }
  it("派生拉长比使用同一资料的水平与垂直半径", () => {
    expect(presets.find((p) => p.name === "JET")!.geometry.kappa).toBeCloseTo(
      2.1 / 1.25,
    );
    expect(
      presets.find((p) => p.name === "ASDEX Upgrade")!.geometry.kappa,
    ).toBe(0.8 / 0.5);
  });
});



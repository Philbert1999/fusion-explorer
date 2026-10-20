import { describe, expect, it } from "vitest";
import {
  DEFAULT_DRIFT_VIEW,
  projectDrift,
  rotateDriftView,
} from "./driftCamera";

describe("drift view rotation", () => {
  it("reset preserves the original projection", () => {
    expect(projectDrift([1, 2, 3], DEFAULT_DRIFT_VIEW)).toEqual([285, 86.5]);
    const rotated = rotateDriftView(DEFAULT_DRIFT_VIEW, 100, 50);
    expect(projectDrift([1, 2, 3], rotated)).not.toEqual(
      projectDrift([1, 2, 3], DEFAULT_DRIFT_VIEW),
    );
    expect(projectDrift([1, 2, 3], { ...DEFAULT_DRIFT_VIEW })).toEqual([
      285, 86.5,
    ]);
  });
  it("rotates points and vector endpoints together without changing physical coordinates", () => {
    const position: [number, number, number] = [0, 0, 1];
    const start = projectDrift([0, 0, 0], { yaw: 0, pitch: Math.PI / 2 }),
      end = projectDrift(position, { yaw: 0, pitch: Math.PI / 2 });
    expect(end[0] - start[0]).toBeGreaterThan(0);
    expect((end[0] - start[0]) / (end[1] - start[1])).toBeCloseTo(26.1 / -21);
    expect(position).toEqual([0, 0, 1]);
  });
  it("opposite drags restore the view and long drags stay bounded", () => {
    const moved = rotateDriftView(DEFAULT_DRIFT_VIEW, 300, 200),
      back = rotateDriftView(moved, -300, -200);
    expect(back.yaw).toBeCloseTo(0);
    expect(back.pitch).toBeCloseTo(0);
    const large = rotateDriftView(DEFAULT_DRIFT_VIEW, 1e6, -1e6);
    expect(Math.abs(large.yaw)).toBeLessThanOrEqual(Math.PI);
    expect(Math.abs(large.pitch)).toBeLessThanOrEqual(Math.PI);
  });
});

it("keeps the torus in frame when tilted", () => {
  for (let pitch = -Math.PI; pitch <= Math.PI; pitch += 0.2)
    for (let phi = 0; phi < Math.PI * 2; phi += 0.3)
      for (let theta = 0; theta < Math.PI * 2; theta += 0.4) {
        const R = 3 + Math.cos(theta),
          [x, y] = projectDrift(
            [R * Math.cos(phi), R * Math.sin(phi), Math.sin(theta)],
            { yaw: 0.7, pitch },
          );
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(595);
        expect(y).toBeGreaterThan(55);
        expect(y).toBeLessThan(405);
      }
});

import {expect, it} from 'vitest';
import {electricResponse, ringPoint, ringTangent} from './electric';
it('obeys Faraday sign, circumference scaling and electron/current opposition', () => {
  const a = electricResponse(6, 3, 0, 2), b = electricResponse(-6, 3, 0, 2);
  expect(a.loopVoltage).toBe(-6);
  expect(a.toroidalE * 2 * Math.PI * 3).toBeCloseTo(-6);
  expect(a.ohmicJ).toBeLessThan(0);
  expect(a.electronDirection).toBe(1);
  expect(b.toroidalE).toBe(-a.toroidalE);
  expect(electricResponse(6, 6, 0, 2).toroidalE).toBe(a.toroidalE / 2);
  expect(electricResponse(0, 3, 0, 2).ohmicJ).toBeCloseTo(0);
});
it('radial E cross toroidal B gives vertical drift, independently of charge', () => {
  expect(electricResponse(0, 3, 800, 2).driftZ).toBe(400);
  expect(electricResponse(0, 3, -800, 2).driftZ).toBe(-400);
  expect(electricResponse(0, 3, 800, -2).driftZ).toBe(-400);
  expect(electricResponse(0, 3, 800, 2).ohmicJ).toBeCloseTo(0);
});
it('ring arrows are tangent to the displayed path and reject invalid fields', () => {
  const p=ringPoint(1), t=ringTangent(1, 1);
  expect(p[0]*t[0]+p[1]*t[1]).toBeCloseTo(0);
  expect(()=>electricResponse(1, 0, 1, 2)).toThrow();
  expect(()=>electricResponse(1, 3, 1, 0)).toThrow();
});
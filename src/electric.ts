export type Vec3 = [number, number, number];
export function electricResponse(fluxRate: number, radius: number, radialE: number, toroidalB: number) {
  if (![fluxRate, radius, radialE, toroidalB].every(Number.isFinite) || radius <= 0 || toroidalB === 0) throw new Error('Invalid electric field parameters');
  const loopVoltage = -fluxRate;
  const toroidalE = loopVoltage / (2 * Math.PI * radius);
  return {loopVoltage, toroidalE, ohmicJ: 1e6 * toroidalE, electronDirection: -Math.sign(toroidalE), driftZ: radialE / toroidalB};
}
export function ringPoint(phi: number, radius = 3, z = 0): Vec3 {
  return [radius * Math.cos(phi), radius * Math.sin(phi), z];
}
export function ringTangent(phi: number, sign: number): Vec3 {
  return [-Math.sin(phi) * sign, Math.cos(phi) * sign, 0];
}
import { TAU } from "./model";
export function cutCrossings(cutDegrees: number, turns: number, q: number) {
  if (
    ![cutDegrees, turns, q].every(Number.isFinite) ||
    cutDegrees < 0 ||
    cutDegrees >= 360 ||
    turns <= 0 ||
    turns > 200 ||
    q <= 0
  )
    throw Error("Invalid slice trace");
  return Array.from(
    { length: Math.max(0, Math.floor(turns - cutDegrees / 360) + 1) },
    (_, k) => {
      const phi = (cutDegrees * Math.PI) / 180 + k * TAU;
      return { phi, theta: phi / q };
    },
  );
}

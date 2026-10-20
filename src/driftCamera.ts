export type DriftViewAngle = { yaw: number; pitch: number };
export const DEFAULT_DRIFT_VIEW: DriftViewAngle = { yaw: 0, pitch: 0 };

export function rotateDriftView(view: DriftViewAngle, dx: number, dy: number) {
  const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
  return {
    yaw: wrap(view.yaw + dx * 0.008),
    pitch: wrap(view.pitch + dy * 0.008),
  };
}

export function projectDrift(
  [x, y, z]: [number, number, number],
  view: DriftViewAngle,
) {
  const X = x * Math.cos(view.yaw) - y * Math.sin(view.yaw);
  const Y = x * Math.sin(view.yaw) + y * Math.cos(view.yaw);
  const tiltedY = Y * Math.cos(view.pitch) - z * Math.sin(view.pitch);
  const tiltedZ = Y * Math.sin(view.pitch) + z * Math.cos(view.pitch);
  const horizontal = Math.hypot(
    10.5,
    21 * Math.cos(view.pitch) - 70 * Math.sin(view.pitch),
  );
  const extent = Math.max(
    3 * horizontal + Math.hypot(10.5, 21, 70),
    5 * horizontal,
  );
  const fit = Math.min(1, 155 / extent);
  return [
    285 + fit * 58 * (0.9 * X - 0.45 * tiltedY),
    244 + fit * (42 * (0.25 * X + 0.5 * tiltedY) - 70 * tiltedZ),
  ];
}

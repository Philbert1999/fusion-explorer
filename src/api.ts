// Stable entry point for reuse in future views, data importers, and analysis tools.
export {
  TAU,
  DEFAULT_GEOMETRY,
  DEFAULT_CAMERA,
  rational,
  qValue,
  closure,
  validateGeometry,
  section,
  point,
  trace,
  poincare,
  progressTurns,
  hasClosed,
} from "./model";
export type { Q, Geometry } from "./model";
export { presets } from "./presets";
export type { Preset } from "./presets";

export { orbit, drifts, field } from "./particles";
export type { OrbitPoint } from "./particles";
export { devices, deviceBounds } from "./devices";
export type { Device } from "./devices";
export { stellaratorPoint, driftProjection } from "./stellarator";

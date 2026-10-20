export function advanceProgress(
  progress: number,
  elapsedSeconds: number,
  durationSeconds: number,
  loop = false,
) {
  if (
    ![progress, elapsedSeconds, durationSeconds].every(Number.isFinite) ||
    progress < 0 ||
    progress > 1 ||
    elapsedSeconds < 0 ||
    durationSeconds <= 0
  )
    throw new Error("Invalid playback timing");
  const next = progress + elapsedSeconds / durationSeconds;
  return loop ? next % 1 : Math.min(1, next);
}

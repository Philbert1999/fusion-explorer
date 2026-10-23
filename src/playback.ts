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

// The first RAF timestamp may precede performance.now() captured during setup.
export function frameElapsed(now: number, previous: number) {
  if (![now, previous].every(Number.isFinite)) throw new Error('Invalid animation timestamp');
  return Math.max(0, Math.min(.1, (now - previous) / 1000));
}
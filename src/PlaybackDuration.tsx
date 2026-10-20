export default function PlaybackDuration({
  seconds,
  onChange,
  context,
  unit = "T",
  min = 1,
  max = 120,
  step = 0.5,
}: {
  seconds: number;
  onChange: (value: number) => void;
  context: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const update = (value: number) => {
    if (Number.isFinite(value) && value >= min && value <= max) onChange(value);
  };
  return (
    <label className="playback-duration">
      <span>演化时长 / {unit}</span>
      <input
        aria-label={`${context}演化时长（${unit}）`}
        type="number"
        min={min}
        max={max}
        step={step}
        value={seconds}
        onChange={(e) => {
          if (e.target.value) update(+e.target.value);
        }}
      />
      <input
        aria-label={`${context}演化时长滑块`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={seconds}
        onChange={(e) => update(+e.target.value)}
      />
    </label>
  );
}

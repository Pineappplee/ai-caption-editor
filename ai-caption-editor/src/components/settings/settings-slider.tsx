interface SettingsSliderProps {
  label: string
  description?: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  suffix?: string
}

export function SettingsSlider({ label, description, value, min, max, step, onChange, suffix }: SettingsSliderProps) {
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-200">{label}</label>
        <span className="text-xs text-zinc-400">{value}{suffix}</span>
      </div>
      {description && <p className="mb-2 text-xs text-zinc-500">{description}</p>}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full max-w-xs h-1.5 appearance-none rounded-full bg-zinc-700 accent-purple-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  )
}

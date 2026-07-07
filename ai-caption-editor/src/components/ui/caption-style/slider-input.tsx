import { useCallback } from 'react'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

export function SliderInput({ label, value, min, max, step = 1, suffix, onChange }: Props) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }, [onChange])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)))
  }, [onChange, min, max])

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] text-zinc-500">{label}</label>
        <input
          type="number"
          value={value}
          onChange={handleInput}
          className="h-5 w-12 rounded border border-zinc-700 bg-zinc-800 px-1 text-[10px] text-zinc-200 text-right font-mono outline-none focus:border-blue-500/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          min={min}
          max={max}
          step={step}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-blue-500 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
      />
      {suffix && (
        <span className="mt-0.5 block text-right text-[8px] text-zinc-600 font-mono">{suffix}</span>
      )}
    </div>
  )
}

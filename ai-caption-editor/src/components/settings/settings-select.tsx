interface SettingsSelectProps {
  label: string
  description?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function SettingsSelect({ label, description, value, options, onChange }: SettingsSelectProps) {
  return (
    <div className="py-2">
      <label className="mb-1 block text-sm font-medium text-zinc-200">{label}</label>
      {description && <p className="mb-2 text-xs text-zinc-500">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500/50 appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

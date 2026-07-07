interface SettingsInputProps {
  label: string
  description?: string
  value: string | number
  type?: 'text' | 'number' | 'password'
  onChange: (value: string) => void
  suffix?: string
}

export function SettingsInput({ label, description, value, type = 'text', onChange, suffix }: SettingsInputProps) {
  return (
    <div className="py-2">
      <label className="mb-1 block text-sm font-medium text-zinc-200">{label}</label>
      {description && <p className="mb-2 text-xs text-zinc-500">{description}</p>}
      <div className="flex max-w-xs items-center gap-0">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${suffix ? 'rounded-l-lg border-r-0' : 'rounded-lg'} flex-1 border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-purple-500/50`}
        />
        {suffix && (
          <span className="rounded-r-lg border border-l-0 border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

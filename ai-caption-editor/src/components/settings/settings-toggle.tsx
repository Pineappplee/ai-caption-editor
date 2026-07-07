interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function SettingsToggle({ label, description, checked, onChange, disabled }: SettingsToggleProps) {
  return (
    <label className={`flex items-start gap-3 py-2 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <div className="relative flex shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <div className="h-5 w-9 rounded-full bg-zinc-700 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-zinc-400 after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-4 peer-checked:after:bg-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
    </label>
  )
}

import type { StylePreset } from '@/services/caption-style'

interface Props {
  presets: StylePreset[]
  activePresetId: string | null
  onSelect: (presetId: string) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  modern: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  classic: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
  minimal: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30',
  cinematic: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
  gaming: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
}

export function StylePresetsBar({ presets, activePresetId, onSelect }: Props) {
  if (presets.length === 0) return null

  return (
    <div className="border-b border-zinc-800/60 pb-3">
      <p className="mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
        Style Presets
      </p>
      <div className="grid grid-cols-2 gap-1">
        {presets.map((preset) => {
          const isActive = activePresetId === preset.id
          const catClass = CATEGORY_COLORS[preset.category] || 'bg-zinc-600/20 text-zinc-400'
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`flex flex-col items-start gap-0.5 rounded border px-2 py-1.5 text-left transition-colors ${
                isActive
                  ? 'border-blue-500/50 bg-blue-600/10'
                  : 'border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600'
              }`}
            >
              <span className={`text-[9px] font-medium ${isActive ? 'text-blue-400' : 'text-zinc-300'}`}>
                {preset.name}
              </span>
              <span className={`rounded px-1 py-0.5 text-[7px] font-medium uppercase ${catClass}`}>
                {preset.category}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

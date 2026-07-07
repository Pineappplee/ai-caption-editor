import { Film, X } from 'lucide-react'

const ANIMATIONS = [
  { id: 'fade-in', label: 'Fade In' },
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'zoom-in', label: 'Zoom In' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'pop', label: 'Pop' },
  { id: 'blur-in', label: 'Blur In' },
  { id: 'flip', label: 'Flip' },
]

interface Props {
  value: string | null
  onChange: (value: string | null) => void
}

export function AnimationPresets({ value, onChange }: Props) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500">Preset</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-0.5 text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="size-2.5" />
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {ANIMATIONS.map((anim) => {
          const isActive = value === anim.id
          return (
            <button
              key={anim.id}
              type="button"
              onClick={() => onChange(isActive ? null : anim.id)}
              className={`flex items-center gap-1.5 rounded border px-2 py-1.5 text-[10px] transition-colors ${
                isActive
                  ? 'border-blue-500/50 bg-blue-600/15 text-blue-400'
                  : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              <Film className="size-3 shrink-0" />
              <span className="truncate">{anim.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

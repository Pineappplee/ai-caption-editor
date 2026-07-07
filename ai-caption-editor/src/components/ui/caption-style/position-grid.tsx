import { AlignStartVertical, AlignCenterVertical, AlignEndVertical } from 'lucide-react'

const POSITIONS: { value: 'top' | 'middle' | 'bottom'; icon: typeof AlignStartVertical }[] = [
  { value: 'top', icon: AlignStartVertical },
  { value: 'middle', icon: AlignCenterVertical },
  { value: 'bottom', icon: AlignEndVertical },
]

interface Props {
  value: 'top' | 'middle' | 'bottom'
  onChange: (value: 'top' | 'middle' | 'bottom') => void
}

export function PositionGrid({ value, onChange }: Props) {
  return (
    <div className="flex gap-0.5 rounded border border-zinc-700 bg-zinc-800 p-0.5">
      {POSITIONS.map(({ value: v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors ${
            value === v
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Icon className="size-3" />
          <span>{v}</span>
        </button>
      ))}
    </div>
  )
}

import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const OPTIONS: { value: 'left' | 'center' | 'right'; icon: typeof AlignLeft }[] = [
  { value: 'left', icon: AlignLeft },
  { value: 'center', icon: AlignCenter },
  { value: 'right', icon: AlignRight },
]

interface Props {
  value: 'left' | 'center' | 'right'
  onChange: (value: 'left' | 'center' | 'right') => void
}

export function AlignmentPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-0.5 rounded border border-zinc-700 bg-zinc-800 p-0.5">
      {OPTIONS.map(({ value: v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex flex-1 items-center justify-center rounded px-2 py-1 transition-colors ${
            value === v
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}

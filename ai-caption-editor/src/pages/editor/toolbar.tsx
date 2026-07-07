import { useState } from 'react'
import { MousePointer2, Hand, Type, Square, Image, Crop, Eraser, Pipette } from 'lucide-react'

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'hand', icon: Hand, label: 'Hand' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'shape', icon: Square, label: 'Shape' },
  { id: 'image', icon: Image, label: 'Image' },
  { id: 'crop', icon: Crop, label: 'Crop' },
  { id: 'erase', icon: Eraser, label: 'Erase' },
  { id: 'picker', icon: Pipette, label: 'Color Picker' },
]

export function Toolbar() {
  const [activeTool, setActiveTool] = useState('select')

  return (
    <div className="flex w-10 flex-col items-center gap-0.5 border-r border-zinc-800 bg-zinc-900/50 py-2">
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setActiveTool(id)}
          title={label}
          className={`flex size-8 items-center justify-center rounded-md transition-colors ${
            activeTool === id
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}

import { Cpu } from 'lucide-react'
import type { AIModel } from '@/services/ai'

interface Props {
  models: AIModel[]
  selected: AIModel
  onChange: (model: AIModel) => void
}

const MODEL_LABELS: Record<AIModel, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-haiku': 'Claude 3 Haiku',
  'claude-3-sonnet': 'Claude 3 Sonnet',
}

const MODEL_DESCRIPTIONS: Record<AIModel, string> = {
  'gpt-4o': 'Fast, high quality',
  'gpt-4o-mini': 'Fast, economical',
  'claude-3-haiku': 'Fast, lightweight',
  'claude-3-sonnet': 'Balanced speed & quality',
}

export function ModelSelector({ models, selected, onChange }: Props) {
  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as AIModel)}
        className="h-7 w-full appearance-none rounded border border-zinc-700 bg-zinc-800 pl-7 pr-2 text-[10px] text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {MODEL_LABELS[model]} — {MODEL_DESCRIPTIONS[model]}
          </option>
        ))}
      </select>
      <Cpu className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-zinc-500" />
    </div>
  )
}

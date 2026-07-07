import { Lightbulb } from 'lucide-react'
import type { SuggestedPrompt } from '@/services/ai'

interface Props {
  prompts: SuggestedPrompt[]
  onSelect: (text: string) => void
  visible: boolean
}

export function SuggestedPrompts({ prompts, onSelect, visible }: Props) {
  if (!visible || prompts.length === 0) return null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Lightbulb className="size-2.5 text-amber-400" />
        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">Suggestions</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelect(prompt.text)}
            className="rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2 py-1 text-[9px] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  )
}

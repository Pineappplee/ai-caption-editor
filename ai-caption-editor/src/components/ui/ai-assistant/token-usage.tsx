import { Zap } from 'lucide-react'
import type { AIUsage } from '@/services/ai'

interface Props {
  usage: AIUsage
}

export function TokenUsage({ usage }: Props) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-zinc-800/40 px-2 py-1">
      <Zap className="size-2.5 text-zinc-500" />
      <span className="text-[8px] text-zinc-500 font-mono tabular-nums">
        {usage.totalTokens.toLocaleString()} tokens
      </span>
    </div>
  )
}

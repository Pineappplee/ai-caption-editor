import { Loader2 } from 'lucide-react'

interface Props {
  isStreaming: boolean
  label?: string
}

export function TaskProgress({ isStreaming, label }: Props) {
  if (!isStreaming) return null

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-blue-600/10 px-2 py-1">
      <Loader2 className="size-3 animate-spin text-blue-400" />
      <span className="text-[9px] text-blue-300 font-medium">
        {label || 'Generating...'}
      </span>
    </div>
  )
}

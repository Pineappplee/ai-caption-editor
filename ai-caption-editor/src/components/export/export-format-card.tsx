import { Film, FileText, Code } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExportFormatInfo } from '@/services/export'

interface ExportFormatCardProps {
  info: ExportFormatInfo
  isSelected: boolean
  onSelect: () => void
}

const iconMap: Record<string, typeof Film | typeof FileText | typeof Code> = {
  Film,
  FileText,
  Code,
}

export function ExportFormatCard({ info, isSelected, onSelect }: ExportFormatCardProps) {
  const Icon = iconMap[info.icon] ?? FileText

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all duration-150',
        isSelected
          ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
          : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50',
      )}
    >
      <div className={cn(
        'flex size-8 items-center justify-center rounded-lg',
        isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500',
      )}>
        <Icon className="size-4" />
      </div>
      <span className={cn(
        'text-xs font-medium',
        isSelected ? 'text-purple-300' : 'text-zinc-300',
      )}>
        {info.label}
      </span>
      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase text-zinc-500">
        {info.extension}
      </span>
      <span className="text-[10px] text-zinc-500 leading-tight">{info.description}</span>
    </button>
  )
}

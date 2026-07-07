import { Upload, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SourceTabsProps {
  activeTab: 'upload' | 'stock' | 'ai'
  onTabChange: (tab: 'upload' | 'stock' | 'ai') => void
}

const tabs = [
  { id: 'upload' as const, label: 'Upload', icon: Upload },
  { id: 'stock' as const, label: 'Stock', icon: Search },
  { id: 'ai' as const, label: 'AI Gen', icon: Sparkles },
]

export function SourceTabs({ activeTab, onTabChange }: SourceTabsProps) {
  return (
    <div className="flex border-b border-zinc-800">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-purple-500 text-purple-400 bg-purple-500/5'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30',
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

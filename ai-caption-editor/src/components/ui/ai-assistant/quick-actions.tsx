import { Wand2, Languages, MessageSquareText, RefreshCw, SpellCheck, PenLine, Minus, Plus, Mic, NotebookPen } from 'lucide-react'
import type { AIAction } from '@/services/ai'

const ACTION_ICONS: Record<string, typeof Wand2> = {
  'generate-captions': Wand2,
  'rewrite': RefreshCw,
  'translate': Languages,
  'summarize': MessageSquareText,
  'fix-grammar': SpellCheck,
  'change-tone': PenLine,
  'shorten': Minus,
  'expand': Plus,
  'remove-filler': Mic,
  'speaker-detection': NotebookPen,
}

const ACTION_COLORS: Record<string, string> = {
  'generate-captions': 'bg-indigo-600/15 text-indigo-400 border-indigo-500/20',
  'rewrite': 'bg-amber-600/15 text-amber-400 border-amber-500/20',
  'translate': 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20',
  'summarize': 'bg-purple-600/15 text-purple-400 border-purple-500/20',
  'fix-grammar': 'bg-cyan-600/15 text-cyan-400 border-cyan-500/20',
  'change-tone': 'bg-pink-600/15 text-pink-400 border-pink-500/20',
  'shorten': 'bg-orange-600/15 text-orange-400 border-orange-500/20',
  'expand': 'bg-blue-600/15 text-blue-400 border-blue-500/20',
  'remove-filler': 'bg-rose-600/15 text-rose-400 border-rose-500/20',
  'speaker-detection': 'bg-teal-600/15 text-teal-400 border-teal-500/20',
}

interface ActionItem {
  id: AIAction
  label: string
  description: string
}

interface Props {
  actions: ActionItem[]
  onAction: (actionId: AIAction) => void
  disabled?: boolean
}

export function QuickActions({ actions, onAction, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {actions.map((action) => {
        const Icon = ACTION_ICONS[action.id] || Wand2
        const colors = ACTION_COLORS[action.id] || 'bg-zinc-600/15 text-zinc-400 border-zinc-500/20'
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction(action.id)}
            disabled={disabled}
            className={`flex items-center gap-1.5 rounded border px-2 py-1.5 text-left transition-colors ${
              disabled
                ? 'opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-900'
                : `${colors} hover:brightness-125`
            }`}
          >
            <Icon className="size-3 shrink-0" />
            <span className="truncate text-[10px] font-medium">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
